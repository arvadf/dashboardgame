/**
 * =====================================================
 * DIGITAL GAME STORE ANALYTICS DASHBOARD
 * script.js — Logika Utama Dashboard
 *
 * Modul:
 *  1. DataManager          — Memuat & memfilter data JSON
 *  2. KPIRenderer          — Menampilkan kartu KPI
 *  3. ChartManager         — Mengelola semua Chart.js
 *  4. TableRenderer        — Menampilkan tabel transaksi
 *  5. TopProductsRenderer  — Progress bar produk terlaris
 *  6. FilterManager        — Mengelola filter interaktif
 *  7. App                  — Bootstrap & orkestrasi
 *
 * Iterasi 1: Marketplace Distribution Chart (Radar + Polar)
 * Iterasi 2: Smooth filter — debounce, from-value counter,
 *            CSS fade transition pada chart & KPI cards
 * =====================================================
 */

'use strict';

/* ─── Utilitas Global ─────────────────────────────────────────────────────── */

/**
 * Debounce: menunda eksekusi fn selama `wait` ms setelah pemanggilan terakhir.
 * Digunakan agar filter tidak memicu render berulang saat input cepat.
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Menerapkan kelas CSS transisi fade-out pada semua chart-container & KPI card
 * sehingga pergantian data terasa mulus.
 */
function applyFadeOut() {
  document.querySelectorAll('.chart-container, .kpi-value').forEach(el => {
    el.style.transition = 'opacity 0.18s ease';
    el.style.opacity = '0.35';
  });
}

/** Mengembalikan opasitas ke 1 setelah render selesai. */
function applyFadeIn() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.chart-container, .kpi-value').forEach(el => {
      el.style.opacity = '1';
    });
  });
}

/* =====================================================
   MODUL 1 — DataManager
   Bertanggung jawab memuat dan memfilter data JSON
   ===================================================== */
