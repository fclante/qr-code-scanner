const express = require('express');
const router = express.Router();
const ApiFacade = require('../apiFacade');
const api = new ApiFacade('http://localhost:3001'); // Replace with your actual API base URL

// Home route
router.get('/', async (req, res) => {
  res.render('index');
});

// Medarbejder routes
router.get('/medarbejder', (req, res) => {
  res.render('medarbejder/index');
});

router.get('/medarbejder/scan', (req, res) => {
  res.render('medarbejder/scan');
});


router.get('/medarbejder/varer', async (req, res) => { 
  try {
    const data = await api.get('/items');
    res.render('medarbejder/varer', { title: 'Medarbejder Varer', data });
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Kunde routes
router.get('/kunde', (req, res) => {
  res.render('kunde/index');
});

router.get('/kunde/scan', (req, res) => {
  res.render('kunde/scan');
});

router.get('/kunde/varer', (req, res) => {
  res.render('kunde/varer');
});

// Add data
router.post('/add', (req, res) => {
  const { price, date_added, expiration_date, quantity, in_stock } = req.body;
  // Send data to external API
  res.redirect('/');
});

// Export data as Excel
router.get('/export', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Supermarket Data');

    // Add header row
    sheet.addRow(['ID', 'Price', 'Date Added', 'Expiration Date', 'Quantity', 'In Stock']);

    // Fetch data from database
    db.all('SELECT * FROM supermarket_data', [], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Database query error');
      }

      // Add rows to Excel
      rows.forEach((row) => {
        sheet.addRow([
          row.id,
          row.price,
          row.date_added,
          row.expiration_date,
          row.quantity,
          row.in_stock ? 'Yes' : 'No',
        ]);
      });

      // Export file
      const filePath = path.join(__dirname, 'supermarket_data.xlsx');
      workbook.xlsx.writeFile(filePath).then(() => {
        res.download(filePath, 'supermarket_data.xlsx', (err) => {
          if (err) console.error('File download error:', err);
        });
      });
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).send('Failed to export data');
  }
});

// Generate QR code
router.get('/generate/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM supermarket_data WHERE id = ?', [id], (err, row) => {
    if (err || !row) {
      console.error(err || 'Data not found');
      return res.status(404).send('Data not found');
    }

    const QRCode = require('qrcode');
    QRCode.toDataURL(JSON.stringify(row), (err, url) => {
      if (err) {
        console.error('QR Code generation failed:', err);
        return res.status(500).send('Failed to generate QR code');
      }

      const base64Image = url.split(',')[1];
      const imgBuffer = Buffer.from(base64Image, 'base64');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${id}.png"`);
      res.setHeader('Content-Type', 'image/png');
      res.send(imgBuffer);
    });
  });
});

module.exports = router;