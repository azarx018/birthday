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

## Polish 2 — Birthday + Gift + Memory ✅

**Bug ditemukan & diperbaiki dulu (regresi dari Polish 1 Foundation):**
`css/scene/scene-memory.css` punya override khusus
`.memory-slide--gallery.is-visible .cta-button--fade` (tombol "Lanjut" di
galeri dipicu visible lewat class INDUK, bukan class `.is-visible` di
tombol itu sendiri — pola beda dari scene lain). Override ini masih pakai
`transform: translateY(0)` lama, padahal sejak Foundation base class
`.cta-button`/`.cta-button--fade` sudah pindah ke `translate`. Sudah
diperbaiki. **Pelajaran:** kalau nanti ada scene lain dengan pola serupa
(override visibility cta-button lewat parent selector), cek juga.

**File yang berubah:**

- `css/scene/scene-birthday.css`
  - Background dapat radial glow pink tipis di belakang konten (identitas
    "soft pink glow" sesuai brief Scene Backgrounds), gradient dasar tetap.
  - `.scene-birthday__button` — radius & shadow ditokenisasi
    (`--radius-pill`, `--shadow-glow-primary`), feedback tekan pindah dari
    `transform: scale()` ke properti `scale` (konsisten dengan pola
    Foundation), TIDAK digabung ke class `.cta-button` (instruksi brief:
    "Do not refactor unrelated code" — cukup tokenisasi, bukan merge).
- `css/scene/scene-gift.css`
  - `.gift-box__body` radius & shadow ditokenisasi (`--radius-sm`, `--shadow-lg`)
  - **Baru:** kotak hadiah sekarang punya feedback tekan (`:active { scale: 0.97 }`)
    — sebelumnya kotak ini interaktif (role="button", ada `onclick`/`onkeydown`
    di JS) tapi TIDAK ada feedback sentuh sama sekali. Pakai `scale` (bukan
    `transform`) karena `gift-idle-shake` (animasi goyang idle) sudah
    menguasai `transform: rotate()` di elemen yang sama — pola yang sama
    seperti `.cta-button` di Foundation.
- `css/scene/scene-memory.css`
  - Background pindah dari `--color-bg-light-soft` (pink) ke
    **`--color-bg-cream`** — identitas sendiri sesuai brief Scene Backgrounds
    ("Memory: warm cream"), beda dari scene terang lain yang masih pink.
    Kontras teks tetap aman (keduanya background terang, teks tetap dark plum).
  - `.memory-photo-frame` (polaroid) — radius naik ke `--radius-sm` (dari 4px),
    shadow ke `--shadow-lg`, padding pakai token spacing. `transform`
    (translateX + rotate digabung) DIPECAH jadi `translate` + `rotate`
    terpisah (properti modern CSS) — lebih jelas dibaca, dan pola ini
    konsisten dipakai di seluruh project pasca-Foundation.
  - `.memory-gallery-item` — radius naik ke `--radius-sm` (dari 6px), shadow
    ditokenisasi (`--shadow-md`), gap grid naik ke `--space-md` (dari
    `--space-sm`) biar antar foto tidak terlalu rapat.
  - **Sengaja TIDAK** menambah feedback tekan (`:active` scale) di foto
    polaroid maupun item galeri — elemen-elemen ini pasif (dilihat/discroll,
    bukan ditekan untuk aksi), swipe horizontal jadi interaksi utamanya.
    Nambah scale-on-touch di situ berisiko terasa "berkedip" tiap kali jari
    mulai swipe, bukan feedback yang berguna.

**Catatan untuk lanjutan:** pola "pisahkan `transform` jadi `translate` +
`rotate` + `scale` terpisah" ini sekarang standar di seluruh project kalau
suatu elemen butuh lebih dari satu jenis transform yang dianimasikan
independen (lihat juga Preloader). Ikuti pola ini di scene berikutnya,
jangan gabung balik jadi satu `transform` shorthand.

---

## Polish 3 — Stars + Quiz + Video + Call + Talking Photo ✅

Scope chunk ini lebih ringan dibanding Polish 2 — kelima scene ini sudah
cukup matang secara visual (Stars sudah deep-blue night sky sesuai brief,
Video sudah pakai `.cta-button` yang otomatis ikut ter-upgrade sejak
Foundation). Fokusnya murni **konsistensi token** (radius/shadow), bukan
perubahan besar.

**File yang berubah:**

- `css/scene/scene-stars.css` — modal `.memory-card` (kartu kenangan saat
  bintang di-tap): radius `16px → --radius-lg`, tambah `box-shadow: var(--shadow-lg)`
  (sebelumnya tidak ada shadow sama sekali). Gambar/video di dalamnya
  `8px → --radius-sm`.
- `css/scene/scene-quiz.css` — `.quiz-option` (kartu jawaban): radius
  `14px → --radius-sm`, shadow hitam generik `→ --shadow-sm`.
- `css/scene/scene-call.css` — tombol Terima/Tolak dapat `box-shadow:
  var(--shadow-md)` (sebelumnya flat, tanpa shadow sama sekali — kurang
  "satisfying" untuk tombol sepenting ini). `.chat-nag` (notifikasi "jangan
  ditolak"): radius `14px → --radius-sm`, shadow hitam generik `→ --shadow-lg`.
- `css/scene/scene-talking-photo.css` — `.talking-photo__frame`: radius
  `28px → --radius-lg` (kebetulan persis sama, tinggal tokenisasi), shadow
  hitam generik `→ --shadow-lg`. **Tidak menyentuh** logic `transform: scale()`
  untuk speaking/pulse — itu mekanisme presisi (lihat komentar kalibrasi di
  atas file), murni ganti nilai shadow/radius saja.
- `css/scene/scene-video.css` — **tidak diubah.** Sudah cukup sinematik
  (`background: #000`, video fullscreen), tombol play sudah otomatis
  ter-upgrade karena pakai `.cta-button`. Brief "Video Cards" (larger play
  button dst.) sebenarnya lebih relevan ke video di DALAM modal Stars
  (`.memory-card__body video`, sudah dapat radius token di atas) — video
  fullscreen Scene 8 ini bukan sebuah "card", jadi tidak perlu diseragamkan
  ke situ.

**Kenapa `transform: scale()` di beberapa file ini TIDAK dipecah jadi
`scale`/`translate` terpisah** (beda dari pola Foundation/Polish 2):
hanya dipecah kalau ada DUA jenis transform yang perlu jalan independen di
elemen yang sama (misalnya animasi napas + feedback tekan). Di
`.quiz-option`, `.scene-call__button`, `.talking-photo__frame` — cuma ada
SATU jenis transform (`scale`) yang dipakai, jadi `transform: scale()`
biasa sudah aman, tidak ada yang perlu dipecah. Jangan refactor yang tidak
perlu (brief Developer Notes: "Do not refactor unrelated code").

---

<!-- Sprint berikutnya ditambah di bawah ini, format sama: judul, file baru,
     file berubah, catatan penting untuk lanjutan. -->
