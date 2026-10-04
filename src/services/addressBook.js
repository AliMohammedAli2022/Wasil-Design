// Address labels never replace the merchant's identity or contact numbers.
export function merchantSender(user, address) {
  const place = address ?? user;
  return {
    name: user.name,
    phone: user.phone,
    phone2: user.phone2 || "",
    province: place.province || user.province,
    area: place.area || "",
    address: place.address || "",
    addressId: address?.addressId || address?.id || "",
    addressName:
      address?.addressName ??
      (address?.id ? address.name : address ? "" : "عنوان الملف الشخصي"),
    location: place.location
      ? { lat: place.location.lat, lng: place.location.lng }
      : null,
  };
}

const text = (v) => String(v ?? "").trim();
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
    let saved = user.addresses.find(
      (a) =>
        key({ province: user.province, ...a }, false) === key(sender, false) &&
        (!sender.addressName || a.name === sender.addressName),
    );
    if (!saved) {
      saved = {
        id: makeId("ADR"),
        name: sender.addressName || sender.area || sender.address,
        province: sender.province,
        area: sender.area,
        address: sender.address,
        location: structuredClone(sender.location),
      };
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
