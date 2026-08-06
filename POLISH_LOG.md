# POLISH LOG — Birthday Memories (Rizka)

> Laporan khusus sprint **UI/UX Polish**, terpisah dari `PROJECT_STATE.md`.
> `PROJECT_STATE.md` tetap sumber kebenaran untuk arsitektur/konvensi/progress
> fitur inti. File ini fokus MELACAK sprint polish saja — biar
> `PROJECT_STATE.md` tidak terus membengkak tiap sprint kecil selesai.
>
> **Untuk AI/asisten mana pun yang melanjutkan:** baca file ini + `PROJECT_STATE.md`
> §4 (Arsitektur & Konvensi) SEBELUM menulis kode polish apa pun.

---

## Konteks

Seluruh fitur/scene sudah selesai secara logic (lihat `PROJECT_STATE.md` §6 & §9).
Fokus sekarang HANYA polish UI/UX sesuai brief `UI_UX_upgrade`, dipecah jadi
sprint kecil bernama **Polish 1, Polish 2, dst** — satu per satu, dengan
approval user di tiap bagian sebelum lanjut.

**Aturan khusus sprint polish:**
- Tidak ada fitur baru, tidak ada perubahan urutan scene, tidak ada
  penggantian placeholder — HANYA presentasi visual & motion.
- Tiap Polish dipecah lagi jadi bagian-bagian kecil (per area: foundation,
  per-scene, dst), dikerjakan berurutan dengan approval user di tiap bagian.
- Tiap sprint selesai → nama folder/zip project diganti sesuai nomor polish
  (misal `birthday-polish1.zip`, `birthday-polish2.zip`).

---

## Roadmap Polish

| Sprint | Scope | Status |
|---|---|---|
| **Polish 1 — Foundation** | Design token baru + `js/effects/ambient.js` + `css/ambient.css` + upgrade `.cta-button` global | ✅ Selesai |
| **Polish 1 lanjutan — Preloader + Welcome** | Loading copy emosional bertahap, gradient "opening", ambient layer di Welcome | ✅ Selesai |
| Polish 2+ | Per-scene (Birthday/Gift/Memory → Stars/Quiz/Video/Call/Talking Photo → Letter → Final/Ending/Photobooth/Scrapbook), lalu review motion & audio crossfade | ⬜ Belum |

---

## Polish 1 — Foundation ✅

**File baru:**
- `css/ambient.css` — style `.ambient-layer` / `.ambient-particle` / `.ambient-glow`
- `js/effects/ambient.js` — `createAmbientLayer(container, options)` →
  `{ mount(), destroy() }`, dipanggil dari `onEnter`/`onExit` scene (pola sama
  seperti lifecycle di `PROJECT_STATE.md` §4.1). Warna partikel ambil dari
  `getThemeColors()` (palette.js), bukan hardcode ulang.

**File yang berubah:**
- `css/variables.css` — token baru:
  - Radius scale: `--radius-sm/md/lg/pill`
  - Shadow scale (warna warm dari `--color-bg-dark`, bukan hitam murni):
    `--shadow-sm/md/lg`, `--shadow-glow-primary`
  - Palet atmosfer tambahan: `--color-bg-purple/-cream/-blue-deep`, `--color-paper`
  - Token ambient: `--ambient-particle-size-min/max`, `--ambient-duration-min/max`,
    `--ambient-opacity-max`, `--z-ambient`
- `css/animations.css` — keyframe baru `ambient-drift` & `ambient-glow-pulse`
- `css/global.css` — `.cta-button` sekarang punya `box-shadow` + feedback tekan
  (`:active { scale: 0.96; box-shadow: var(--shadow-sm); }`).
  **Penting untuk yang lanjut kerja di file ini:** transition lengkap (scale,
  box-shadow, opacity, translate) didefinisikan SEKALI di `.cta-button` dasar.
  `.cta-button--fade` sengaja TIDAK redeclare properti `transition` lagi —
  kalau redeclare, itu akan MENIMPA (bukan menggabung) daftar transition di
  base class. Kalau nanti nambah varian tombol baru, ikuti pola ini.
- `index.html` — tambah `<link rel="stylesheet" href="css/ambient.css" />`

**Catatan penting untuk lanjutan:**
- Ambient layer BELUM dipasang di scene manapun — baru modul + style-nya siap
  dipakai. Pemasangan pertama rencananya di scene Welcome.
