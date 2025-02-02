const express = require('express');
const router = express.Router();
const ApiFacade = require('../apiFacade');
const api = new ApiFacade('http://localhost:3001'); // Replace with your actual API base URL

// Home route
router.get('/', async (req, res) => {
  res.render('index', { title: 'Supermarket Data' });
});

// Medarbejder routes
router.get('/medarbejder', (req, res) => {
  res.render('medarbejder/index', { title: 'Medarbejder Portal' });
});

router.get('/medarbejder/scan', (req, res) => {
  res.render('medarbejder/scan', { title: 'Medarbejder Scan' });
});

router.get('/medarbejder/varer', async (req, res) => { 
  try {
    const data = await api.get('/items');
    res.render('medarbejder/varer', { title: 'Medarbejder Varer', data: data });
    console.log(data);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Kunde routes
router.get('/kunde', (req, res) => {
  res.render('kunde/index', { title: 'Kunde Portal' });
});

router.get('/kunde/scan', (req, res) => {
  res.render('kunde/scan', { title: 'Kunde Scan' });
});

router.get('/kunde/varer', (req, res) => {
  res.render('kunde/varer', { title: 'Kunde Varer' });
});


// Export data as Excel
router.get('/export', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Supermarket Data');

    // Add header row
    sheet.addRow(['ID', 'Price', 'Date Added', 'Expiration Date', 'Quantity', 'In Stock']);

    // Fetch data from API instead of database
    const items = await api.get('/items');
    
    // Add rows to Excel
    items.forEach((item) => {
      sheet.addRow([
        item.id,
        item.name,
        item.price,
        item.date_added,
        item.expiration_date,
        item.quantity,
        item.in_stock ? 'Yes' : 'No',
      ]);
    });

    // Export file
    const filePath = path.join(__dirname, 'supermarket_data.xlsx');
    workbook.xlsx.writeFile(filePath).then(() => {
      res.download(filePath, 'supermarket_data.xlsx', (err) => {
        if (err) console.error('File download error:', err);
      });
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).send('Failed to export data');
  }
});

const QRCode = require('qrcode');

function sanitizeFileName(str) {
  return str
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/Æ/g, 'Ae')
    .replace(/Ø/g, 'Oe')
    .replace(/Å/g, 'Aa')
    .replace(/\s+/g, '_'); // Replace spaces with underscores
}

// Add this new route
router.get('/generate/:id', async (req, res) => {
  try {
    const id = req.params.id;   
    const item = await api.getById('/items', id);
    
    QRCode.toDataURL(JSON.stringify(item), (err, url) => {
      if (err) {
        console.error('QR Code generation failed:', err);
        return res.status(500).send('Failed to generate QR code');
      }

      const base64Image = url.split(',')[1];
      const imgBuffer = Buffer.from(base64Image, 'base64');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${sanitizeFileName(item.name)}.png"`);
      res.setHeader('Content-Type', 'image/png');
      res.send(imgBuffer);
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).send('Error generating QR code');
  }
});


// Create/Update form route (GET)
router.get('/create', (req, res) => {
  res.render('medarbejder/create-item', { 
    title: 'Create New Item', 
    item: null 
  });
});

router.post('/create', async (req, res) => {
  try {
    console.log('Received data:', req.body);
    const { name, price, date_added, expiration_date, quantity, in_stock } = req.body;
    
    // Validate that we received data
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Empty request body');
      return res.status(400).send('No data received');
    }
    
    // Validate required fields
    if (!name || !price || !date_added || !expiration_date || quantity === undefined || in_stock === undefined) {
      console.log('Missing required fields:', { name, price, date_added, expiration_date, quantity, in_stock });
      return res.status(400).send('Missing required fields');
    }

    // Validate data types and ranges
    if (isNaN(price) || price < 0) {
      return res.status(400).send('Invalid price value');
    }

    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).send('Invalid quantity value');
    }

    // Create the item
    await api.post('/items', { name, price, date_added, expiration_date, quantity, in_stock });
    res.redirect('/medarbejder/varer');
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).send(`Error creating item: ${error.message}`);
  }
});

// Delete route (GET)
router.get('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await api.delete(`/items/${id}`);
    res.redirect('/medarbejder/varer');
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Error deleting item');
  }
});

// Update form route (GET)
router.get('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await api.getById('/items', id);
    res.render('medarbejder/create-item', { 
      title: 'Update Item', 
      item 
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).send('Error fetching item');
  }
});

// Change the PUT route to POST temporarily for debugging
router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received data:', req.body);
    const { name, price, date_added, expiration_date, quantity, in_stock } = req.body;
    
    // Improved validation
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Empty request body');
      return res.status(400).send('No data received');
    }
    
    if (!name || !price || !date_added || !expiration_date || quantity === undefined || in_stock === undefined) {
      console.log('Missing required fields:', { name, price, date_added, expiration_date, quantity, in_stock });
      return res.status(400).send('Missing required fields');
    }
    
    await api.put(`/items/${id}`, { name, price, date_added, expiration_date, quantity, in_stock });
    res.redirect('/medarbejder/varer');
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Error updating item');
  }
});

router.get('/scan/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Scanning item with ID:', id);
    
    // Get the scanned item details
    let scannedItem;
    try {
      const apiResponse = await api.getById('/items', id);
      console.log('Raw API response:', apiResponse);
      
      // Ensure we have a valid response object
      if (!apiResponse) {
        throw new Error(`No item found with ID: ${id}`);
      }

      // Safely format dates if they exist
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      };
      
      // Create a sanitized scanned item object with default values
      scannedItem = {
        id: apiResponse.id || id,
        name: apiResponse.name || '',
        price: apiResponse.price || 0,
        quantity: apiResponse.quantity || 1,
        date_added: formatDate(apiResponse.date_added) || new Date().toISOString().split('T')[0],
        expiration_date: formatDate(apiResponse.expiration_date) || '',
        in_stock: apiResponse.in_stock ?? true
      };

      console.log('Processed scanned item:', scannedItem);

    } catch (apiError) {
      console.error('API Error:', apiError);
      // Instead of throwing error, create a new item template
      scannedItem = {
        id: id,
        name: '',
        price: 0,
        quantity: 1,
        date_added: new Date().toISOString().split('T')[0],
        expiration_date: '',
        in_stock: true
      };
    }
    
    // Always render the template with the scanned item
    res.render('medarbejder/scan-result', {
      title: 'Scan Result',
      scannedItem,
      existingItem: null // We'll always show the new item form for now
    });

  } catch (error) {
    console.error('Error processing scan:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error processing QR code scan',
      error: error
    });
  }
});

module.exports = router;