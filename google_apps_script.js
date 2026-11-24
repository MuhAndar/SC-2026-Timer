/**
 * GOOGLE APPS SCRIPT - SPEED CODING CONNECTOR
 * Salin dan tempel kode ini di Extensions -> Apps Script pada Google Spreadsheet Anda.
 * 
 * Fungsi:
 * 1. Menyediakan API JSON daftar peserta (GET)
 * 2. Menerima hasil waktu selesai lomba dan mencatatnya otomatis ke sheet (POST)
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Peserta") || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0]) {
      rows.push({
        id: "P" + (i < 10 ? "0" + i : i),
        name: String(row[0]).trim(),
        category: row[1] ? String(row[1]).trim() : "SD",
        school: row[2] ? String(row[2]).trim() : "Sekolah",
        seat: row[3] ? String(row[3]).trim() : ""
      });
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
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HasilLomba");
    
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("HasilLomba");
      sheet.appendRow(["Rank", "No Meja", "Nama Peserta", "Kategori", "Sekolah", "Waktu Selesai (Elapsed)", "Waktu Jam"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#FFAB19");
    }

    if (postData.results && Array.isArray(postData.results)) {
      postData.results.forEach(function(r) {
        sheet.appendRow([r.rank, r.seat, r.name, r.category, r.school, r.elapsed, r.timestamp]);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
