# EDU-MERIT System

Sistem Pengurusan Merit dan Demerit Pelajar dengan integrasi Google Sheets dan QR Code Scanner.

## 🚀 Features
- **QR Code Scanner** untuk scan ID pelajar
- **Google Sheets Integration** - Data disimpan secara real-time
- **Authentication System** untuk pensyarah
- **Real-time Updates** - Perubahan terus ke spreadsheet
- **PWA Support** - Boleh install sebagai app
- **Responsive Design** - Works on desktop & mobile
- **Brutalist Industrial UI** - Unique aesthetic design

## 📋 Prerequisites
1. Google Account untuk Google Sheets
2. Web browser dengan kamera (untuk scanner)
3. GitHub account (untuk hosting)

## 🛠️ Setup Instructions

### 1. Setup Google Sheets
1. Buka [sheets.new](https://sheets.new)
2. Buat 5 sheet dengan nama:
   - `Pelajar`
   - `Pensyarah`
   - `Transaksi`
   - `AccessLog`
   - `Config`
3. Copy data dari file `sheets-structure.csv` ke sheet masing-masing

### 2. Deploy Apps Script
1. Dalam Google Sheets: **Extensions → Apps Script**
2. Delete code default
3. Paste code dari `apps-script-code.js`
4. **Save** (Ctrl+S)
5. **Deploy → New Deployment**
6. Pilih **Type: Web App**
7. **Execute as:** Me
8. **Who has access:** Anyone (atau Anyone with Google account)
9. **Deploy**
10. Copy Web App URL

### 3. Update Frontend Configuration
1. Buka `js/config.js`
2. Update `API_BASE_URL` dengan URL deployment anda:
```javascript
API_BASE_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
