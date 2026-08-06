/**
 * Layout yang dipilih user (single/triple/korean-six) — persist selama
 * sesi Photo Booth berjalan (dari Choose Layout sampai Result Preview).
 * In-memory saja, sama seperti session-photo.js, tidak perlu server.
 */
let selectedLayoutId = null;

export function setSelectedLayoutId(layoutId) {
  selectedLayoutId = layoutId;
}

export function getSelectedLayoutId() {
  return selectedLayoutId;
}