- Warna atmosfer baru (`--color-bg-purple`, dst) juga belum dipakai di
  background scene manapun — nunggu keputusan gradient per-scene di sprint
  per-scene berikutnya, supaya tidak mendahului scope yang belum di-approve user.

---

## Polish 1 lanjutan — Preloader + Welcome ✅

**Keputusan yang sudah dikonfirmasi user:**
- Copy loading pakai versi terjemahan Indonesia yang diusulkan (lihat di bawah),
  user boleh minta ganti kapan saja nanti.
- Jeda antar baris typing di Welcome TETAP default 1400ms (tidak dinaikkan) —
  user mau coba dulu, infokan ke AI kalau kerasa kecepetan.

**File yang berubah:**
- `css/variables.css` — tambah `--gradient-opening` (dipakai bareng oleh
  Preloader & Welcome, satu identitas "babak pembuka").
- `css/scene/scene-preloader.css`:
  - Background jadi `var(--gradient-opening)` (sebelumnya flat `--color-bg-dark`)
  - Progress bar fill dapat `box-shadow: var(--shadow-glow-primary)` (glow pink tipis)
  - Teks loading dapat efek "rise-in" tiap ganti pesan, lewat `translate` +
    class `.is-entering` — SENGAJA pakai `translate` (bukan `transform`),
    karena `pulse-soft` (animasi napas, infinite) sudah menguasai `opacity`
    di elemen yang sama; kalau pakai `transform`/`opacity` lagi di sini akan
    bentrok sama animasi itu.
- `js/scene/scene-preloader.js`:
  - `LOADING_MESSAGES` — 5 pesan bertahap (`Memuat Kenangan...` →
    `Mengumpulkan Momen Bahagia...` → `Menyiapkan Sesuatu yang Spesial...` →
    `Hampir Siap...` → `Kejutanmu Sudah Siap.`), dipetakan ke ratio progress
    ASLI (bukan timer buatan) lewat `getMessageForRatio()`
  - `swapMessage()` — helper reset-transition-paksa (matikan transition →
    set state awal → force reflow → nyalakan lagi transition → lepas class)
    supaya efek rise-in benar-benar teranimasi, bukan cuma "snap"
- `css/scene/scene-welcome.css`:
  - Background jadi `var(--gradient-opening)` (sama dengan Preloader, kontinuitas)
  - Teks dapat `text-shadow` glow pink tipis (ide "soft glow" dari brief)
  - **Penting:** `.scene-welcome__text` sekarang `position: relative; z-index: 2;`
    — WAJIB, karena `.ambient-layer` (lihat Polish 1 Foundation) pakai
    `position: absolute` + `z-index: 1`. Tanpa ini, sparkle akan menutupi teks
    (elemen in-flow non-positioned secara default tampil DI BAWAH elemen
    positioned lain dengan z-index positif). **Pola ini WAJIB diikuti tiap
    scene lain yang mulai pakai ambient layer di Polish berikutnya** — beri
    wrapper konten utamanya `position: relative` + `z-index` di atas `--z-ambient` (1).
- `js/scene/scene-welcome.js` — pasang `createAmbientLayer()` (14 partikel +
  1 glow bloom, warna ikut tema), `mount()` di `onEnter`, `destroy()` di
  `onExit` (pola lifecycle sama seperti scene lain, lihat `PROJECT_STATE.md` §4.1)
- `index.html` — elemen teks preloader sekarang punya `id="preloader-text"`
  (sebelumnya tidak ada id, tidak bisa ditarget dari JS)

**Catatan untuk lanjutan:**
- Preloader SENGAJA tidak dipasangi ambient layer (beda dari Welcome) — durasinya
  singkat (~1.2 detik+), generate partikel di situ berisiko terasa buru-buru/
  tidak sempat kelihatan, dan brief "Ambient Effects" section memang
  ditujukan untuk Welcome, bukan loading screen.
- `--gradient-opening` sekarang "milik" Preloader+Welcome. Scene lain butuh
  gradient sendiri sesuai identitas masing-masing (lihat brief Scene
  Backgrounds: Birthday = soft pink glow, Memory = warm cream, Night Sky =
  deep blue, Letter = paper texture, Ending = pink gradient) — akan
  didefinisikan token barunya per-scene di Polish 2, bukan digeneralisir ke
  satu gradient untuk semua.

---

<!-- Sprint berikutnya ditambah di bawah ini, format sama: judul, file baru,
     file berubah, catatan penting untuk lanjutan. -->
