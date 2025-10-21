export function playNotification() {
  try {
    const audio = new Audio("/sounds/notify.mp3"); // add an asset at public/sounds/notify.mp3
    audio.play().catch(e => {
      console.warn("Audio play failed", e);
    });
  } catch (e) {
    console.warn("Audio play failed", e);
  }
}