const DataManager = (() => {
  /** @type {Object|null} Raw data dari JSON */
  let rawData = null;

  /**
   * Memuat data dari file data.json
   * @returns {Promise<Object>}
   */
  /**
   * Data fallback inline — digunakan jika fetch gagal (mis. file://).
   * Identik dengan data.json.
   */
  const FALLBACK_DATA = {"transactions":[{"id":"TRX-001","date":"2025-01-05","platform":"Steam","category":"Action","product":"CyberBlade Chronicles","quantity":3,"price":299000,"stock":45},{"id":"TRX-002","date":"2025-01-08","platform":"PlayStation Store","category":"RPG","product":"Eternal Realms Online","quantity":2,"price":459000,"stock":30},{"id":"TRX-003","date":"2025-01-12","platform":"Xbox Game Pass","category":"Sports","product":"SuperLeague Football 25","quantity":5,"price":199000,"stock":120},{"id":"TRX-004","date":"2025-01-15","platform":"Steam","category":"Strategy","product":"Empire Builder Deluxe","quantity":1,"price":349000,"stock":200},{"id":"TRX-005","date":"2025-01-20","platform":"Nintendo eShop","category":"Adventure","product":"Pixel Quest Odyssey","quantity":4,"price":259000,"stock":75},{"id":"TRX-006","date":"2025-01-22","platform":"Epic Games Store","category":"Shooter","product":"Warfront Infinity","quantity":6,"price":399000,"stock":60},{"id":"TRX-007","date":"2025-01-28","platform":"Steam","category":"Horror","product":"Shadow Depths","quantity":2,"price":189000,"stock":15},{"id":"TRX-008","date":"2025-02-03","platform":"PlayStation Store","category":"Action","product":"CyberBlade Chronicles","quantity":4,"price":299000,"stock":41},{"id":"TRX-009","date":"2025-02-07","platform":"Steam","category":"RPG","product":"Eternal Realms Online","quantity":3,"price":459000,"stock":27},{"id":"TRX-010","date":"2025-02-11","platform":"Epic Games Store","category":"Strategy","product":"Empire Builder Deluxe","quantity":2,"price":349000,"stock":198},{"id":"TRX-011","date":"2025-02-14","platform":"Nintendo eShop","category":"Adventure","product":"Pixel Quest Odyssey","quantity":7,"price":259000,"stock":68},{"id":"TRX-012","date":"2025-02-18","platform":"Xbox Game Pass","category":"Sports","product":"SuperLeague Football 25","quantity":3,"price":199000,"stock":117},{"id":"TRX-013","date":"2025-02-22","platform":"Steam","category":"Shooter","product":"Warfront Infinity","quantity":5,"price":399000,"stock":54},{"id":"TRX-014","date":"2025-02-25","platform":"PlayStation Store","category":"Horror","product":"Shadow Depths","quantity":1,"price":189000,"stock":13},{"id":"TRX-015","date":"2025-03-02","platform":"Steam","category":"Action","product":"CyberBlade Chronicles","quantity":8,"price":299000,"stock":33},{"id":"TRX-016","date":"2025-03-06","platform":"Epic Games Store","category":"RPG","product":"Eternal Realms Online","quantity":2,"price":459000,"stock":25},{"id":"TRX-017","date":"2025-03-10","platform":"Nintendo eShop","category":"Sports","product":"SuperLeague Football 25","quantity":6,"price":199000,"stock":111},{"id":"TRX-018","date":"2025-03-15","platform":"Xbox Game Pass","category":"Strategy","product":"Empire Builder Deluxe","quantity":3,"price":349000,"stock":195},{"id":"TRX-019","date":"2025-03-20","platform":"Steam","category":"Adventure","product":"Pixel Quest Odyssey","quantity":5,"price":259000,"stock":63},{"id":"TRX-020","date":"2025-03-25","platform":"PlayStation Store","category":"Shooter","product":"Warfront Infinity","quantity":4,"price":399000,"stock":50},{"id":"TRX-021","date":"2025-03-28","platform":"Epic Games Store","category":"Action","product":"NeonRacer X","quantity":3,"price":279000,"stock":88},{"id":"TRX-022","date":"2025-04-03","platform":"Steam","category":"RPG","product":"Dragon's Legacy","quantity":5,"price":389000,"stock":42},{"id":"TRX-023","date":"2025-04-07","platform":"Nintendo eShop","category":"Action","product":"NeonRacer X","quantity":4,"price":279000,"stock":84},{"id":"TRX-024","date":"2025-04-11","platform":"PlayStation Store","category":"Strategy","product":"Empire Builder Deluxe","quantity":2,"price":349000,"stock":193},{"id":"TRX-025","date":"2025-04-15","platform":"Steam","category":"Horror","product":"Shadow Depths","quantity":3,"price":189000,"stock":10},{"id":"TRX-026","date":"2025-04-19","platform":"Xbox Game Pass","category":"Adventure","product":"Pixel Quest Odyssey","quantity":6,"price":259000,"stock":57},{"id":"TRX-027","date":"2025-04-23","platform":"Epic Games Store","category":"Shooter","product":"Warfront Infinity","quantity":7,"price":399000,"stock":43},{"id":"TRX-028","date":"2025-04-27","platform":"Steam","category":"Sports","product":"SuperLeague Football 25","quantity":4,"price":199000,"stock":107},{"id":"TRX-029","date":"2025-05-02","platform":"PlayStation Store","category":"RPG","product":"Dragon's Legacy","quantity":6,"price":389000,"stock":36},{"id":"TRX-030","date":"2025-05-06","platform":"Steam","category":"Action","product":"CyberBlade Chronicles","quantity":7,"price":299000,"stock":26},{"id":"TRX-031","date":"2025-05-10","platform":"Nintendo eShop","category":"Strategy","product":"Empire Builder Deluxe","quantity":2,"price":349000,"stock":191},{"id":"TRX-032","date":"2025-05-14","platform":"Epic Games Store","category":"Adventure","product":"Pixel Quest Odyssey","quantity":5,"price":259000,"stock":52},{"id":"TRX-033","date":"2025-05-18","platform":"Xbox Game Pass","category":"Shooter","product":"Warfront Infinity","quantity":3,"price":399000,"stock":40},{"id":"TRX-034","date":"2025-05-22","platform":"Steam","category":"RPG","product":"Eternal Realms Online","quantity":4,"price":459000,"stock":21},{"id":"TRX-035","date":"2025-05-26","platform":"PlayStation Store","category":"Action","product":"NeonRacer X","quantity":5,"price":279000,"stock":79},{"id":"TRX-036","date":"2025-06-01","platform":"Steam","category":"Horror","product":"Shadow Depths","quantity":2,"price":189000,"stock":8},{"id":"TRX-037","date":"2025-06-05","platform":"Epic Games Store","category":"Sports","product":"SuperLeague Football 25","quantity":8,"price":199000,"stock":99},{"id":"TRX-038","date":"2025-06-09","platform":"Nintendo eShop","category":"RPG","product":"Dragon's Legacy","quantity":3,"price":389000,"stock":33},{"id":"TRX-039","date":"2025-06-13","platform":"PlayStation Store","category":"Adventure","product":"Pixel Quest Odyssey","quantity":6,"price":259000,"stock":46},{"id":"TRX-040","date":"2025-06-17","platform":"Steam","category":"Action","product":"CyberBlade Chronicles","quantity":9,"price":299000,"stock":17},{"id":"TRX-041","date":"2025-06-21","platform":"Xbox Game Pass","category":"Strategy","product":"Empire Builder Deluxe","quantity":4,"price":349000,"stock":187},{"id":"TRX-042","date":"2025-06-25","platform":"Epic Games Store","category":"Shooter","product":"Warfront Infinity","quantity":5,"price":399000,"stock":35},{"id":"TRX-043","date":"2025-07-02","platform":"Steam","category":"RPG","product":"Eternal Realms Online","quantity":6,"price":459000,"stock":15},{"id":"TRX-044","date":"2025-07-06","platform":"PlayStation Store","category":"Action","product":"NeonRacer X","quantity":4,"price":279000,"stock":75},{"id":"TRX-045","date":"2025-07-10","platform":"Nintendo eShop","category":"Sports","product":"SuperLeague Football 25","quantity":7,"price":199000,"stock":92},{"id":"TRX-046","date":"2025-07-14","platform":"Steam","category":"Adventure","product":"Pixel Quest Odyssey","quantity":3,"price":259000,"stock":43},{"id":"TRX-047","date":"2025-07-18","platform":"Epic Games Store","category":"Horror","product":"Shadow Depths","quantity":4,"price":189000,"stock":4},{"id":"TRX-048","date":"2025-07-22","platform":"Xbox Game Pass","category":"RPG","product":"Dragon's Legacy","quantity":5,"price":389000,"stock":28},{"id":"TRX-049","date":"2025-07-26","platform":"Steam","category":"Shooter","product":"Warfront Infinity","quantity":8,"price":399000,"stock":27},{"id":"TRX-050","date":"2025-07-30","platform":"PlayStation Store","category":"Strategy","product":"Empire Builder Deluxe","quantity":3,"price":349000,"stock":184},{"id":"TRX-051","date":"2025-08-03","platform":"Steam","category":"Action","product":"CyberBlade Chronicles","quantity":10,"price":299000,"stock":7},{"id":"TRX-052","date":"2025-08-07","platform":"Nintendo eShop","category":"Adventure","product":"Pixel Quest Odyssey","quantity":5,"price":259000,"stock":38},{"id":"TRX-053","date":"2025-08-11","platform":"Epic Games Store","category":"RPG","product":"Eternal Realms Online","quantity":4,"price":459000,"stock":11},{"id":"TRX-054","date":"2025-08-15","platform":"Xbox Game Pass","category":"Sports","product":"SuperLeague Football 25","quantity":6,"price":199000,"stock":86},{"id":"TRX-055","date":"2025-08-19","platform":"Steam","category":"Strategy","product":"Empire Builder Deluxe","quantity":2,"price":349000,"stock":182},{"id":"TRX-056","date":"2025-08-23","platform":"PlayStation Store","category":"Action","product":"NeonRacer X","quantity":6,"price":279000,"stock":69},{"id":"TRX-057","date":"2025-08-27","platform":"Epic Games Store","category":"Shooter","product":"Warfront Infinity","quantity":9,"price":399000,"stock":18},{"id":"TRX-058","date":"2025-09-01","platform":"Steam","category":"RPG","product":"Dragon's Legacy","quantity":7,"price":389000,"stock":21},{"id":"TRX-059","date":"2025-09-05","platform":"Nintendo eShop","category":"Horror","product":"Shadow Depths","quantity":2,"price":189000,"stock":2},{"id":"TRX-060","date":"2025-09-09","platform":"Xbox Game Pass","category":"Adventure","product":"Pixel Quest Odyssey","quantity":4,"price":259000,"stock":34},{"id":"TRX-061","date":"2025-09-13","platform":"Steam","category":"Action","product":"CyberBlade Chronicles","quantity":6,"price":299000,"stock":1},{"id":"TRX-062","date":"2025-09-17","platform":"PlayStation Store","category":"Strategy","product":"Empire Builder Deluxe","quantity":3,"price":349000,"stock":179},{"id":"TRX-063","date":"2025-09-21","platform":"Epic Games Store","category":"Sports","product":"SuperLeague Football 25","quantity":5,"price":199000,"stock":81},{"id":"TRX-064","date":"2025-09-25","platform":"Steam","category":"RPG","product":"Eternal Realms Online","quantity":3,"price":459000,"stock":8},{"id":"TRX-065","date":"2025-10-01","platform":"Nintendo eShop","category":"Action","product":"NeonRacer X","quantity":5,"price":279000,"stock":64},{"id":"TRX-066","date":"2025-10-05","platform":"Steam","category":"Shooter","product":"Warfront Infinity","quantity":7,"price":399000,"stock":11},{"id":"TRX-067","date":"2025-10-09","platform":"Xbox Game Pass","category":"RPG","product":"Dragon's Legacy","quantity":4,"price":389000,"stock":17},{"id":"TRX-068","date":"2025-10-13","platform":"PlayStation Store","category":"Adventure","product":"Pixel Quest Odyssey","quantity":6,"price":259000,"stock":28},{"id":"TRX-069","date":"2025-10-17","platform":"Epic Games Store","category":"Action","product":"CyberBlade Chronicles","quantity":3,"price":299000,"stock":0},{"id":"TRX-070","date":"2025-10-20","platform":"Steam","category":"Sports","product":"SuperLeague Football 25","quantity":8,"price":199000,"stock":73}],"products":[{"name":"CyberBlade Chronicles","category":"Action","price":299000,"stock":0,"platforms":["Steam","Epic Games Store","PlayStation Store"]},{"name":"Eternal Realms Online","category":"RPG","price":459000,"stock":8,"platforms":["Steam","PlayStation Store","Epic Games Store"]},{"name":"SuperLeague Football 25","category":"Sports","price":199000,"stock":73,"platforms":["Xbox Game Pass","Steam","Epic Games Store","Nintendo eShop"]},{"name":"Empire Builder Deluxe","category":"Strategy","price":349000,"stock":179,"platforms":["Steam","Xbox Game Pass","PlayStation Store","Nintendo eShop"]},{"name":"Pixel Quest Odyssey","category":"Adventure","price":259000,"stock":28,"platforms":["Nintendo eShop","Steam","PlayStation Store","Xbox Game Pass"]},{"name":"Warfront Infinity","category":"Shooter","price":399000,"stock":11,"platforms":["Epic Games Store","Steam","PlayStation Store","Xbox Game Pass"]},{"name":"Shadow Depths","category":"Horror","price":189000,"stock":2,"platforms":["Steam","PlayStation Store","Nintendo eShop","Epic Games Store"]},{"name":"NeonRacer X","category":"Action","price":279000,"stock":64,"platforms":["Epic Games Store","Nintendo eShop","PlayStation Store"]},{"name":"Dragon's Legacy","category":"RPG","price":389000,"stock":17,"platforms":["Steam","PlayStation Store","Nintendo eShop","Xbox Game Pass"]}]};

  async function load() {
    try {
      const res = await fetch('./data.json');
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      rawData = await res.json();
      console.log(`[DataManager] Berhasil memuat ${rawData.transactions.length} transaksi.`);
      return rawData;
    } catch (err) {
      // [FIX #4] Fallback ke data inline jika fetch gagal (mis. dibuka via file://)
      console.warn('[DataManager] fetch gagal, menggunakan data inline sebagai fallback:', err.message);
      rawData = FALLBACK_DATA;
      return rawData;
    }
  }

  /**
   * Mengembalikan data mentah yang sudah dimuat
   * @returns {Object}
   */
  function getRaw() {
    return rawData;
  }

  /**
   * Memfilter transaksi berdasarkan kriteria filter aktif
   * @param {Object} filters — { platform, category, dateFrom, dateTo }
   * @returns {Array} — Array transaksi yang sudah difilter
   */
  function filter(filters) {
    if (!rawData) return [];
    return rawData.transactions.filter(trx => {
      const trxDate = new Date(trx.date);

      // Filter Platform
      if (filters.platform && filters.platform !== 'all') {
        if (trx.platform !== filters.platform) return false;
      }

      // Filter Kategori
      if (filters.category && filters.category !== 'all') {
        if (trx.category !== filters.category) return false;
      }

      // Filter Tanggal Mulai
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (trxDate < from) return false;
      }

      // Filter Tanggal Akhir
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (trxDate > to) return false;
      }

      return true;
    });
  }

  /**
   * Menghitung KPI dari array transaksi
   * @param {Array} transactions
   * @returns {Object} — { totalRevenue, totalTransactions, totalItems, avgOrderValue }
   */
  function computeKPIs(transactions) {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.price * t.quantity, 0);
    const totalItems   = transactions.reduce((sum, t) => sum + t.quantity, 0);
    const totalTrx     = transactions.length;
    const avgOrderValue = totalTrx > 0 ? totalRevenue / totalTrx : 0;
    return { totalRevenue, totalTransactions: totalTrx, totalItems, avgOrderValue };
  }

  /**
   * [FIX #1] Menghitung % perubahan antara dua nilai KPI
   * @param {number} current
   * @param {number} previous
   * @returns {number|null} — null jika previous = 0
   */
  function computeKPIChange(current, previous) {
    if (previous === 0) return null;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Menghitung tren penjualan bulanan
   * @param {Array} transactions
   * @returns {Object} — { labels: string[], revenues: number[] }
   */
  function computeMonthlySales(transactions) {
    const monthMap = {};
    const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!monthMap[key]) monthMap[key] = 0;
      monthMap[key] += t.price * t.quantity;
    });
    const sorted = Object.keys(monthMap).sort();
    const labels  = sorted.map(k => {
      const [y, m] = k.split('-');
      return `${MONTHS_ID[parseInt(m)-1]} ${y}`;
    });
    const revenues = sorted.map(k => monthMap[k]);
    return { labels, revenues };
  }

  /**
   * Menghitung pendapatan per platform
   * @param {Array} transactions
   * @returns {Object} — { platforms: string[], revenues: number[] }
   */
  function computePlatformRevenue(transactions) {
    const platformMap = {};
    transactions.forEach(t => {
      if (!platformMap[t.platform]) platformMap[t.platform] = 0;
      platformMap[t.platform] += t.price * t.quantity;
    });
    const sorted = Object.entries(platformMap).sort((a, b) => b[1] - a[1]);
    return {
      platforms: sorted.map(e => e[0]),
      revenues:  sorted.map(e => e[1])
    };
  }

  /**
   * Menghitung top produk berdasarkan total pendapatan
   * @param {Array} transactions
   * @param {number} topN — Jumlah produk teratas
   * @returns {Array} — [{ name, revenue, quantity }]
   */
  function computeTopProducts(transactions, topN = 7) {
    const productMap = {};
    transactions.forEach(t => {
      if (!productMap[t.product]) productMap[t.product] = { revenue: 0, quantity: 0 };
      productMap[t.product].revenue  += t.price * t.quantity;
      productMap[t.product].quantity += t.quantity;
    });
    return Object.entries(productMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, topN);
  }

  /**
   * [FIX #2] Menghitung distribusi status stok dari daftar produk,
   * difilter berdasarkan platform yang aktif.
   * @param {Object} filters — filter aktif saat ini
   * @returns {Object} — { habis, kritis, rendah, aman }
   */
  function computeStockStatus(filters) {
    if (!rawData) return {};
    const categories = { 'Habis (0)': 0, 'Kritis (1-10)': 0, 'Rendah (11-50)': 0, 'Aman (>50)': 0 };

    // Jika ada filter platform, hanya hitung produk yang tersedia di platform itu
    const activePlatform = filters && filters.platform && filters.platform !== 'all'
      ? filters.platform
      : null;

    rawData.products.forEach(p => {
      if (activePlatform && !p.platforms.includes(activePlatform)) return;

      if (p.stock === 0)       categories['Habis (0)']++;
      else if (p.stock <= 10)  categories['Kritis (1-10)']++;
      else if (p.stock <= 50)  categories['Rendah (11-50)']++;
      else                     categories['Aman (>50)']++;
    });
    return categories;
  }

  /**
   * [ITERASI 1] Menghitung distribusi multi-metrik antar platform marketplace.
   * Menghasilkan data dinormalisasi (0–100) untuk Radar Chart dan data
   * absolut untuk Polar Area Chart.
   * @param {Array} transactions
   * @returns {Object} — { platforms, revenue, transactions, items, marketShare }
   */
  function computeMarketplaceDistribution(transactions) {
    const map = {};
    transactions.forEach(t => {
      if (!map[t.platform]) map[t.platform] = { revenue: 0, trx: 0, items: 0 };
      map[t.platform].revenue += t.price * t.quantity;
      map[t.platform].trx    += 1;
      map[t.platform].items  += t.quantity;
    });

    const platforms = Object.keys(map);
    if (!platforms.length) return { platforms: [], revenue: [], transactions: [], items: [], marketShare: [] };

    // Normalisasi setiap metrik ke skala 0–100 berdasarkan nilai maksimumnya
    const maxRev   = Math.max(...platforms.map(p => map[p].revenue))   || 1;
    const maxTrx   = Math.max(...platforms.map(p => map[p].trx))       || 1;
    const maxItems = Math.max(...platforms.map(p => map[p].items))     || 1;

    const totalItems = platforms.reduce((s, p) => s + map[p].items, 0) || 1;

    return {
      platforms,
      revenue:      platforms.map(p => Math.round((map[p].revenue / maxRev)   * 100)),
      transactions: platforms.map(p => Math.round((map[p].trx    / maxTrx)   * 100)),
      items:        platforms.map(p => Math.round((map[p].items  / maxItems)  * 100)),
      // Pangsa pasar absolut (item) untuk Polar Area Chart
      marketShare:  platforms.map(p => map[p].items),
      rawRevenue:   platforms.map(p => map[p].revenue),
      rawItems:     platforms.map(p => map[p].items),
      rawTrx:       platforms.map(p => map[p].trx),
    };
  }

  return { load, getRaw, filter, computeKPIs, computeKPIChange, computeMonthlySales,
           computePlatformRevenue, computeTopProducts, computeStockStatus,
           computeMarketplaceDistribution };
})();


