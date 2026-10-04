// Address labels never replace the merchant's identity or contact numbers.
export function merchantSender(user, address) {
  const place = address ?? user;
  const primary =
    !address &&
    user.addresses?.find((a) => samePoint(a.location, user.location));
  return {
    name: user.name,
    phone: user.phone,
    phone2: address?.phone2 ?? user.phone2 ?? "",
    businessName: user.businessName || "",
    province: place.province ?? user.province,
    area: place.area || "",
    address: place.address || "",
    addressId: address?.addressId || address?.id || primary?.id || "",
    addressName:
      address?.addressName ??
      (address?.id && !address.role
        ? address.name
        : address
          ? ""
          : primary?.name || "عنوان الملف الشخصي"),
    location: place.location
      ? { lat: place.location.lat, lng: place.location.lng }
      : null,
  };
}

const text = (v) => String(v ?? "").trim();
const addressTitle = (value) =>
  text(value).replace(/\s+/g, " ").toLocaleLowerCase();
function samePoint(a, b) {
  return (
    a &&
    b &&
    ["lat", "lng"].every(
      (key) => Number(a[key]).toFixed(6) === Number(b[key]).toFixed(6),
    )
  );
}

export function addressConflict(addresses, candidate, excludeId) {
  const others = addresses.filter((address) => address.id !== excludeId);
  if (
    others.some(
      (address) => addressTitle(address.name) === addressTitle(candidate.name),
    )
  )
    return "اسم العنوان موجود في «عناويني». اختر العنوان المحفوظ أو أدخل اسماً مختلفاً.";
  if (others.some((address) => samePoint(address.location, candidate.location)))
    return "هذا الموقع محفوظ في «عناويني». اختر العنوان الموجود بدلاً من إضافته مرة أخرى.";
  return "";
}

// Reuse a saved pickup; validate new places before mutating the order or address book.
export function pickupAddress(user, sender) {
  const addresses = user.addresses || [];
  const existing = addresses.find(
    (address) =>
      samePoint(address.location, sender.location) &&
      (!sender.addressName ||
        addressTitle(address.name) === addressTitle(sender.addressName)),
  );
  if (existing) return existing;
  let name = sender.addressName || sender.address || sender.area;
  if (!sender.addressName) {
    const base = name;
    for (
      let index = 2;
      addresses.some(
        (address) => addressTitle(address.name) === addressTitle(name),
      );
      index++
    )
      name = `${base} (${index})`;
  }
  const candidate = {
    name,
    province: sender.province,
    area: sender.area,
    address: sender.address,
    location: sender.location,
  };
  const problem = addressConflict(addresses, candidate);
  if (problem) throw Object.assign(Error(problem), { status: 400 });
  return {
    ...candidate,
    location: sender.location
      ? { lat: sender.location.lat, lng: sender.location.lng }
      : null,
  };
}
const key = (entry, recipient) =>
  JSON.stringify([
    ...(recipient
      ? [
          text(entry.phone),
          text(entry.name),
          text(entry.phone2),
          text(entry.landmark),
        ]
      : []),
    text(entry.province),
    text(entry.area),
    text(entry.address),
    entry.location ? Number(entry.location.lat).toFixed(6) : "",
    entry.location ? Number(entry.location.lng).toFixed(6) : "",
  ]);

// Keep each recipient/location combination, even when the phone number is shared.
export function rememberOrderPlaces(user, order, makeId) {
  user.addresses ??= [];
  user.customers ??= [];
  const sender = order.sender;
  if (sender?.address && sender.location) {
    let saved = pickupAddress(user, sender);
    if (!saved.id) {
      saved = { ...saved, id: makeId("ADR") };
      user.addresses.push(saved);
    }
    sender.addressId = saved.id;
    sender.addressName = saved.name;
  }
  const recipient = order.recipient;
  if (
    recipient?.phone &&
    recipient.name &&
    recipient.area &&
    !user.customers.some((c) => key(c, true) === key(recipient, true))
  ) {
    const { id: ignored, ...details } = recipient;
    user.customers.push({ ...structuredClone(details), id: makeId("CUS") });
  }
}
