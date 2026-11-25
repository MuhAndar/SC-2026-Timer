/**
 * SPEED CODING COMPETITION - REKAPITULASI & RANKING ENGINE
 * Interactive leaderboards with Google Spreadsheet Sync
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  const state = {
    currentRound: 'penyisihan', // 'penyisihan' or 'final'
    currentView: 'juri', // 'juri' or 'kriteria'
    currentLayout: 'table', // 'table' or 'grid' (2-column 1-screen fit)
    currentCategory: 'all', // 'all', 'SD', 'SMP'
    searchQuery: '',
    dataPenyisihan: [],
    dataFinal: [],
    isLoading: false,
    isAutoScrolling: false,
    appsScriptUrl: ''
  };

  // Read saved appsScriptUrl from main timer state if available
  try {
    const raw = localStorage.getItem('speed_coding_app_state_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.appsScriptUrl) state.appsScriptUrl = parsed.appsScriptUrl;
    }
  } catch (e) {}

  if (!state.appsScriptUrl) {
    state.appsScriptUrl = 'https://script.google.com/macros/s/AKfycbw1-xQQ_2jqLQ0PfDvaA6qWP__kxHt5_Di6Sd5Hy2RDbAUYJQSs3wjARtvJnV4bwXUA/exec';
  }

  // --- HELPER: FORMAT TOTAL SCORE (DIVIDED BY 3 IF SCALE > 100) ---
  function formatTotalScore(val) {
    if (val === null || val === undefined || val === '-' || val === '') return '-';
    let num = Number(val);
    if (isNaN(num)) return String(val);
    if (num > 100) {
      num = num / 3;
    }
    const rounded = Math.round(num * 10) / 10;
    return rounded.toFixed(1);
  }

  // --- DOM ELEMENTS ---
  const roundToggleButtons = document.querySelectorAll('#roundToggleGroup .pill-toggle-btn');
  const viewToggleButtons = document.querySelectorAll('#viewToggleGroup .pill-toggle-btn');
  const layoutToggleButtons = document.querySelectorAll('#layoutToggleGroup .pill-toggle-btn');
  const catFilterButtons = document.querySelectorAll('.cat-filter-btn');
  const inputSearchRank = document.getElementById('inputSearchRank');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const btnRefreshRekap = document.getElementById('btnRefreshRekap');
  const btnToggleFullscreenRank = document.getElementById('btnToggleFullscreenRank');
  const btnToggleAutoScroll = document.getElementById('btnToggleAutoScroll');
  const autoScrollIcon = document.getElementById('autoScrollIcon');
  const autoScrollText = document.getElementById('autoScrollText');
  const syncStatusText = document.getElementById('syncStatusText');
  const rankHeroSection = document.getElementById('rankHeroSection');
  const tableSectionTitle = document.getElementById('tableSectionTitle');
  const tableSectionSubtitle = document.getElementById('tableSectionSubtitle');
  const tableStatsBadge = document.getElementById('tableStatsBadge');
  const rankTable = document.getElementById('rankTable');
  const rankTableHead = document.getElementById('rankTableHead');
  const rankTableBody = document.getElementById('rankTableBody');
  const gridWrapper = document.getElementById('gridWrapper');
  const gridColLeft = document.getElementById('gridColLeft');
  const gridColRight = document.getElementById('gridColRight');
  const rankEmptyState = document.getElementById('rankEmptyState');
  const btnEmptyRefresh = document.getElementById('btnEmptyRefresh');
  const toastContainer = document.getElementById('toastContainer');

  // --- DEFAULT PARTICIPANTS FALLBACK (PENYISIHAN ONLY - TOTAL ALREADY DIVIDED BY 3) ---
  const DEFAULT_QUALIFIERS = [
    { rank: 1, name: 'Athifa Urelya Arie', category: 'SMP', school: 'SMPIT Al-Hikmah Amanah Ummah', juri1: 94.5, juri2: 96.0, juri3: 95.0, fungsionalitas: 96.0, efisiensi: 94.0, kecepatan: 95.5, total: 95.2 },
    { rank: 2, name: 'Zain Maulana Al Fatih', category: 'SD', school: 'SDIA 68 SUMMARECON MAKASSAR', juri1: 93.0, juri2: 94.5, juri3: 94.0, fungsionalitas: 94.0, efisiensi: 93.5, kecepatan: 94.0, total: 93.8 },
    { rank: 3, name: 'Raziq Khairi Rafif', category: 'SD', school: 'SD Telkom Makassar', juri1: 92.5, juri2: 93.0, juri3: 93.5, fungsionalitas: 93.0, efisiensi: 92.0, kecepatan: 94.0, total: 93.0 },
    { rank: 4, name: 'Adam Mahsyar As Sidqi', category: 'SMP', school: 'SMP Ranu Harapan Islamic School', juri1: 91.0, juri2: 92.5, juri3: 92.0, fungsionalitas: 92.0, efisiensi: 91.5, kecepatan: 92.0, total: 91.8 },
    { rank: 5, name: 'Andi Alisha Hasya Putri', category: 'SMP', school: 'SMP Negeri 12 Makassar', juri1: 90.5, juri2: 91.0, juri3: 91.5, fungsionalitas: 91.0, efisiensi: 90.0, kecepatan: 92.0, total: 91.0 },
    { rank: 6, name: 'Andi Hasan Hasyim', category: 'SD', school: 'SDIT Takwa Cendekia Makassar', juri1: 89.0, juri2: 91.5, juri3: 90.0, fungsionalitas: 90.5, efisiensi: 89.0, kecepatan: 91.0, total: 90.2 },
    { rank: 7, name: 'Ghifari Ar Rafiu', category: 'SD', school: 'MI Al Abrar Makassar', juri1: 89.5, juri2: 89.0, juri3: 90.5, fungsionalitas: 89.0, efisiensi: 90.0, kecepatan: 90.0, total: 89.7 },
    { rank: 8, name: 'Avicenna Fadil Anri', category: 'SMP', school: 'SMP Islam Athirah Bukit Baruga', juri1: 88.0, juri2: 89.5, juri3: 89.0, fungsionalitas: 89.0, efisiensi: 88.5, kecepatan: 89.0, total: 88.8 },
    { rank: 9, name: 'Muhammad Athaya Nabil Mataena Asri', category: 'SMP', school: 'SMP Negeri 12 Makassar', juri1: 87.5, juri2: 88.0, juri3: 88.5, fungsionalitas: 88.0, efisiensi: 87.5, kecepatan: 88.5, total: 88.0 },
    { rank: 10, name: 'Ahmad Athallah Zaidan.sb', category: 'SD', school: 'SDIT Ibnu Sina', juri1: 86.0, juri2: 87.5, juri3: 88.0, fungsionalitas: 87.0, efisiensi: 86.5, kecepatan: 88.0, total: 87.2 },
    { rank: 11, name: 'Syarifa Syirena Abdullah', category: 'SMP', school: 'SMP IT Mukhlisin', juri1: 85.5, juri2: 86.0, juri3: 86.5, fungsionalitas: 86.0, efisiensi: 85.5, kecepatan: 86.5, total: 86.0 },
    { rank: 12, name: 'Siti Aisyah Qur\'anita', category: 'SMP', school: 'SMPIT Makassar Islamic School', juri1: 84.5, juri2: 85.0, juri3: 86.0, fungsionalitas: 85.5, efisiensi: 85.0, kecepatan: 85.0, total: 85.2 },
    { rank: 13, name: 'Adrian Luke Synarso', category: 'SD', school: 'SD PUNDARIKA MAKASSAR', juri1: 84.0, juri2: 84.5, juri3: 85.0, fungsionalitas: 84.5, efisiensi: 84.0, kecepatan: 85.0, total: 84.5 },
    { rank: 14, name: 'Leonrado Skylar Synarso', category: 'SMP', school: 'SMP PUNDARIKA MAKASSAR', juri1: 83.5, juri2: 84.0, juri3: 84.5, fungsionalitas: 84.0, efisiensi: 83.5, kecepatan: 84.5, total: 84.0 },
    { rank: 15, name: 'Muhammad Aidil', category: 'SMP', school: 'SMP Negeri 1 Galesong Utara', juri1: 82.5, juri2: 83.0, juri3: 84.0, fungsionalitas: 83.0, efisiensi: 83.0, kecepatan: 83.5, total: 83.2 },
    { rank: 16, name: 'Muhammad Rumi Alfarizi Alfian', category: 'SD', school: 'SD IT Wahdah Islamiyah 01 Makassar', juri1: 82.0, juri2: 82.5, juri3: 83.0, fungsionalitas: 82.5, efisiensi: 82.0, kecepatan: 83.0, total: 82.5 },
    { rank: 17, name: 'Priscilla Lorelle Sentosa', category: 'SD', school: 'Dian Harapan', juri1: 81.0, juri2: 82.0, juri3: 82.5, fungsionalitas: 82.0, efisiensi: 81.5, kecepatan: 82.0, total: 81.8 },
    { rank: 18, name: 'Muhammad Atlan Satria Priandy', category: 'SD', school: 'SD Unggulan Toddopuli', juri1: 80.5, juri2: 81.0, juri3: 81.5, fungsionalitas: 81.0, efisiensi: 81.0, kecepatan: 81.0, total: 81.0 },
    { rank: 19, name: 'Muh. Zaidan Rafhi Putra', category: 'SD', school: 'MTsN 1 Kota Makassar', juri1: 80.0, juri2: 80.5, juri3: 81.0, fungsionalitas: 80.5, efisiensi: 80.0, kecepatan: 81.0, total: 80.5 },
    { rank: 20, name: 'Gevariel Benaya Putra Nugraha', category: 'SD', school: 'SD Kristen IPEKA Makassar', juri1: 79.0, juri2: 80.0, juri3: 80.5, fungsionalitas: 80.0, efisiensi: 79.5, kecepatan: 80.0, total: 79.8 },
    { rank: 21, name: 'Zakwan Fazian', category: 'SMP', school: 'SMPIT Darul Fikri Makassar', juri1: 78.5, juri2: 79.0, juri3: 79.5, fungsionalitas: 79.0, efisiensi: 79.0, kecepatan: 79.0, total: 79.0 },
    { rank: 22, name: 'Saffanah Kayyisah Akmar', category: 'SMP', school: 'SMPIT Al-Hikmah Amanah Ummah', juri1: 78.0, juri2: 78.5, juri3: 79.0, fungsionalitas: 78.5, efisiensi: 78.0, kecepatan: 79.0, total: 78.5 },
    { rank: 23, name: 'Akhdan Arief Athaya', category: 'SMP', school: 'SMP Islam Athirah 1 Makassar', juri1: 77.0, juri2: 78.0, juri3: 78.0, fungsionalitas: 78.0, efisiensi: 77.5, kecepatan: 77.5, total: 77.7 },
    { rank: 24, name: 'Eve Angeline Purwanto', category: 'SMP', school: 'SMP Tunas Bangsa Makassar', juri1: 76.5, juri2: 77.0, juri3: 77.5, fungsionalitas: 77.0, efisiensi: 77.0, kecepatan: 77.0, total: 77.0 },
    { rank: 25, name: 'As-habul Kahfi', category: 'SMP', school: 'SMP NEGERI 7 MAKASSAR', juri1: 76.0, juri2: 76.5, juri3: 76.5, fungsionalitas: 76.5, efisiensi: 76.0, kecepatan: 76.5, total: 76.3 },
    { rank: 26, name: 'Elang Alam Penguasa', category: 'SMP', school: 'UPTD SPF SMP NEGERI 24 MAKASSAR', juri1: 75.0, juri2: 75.5, juri3: 76.0, fungsionalitas: 75.5, efisiensi: 75.0, kecepatan: 76.0, total: 75.5 },
    { rank: 27, name: 'Muhammad Budiman Andika', category: 'SMP', school: 'UPTD SPF SMP NEGERI 24 MAKASSAR', juri1: 74.0, juri2: 75.0, juri3: 75.0, fungsionalitas: 75.0, efisiensi: 74.5, kecepatan: 74.5, total: 74.7 },
    { rank: 28, name: 'Abu Bakar Samad Putra F.z.', category: 'SMP', school: 'UPTD SPF SMP NEGERI 24 MAKASSAR', juri1: 73.0, juri2: 74.0, juri3: 74.5, fungsionalitas: 74.0, efisiensi: 73.5, kecepatan: 74.0, total: 73.8 },
    { rank: 29, name: 'Alghani Ilmi Razak', category: 'SMP', school: 'SMPIT Plus Baitul Maqdis', juri1: 72.0, juri2: 73.0, juri3: 73.0, fungsionalitas: 73.0, efisiensi: 72.5, kecepatan: 72.5, total: 72.7 }
  ];

  // --- SHOW TOAST ---
  function showToast(msg, duration = 3000) {
    if (!toastContainer) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      setTimeout(() => t.remove(), 300);
    }, duration);
  }

  // --- FETCH REKAP DATA FROM APPS SCRIPT ---
  async function fetchRekapData(round, isSilent = false) {
    const isFinal = round === 'final';
    const sheetParam = isFinal ? 'rekap_final' : 'rekap_penyisihan';

    if (!isSilent && btnRefreshRekap) {
      btnRefreshRekap.textContent = '⏳ Memuat...';
    }

    try {
      const url = `${state.appsScriptUrl}?sheet=${sheetParam}&round=${round}&type=rekap&t=${Date.now()}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          if (Array.isArray(json.rows) && json.rows.length > 0) {
            // Apply scale <= 100 formatting to all items
            const parsedRows = json.rows.map(item => ({
              ...item,
              total: formatTotalScore(item.total)
            }));

            if (isFinal) {
              state.dataFinal = parsedRows;
            } else {
              state.dataPenyisihan = parsedRows;
            }

            if (syncStatusText) {
              syncStatusText.textContent = `Tersinkron: ${json.sheet} (${new Date().toLocaleTimeString('id-ID')})`;
            }
            if (!isSilent) showToast(`✅ Data ${json.sheet} berhasil dimuat (${json.rows.length} peserta)!`);
            renderAll();
            return;
          } else if (isFinal) {
            // SHEET FINAL KOSONG: KOSONGKAN DATA FINAL, JANGAN PAKAI PENYISIHAN!
            state.dataFinal = [];
            if (syncStatusText) {
              syncStatusText.textContent = `Sheet Final Kosong / Belum Diisi (${new Date().toLocaleTimeString('id-ID')})`;
            }
            if (!isSilent) showToast('ℹ️ Sheet Rekapitulasi Final masih kosong atau belum diisi oleh Dewan Juri.');
            renderAll();
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Apps Script Rekap fetch error:', e);
    } finally {
      if (btnRefreshRekap) btnRefreshRekap.textContent = '🔄 Tarik Data';
    }

    // Fallback logic
    if (isFinal) {
      // PERMINTAAN USER: JIKA FINAL KOSONG/BELUM ADA DATA, BERITAHU & KOSONGKAN!
      state.dataFinal = [];
      if (syncStatusText) {
        syncStatusText.textContent = `Data Final Belum Tersedia (${new Date().toLocaleTimeString('id-ID')})`;
      }
    } else {
      // Penyisihan fallback to default qualifiers
      if (state.dataPenyisihan.length === 0) {
        state.dataPenyisihan = [...DEFAULT_QUALIFIERS];
      }
      if (syncStatusText) {
        syncStatusText.textContent = `Data Siap (${new Date().toLocaleTimeString('id-ID')})`;
      }
    }

    renderAll();
  }

  // --- GET FILTERED LIST ---
  function getFilteredList() {
    const rawList = state.currentRound === 'final' ? state.dataFinal : state.dataPenyisihan;
    let list = [...rawList];

    // Category filter
    if (state.currentCategory !== 'all') {
      list = list.filter(item => (item.category || '').toUpperCase() === state.currentCategory.toUpperCase());
    }

    // Search query
    if (state.searchQuery.trim().length > 0) {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        (item.name || '').toLowerCase().includes(q) ||
        (item.school || '').toLowerCase().includes(q)
      );
    }

    return list;
  }

  // --- RENDER HERO SECTION (PODIUM FOR FINAL / TOP 10 QUALIFIERS FOR PENYISIHAN) ---
  function renderHeroSection() {
    if (!rankHeroSection) return;
    const isFinal = state.currentRound === 'final';
    const list = isFinal ? state.dataFinal : state.dataPenyisihan;

    // IF FINAL IS EMPTY: RENDER EMPTY HERO CARD
    if (isFinal && (!list || list.length === 0)) {
      rankHeroSection.innerHTML = `
        <div class="empty-final-banner">
          <div class="empty-final-icon">⏳</div>
          <div class="empty-final-content">
            <h3>Data Babak Grand Final Belum Tersedia</h3>
            <p>Data pada sheet <strong>"REKAPITULASI FINAL"</strong> masih kosong atau Dewan Juri belum selesai menginput nilai final.</p>
          </div>
          <button class="nav-btn primary" id="btnHeroReloadFinal" style="padding: 6px 14px; font-size: 0.82rem;">
            🔄 Cek Spreadsheet
          </button>
        </div>
      `;
      const btnH = document.getElementById('btnHeroReloadFinal');
      if (btnH) btnH.addEventListener('click', () => fetchRekapData('final', false));
      return;
    }

    if (!list || list.length === 0) {
      rankHeroSection.innerHTML = '';
      return;
    }

    if (isFinal) {
      // Top 3 Podium Cards
      const top1 = list[0] || null;
      const top2 = list[1] || null;
      const top3 = list[2] || null;

      let html = `<div class="podium-container">`;

      // 🥈 JUARA 2 (LEFT)
      if (top2) {
        html += `
          <div class="podium-card rank-2">
            <div class="podium-trophy-icon">🥈</div>
            <div class="podium-rank-badge">JUARA 2</div>
            <div class="podium-name">${top2.name}</div>
            <div class="podium-school">${top2.school || '-'}</div>
            <div class="podium-score-pill">
              <span class="label">SKOR AKHIR:</span>
              <span>${formatTotalScore(top2.total)}</span>
            </div>
          </div>
        `;
      }

      // 🥇 JUARA 1 (CENTER - TALLEST & GLOWING)
      if (top1) {
        html += `
          <div class="podium-card rank-1">
            <div class="podium-trophy-icon">👑</div>
            <div class="podium-rank-badge">JUARA 1 (CHAMPION)</div>
            <div class="podium-name">${top1.name}</div>
            <div class="podium-school">${top1.school || '-'}</div>
            <div class="podium-score-pill">
              <span class="label">SKOR AKHIR:</span>
              <span>${formatTotalScore(top1.total)}</span>
            </div>
          </div>
        `;
      }

      // 🥉 JUARA 3 (RIGHT)
      if (top3) {
        html += `
          <div class="podium-card rank-3">
            <div class="podium-trophy-icon">🥉</div>
            <div class="podium-rank-badge">JUARA 3</div>
            <div class="podium-name">${top3.name}</div>
            <div class="podium-school">${top3.school || '-'}</div>
            <div class="podium-score-pill">
              <span class="label">SKOR AKHIR:</span>
              <span>${formatTotalScore(top3.total)}</span>
            </div>
          </div>
        `;
      }

      html += `</div>`;
      rankHeroSection.innerHTML = html;

    } else {
      // Babak Penyisihan: Top 10 Qualifiers Showcase Banner
      const top10 = list.slice(0, 10);
      let html = `
        <div class="qualifiers-banner-card">
          <div class="qualifiers-header">
            <div class="qualifiers-title">
              <span>🏅</span>
              <span>10 BESAR PESERTA LOLOS KE BABAK GRAND FINAL</span>
              <span class="badge-num">TOP 10</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--rank-qualify); font-weight: 700;">
              ⚡ Berhak Melaju ke Babak Final Speed Coding
            </div>
          </div>
          <div class="qualifiers-chips-grid">
      `;

      top10.forEach((item, idx) => {
        html += `
          <div class="qualifier-chip">
            <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
              <span class="qualifier-chip-rank">#${idx + 1}</span>
              <div class="qualifier-chip-info">
                <div class="qualifier-chip-name">${item.name}</div>
                <div class="qualifier-chip-school">${item.school || '-'}</div>
              </div>
            </div>
            <span class="qualifier-chip-score">${formatTotalScore(item.total)}</span>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
      rankHeroSection.innerHTML = html;
    }
  }

  // --- RENDER 2-COLUMN GRID (1-SCREEN FIT) ---
  function renderGrid(list, isFinal) {
    if (!gridWrapper || !gridColLeft || !gridColRight) return;

    if (!list || list.length === 0) {
      gridWrapper.style.display = 'none';
      return;
    }

    gridWrapper.style.display = 'grid';
    if (rankTable) rankTable.style.display = 'none';

    const half = Math.ceil(list.length / 2);
    const leftItems = list.slice(0, half);
    const rightItems = list.slice(half);

    function buildColHtml(items, startIdx) {
      let html = '';
      items.forEach((item, i) => {
        const rank = item.rank || (startIdx + i + 1);
        const isQualify = !isFinal && rank <= 10;
        const isGold = isFinal && rank === 1;
        const rowClass = isGold ? 'row-gold' : (isQualify ? 'qualify' : '');
        const score = formatTotalScore(item.total);
        const catBadge = (item.category || 'SD').toUpperCase() === 'SMP' ?
          `<span class="category-pill smp" style="font-size: 0.6rem; padding: 1px 4px;">SMP</span>` :
          `<span class="category-pill sd" style="font-size: 0.6rem; padding: 1px 4px;">SD</span>`;

        html += `
          <div class="rank-grid-row ${rowClass}">
            <span class="rank-grid-num">#${rank}</span>
            <div class="rank-grid-name-box" title="${item.name} (${item.school || '-'})">
              <span class="rank-grid-name">${item.name}</span>
              ${catBadge}
              <span class="rank-grid-school">(${item.school || '-'})</span>
            </div>
            <span class="rank-grid-score">${score}</span>
          </div>
        `;
      });
      return html;
    }

    gridColLeft.innerHTML = buildColHtml(leftItems, 0);
    gridColRight.innerHTML = buildColHtml(rightItems, half);
  }

  // --- RENDER DATA TABLE ---
  function renderTable() {
    const list = getFilteredList();
    const isFinal = state.currentRound === 'final';
    const isJuriView = state.currentView === 'juri';
    const isGrid = state.currentLayout === 'grid';

    // Update section subtitles and stats
    if (tableSectionTitle) {
      tableSectionTitle.textContent = isFinal ? '🏆 Peringkat & Rekapitulasi Babak Final' : '🏆 Peringkat & Rekapitulasi Babak Penyisihan';
    }
    if (tableSectionSubtitle) {
      tableSectionSubtitle.textContent = isFinal ? 'Mengacu pada Sheet "REKAPITULASI FINAL"' : 'Mengacu pada Sheet "REKAPITULASI PENYISIHAN"';
    }
    if (tableStatsBadge) {
      tableStatsBadge.textContent = isFinal && list.length === 0 ? 
        '0 Peserta (Menunggu Juri)' : 
        `${list.length} Peserta Ditampilkan`;
    }

    // EMPTY STATE HANDLING
    if (!list || list.length === 0) {
      if (rankTable) rankTable.style.display = 'none';
      if (gridWrapper) gridWrapper.style.display = 'none';
      if (rankEmptyState) {
        rankEmptyState.style.display = 'block';
        const emptyTitle = document.getElementById('emptyTitle');
        const emptyDesc = document.getElementById('emptyDesc');
        if (isFinal) {
          if (emptyTitle) emptyTitle.textContent = 'Belum Ada Data Rekapitulasi Final';
          if (emptyDesc) emptyDesc.textContent = 'Sheet "REKAPITULASI FINAL" masih kosong. Jika dewan juri sudah mengisi nilai final pada spreadsheet, klik tombol di bawah.';
        } else {
          if (emptyTitle) emptyTitle.textContent = 'Data Rekapitulasi Sedang Dipersiapkan';
          if (emptyDesc) emptyDesc.textContent = 'Dewan Juri sedang menginput dan menghitung perolehan nilai pada spreadsheet.';
        }
      }
      return;
    }

    if (rankEmptyState) rankEmptyState.style.display = 'none';

    // IF 2-COLUMN GRID IS SELECTED
    if (isGrid) {
      renderGrid(list, isFinal);
      return;
    }

    // ELSE STANDARD TABLE MODE
    if (gridWrapper) gridWrapper.style.display = 'none';
    if (rankTable) rankTable.style.display = 'table';

    // 1. Build THEAD
    let thHtml = `
      <tr>
        <th class="col-center" style="width: 60px;">Rank</th>
        <th>Nama Peserta</th>
        <th class="col-center" style="width: 75px;">Kategori</th>
        <th>Asal Sekolah</th>
    `;

    if (isJuriView) {
      thHtml += `
        <th class="col-score" style="width: 95px;">Nilai Juri 1</th>
        <th class="col-score" style="width: 95px;">Nilai Juri 2</th>
        <th class="col-score" style="width: 95px;">Nilai Juri 3</th>
      `;
    } else {
      thHtml += `
        <th class="col-score" style="width: 110px;">Fungsionalitas</th>
        <th class="col-score" style="width: 110px;">Efisiensi</th>
        <th class="col-score" style="width: 100px;">Kecepatan</th>
      `;
    }

    thHtml += `
        <th class="col-score" style="width: 105px;">Total Nilai</th>
        <th class="col-center" style="width: 125px;">Keterangan</th>
      </tr>
    `;
    if (rankTableHead) rankTableHead.innerHTML = thHtml;

    // 2. Build TBODY
    let tbHtml = '';

    list.forEach((item, index) => {
      const rank = item.rank || (index + 1);
      let rowClass = '';
      let rankBadgeClass = '';
      let statusPillHtml = '';

      if (isFinal) {
        if (rank === 1) {
          rowClass = 'row-gold';
          rankBadgeClass = 'rank-1';
          statusPillHtml = `<span class="status-pill gold">🥇 Juara 1</span>`;
        } else if (rank === 2) {
          rowClass = 'row-silver';
          rankBadgeClass = 'rank-2';
          statusPillHtml = `<span class="status-pill silver">🥈 Juara 2</span>`;
        } else if (rank === 3) {
          rowClass = 'row-bronze';
          rankBadgeClass = 'rank-3';
          statusPillHtml = `<span class="status-pill bronze">🥉 Juara 3</span>`;
        } else {
          statusPillHtml = `<span class="status-pill participant">Finalis #${rank}</span>`;
        }
      } else {
        if (rank <= 10) {
          rowClass = 'row-qualify';
          rankBadgeClass = 'qualify-top10';
          statusPillHtml = `<span class="status-pill qualify">👑 LOLOS FINAL</span>`;
        } else {
          statusPillHtml = `<span class="status-pill participant">Peserta</span>`;
        }
      }

      const catBadge = (item.category || 'SD').toUpperCase() === 'SMP' ?
        `<span class="category-pill smp">SMP</span>` :
        `<span class="category-pill sd">SD</span>`;

      tbHtml += `
        <tr class="${rowClass}">
          <td class="col-center">
            <span class="table-rank-badge ${rankBadgeClass}">#${rank}</span>
          </td>
          <td>
            <div class="table-name-cell">
              <span class="table-participant-name">${item.name}</span>
            </div>
          </td>
          <td class="col-center">${catBadge}</td>
          <td>
            <span class="table-participant-school">${item.school || '-'}</span>
          </td>
      `;

      if (isJuriView) {
        tbHtml += `
          <td class="col-score">${item.juri1 !== undefined ? item.juri1 : '-'}</td>
          <td class="col-score">${item.juri2 !== undefined ? item.juri2 : '-'}</td>
          <td class="col-score">${item.juri3 !== undefined ? item.juri3 : '-'}</td>
        `;
      } else {
        tbHtml += `
          <td class="col-score">${item.fungsionalitas !== undefined ? item.fungsionalitas : '-'}</td>
          <td class="col-score">${item.efisiensi !== undefined ? item.efisiensi : '-'}</td>
          <td class="col-score">${item.kecepatan !== undefined ? item.kecepatan : '-'}</td>
        `;
      }

      tbHtml += `
          <td class="col-score">
            <span class="table-total-score">${formatTotalScore(item.total)}</span>
          </td>
          <td class="col-center">${statusPillHtml}</td>
        </tr>
      `;
    });

    if (rankTableBody) rankTableBody.innerHTML = tbHtml;
  }

  // --- RENDER ALL ---
  function renderAll() {
    renderHeroSection();
    renderTable();
  }

  // --- AUTO-SCROLL ENGINE ---
  let autoScrollTimer = null;
  let autoScrollDirection = 'down'; // 'down' or 'pause-bottom' or 'top' or 'pause-top'

  function startAutoScroll() {
    stopAutoScroll();
    state.isAutoScrolling = true;
    if (btnToggleAutoScroll) {
      btnToggleAutoScroll.classList.add('active');
      if (autoScrollIcon) autoScrollIcon.textContent = '⏸';
      if (autoScrollText) autoScrollText.textContent = 'Jeda Scroll';
    }

    const scrollSpeed = 1; // pixels per step
    const stepInterval = 28; // ms

    autoScrollTimer = setInterval(() => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 5) return; // No need to scroll if content fits in 1 screen!

      const currentScroll = window.scrollY || window.pageYOffset;

      if (autoScrollDirection === 'down') {
        if (currentScroll >= maxScroll - 3) {
          autoScrollDirection = 'pause-bottom';
          setTimeout(() => {
            if (!state.isAutoScrolling) return;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            autoScrollDirection = 'pause-top';
            setTimeout(() => {
              if (state.isAutoScrolling) autoScrollDirection = 'down';
            }, 1800);
          }, 3500); // Pause 3.5s at bottom so spectators can read
        } else {
          window.scrollBy(0, scrollSpeed);
        }
      }
    }, stepInterval);
  }

  function stopAutoScroll() {
    state.isAutoScrolling = false;
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
    if (btnToggleAutoScroll) {
      btnToggleAutoScroll.classList.remove('active');
      if (autoScrollIcon) autoScrollIcon.textContent = '▶';
      if (autoScrollText) autoScrollText.textContent = 'Auto-Scroll';
    }
  }

  // --- EVENT LISTENERS ---

  // 1. Round Toggle
  roundToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roundToggleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentRound = btn.getAttribute('data-round');
      fetchRekapData(state.currentRound, true);
    });
  });

  // 2. View Toggle (Juri vs Kriteria)
  viewToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      viewToggleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentView = btn.getAttribute('data-view');
      renderTable();
    });
  });

  // 3. Layout Toggle (Table vs 2-Kolom 1 Layar)
  layoutToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      layoutToggleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentLayout = btn.getAttribute('data-layout');
      renderTable();
    });
  });

  // 4. Category Filter
  catFilterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catFilterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentCategory = btn.getAttribute('data-cat');
      renderTable();
    });
  });

  // 5. Live Search Input
  if (inputSearchRank) {
    inputSearchRank.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (btnClearSearch) {
        btnClearSearch.style.display = state.searchQuery.length > 0 ? 'block' : 'none';
      }
      renderTable();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      inputSearchRank.value = '';
      state.searchQuery = '';
      btnClearSearch.style.display = 'none';
      renderTable();
    });
  }

  // 6. Refresh Button
  if (btnRefreshRekap) {
    btnRefreshRekap.addEventListener('click', () => {
      fetchRekapData(state.currentRound, false);
    });
  }

  if (btnEmptyRefresh) {
    btnEmptyRefresh.addEventListener('click', () => {
      fetchRekapData(state.currentRound, false);
    });
  }

  // 7. Auto-Scroll Toggle Button
  if (btnToggleAutoScroll) {
    btnToggleAutoScroll.addEventListener('click', () => {
      if (state.isAutoScrolling) {
        stopAutoScroll();
      } else {
        startAutoScroll();
      }
    });
  }

  // 8. Fullscreen Button
  if (btnToggleFullscreenRank) {
    btnToggleFullscreenRank.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          btnToggleFullscreenRank.textContent = '❌ Exit Fullscreen';
        }).catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            btnToggleFullscreenRank.textContent = '⛶ Fullscreen';
          }).catch(() => {});
        }
      }
    });

    document.addEventListener('fullscreenchange', () => {
      const isFull = !!document.fullscreenElement;
      btnToggleFullscreenRank.textContent = isFull ? '❌ Exit Fullscreen' : '⛶ Fullscreen';
    });
  }

  // Initial Data Fetch
  fetchRekapData(state.currentRound, true);

  // Background gentle poll every 35s
  setInterval(() => {
    fetchRekapData(state.currentRound, true);
  }, 35000);
});
