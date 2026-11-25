/**
 * GOOGLE APPS SCRIPT - SPEED CODING CONNECTOR
 * Salin dan tempel kode ini di Extensions -> Apps Script pada Google Spreadsheet Anda.
 * 
 * Fitur:
 * 1. Otomatis mengenali babak (postData.round: 'QUALIFICATION' atau 'FINAL')
 *    - Jika QUALIFICATION: mengisi kolom 'Kecepatan Penyelesaian' ke seluruh sheet Juri Kualifikasi (JURI 1, JURI 2, JURI 3)
 *      dan mengupdate sheet 'Rekap_Hasil_Kualifikasi'
 *    - Jika FINAL: mengisi kolom 'Kecepatan Penyelesaian' ke seluruh sheet Juri Final (JURI 1 FINAL, JURI 2 FINAL, JURI 3 FINAL)
 *      dan mengupdate sheet 'Rekap_Hasil_Final'
 * 2. Menyediakan API JSON daftar peserta (GET)
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var targetSheet = sheets[0];
  
  var data = targetSheet.getDataRange().getValues();
  var headerRow = -1;
  var nameCol = -1;
  
  for (var r = 0; r < data.length; r++) {
    for (var c = 0; c < data[r].length; c++) {
      var val = String(data[r][c]).toLowerCase();
      if (val.indexOf("nama peserta") !== -1 || (val.indexOf("nama") !== -1 && data[r].length > 2)) {
        headerRow = r;
        nameCol = c;
        break;
      }
    }
    if (headerRow !== -1) break;
  }
  
  var rows = [];
  if (headerRow !== -1 && nameCol !== -1) {
    for (var i = headerRow + 1; i < data.length; i++) {
      var name = String(data[i][nameCol]).trim();
      if (name && name.toLowerCase() !== "nama peserta") {
        rows.push({
          no: data[i][nameCol - 1] || (rows.length + 1),
          name: name
        });
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    count: rows.length,
    participants: rows
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var round = (postData.round || 'QUALIFICATION').toUpperCase();
    var results = postData.results || [];
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    
    // Map of name -> elapsed finish time
    var timeMap = {};
    results.forEach(function(r) {
      if (r.name && r.elapsed) {
        timeMap[r.name.trim().toLowerCase()] = r.elapsed;
      }
    });

    var updatedSheets = [];
    var isFinal = (round === 'FINAL');

    // Filter sheets according to round
    sheets.forEach(function(sheet) {
      var sName = sheet.getName().toUpperCase();
      
      // If round is FINAL, target sheets with "FINAL" in title.
      // If round is QUALIFICATION, target juri sheets WITHOUT "FINAL" in title.
      var isTargetSheet = false;
      if (isFinal) {
        if (sName.indexOf("FINAL") !== -1 && sName.indexOf("REKAP") === -1) {
          isTargetSheet = true;
        }
      } else {
        if (sName.indexOf("FINAL") === -1 && sName.indexOf("REKAP") === -1 && 
            (sName.indexOf("JURI") !== -1 || sName.indexOf("KUALIFIKASI") !== -1 || sName.indexOf("PENYISIHAN") !== -1 || sName === "SHEET1")) {
          isTargetSheet = true;
        }
      }

      if (!isTargetSheet) return;

      var data = sheet.getDataRange().getValues();
      var headerRow = -1;
      var nameCol = -1;
      var timeCol = -1;

      // Locate column indices in this sheet
      for (var r = 0; r < Math.min(15, data.length); r++) {
        for (var c = 0; c < data[r].length; c++) {
          var val = String(data[r][c]).toLowerCase();
          if (val.indexOf("nama peserta") !== -1 || (val.indexOf("nama") !== -1 && nameCol === -1)) {
            nameCol = c;
            headerRow = r;
          }
          if (val.indexOf("kecepatan") !== -1 || val.indexOf("waktu") !== -1) {
            timeCol = c;
          }
        }
        if (nameCol !== -1 && timeCol !== -1) break;
      }

      // If both Nama Peserta and Kecepatan columns exist in this sheet, fill them!
      if (headerRow !== -1 && nameCol !== -1 && timeCol !== -1) {
        var sheetUpdated = false;
        for (var i = headerRow + 1; i < data.length; i++) {
          var pName = String(data[i][nameCol]).trim().toLowerCase();
          if (pName && timeMap[pName]) {
            // Write to cell (1-based row & column)
            sheet.getRange(i + 1, timeCol + 1).setValue(timeMap[pName]);
            sheetUpdated = true;
          }
        }
        if (sheetUpdated) {
          updatedSheets.push(sheet.getName());
        }
      }
    });

    // Create or update dedicated Rekap sheet (Rekap_Hasil_Final / Rekap_Hasil_Kualifikasi)
    var rekapSheetName = isFinal ? "Rekap_Hasil_Final" : "Rekap_Hasil_Kualifikasi";
    var rekapSheet = ss.getSheetByName(rekapSheetName) || ss.insertSheet(rekapSheetName);
    rekapSheet.clear();
    
    var headerTitle = isFinal ? "HASIL GRAND FINAL SPEED CODING 2026" : "HASIL KUALIFIKASI SPEED CODING 2026";
    rekapSheet.appendRow([headerTitle]);
    rekapSheet.appendRow(["Rank", "No Meja", "Nama Peserta", "Kategori", "Asal Sekolah", "Waktu Selesai (Elapsed)", "Waktu Jam Selesai"]);
    
    rekapSheet.getRange(2, 1, 1, 7)
      .setFontWeight("bold")
      .setBackground(isFinal ? "#10B981" : "#FFAB19")
      .setFontColor("#FFFFFF");

    results.forEach(function(r) {
      rekapSheet.appendRow([r.rank || "-", r.seat || "-", r.name, r.category || "-", r.school || "-", r.elapsed || "-", r.timestamp || "-"]);
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      round: round,
      message: "Berhasil mengisi kolom Kecepatan ke: " + (updatedSheets.length > 0 ? updatedSheets.join(", ") : "Tidak ada sheet juri yang cocok") + " & master " + rekapSheetName,
      updatedSheets: updatedSheets
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
