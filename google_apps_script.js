/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: SPEED CODING AUTO-SYNC CONNECTOR
 * ==============================================================================
 * Petunjuk Pemasangan di Google Spreadsheet:
 * 1. Buka Google Spreadsheet Anda.
 * 2. Klik menu: Ekstensi (Extensions) -> Apps Script.
 * 3. Hapus seluruh isi Code.gs, lalu tempel (paste) seluruh kode ini.
 * 4. Klik ikon Save (Disket / Ctrl+S).
 * 5. Klik tombol biru "Terapkan" (Deploy) -> "Kelola Penerapan" (Manage Deployments)
 *    -> Klik ikon Pensil (Edit) -> Pilih Versi: "Versi baru" (New version) -> Klik "Terapkan" (Deploy).
 *    (Atau jika baru pertama kali: "Penerapan baru" -> Aplikasi Web -> Akses: "Siapa saja / Anyone").
 * ==============================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var reqSheet = (e && e.parameter && e.parameter.sheet) ? String(e.parameter.sheet).trim().toLowerCase() : '';
    var reqType = (e && e.parameter && e.parameter.type) ? String(e.parameter.type).trim().toLowerCase() : '';
    
    // =========================================================================
    // 1. REKAPITULASI PENYISIHAN & FINAL (UNTUK HALAMAN /rank)
    // =========================================================================
    if (reqSheet === 'rekap_penyisihan' || reqSheet === 'rekap_final' || reqType === 'rekap') {
      var isFinalRekap = (reqSheet === 'rekap_final' || (e && e.parameter && String(e.parameter.round).toLowerCase() === 'final'));
      var targetRekapSheet = null;

      for (var s = 0; s < sheets.length; s++) {
        var sName = sheets[s].getName().toUpperCase();
        if (isFinalRekap) {
          if (sName.indexOf("REKAPITULASI FINAL") !== -1 || sName.indexOf("REKAP FINAL") !== -1 || sName === "REKAPITULASI_FINAL") {
            targetRekapSheet = sheets[s];
            break;
          }
        } else {
          if (sName.indexOf("REKAPITULASI PENYISIHAN") !== -1 || sName.indexOf("REKAP PENYISIHAN") !== -1 || 
              sName.indexOf("REKAPITULASI KUALIFIKASI") !== -1 || sName.indexOf("REKAP KUALIFIKASI") !== -1 || sName === "REKAPITULASI_PENYISIHAN") {
            targetRekapSheet = sheets[s];
            break;
          }
        }
      }

      // Fallback pencarian fleksibel jika nama persis belum ditemukan
      if (!targetRekapSheet) {
        for (var s = 0; s < sheets.length; s++) {
          var sName = sheets[s].getName().toUpperCase();
          if (isFinalRekap && sName.indexOf("FINAL") !== -1 && sName.indexOf("JURI") === -1) {
            targetRekapSheet = sheets[s];
            break;
          } else if (!isFinalRekap && (sName.indexOf("PENYISIHAN") !== -1 || sName.indexOf("KUALIFIKASI") !== -1) && sName.indexOf("JURI") === -1) {
            targetRekapSheet = sheets[s];
            break;
          }
        }
      }

      if (!targetRekapSheet) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          type: "rekap",
          count: 0,
          sheet: isFinalRekap ? "REKAPITULASI FINAL (Belum Ditemukan)" : "REKAPITULASI PENYISIHAN (Belum Ditemukan)",
          rows: [],
          message: "Sheet rekapitulasi belum ditemukan di spreadsheet."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var rekapResult = parseRekapSheet(targetRekapSheet);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        type: "rekap",
        round: isFinalRekap ? "final" : "penyisihan",
        sheet: rekapResult.sheet,
        count: rekapResult.count,
        rows: rekapResult.rows
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // 2. DATA FINALIS UNTUK DENAH MEJA (/ & operator.html)
    // =========================================================================
    var targetSheet = null;

    if (reqSheet === 'final' || reqSheet.indexOf('final') !== -1) {
      // 1. Cari sheet Rekapitulasi Final
      for (var s = 0; s < sheets.length; s++) {
        var sName = sheets[s].getName().toUpperCase();
        if (sName.indexOf("REKAPITULASI FINAL") !== -1 || sName.indexOf("REKAP FINAL") !== -1) {
          targetSheet = sheets[s];
          break;
        }
      }
      // 2. Fallback: sheet apapun yang mengandung 'FINAL' selain sheet Juri
      if (!targetSheet) {
        for (var s = 0; s < sheets.length; s++) {
          var sName = sheets[s].getName().toUpperCase();
          if (sName.indexOf("FINAL") !== -1 && sName.indexOf("JURI") === -1) {
            targetSheet = sheets[s];
            break;
          }
        }
      }
      if (!targetSheet) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          count: 0,
          sheet: "Rekapitulasi Final (Belum Ditemukan)",
          participants: [],
          message: "Sheet Rekapitulasi Final belum ditemukan di spreadsheet."
        })).setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      // Default: cari sheet PESERTA
      for (var s = 0; s < sheets.length; s++) {
        if (sheets[s].getName().toUpperCase().indexOf("PESERTA") !== -1) {
          targetSheet = sheets[s];
          break;
        }
      }
      if (!targetSheet) targetSheet = sheets[0];
    }

    var data = targetSheet.getDataRange().getValues();
    var headerRow = -1;
    var nameCol = -1;
    var catCol = -1;
    var schoolCol = -1;

    for (var r = 0; r < Math.min(20, data.length); r++) {
      for (var c = 0; c < data[r].length; c++) {
        var val = String(data[r][c]).toLowerCase().trim();
        if (val.indexOf("nama") !== -1 && nameCol === -1) {
          nameCol = c;
          headerRow = r;
        }
        if (val.indexOf("kategori") !== -1 || val.indexOf("jenjang") !== -1) {
          catCol = c;
        }
        if (val.indexOf("sekolah") !== -1 || val.indexOf("instansi") !== -1) {
          schoolCol = c;
        }
      }
      if (headerRow !== -1 && nameCol !== -1) break;
    }

    var list = [];
    if (headerRow !== -1 && nameCol !== -1) {
      for (var i = headerRow + 1; i < data.length; i++) {
        var name = String(data[i][nameCol]).trim();
        if (name && name.toLowerCase() !== "nama peserta" && name.toLowerCase() !== "nama" && name.replace(/[^a-zA-Z]/g, '').length >= 3) {
          var rawSchool = schoolCol !== -1 ? String(data[i][schoolCol]).trim() : "";
          var rawCat = catCol !== -1 ? String(data[i][catCol]).trim() : "";
          if (!rawCat && rawSchool) {
            rawCat = rawSchool.toUpperCase().indexOf("SMP") !== -1 ? "SMP" : (rawSchool.toUpperCase().indexOf("SD") !== -1 ? "SD" : "SD");
          }
          list.push({
            no: (list.length + 1),
            name: name,
            category: rawCat || "SD",
            school: rawSchool
          });
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: list.length,
      sheet: targetSheet.getName(),
      participants: list
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Helper untuk parsing sheet Rekapitulasi Nilai (Juri & Kriteria Penilaian)
 */
function parseRekapSheet(sheet) {
  var data = sheet.getDataRange().getValues();
  if (!data || data.length === 0) return { sheet: sheet.getName(), count: 0, rows: [] };

  var headerRow = -1;
  var col = {};

  for (var r = 0; r < Math.min(20, data.length); r++) {
    for (var c = 0; c < data[r].length; c++) {
      var val = String(data[r][c]).toLowerCase().trim();
      if ((val.indexOf("nama") !== -1 || val === "peserta") && col.name === undefined) {
        col.name = c;
        headerRow = r;
      }
      if ((val.indexOf("sekolah") !== -1 || val.indexOf("instansi") !== -1) && col.school === undefined) col.school = c;
      if ((val.indexOf("kategori") !== -1 || val.indexOf("jenjang") !== -1) && col.category === undefined) col.category = c;
      if ((val.indexOf("peringkat") !== -1 || val.indexOf("rank") !== -1 || val === "no" || val === "juara") && col.rank === undefined) col.rank = c;

      // Juri
      if ((val.indexOf("juri 1") !== -1 || val === "j1" || val.indexOf("juri1") !== -1) && col.juri1 === undefined) col.juri1 = c;
      if ((val.indexOf("juri 2") !== -1 || val === "j2" || val.indexOf("juri2") !== -1) && col.juri2 === undefined) col.juri2 = c;
      if ((val.indexOf("juri 3") !== -1 || val === "j3" || val.indexOf("juri3") !== -1) && col.juri3 === undefined) col.juri3 = c;

      // Kriteria
      if ((val.indexOf("fungsi") !== -1) && col.fungsionalitas === undefined) col.fungsionalitas = c;
      if ((val.indexOf("efisien") !== -1 || val.indexOf("algoritma") !== -1) && col.efisiensi === undefined) col.efisiensi = c;
      if ((val.indexOf("kecepatan") !== -1 || val.indexOf("waktu") !== -1 || val.indexOf("speed") !== -1) && col.kecepatan === undefined) col.kecepatan = c;

      // Total
      if ((val.indexOf("total") !== -1 || val.indexOf("skor") !== -1 || val.indexOf("nilai akhir") !== -1 || val === "jumlah") && col.total === undefined) col.total = c;
    }
    if (headerRow !== -1 && col.name !== undefined) break;
  }

  if (headerRow === -1) headerRow = 0;

  var rows = [];
  for (var i = headerRow + 1; i < data.length; i++) {
    var rawName = col.name !== undefined ? String(data[i][col.name]).trim() : "";
    if (!rawName || rawName.toLowerCase() === "nama peserta" || rawName.toLowerCase() === "nama" || rawName.replace(/[^a-zA-Z]/g, '').length < 3) {
      continue;
    }

    var school = col.school !== undefined ? String(data[i][col.school]).trim() : "";
    var cat = col.category !== undefined ? String(data[i][col.category]).trim() : "";
    if (!cat && school) {
      cat = school.toUpperCase().indexOf("SMP") !== -1 ? "SMP" : "SD";
    }

    var rankVal = col.rank !== undefined && data[i][col.rank] !== "" ? data[i][col.rank] : (rows.length + 1);
    var j1 = col.juri1 !== undefined ? data[i][col.juri1] : null;
    var j2 = col.juri2 !== undefined ? data[i][col.juri2] : null;
    var j3 = col.juri3 !== undefined ? data[i][col.juri3] : null;

    var fung = col.fungsionalitas !== undefined ? data[i][col.fungsionalitas] : null;
    var efi = col.efisiensi !== undefined ? data[i][col.efisiensi] : null;
    var kec = col.kecepatan !== undefined ? data[i][col.kecepatan] : null;

    var totalVal = col.total !== undefined ? data[i][col.total] : null;
    if (totalVal === null || totalVal === "" || isNaN(totalVal)) {
      if (j1 !== null || j2 !== null || j3 !== null) {
        var s = (Number(j1) || 0) + (Number(j2) || 0) + (Number(j3) || 0);
        totalVal = s > 0 ? (s / 3) : null;
      } else if (fung !== null || efi !== null || kec !== null) {
        var s = (Number(fung) || 0) + (Number(efi) || 0) + (Number(kec) || 0);
        totalVal = s > 0 ? (s / 3) : null;
      }
    } else {
      // Jika kolom total di spreadsheet berisi hasil penjumlahan nilai 3 juri (> 100), bagi 3 agar skala 0-100
      var nTot = Number(totalVal);
      if (!isNaN(nTot) && nTot > 100) {
        totalVal = nTot / 3;
      }
    }

    function formatScore(val) {
      if (val === null || val === "" || val === undefined) return "-";
      var num = Number(val);
      if (!isNaN(num)) return Math.round(num * 10) / 10;
      return String(val);
    }

    rows.push({
      rank: rankVal,
      name: rawName,
      category: cat || "SD",
      school: school,
      juri1: formatScore(j1),
      juri2: formatScore(j2),
      juri3: formatScore(j3),
      fungsionalitas: formatScore(fung),
      efisiensi: formatScore(efi),
      kecepatan: formatScore(kec),
      total: formatScore(totalVal)
    });
  }

  // Sort descending by total jika ada total numerik
  var hasNumeric = rows.some(function(r) { return typeof r.total === 'number'; });
  if (hasNumeric) {
    rows.sort(function(a, b) {
      var numA = typeof a.total === 'number' ? a.total : -1;
      var numB = typeof b.total === 'number' ? b.total : -1;
      return numB - numA;
    });
    rows.forEach(function(r, idx) {
      r.rank = idx + 1;
    });
  }

  return {
    sheet: sheet.getName(),
    count: rows.length,
    rows: rows
  };
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No POST body received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var postData = JSON.parse(e.postData.contents);
    var round = (postData.round || 'QUALIFICATION').toUpperCase();
    var isFinal = (round === 'FINAL');
    var results = postData.results || [];

    if (results.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "No results to record"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();

    // Map of normalized name -> finish data or clear action
    var resultMap = {};
    results.forEach(function(r) {
      if (r.name) {
        var isClear = (r.action === 'clear' || postData.action === 'clear' || !r.elapsed);
        resultMap[normalizeName(r.name)] = {
          rawName: r.name,
          elapsed: isClear ? '' : r.elapsed,
          isClear: isClear,
          rank: r.rank || "-",
          category: r.category || "",
          school: r.school || "",
          timestamp: isClear ? '' : (r.timestamp || new Date().toLocaleTimeString('id-ID'))
        };
      }
    });

    var updatedSheetReports = [];

    // Filter sheet target sesuai babak
    sheets.forEach(function(sheet) {
      var sName = sheet.getName().toUpperCase();

      // Lewati sheet master peserta dan rekap
      if (sName.indexOf("REKAP") !== -1 || sName === "PESERTA" || sName.indexOf("PETUNJUK") !== -1) {
        return;
      }

      var isTarget = false;
      if (isFinal) {
        // Mode Final: target sheet yang mengandung kata "FINAL" (misal: "Juri 1 Final", "Juri 2 Final", "Juri 3 Final")
        if (sName.indexOf("FINAL") !== -1) {
          isTarget = true;
        }
      } else {
        // Mode Penyisihan / Kualifikasi: target sheet yang TIDAK mengandung kata "FINAL", dan mengandung "JURI", "PENYISIHAN", atau "KUALIFIKASI"
        if (sName.indexOf("FINAL") === -1 && 
           (sName.indexOf("JURI") !== -1 || sName.indexOf("PENYISIHAN") !== -1 || sName.indexOf("KUALIFIKASI") !== -1 || sName === "SHEET1")) {
          isTarget = true;
        }
      }

      if (!isTarget) return;

      var data = sheet.getDataRange().getValues();
      var headerRow = -1;
      var nameCol = -1;
      var timeCol = -1;

      // 1. Cari letak kolom Nama dan Waktu Selesai
      for (var r = 0; r < Math.min(15, data.length); r++) {
        for (var c = 0; c < data[r].length; c++) {
          var val = String(data[r][c]).trim().toLowerCase();

          // Deteksi kolom nama
          if (val.indexOf("nama peserta") !== -1 || (val.indexOf("nama") !== -1 && nameCol === -1)) {
            nameCol = c;
            headerRow = r;
          }

          // Deteksi kolom waktu selesai (prioritaskan 'waktu selesai' atau 'selesai')
          if (val.indexOf("waktu selesai") !== -1 || val.indexOf("selesai") !== -1) {
            timeCol = c;
          } else if (timeCol === -1 && (val.indexOf("kecepatan") !== -1 || val.indexOf("waktu") !== -1)) {
            timeCol = c;
          }
        }
        if (headerRow !== -1 && nameCol !== -1 && timeCol !== -1) break;
      }

      // Jika kolom ditemukan, lakukan pengisian nilai
      if (headerRow !== -1 && nameCol !== -1 && timeCol !== -1) {
        var matchCount = 0;

        for (var rowIdx = headerRow + 1; rowIdx < data.length; rowIdx++) {
          var rowName = String(data[rowIdx][nameCol]).trim();
          if (!rowName) continue;

          var normRowName = normalizeName(rowName);

          // Cek kecocokan nama
          for (var key in resultMap) {
            var item = resultMap[key];
            if (isNameMatch(normRowName, key)) {
              var targetCell = sheet.getRange(rowIdx + 1, timeCol + 1);
              if (item.isClear) {
                targetCell.clearContent();
              } else {
                targetCell.setNumberFormat("@"); // Format teks agar waktu 00:52 tidak berubah
                targetCell.setValue(item.elapsed);
              }
              matchCount++;
              break;
            }
          }
        }

        if (matchCount > 0) {
          updatedSheetReports.push(sheet.getName() + " (" + matchCount + " peserta)");
        }
      }
    });

    // 2. Update Sheet Rekap Terpusat (Rekap_Hasil_Kualifikasi / Rekap_Hasil_Final)
    var rekapSheetName = isFinal ? "Rekap_Hasil_Final" : "Rekap_Hasil_Kualifikasi";
    var rekapSheet = ss.getSheetByName(rekapSheetName);

    if (results.length > 1) {
      // Jika sync seluruh peserta (Batch)
      if (!rekapSheet) rekapSheet = ss.insertSheet(rekapSheetName);
      rekapSheet.clear();

      var headerTitle = isFinal ? "HASIL GRAND FINAL SPEED CODING 2026" : "HASIL KUALIFIKASI SPEED CODING 2026";
      rekapSheet.appendRow([headerTitle]);
      rekapSheet.appendRow(["Rank", "Nama Peserta", "Kategori", "Asal Sekolah", "Waktu Selesai (Elapsed)", "Waktu Jam Selesai"]);

      rekapSheet.getRange(2, 1, 1, 6)
        .setFontWeight("bold")
        .setBackground(isFinal ? "#10B981" : "#FFAB19")
        .setFontColor("#FFFFFF");

      results.forEach(function(r) {
        rekapSheet.appendRow([r.rank || "-", r.name, r.category || "-", r.school || "-", r.elapsed || "-", r.timestamp || "-"]);
      });
    } else if (results.length === 1 && rekapSheet) {
      // Jika sync 1 peserta (Live finish atau batal/clear), cari barisnya di rekap tanpa me-reset
      var rData = rekapSheet.getDataRange().getValues();
      var single = results[0];
      var isClearSingle = (single.action === 'clear' || postData.action === 'clear' || !single.elapsed);
      var foundRow = -1;
      for (var rk = 2; rk < rData.length; rk++) {
        if (isNameMatch(normalizeName(rData[rk][1]), normalizeName(single.name))) {
          foundRow = rk + 1;
          break;
        }
      }
      if (foundRow !== -1) {
        if (isClearSingle) {
          rekapSheet.getRange(foundRow, 5).clearContent();
          rekapSheet.getRange(foundRow, 6).clearContent();
        } else {
          rekapSheet.getRange(foundRow, 5).setValue(single.elapsed);
          rekapSheet.getRange(foundRow, 6).setValue(single.timestamp || new Date().toLocaleTimeString('id-ID'));
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      round: round,
      updatedSheets: updatedSheetReports,
      message: updatedSheetReports.length > 0 ? 
        "Waktu selesai berhasil dikirim ke: " + updatedSheetReports.join(", ") : 
        "Data diterima, namun tidak ada kolom 'Waktu Selesai' yang cocok di sheet juri."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Normalisasi nama: lowercase & hanya ambil karakter alfanumerik
 */
function normalizeName(str) {
  if (!str) return "";
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Pencocokan nama fleksibel (menangani spasi ganda, singkatan, atau nama panggilan)
 */
function isNameMatch(normA, normB) {
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  if (normA.length >= 4 && normB.length >= 4) {
    if (normA.indexOf(normB) !== -1 || normB.indexOf(normA) !== -1) return true;
  }
  return false;
}