/* =====================================================
   MODUL 2 — KPIRenderer
   Menampilkan nilai KPI pada kartu dashboard
   ===================================================== */
const KPIRenderer = (() => {
  /**
   * Format angka ke format Rupiah Indonesia
   * @param {number} num
   * @returns {string}
   */
  function formatRupiah(num) {
    if (num >= 1_000_000_000) return `Rp ${(num/1_000_000_000).toFixed(1)}M`;
    if (num >= 1_000_000)     return `Rp ${(num/1_000_000).toFixed(1)}Jt`;
    if (num >= 1_000)         return `Rp ${(num/1_000).toFixed(0)}Rb`;
    return `Rp ${num.toFixed(0)}`;
  }

  /**
   * [ITERASI 2] Animasi angka counter dari nilai 'from' ke 'target'.
   * Saat filter berubah, counter dimulai dari nilai SEBELUMNYA (bukan 0)
   * sehingga transisi terasa instan & mulus tanpa lompatan.
   * @param {HTMLElement} el
   * @param {number} from   — Nilai awal (nilai KPI saat ini)
   * @param {number} target — Nilai tujuan (nilai KPI baru)
   * @param {Function} formatter
   * @param {number} duration — Durasi animasi dalam ms
   */
  function animateCounter(el, from, target, formatter, duration = 550) {
    // Batalkan animasi sebelumnya jika masih berjalan
    if (el._rafId) cancelAnimationFrame(el._rafId);

    const startTime = performance.now();
    const step = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out expo — cepat di awal, melambat di akhir
      const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current  = from + (target - from) * eased;
      el.textContent = formatter(current);
      if (progress < 1) {
        el._rafId = requestAnimationFrame(step);
      } else {
        el._rafId = null;
        // Pastikan nilai akhir tepat
        el.textContent = formatter(target);
      }
    };
    el._rafId = requestAnimationFrame(step);
  }

  /** Menyimpan nilai KPI terakhir agar animasi from-value berjalan. */
  let prevKPIs = { totalRevenue: 0, totalTransactions: 0, totalItems: 0, avgOrderValue: 0 };

  /**
   * [FIX #1] Update badge % perubahan pada sebuah kartu KPI.
   * @param {string} cardClass — CSS class kartu (mis. 'kpi-revenue')
   * @param {number} current
   * @param {number} previous
   */
  function updateBadge(cardClass, current, previous) {
    const card = document.querySelector(`.${cardClass}`);
    if (!card) return;
    const badge = card.querySelector('.kpi-badge');
    if (!badge) return;

    const change = DataManager.computeKPIChange(current, previous);
    if (change === null) {
      badge.textContent = '—';
      badge.className = 'kpi-badge';
      return;
    }
    const isUp = change >= 0;
    badge.textContent = `${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(1)}%`;
    badge.className = `kpi-badge ${isUp ? 'up' : 'down'}`;
  }

  /**
   * Render semua KPI ke DOM.
   * @param {Object} kpis — { totalRevenue, totalTransactions, totalItems, avgOrderValue }
   */
  function render(kpis) {
    const elRevenue = document.getElementById('kpi-revenue');
    const elTrx     = document.getElementById('kpi-trx');
    const elItems   = document.getElementById('kpi-items');
    const elAov     = document.getElementById('kpi-aov');

    // [FIX #1] Update badge % perubahan vs nilai sebelumnya
    updateBadge('kpi-revenue', kpis.totalRevenue,      prevKPIs.totalRevenue);
    updateBadge('kpi-trx',     kpis.totalTransactions, prevKPIs.totalTransactions);
    updateBadge('kpi-items',   kpis.totalItems,        prevKPIs.totalItems);
    updateBadge('kpi-aov',     kpis.avgOrderValue,     prevKPIs.avgOrderValue);

    // Animasikan dari nilai sebelumnya → nilai baru
    if (elRevenue) animateCounter(elRevenue, prevKPIs.totalRevenue,      kpis.totalRevenue,      formatRupiah);
    if (elTrx)     animateCounter(elTrx,     prevKPIs.totalTransactions, kpis.totalTransactions, v => Math.floor(v).toLocaleString('id-ID'));
    if (elItems)   animateCounter(elItems,   prevKPIs.totalItems,        kpis.totalItems,        v => Math.floor(v).toLocaleString('id-ID') + ' item');
    if (elAov)     animateCounter(elAov,     prevKPIs.avgOrderValue,     kpis.avgOrderValue,     formatRupiah);

    // Simpan nilai saat ini sebagai 'prev' untuk animasi berikutnya
    prevKPIs = { ...kpis };
  }

  return { render, formatRupiah };
})();


