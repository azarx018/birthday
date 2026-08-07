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

## Perbaikan pacing Welcome (feedback user, di luar urutan sprint)

User konfirmasi typing di Welcome kerasa kecepetan (sebelumnya sengaja
dipertahankan default 1400ms atas permintaan user sendiri di Polish 1
lanjutan). Sekarang dinaikkan ke **1900ms**, khusus di
`js/scene/scene-welcome.js` lewat parameter `pauseBetween` — TIDAK ubah
`DEFAULT_PAUSE_MS` global di `js/animation.js`, jadi scene lain (Talking
Photo, Letter, dll.) tidak ikut kena.

---

## Polish 4 — Letter ✅

Sebelumnya scene ini sudah punya mekanisme bagus (typewriter per paragraf,
auto-scroll pelan yang jeda kalau disentuh manual) tapi tampilannya masih
polos — background flat, tidak ada "kertas", tidak ada shadow.

**File yang berubah:**

- `css/scene/scene-letter.css`
  - `.scene-letter` — background jadi `var(--color-paper)`, jadi backdrop
    hangat tempat "lembar surat" duduk di atasnya.
  - `.letter__sheet` — sekarang benar-benar terlihat seperti lembar kertas:
    gradient putih-krem halus, `border-radius: var(--radius-md)`,
    `box-shadow: var(--shadow-lg)` ("soft paper shadow" dari brief), plus
    aksen garis tipis emas (`--color-accent-secondary`) di tepi atas — detail
    kecil ala kop surat, tanpa perlu asset gambar tekstur kertas (brief:
    "Never use fake assets" — jadi solusinya CSS gradient, bukan pura-pura
    ada file tekstur).
  - `.letter__paragraph` — font-size naik ke `--font-size-md` (dari base)
    biar terasa lebih seperti surat sungguhan, margin-bottom naik ke
    `--space-lg`. **Tambah `animation: fade-in`** — tiap paragraf baru
    (dibuat lewat `document.createElement` di JS) otomatis fade-in begitu
    masuk DOM, jalan BARENGAN dengan efek ketik karakter-per-karakter yang
    sudah ada — persis dua item brief ("fade-in text" + "gentle typewriter
    effect") tercapai tanpa perlu ubah logic JS sama sekali, cukup CSS.
  - `.letter__salutation` — `align-self: flex-start` (sebelumnya ikut center
    dari parent flex, sekarang rata kiri seperti pembuka surat sungguhan).

**Tidak diubah (di luar scope polish visual):**
- Musik piano BGM masih tertunda ke sprint Audio System terpisah (lihat
  `PROJECT_STATE.md` §7 — audio memang sengaja belum digarap).
- Logic auto-scroll & typewriter JS tidak disentuh sama sekali, cuma
  presentasi visual.

---

## 🐛 Bug Fix — Photo Booth tidak bisa lanjut ke Scrapbook

**Root cause (dikonfirmasi, sesuai investigasi 10 poin di bug report):**

`#photobooth-continue-button` (index.html baris 289) punya class
`cta-button cta-button--fade`. Sejak Polish 1 Foundation, `.cta-button--fade`
defaultnya `opacity: 0; pointer-events: none;` dan HANYA berubah terlihat +
bisa diklik kalau class `.is-visible` ditambahkan (lihat `global.css`).
Semua tombol `--fade` lain di project selalu punya baris
`xxx.classList.add("is-visible")` di suatu tempat di JS scene-nya —
**tombol ini yang satu-satunya kelewatan.** `setState("continue")` di
`scene-photobooth.js` cuma menampilkan PANEL-nya (`display:flex`), tapi
tombol di dalamnya tetap `opacity:0;pointer-events:none` selamanya.
Persis cocok sama gejala: layar putih kosong, tombol tidak bisa diklik
sama sekali (bukan soal listener/z-index/overlay — listener sudah
terpasang benar, elemennya saja yang tidak pernah "dinyalakan" secara visual/interaktif).

**Fix:** `js/scene/scene-photobooth.js` — `continueButton.classList.add("is-visible")`
ditambahkan di `handleWhatsappClick()` dan `handleSkipShareClick()`
(dua-duanya, karena keduanya sama-sama transisi ke state "continue").

**Fix lain yang menyertai (root cause berbeda, ditemukan saat investigasi):**

1. **Frame ikut tampil saat live capture** (request baru user): `.photobooth__frame-image`
   di-overlay `position:absolute;inset:0` langsung di atas video kamera tanpa
   opacity gating. Fix: `css/scene/scene-photobooth.css` — tambah `opacity: 0`
   permanen di elemen ini. Elemen TETAP ada di DOM (tidak dihapus/`display:none`)
   karena `naturalWidth`/`naturalHeight`-nya masih dipakai buat hitung aspect
   ratio (`ensureFrameAspectRatio`) dan sebagai source `ctx.drawImage()` di
   komposit final — cuma tampilan live-nya yang disembunyikan.

2. **Kemungkinan penyebab "gambar jadi 2" saat preview:** ditelusuri seluruh
   state machine, TIDAK ketemu jalur yang bisa bikin dua panel `.is-active`
   bersamaan (`setState()` selalu bersih-bersih semua panel dulu sebelum
   aktifkan satu). Yang ketemu: **race condition nyata** — `shotContinueButton`
   ("➡ Lanjut" di preview per-shot) tidak pernah di-`disable`, beda dari
   `captureButton` yang di-disable saat countdown. Dwi-tap cepat di shot
   terakhir bisa memicu `finalizePhotoBooth()` dua kali. Ditambah,
   `composeFinalPreview()` sebelumnya TIDAK di-`await` (padahal isinya
   `canvas.toBlob()` yang async) sebelum `setState("preview")` — ada celah
   waktu panel preview sudah tampil tapi `previewImageElement.src` belum
   ke-update ke gambar final (berpotensi sempat menampilkan gambar sisa
   sesi sebelumnya, terutama abis "Ambil Ulang Semua").
   - Fix: `composeFinalPreview()` sekarang `return new Promise(...)`,
     resolve di dalam callback `toBlob`; `finalizePhotoBooth()` pakai
     `await composeFinalPreview()` sebelum `setState("preview")`.
   - Fix: `handleShotContinueClick()` sekarang guard `if (shotContinueButton.disabled) return;`
     + disable tombolnya sendiri di awal; re-enable di `handleCaptureClick()`
     (shot baru) dan `resetScene()`.
   - **Catatan jujur:** ini kemungkinan penyebab paling masuk akal yang
     ketemu lewat code review statis, tapi tidak 100% bisa dipastikan tanpa
     reproduce langsung. Kalau setelah fix ini masih kejadian, tolong info
     layout mana yang dipakai (Single/Triple/Korean Six) pas bug muncul.

---

## Polish 5 — Final Gift + Ending + Photobooth + Scrapbook ✅

**File yang berubah (visual, di luar bug fix di atas):**

- `css/scene/scene-final-gift.css` — tambah radial glow pink tipis di
  belakang konten (pola sama seperti Birthday di Polish 2), momen ini
  sama-sama "perayaan".
- `css/scene/scene-ending.css`
  - Background sekarang gradient sendiri: pink soft → cream, identitas
    "menoleh ke belakang, nostalgic", beda dari Birthday/Final Gift yang
    lebih pink cerah.
  - `.ending__stat` (angka hari/jam/menit) sekarang jadi "kartu" kecil
    (background putih transparan, `--radius-sm`, `--shadow-sm`) —
    sebelumnya cuma angka polos mengambang, sekarang punya hierarki visual
    lebih jelas.
- `css/scene/scene-scrapbook.css` — `.scrapbook__page` & `.scrapbook__new-photo`
  radius/shadow ditokenisasi. **Sengaja TIDAK** menyentuh warna meja kayu,
  tape, atau shadow foto-foto lama (`.scrapbook__old-photo`) — itu detail
  yang memang didesain "vintage/sepia", beda konteks dari sistem
  shadow warm-tinted lainnya, mengubahnya justru merusak kesan handmade-nya.

**Kenapa Photobooth tidak dapat polish visual tambahan di luar bug fix:**
scene ini paling kompleks (9-panel state machine) dan baru saja diubah
karena bug — fokus sesi ini stabilitas dulu. Polish visual murni untuk
Photobooth (kalau memang perlu) sebaiknya jadi sprint sendiri setelah user
konfirmasi ketiga bug di atas sudah benar-benar beres di device asli.

---

## 🐛 Bug Fix Round 2 — Root cause SEBENARNYA dari "kepotong" & "gambar jadi 2"

User kasih screenshot nyata setelah testing fix round 1 — ternyata bug
masih ada, dan user sendiri curiga soal "layout/posisi". Curiganya benar.
Investigasi ulang nemu root cause yang jauh lebih mendasar dari
race-condition di round 1 (race-condition itu tetap perbaikan valid,
tapi bukan penyebab utama).

**Root cause (dikonfirmasi lewat 3 screenshot user):**

`css/scene.css` — `.scene` (base class SEMUA scene) di-set
`position: absolute; inset: 0;` TANPA `overflow-y` sama sekali (default
`visible`), sementara `css/global.css` men-set `body { overflow: hidden; }`.
Selama isi sebuah scene MUAT dalam satu layar (100dvh), tidak masalah.
Begitu isi scene LEBIH TINGGI dari layar — panel Share di Photobooth
(teks + 2 tombol) atau `.scrapbook__page` (foto + teks + dekorasi) — scene
tidak punya scroll internal-nya sendiri, jadi kontennya overflow tanpa
batas yang jelas. Karena `body{overflow:hidden}` seharusnya mematikan
scroll dokumen tapi TIDAK ADA scene individual yang scrollable, hasilnya
scroll behavior jadi tidak konsisten/bocor — persis cocok sama SEMUA
gejala yang dilaporkan user: bagian atas kepotong (share panel), bagian
tengah kepotong (scrapbook), dan foto yang kelihatan "dobel" saat scroll
(hampir pasti ini konten scene yang overflow tanpa batas jelas, bukan
benar-benar 2 gambar berbeda).

**Kenapa fix round 1 (`overflow-y:auto` seharusnya) tidak langsung kelihatan efeknya:**
5 scene (`scene-birthday`, `scene-final-gift`, `scene-scrapbook`,
`scene-video`, `scene-stars`) masing-masing punya `overflow: hidden`
SENDIRI di level scene (awalnya buat menahan dekorasi — balon/confetti/
partikel bintang — biar tidak bocor ke samping layar). Karena file
scene-*.css di-load SETELAH `scene.css`, aturan ini MENIMPA BALIK
`overflow-y: auto` yang mau ditambahkan ke `.scene`. **`scene-scrapbook`
ada di daftar ini — persis scene yang dilaporkan kepotong di tengah.**

**Fix:**

1. `css/scene.css` — `.scene` sekarang `overflow-y: auto;` +
   `-webkit-overflow-scrolling: touch;` (scroll internal per-scene,
   bukan mengandalkan body).
2. `css/scene.css` — `justify-content: center` → **`justify-content: safe center`**.
   Ini detail teknis penting: flexbox yang di-scroll dengan `justify-content:center`
   polos punya bug lama di banyak browser — begitu konten overflow,
   bagian ATAS yang "ke-center" jadi TIDAK BISA dijangkau scroll sama
   sekali (persis "atasnya kecut" di panel Share). `safe center` adalah
   keyword CSS modern yang dirancang khusus untuk kasus ini: tetap center
   kalau muat, otomatis jatuh ke start-alignment (bisa di-scroll penuh)
   begitu overflow.
3. Lima scene (`scene-birthday.css`, `scene-final-gift.css`,
   `scene-scrapbook.css`, `scene-video.css`, `scene-stars.css`) —
   `overflow: hidden` diganti jadi `overflow-x: hidden; overflow-y: auto;`
   — tetap menahan dekorasi biar tidak bocor SAMPING (niat awalnya utuh),
   tapi vertical tetap bisa scroll kalau konten lebih tinggi dari layar.

**Status fix round 1 (race condition `shotContinueButton`, `await composeFinalPreview()`):**
tetap dipertahankan — itu tetap bug nyata yang valid diperbaiki, cuma
bukan penyebab UTAMA yang dilaporkan user. Kombinasi kedua fix ini
seharusnya membuat behaviour jauh lebih stabil.

**Mohon ditest ulang di device asli:** khususnya alur penuh Photobooth →
Scrapbook, dan perhatikan apakah share panel & scrapbook sudah full
kelihatan (bisa di-scroll natural ke atas/bawah tanpa kepotong).

---

## Polish 6 — Scrapbook: posisi & animasi menutup

**Konteks:** setelah fix scroll di round sebelumnya, user lapor
`.scrapbook__page` terasa tidak di tengah lagi, dan animasi "menutup"
(`scaleY` menyusut ke atas) terasa seperti "tersedot/menggulung ke atas".

**File yang berubah:** `css/scene/scene-scrapbook.css`

- **Posisi:** `.scrapbook__page` dapat `margin-top`/`margin-bottom: var(--space-lg)`.
  Penjelasan jujur ke user: begitu konten halaman lebih tinggi dari layar,
  `.scene` (base) pakai `justify-content: safe center` (lihat fix round 2)
  yang SENGAJA jatuh ke start-alignment (dari atas) begitu overflow — ini
  trade-off yang perlu supaya konten tetap bisa di-scroll penuh sampai ke
  atas (masalah sebelumnya: kelihatan "center" tapi sebenarnya kepotong,
  tidak bisa discroll sama sekali). Margin ini bukan bikin "benar-benar
  selalu di tengah", tapi memastikan minimal selalu ada jarak dari tepi
  atas, jadi tetap terasa "diposisikan" bukan "kejepit".
- **Animasi menutup — diganti total, sesuai pilihan user ("flip 3D dari samping"):**
  - `.scene-scrapbook` dapat `perspective: 1000px;` (wajib di parent
    langsung elemen yang di-transform 3D, bukan di elemen itu sendiri).
  - `.scrapbook__page` — `transform-origin: top center` → **`left center`**
    (engsel di kiri, seperti sampul buku), tambah `backface-visibility: hidden;`.
  - `.scrapbook__page.is-closing` — `transform: scaleY(0.04); opacity:0.3;`
    → **`transform: rotateY(-100deg); opacity: 0;`** — halaman berputar
    menutup di engsel kiri sampai menjauh dari pandangan, dibarengi fade
    (supaya tidak terlihat "menembus" flat waktu sudutnya mendekati
    tegak lurus terhadap layar).

---

<!-- Sprint berikutnya ditambah di bawah ini, format sama: judul, file baru,
     file berubah, catatan penting untuk lanjutan. -->
