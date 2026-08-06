/**
 * Preload sekumpulan asset (image, audio, video) dan melaporkan progres
 * secara real berdasarkan jumlah asset yang benar-benar selesai dimuat.
 *
 * @param {Array<{type: string, src: string}>} manifest
 * @param {(ratio: number) => void} onProgress - ratio antara 0 dan 1
 * @returns {Promise<void>}
 */
export function preloadAssets(manifest, onProgress = () => {}) {
  const total = manifest.length;

  if (total === 0) {
    onProgress(1);
    return Promise.resolve();
  }

  let loaded = 0;

  const updateProgress = () => {
    loaded += 1;
    onProgress(loaded / total);
  };

  const tasks = manifest.map((asset) => loadSingleAsset(asset).then(updateProgress));

  return Promise.all(tasks);
}

function loadSingleAsset({ type, src }) {
  switch (type) {
    case "image":
      return loadImage(src);
    case "audio":
      return loadMedia(new Audio(), src);
    case "video":
      return loadMedia(document.createElement("video"), src);
    default:
      return Promise.reject(new Error(`Tipe asset tidak dikenal: ${type}`));
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Gagal memuat image: ${src}`));
    img.src = src;
  });
}

function loadMedia(mediaElement, src) {
  return new Promise((resolve, reject) => {
    mediaElement.oncanplaythrough = () => resolve();
    mediaElement.onerror = () => reject(new Error(`Gagal memuat media: ${src}`));
    mediaElement.preload = "auto";
    mediaElement.src = src;
  });
}