/* =====================================================
   MODUL 3 — ChartManager
   Membuat & memperbarui semua chart Chart.js
   ===================================================== */
const ChartManager = (() => {
  /** Menyimpan referensi instance Chart.js */
  const charts = {};

  /** Warna palet untuk grafik */
  const COLORS = {
    purple:  '#6366f1',
    cyan:    '#22d3ee',
    pink:    '#f472b6',
    green:   '#4ade80',
    orange:  '#fb923c',
    yellow:  '#fbbf24',
    red:     '#f87171',
    blue:    '#60a5fa',
    teal:    '#2dd4bf',
    indigo:  '#818cf8',
  };

  const PALETTE = Object.values(COLORS);

  /** Konfigurasi global Chart.js */
  function configureDefaults() {
    Chart.defaults.color = '#8b95b0';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size   = 11;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 22, 41, 0.95)';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(99,102,241,0.4)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = '#f0f4ff';
    Chart.defaults.plugins.tooltip.bodyColor  = '#8b95b0';
    Chart.defaults.plugins.tooltip.padding    = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.boxPadding = 4;
  }

  /**
   * Menghancurkan chart yang ada sebelum membuat yang baru
   * @param {string} id
   */
  function destroyChart(id) {
    if (charts[id]) {
      charts[id].destroy();
      delete charts[id];
    }
  }

  /**
   * 1. Grafik Tren Penjualan Bulanan (Line Chart dengan gradient fill)
   */
  function renderMonthlySales(data) {
    destroyChart('monthly');
    const ctx = document.getElementById('chart-monthly');
    if (!ctx) return;

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(99,102,241,0.3)');
    gradient.addColorStop(1, 'rgba(99,102,241,0.0)');

    if (!data.labels.length) return showNoData('chart-monthly');

    charts['monthly'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Pendapatan',
          data:  data.revenues,
          borderColor: COLORS.purple,
          backgroundColor: gradient,
          borderWidth: 2.5,
          pointBackgroundColor: COLORS.purple,
          pointBorderColor:     '#0f1629',
          pointBorderWidth:     2,
          pointRadius:          5,
          pointHoverRadius:     7,
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${KPIRenderer.formatRupiah(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { maxRotation: 30 }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { callback: v => KPIRenderer.formatRupiah(v) }
          }
        }
      }
    });
  }

  /**
   * 2. Grafik Pendapatan per Platform (Bar Chart horizontal)
   */
  function renderPlatformRevenue(data) {
    destroyChart('platform');
    const ctx = document.getElementById('chart-platform');
    if (!ctx) return;

    if (!data.platforms.length) return showNoData('chart-platform');

    const bgColors = data.platforms.map((_, i) => PALETTE[i % PALETTE.length] + '22');
    const bdColors = data.platforms.map((_, i) => PALETTE[i % PALETTE.length]);

    charts['platform'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.platforms,
        datasets: [{
          label: 'Pendapatan',
          data: data.revenues,
          backgroundColor: bgColors,
          borderColor: bdColors,
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${KPIRenderer.formatRupiah(ctx.parsed.x)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { callback: v => KPIRenderer.formatRupiah(v) }
          },
          y: {
            grid: { display: false, drawBorder: false },
          }
        }
      }
    });
  }

  /**
   * 3. Grafik Distribusi Stok (Doughnut Chart)
   */
  function renderStockStatus(data) {
    destroyChart('stock');
    const ctx = document.getElementById('chart-stock');
    if (!ctx) return;

    const labels   = Object.keys(data);
    const values   = Object.values(data);
    const stockColors = ['#f87171', '#fb923c', '#fbbf24', '#4ade80'];

    // Update legenda
    const legendEl = document.getElementById('stock-legend');
    if (legendEl) {
      legendEl.innerHTML = labels.map((lbl, i) => `
        <div class="stock-legend-item">
          <span class="stock-dot" style="background:${stockColors[i]}"></span>
          <span class="stock-legend-label">${lbl}</span>
          <span class="stock-legend-count">${values[i]} produk</span>
        </div>
      `).join('');
    }

    if (values.every(v => v === 0)) return showNoData('chart-stock');

    charts['stock'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: stockColors.map(c => c + '33'),
          borderColor:      stockColors,
          borderWidth: 2,
          hoverOffset: 10,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} produk`
            }
          }
        }
      }
    });
  }

  /**
   * Helper: tampilkan pesan "tidak ada data" di dalam canvas
   */
  function showNoData(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    parent.innerHTML = `
      <div class="no-data">
        <div class="no-data-icon">📭</div>
        <div>Tidak ada data yang cocok dengan filter yang dipilih.</div>
      </div>`;
  }

  /* ── ITERASI 1: Marketplace Distribution Charts ────────────────────────── */

  /**
   * 4. Radar Chart — Perbandingan multi-metrik antar platform.
   * Menampilkan Revenue (%), Transaksi (%), dan Item Terjual (%)
   * dalam satu tampilan radar untuk analisis saluran penjualan.
   * @param {Object} data — Output dari DataManager.computeMarketplaceDistribution()
   */
  function renderMarketplaceRadar(data) {
    destroyChart('mkt-radar');
    const ctx = document.getElementById('chart-marketplace-radar');
    if (!ctx) return;

    if (!data.platforms.length) return showNoData('chart-marketplace-radar');

    // Setiap platform menjadi satu dataset dengan tiga dimensi
    const platformColors = [
      { border: COLORS.purple, bg: 'rgba(99,102,241,0.15)'  },
      { border: COLORS.cyan,   bg: 'rgba(34,211,238,0.12)'  },
      { border: COLORS.pink,   bg: 'rgba(244,114,182,0.12)' },
      { border: COLORS.green,  bg: 'rgba(74,222,128,0.12)'  },
      { border: COLORS.orange, bg: 'rgba(251,146,60,0.12)'  },
    ];

    const datasets = data.platforms.map((platform, i) => {
      const c = platformColors[i % platformColors.length];
      return {
        label: platform,
        data:  [data.revenue[i], data.transactions[i], data.items[i]],
        borderColor:     c.border,
        backgroundColor: c.bg,
        borderWidth:     2,
        pointBackgroundColor: c.border,
        pointBorderColor:    '#0f1629',
        pointBorderWidth:    2,
        pointRadius:         4,
        pointHoverRadius:    6,
      };
    });

    charts['mkt-radar'] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Revenue (%)', 'Transaksi (%)', 'Item Terjual (%)'],
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeOutQuart' },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 12,
              font: { size: 10 },
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const p  = data.platforms[ctx.datasetIndex];
                const dim = ['Revenue', 'Transaksi', 'Item'][ctx.dataIndex];
                const raw = [data.rawRevenue, data.rawTrx, data.rawItems][ctx.dataIndex];
                const unit = ctx.dataIndex === 0
                  ? KPIRenderer.formatRupiah(raw[ctx.datasetIndex])
                  : raw[ctx.datasetIndex].toLocaleString('id-ID');
                return ` ${p} — ${dim}: ${unit} (${ctx.parsed.r}%)`;
              }
            }
          }
        },
        scales: {
          r: {
            angleLines:  { color: 'rgba(255,255,255,0.06)' },
            grid:        { color: 'rgba(255,255,255,0.06)' },
            pointLabels: { color: '#8b95b0', font: { size: 11, weight: '600' } },
            ticks: {
              color: '#4a5568',
              backdropColor: 'transparent',
              stepSize: 25,
              max: 100,
              min: 0,
            }
          }
        }
      }
    });
  }

  /**
   * 5. Polar Area Chart — Pangsa pasar platform berdasarkan item terjual.
   * Memperlihatkan kontribusi absolut setiap platform sebagai saluran
   * distribusi terbaik secara visual.
   * @param {Object} data — Output dari DataManager.computeMarketplaceDistribution()
   */
  function renderMarketplacePolar(data) {
    destroyChart('mkt-polar');
    const ctx = document.getElementById('chart-marketplace-polar');
    if (!ctx) return;

    if (!data.platforms.length) return showNoData('chart-marketplace-polar');

    const POLAR_COLORS = [
      '#6366f1', '#22d3ee', '#f472b6', '#4ade80', '#fb923c'
    ];

    // Render legenda
    const legendEl = document.getElementById('marketplace-legend');
    if (legendEl) {
      const totalItems = data.rawItems.reduce((s, v) => s + v, 0) || 1;
      legendEl.innerHTML = data.platforms.map((p, i) => {
        const pct = ((data.rawItems[i] / totalItems) * 100).toFixed(1);
        return `
          <div class="stock-legend-item">
            <span class="stock-dot" style="background:${POLAR_COLORS[i % POLAR_COLORS.length]}"></span>
            <span class="stock-legend-label" title="${p}">${p.replace(' Store','').replace(' Game Pass','')}</span>
            <span class="stock-legend-count">${pct}%</span>
          </div>`;
      }).join('');
    }

    charts['mkt-polar'] = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: data.platforms,
        datasets: [{
          data:            data.rawItems,
          backgroundColor: POLAR_COLORS.map((c, i) =>
            i < data.platforms.length ? c + '30' : 'transparent'),
          borderColor:     POLAR_COLORS.slice(0, data.platforms.length),
          borderWidth:     2,
          hoverOffset:     8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: 'easeOutBack' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = data.rawItems.reduce((s, v) => s + v, 0) || 1;
                const pct   = ((ctx.parsed.r / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${ctx.parsed.r} item (${pct}%)`;
              }
            }
          }
        },
        scales: {
          r: {
            grid:  { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#4a5568', backdropColor: 'transparent', font: { size: 9 } }
          }
        }
      }
    });
  }

  return {
    configureDefaults,
    renderMonthlySales,
    renderPlatformRevenue,
    renderStockStatus,
    renderMarketplaceRadar,
    renderMarketplacePolar,
  };
})();


