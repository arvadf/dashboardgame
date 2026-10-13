# 🎮 GameStore Analytics — Dashboard Analitik Toko Game Digital

Dashboard analitik interaktif untuk memantau performa toko game digital secara real-time. Dibangun dengan HTML, Tailwind CSS, Vanilla JavaScript, dan Chart.js — tanpa framework atau build tool.

---

## 📸 Fitur Utama

- **4 KPI Card** — Total Pendapatan, Total Transaksi, Total Item Terjual, dan Rata-rata Nilai Pesanan (AOV) dengan animasi counter dan badge % perubahan dinamis
- **Filter Interaktif** — Filter berdasarkan Platform Marketplace, Kategori Game, dan Rentang Tanggal; semua chart & tabel otomatis diperbarui
- **5 Chart Interaktif** (Chart.js):
  - 📉 Line Chart — Tren penjualan bulanan dengan gradient fill
  - 🕸️ Radar Chart — Perbandingan multi-metrik (Revenue, Transaksi, Item) antar platform, dinormalisasi 0–100
  - 🎯 Polar Area Chart — Pangsa pasar item terjual per platform
  - 🖥️ Bar Chart Horizontal — Peringkat pendapatan per platform
  - 📦 Doughnut Chart — Distribusi status stok produk
- **Top 7 Produk Terlaris** — Progress bar dengan gradient warna per peringkat
- **Ringkasan Platform Dinamis** — Kartu info platform berikut revenue & jumlah transaksi, otomatis berubah sesuai filter
- **Tabel Transaksi** — Riwayat 10 transaksi terbaru sesuai filter aktif
- **Jam Real-time** di header
- **Loading Overlay** dengan animasi saat data dimuat
- **Dark Mode Premium** dengan efek glassmorphism
- **Responsif** — Mobile, tablet, dan desktop

---

## 🗂️ Struktur Proyek

```
ibm project/
├── index.html   # Struktur halaman & markup
├── style.css    # Semua gaya, animasi, dan tema dark mode
├── script.js    # Seluruh logika aplikasi (7 modul)
└── data.json    # Data dummy transaksi & produk
```

---

## 📊 Data (`data.json`)

| Field | Keterangan |
|---|---|
| `transactions` | 70 transaksi dari Januari–Oktober 2025 |
| `products` | 9 produk unik dari 7 kategori |

**Platform yang tersedia:** Steam, Epic Games Store, PlayStation Store, Xbox Game Pass, Nintendo eShop

**Kategori game:** Action, RPG, Sports, Strategy, Adventure, Shooter, Horror

**Struktur transaksi:**
```json
{
  "id": "TRX-001",
  "date": "2025-01-05",
  "platform": "Steam",
  "category": "Action",
  "product": "CyberBlade Chronicles",
  "quantity": 3,
  "price": 299000,
  "stock": 45
}
```

**Struktur produk:**
```json
{
  "name": "CyberBlade Chronicles",
  "category": "Action",
  "price": 299000,
  "stock": 0,
  "platforms": ["Steam", "Epic Games Store", "PlayStation Store"]
}
```

---

## 🏗️ Arsitektur JavaScript (`script.js`)

Menggunakan pola **IIFE Module Pattern** — 7 modul terisolasi:

```
App.init()
 ├── DataManager.load()              → fetch data.json (fallback inline)
 ├── FilterManager.populateDropdowns()
 ├── FilterManager.init(callback)    → debounce + event listeners
 └── updateDashboard(filters)
      ├── DataManager.filter()
      ├── DataManager.computeKPIs / computeMonthlySales / dll.
      ├── KPIRenderer.render()        → animasi counter + badge dinamis
      ├── ChartManager.render*()      → destroy + recreate Chart.js
      ├── TopProductsRenderer.render()
      ├── renderPlatformSummary()     → ringkasan platform dinamis
      └── TableRenderer.render()
```

| Modul | Tanggung Jawab |
|---|---|
| `DataManager` | Fetch & fallback data, filter transaksi, semua kalkulasi (KPI, bulanan, platform, top produk, stok, distribusi marketplace, % perubahan KPI) |
| `KPIRenderer` | Format Rupiah, animasi counter `requestAnimationFrame` dari nilai sebelumnya, update badge % perubahan |
| `ChartManager` | Konfigurasi Chart.js defaults, destroy+recreate 5 chart (Line, Bar, Doughnut, Radar, Polar Area) |
| `TableRenderer` | Render tabel transaksi dengan format tanggal, platform pill, category badge berwarna |
| `TopProductsRenderer` | Progress bar produk terlaris dengan gradient per peringkat |
| `FilterManager` | Manage state filter, populate dropdown dari data, debounce input tanggal (100ms) |
| `App` | Bootstrap, orkestrasi semua modul, jam real-time header |

---

## 🎨 Desain & Styling (`style.css`)

- **Tema:** Dark mode premium (`#0a0e1a`) dengan efek glassmorphism (`backdrop-filter: blur`)
- **Font:** Inter (UI) + JetBrains Mono (angka/kode)
- **Animasi:**
  - `fadeInUp` — KPI card muncul staggered saat load
  - `pulse-glow` — logo icon berpendar
  - `blink` — dot LIVE badge
  - `shimmer` — skeleton loading
  - Fade transition chart & KPI saat filter berubah (`opacity 0.35 → 1`)
- **Warna aksen:** Purple `#6366f1`, Cyan `#22d3ee`, Pink `#f472b6`, Green `#4ade80`
- **Responsif:**
  - `≤ 1024px` — kolom main-side menjadi 1 kolom
  - `≤ 768px` — KPI grid 2 kolom, chart stacked, tanggal header disembunyikan
  - `≤ 480px` — KPI grid 1 kolom, filter 1 kolom

---

## 🚀 Cara Menjalankan

### Via HTTP Server (direkomendasikan)

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
# Gunakan ekstensi "Live Server" → klik kanan index.html → Open with Live Server
```

Buka browser: `http://localhost:8080`

### Via File Langsung (`file://`)

Bisa langsung dibuka di browser — aplikasi menggunakan **data inline fallback** otomatis jika `fetch('./data.json')` gagal, sehingga tetap berjalan tanpa server.

---

## 🔧 Dependensi Eksternal (CDN)

| Library | Versi | Fungsi |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com) | CDN | Utility classes layout & spacing |
| [Chart.js](https://www.chartjs.org) | 4.4.3 | Semua visualisasi data |
| [Google Fonts](https://fonts.google.com) | — | Inter & JetBrains Mono |

> Aplikasi membutuhkan koneksi internet untuk memuat CDN di atas. Untuk penggunaan offline penuh, unduh library tersebut dan ubah path di `index.html`.

---

## 📁 Riwayat Iterasi

| Iterasi | Perubahan |
|---|---|
| **Iterasi 1** | Tambah Radar Chart + Polar Area Chart untuk distribusi marketplace |
| **Iterasi 2** | Smooth filter update — debounce 100ms, fade CSS, animasi KPI counter dari nilai sebelumnya |
| **Fix #1** | KPI badge % perubahan dihitung dari data nyata (tidak lagi hardcoded) |
| **Fix #2** | Distribusi stok sekarang reaktif terhadap filter platform |
| **Fix #3** | Tambah `.hidden` CSS class agar loading overlay bisa disembunyikan dengan benar |
| **Fix #4** | Fallback data inline agar dashboard tetap berjalan saat dibuka via `file://` |
| **Fix #5** | Ringkasan platform digenerasi dinamis dari data (revenue & transaksi aktual) |

---

## 📄 Lisensi

© 2025 GameStore Analytics. Semua hak dilindungi.
