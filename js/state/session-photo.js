/**
 * Penyimpanan sementara (in-memory, bukan localStorage/server) untuk
 * meneruskan foto hasil Photo Booth (Scene 14) ke Final Scrapbook
 * (Scene 15). Sengaja bukan file terpisah per scene karena isinya cuma
 * dipakai lintas 2 scene itu — module singleton kecil sudah cukup.
 */
let capturedPhotoUrl = null;

export function setCapturedPhoto(objectUrl) {
  capturedPhotoUrl = objectUrl;
}

export function getCapturedPhoto() {
  return capturedPhotoUrl;
}

export function clearCapturedPhoto() {
  if (capturedPhotoUrl) URL.revokeObjectURL(capturedPhotoUrl);
  capturedPhotoUrl = null;
}