/* =====================================================
   MODUL 4 — TableRenderer
   Menampilkan tabel transaksi terbaru
   ===================================================== */
const TableRenderer = (() => {
  const PLATFORM_ICONS = {
    'Steam':             '🎮',
    'PlayStation Store': '🎯',
    'Xbox Game Pass':    '🟢',
    'Nintendo eShop':    '🔴',
    'Epic Games Store':  '🎪',
  };

  /**
   * Render tabel dengan transaksi yang difilter
   * @param {Array} transactions
   * @param {number} limit — Maks baris yang ditampilkan
   */
  function render(transactions, limit = 10) {
    const tbody = document.getElementById('trx-tbody');
    const countEl = document.getElementById('trx-count');

    if (!tbody) return;

    if (countEl) countEl.textContent = `${transactions.length} transaksi`;

    const displayed = transactions.slice(0, limit);

    if (!displayed.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted);">
            📭 Tidak ada transaksi yang ditemukan
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = displayed.map(t => {
      const revenue     = (t.price * t.quantity).toLocaleString('id-ID');
      const icon        = PLATFORM_ICONS[t.platform] || '🎮';
      const dateFormatted = new Date(t.date).toLocaleDateString('id-ID', {
        day:'2-digit', month:'short', year:'numeric'
      });
      const catClass = `cat-${t.category.replace(/\s+/g,'')}`;
      return `
        <tr>
          <td class="td-id">${t.id}</td>
          <td class="td-date">${dateFormatted}</td>
          <td>
            <span class="platform-pill">${icon} ${t.platform}</span>
          </td>
          <td><span class="category-badge ${catClass}">${t.category}</span></td>
          <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.product}</td>
          <td style="text-align:center;">${t.quantity}x</td>
          <td class="td-revenue">Rp ${revenue}</td>
        </tr>`;
    }).join('');
  }

  return { render };
})();


