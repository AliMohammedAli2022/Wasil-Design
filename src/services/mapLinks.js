export function mapLinks(location, name = "الموقع") {
  if (
    !Number.isFinite(location?.lat) ||
    !Number.isFinite(location?.lng) ||
    Math.abs(location.lat) > 90 ||
    Math.abs(location.lng) > 180
  )
    return [];
  const point = `${location.lat},${location.lng}`;
  return [
    {
      id: "google",
      label: "Google Maps",
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point)}`,
    },
    {
      id: "waze",
      label: "Waze",
      url: `https://waze.com/ul?ll=${encodeURIComponent(point)}&zoom=17`,
    },
    {
      id: "apple",
      label: "خرائط Apple",
      url: `https://maps.apple.com/?ll=${encodeURIComponent(point)}&q=${encodeURIComponent(name)}`,
    },
  ];
}

export function nativeMapLink(location, name = "الموقع") {
  if (!mapLinks(location).length) return "";
  const point = `${location.lat},${location.lng}`;
  return `geo:${point}?q=${encodeURIComponent(`${point} (${name})`)}`;
}

export async function shareMapLink(link, name, device = globalThis.navigator) {
  if (device?.share) {
    try {
      await device.share({ title: name, text: `موقع ${name}`, url: link });
      return "shared";
    } catch (error) {
      if (error.name === "AbortError") return "cancelled";
    }
  }
  try {
    if (device?.clipboard) {
      await device.clipboard.writeText(link);
      return "copied";
    }
  } catch {
    /* Offer a selectable link when sharing and clipboard are unavailable. */
  }
  return "manual";
}
