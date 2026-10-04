// Retire only the removed device-draft feature, including its sample markers.
export function removeDeviceDraftStorage(storage) {
  try {
    const keys = Array.from({ length: storage?.length || 0 }, (_, index) =>
      storage.key(index),
    );
    for (const key of keys)
      if (key?.startsWith("wasel-offline-")) storage.removeItem(key);
  } catch {
    // Restricted storage must not prevent opening the application.
  }
}