/* =====================================================
   MODUL 5 — TopProductsRenderer
   Menampilkan daftar produk terlaris dengan bar
   ===================================================== */
const TopProductsRenderer = (() => {
  const BAR_GRADIENTS = [
    'linear-gradient(90deg,#6366f1,#8b5cf6)',
    'linear-gradient(90deg,#22d3ee,#0891b2)',
    'linear-gradient(90deg,#f472b6,#ec4899)',
    'linear-gradient(90deg,#4ade80,#16a34a)',
    'linear-gradient(90deg,#fb923c,#ea580c)',
    'linear-gradient(90deg,#fbbf24,#d97706)',
    'linear-gradient(90deg,#f87171,#dc2626)',
  ];

  /**
   * Render daftar produk teratas
   * @param {Array} products — [{ name, revenue, quantity }]
   */
  function render(products) {
    const container = document.getElementById('top-products-list');
    if (!container) return;

    if (!products.length) {
      container.innerHTML = `
        <div class="no-data">
          <div class="no-data-icon">📭</div>
          <div>Tidak ada data produk tersedia.</div>
        </div>`;
      return;
    }

    const maxRevenue = products[0].revenue;

    container.innerHTML = products.map((p, i) => {
      const pct      = (p.revenue / maxRevenue) * 100;
      const gradient = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
      const revStr   = KPIRenderer.formatRupiah(p.revenue);
      return `
        <div class="product-item">
          <div class="product-row">
            <div class="product-rank" style="background:${gradient}">${i+1}</div>
            <div class="product-name" title="${p.name}">${p.name}</div>
            <div class="product-revenue">${revStr}</div>
          </div>
          <div class="product-bar-track">
            <div class="product-bar-fill" style="width:${pct}%;background:${gradient}"></div>
          </div>
        </div>`;
    }).join('');
  }

  return { render };
})();


