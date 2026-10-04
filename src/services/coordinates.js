import { toEnglishDigits } from "./formFields.js";

function coordinate(value) {
  const text = toEnglishDigits(value ?? "")
    .trim()
    .replace(/[،,٫]/g, ".");
  return text ? Number(text) : NaN;
}

export function addressLocation(latitude, longitude) {
  const lat = coordinate(latitude),
    lng = coordinate(longitude);
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
    ? { lat, lng }
    : null;
}