/* =====================================================
   MODUL 6 — FilterManager
   Mengelola nilai filter & memicu pembaruan dashboard
   ===================================================== */
const FilterManager = (() => {
  /** Nilai filter saat ini */
  let current = {
    platform: 'all',
    category: 'all',
    dateFrom: '',
    dateTo:   ''
  };

  /** Callback yang dipanggil setiap kali filter berubah */
  let onChangeCallback = null;

  /**
   * Mengambil nilai filter saat ini
   * @returns {Object}
   */
  function get() { return { ...current }; }

  /**
   * Mengisi opsi dropdown dari data mentah
   * @param {Object} rawData
   */
  function populateDropdowns(rawData) {
    const platforms  = [...new Set(rawData.transactions.map(t => t.platform))].sort();
    const categories = [...new Set(rawData.transactions.map(t => t.category))].sort();

    const selPlatform = document.getElementById('filter-platform');
    const selCategory = document.getElementById('filter-category');

    if (selPlatform) {
      selPlatform.innerHTML = `<option value="all">Semua Platform</option>` +
        platforms.map(p => `<option value="${p}">${p}</option>`).join('');
    }

    if (selCategory) {
      selCategory.innerHTML = `<option value="all">Semua Kategori</option>` +
        categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  }

  /**
   * [ITERASI 2] Mendaftarkan listener untuk setiap elemen filter.
   * Setiap listener di-debounce (100 ms) agar tidak memicu render
   * berulang saat pengguna mengetik atau menggeser input dengan cepat.
   * Dropdown (select) langsung merespons tanpa debounce.
   * @param {Function} onChange — dipanggil saat filter berubah
   */
  function init(onChange) {
    onChangeCallback = onChange;

    const selPlatform = document.getElementById('filter-platform');
    const selCategory = document.getElementById('filter-category');
    const inpFrom     = document.getElementById('filter-date-from');
    const inpTo       = document.getElementById('filter-date-to');
    const btnReset    = document.getElementById('btn-reset');

    // Debounced trigger khusus untuk input tanggal
    const debouncedTrigger = debounce(() => triggerChange(), 100);

    // Select: respons langsung (tidak perlu debounce)
    if (selPlatform) {
      selPlatform.addEventListener('change', e => {
        current.platform = e.target.value;
        triggerChange();
      });
    }

    if (selCategory) {
      selCategory.addEventListener('change', e => {
        current.category = e.target.value;
        triggerChange();
      });
    }

    // Input tanggal: debounce 100ms agar tidak memicu render per keystroke
    if (inpFrom) {
      inpFrom.addEventListener('change', e => {
        current.dateFrom = e.target.value;
        debouncedTrigger();
      });
    }

    if (inpTo) {
      inpTo.addEventListener('change', e => {
        current.dateTo = e.target.value;
        debouncedTrigger();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => reset());
    }
  }

  /**
   * Reset semua filter ke nilai default & langsung render ulang.
   */
  function reset() {
    current = { platform: 'all', category: 'all', dateFrom: '', dateTo: '' };

    const selPlatform = document.getElementById('filter-platform');
    const selCategory = document.getElementById('filter-category');
    const inpFrom     = document.getElementById('filter-date-from');
    const inpTo       = document.getElementById('filter-date-to');

    if (selPlatform) selPlatform.value = 'all';
    if (selCategory) selCategory.value = 'all';
    if (inpFrom) inpFrom.value = '';
    if (inpTo)   inpTo.value   = '';

    triggerChange();
  }

  /** Memanggil callback onChange */
  function triggerChange() {
    if (typeof onChangeCallback === 'function') onChangeCallback(current);
  }

  return { get, populateDropdowns, init, reset };
})();


/* =====================================================
   MODUL 7 — App
   Titik masuk & orkestrasi semua modul
   ===================================================== */
const App = (() => {
  /**
   * [ITERASI 2] Memperbarui seluruh dashboard dengan data yang difilter.
   *
   * Alur smooth update:
   *  1. applyFadeOut() — chart & KPI value memudar (opacity 0.35, 180ms)
   *  2. Semua kalkulasi & render dilakukan setelah fade selesai
   *  3. applyFadeIn() — elemen kembali ke opacity 1 via rAF
   *
   * KPI counter dimulai dari nilai sebelumnya (bukan 0) — dikelola oleh
   * KPIRenderer.prevKPIs — sehingga tidak ada "lompatan" angka.
   *
   * @param {Object} filters
   */
  function updateDashboard(filters) {
    // ── [ITERASI 2] Fade-out ringan sebelum data diganti
    applyFadeOut();

    // Gunakan setTimeout 0 agar browser sempat merender fade-out sebelum
    // proses berat (destroy + recreate chart) dijalankan.
    setTimeout(() => {
      const filtered = DataManager.filter(filters);

      // ── Hitung & render KPI (dengan animasi from-value)
      const kpis = DataManager.computeKPIs(filtered);
      KPIRenderer.render(kpis);

      // ── Perbarui semua chart
      const monthly     = DataManager.computeMonthlySales(filtered);
      const platform    = DataManager.computePlatformRevenue(filtered);
      const topProds    = DataManager.computeTopProducts(filtered);
      const stockData   = DataManager.computeStockStatus(filters); // [FIX #2] teruskan filters
      const mktData     = DataManager.computeMarketplaceDistribution(filtered);

      ChartManager.renderMonthlySales(monthly);
      ChartManager.renderPlatformRevenue(platform);
      ChartManager.renderStockStatus(stockData);
      ChartManager.renderMarketplaceRadar(mktData);
      ChartManager.renderMarketplacePolar(mktData);

      // ── Render top produk
      TopProductsRenderer.render(topProds);

      // ── [FIX #5] Render ringkasan platform dinamis
      renderPlatformSummary(mktData);

      // ── Render tabel transaksi (diurutkan terbaru)
      const sortedTrx = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
      TableRenderer.render(sortedTrx, 10);

      // ── [ITERASI 2] Fade-in setelah semua konten selesai dirender
      applyFadeIn();
    }, 0);
  }

  /**
   * [FIX #5] Render ringkasan platform secara dinamis dari data transaksi.
   * Menampilkan platform aktif beserta statistik cepat (total revenue & transaksi).
   * @param {Object} mktData — output computeMarketplaceDistribution
   */
  function renderPlatformSummary(mktData) {
    const container = document.getElementById('platform-summary-list');
    if (!container) return;

    const PLATFORM_META = {
      'Steam':             { icon: '🎮', color: '#818cf8', tag: 'PC' },
      'Epic Games Store':  { icon: '🎪', color: '#22d3ee', tag: 'PC' },
      'PlayStation Store': { icon: '🎯', color: '#f472b6', tag: 'Konsol' },
      'Xbox Game Pass':    { icon: '🟢', color: '#4ade80', tag: 'Konsol' },
      'Nintendo eShop':    { icon: '🔴', color: '#fbbf24', tag: 'Konsol' },
    };

    if (!mktData.platforms.length) {
      container.innerHTML = `<div style="font-size:0.8rem;color:var(--text-muted);text-align:center;padding:1rem;">Tidak ada data platform.</div>`;
      return;
    }

    container.innerHTML = mktData.platforms.map((p, i) => {
      const meta  = PLATFORM_META[p] || { icon: '🎮', color: '#818cf8', tag: '' };
      const rev   = KPIRenderer.formatRupiah(mktData.rawRevenue[i]);
      const trx   = mktData.rawTrx[i];
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:0.65rem 0.85rem;
                    background:${meta.color}12;
                    border:1px solid ${meta.color}26;
                    border-radius:10px;">
          <span style="font-size:0.8rem;">${meta.icon} ${p}</span>
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <span style="font-size:0.68rem;color:var(--text-muted);">${trx} trx</span>
            <span style="font-size:0.7rem;color:${meta.color};font-weight:600;">${rev}</span>
          </div>
        </div>`;
    }).join('');
  }

  /**
   * Memperbarui jam header secara real-time
   */
  function startClock() {
    const el = document.getElementById('header-time');
    if (!el) return;
    const tick = () => {
      const now = new Date();
      el.textContent = now.toLocaleString('id-ID', {
        weekday: 'short', day: '2-digit',
        month:   'short',  year: 'numeric',
        hour:    '2-digit', minute: '2-digit', second: '2-digit'
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  /**
   * Bootstrap aplikasi — titik masuk utama
   */
  async function init() {
    try {
      // Tampilkan indikator loading
      document.getElementById('loading-overlay')?.classList.remove('hidden');

      // 1. Konfigurasi Chart.js defaults
      ChartManager.configureDefaults();

      // 2. Muat data dari JSON
      const rawData = await DataManager.load();

      // 3. Isi dropdown filter dari data
      FilterManager.populateDropdowns(rawData);

      // 4. Inisialisasi filter dengan callback
      FilterManager.init((filters) => updateDashboard(filters));

      // 5. Render dashboard pertama kali (tanpa filter)
      updateDashboard(FilterManager.get());

      // 6. Mulai jam
      startClock();

      // Sembunyikan loading overlay
      document.getElementById('loading-overlay')?.classList.add('hidden');

      console.log('[App] Dashboard berhasil diinisialisasi ✅');
    } catch (err) {
      console.error('[App] Gagal menginisialisasi:', err);
      // Tampilkan pesan error kepada pengguna
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.innerHTML = `
          <div style="text-align:center;color:#f87171;">
            <div style="font-size:2rem;margin-bottom:1rem;">⚠️</div>
            <div style="font-weight:600;margin-bottom:0.5rem;">Gagal memuat data</div>
            <div style="font-size:0.8rem;color:#8b95b0;">
              Pastikan file data.json tersedia dan buka via server HTTP (bukan file://).
            </div>
          </div>`;
      }
    }
  }

  // Tunggu DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { updateDashboard };
})();
