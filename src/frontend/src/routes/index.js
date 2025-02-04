const express = require('express');
const router = express.Router();
const ApiFacade = require('../apiFacade');
const fetch = require('node-fetch');

// Update API base URL to use /api prefix
const api = new ApiFacade(process.env.NODE_ENV === 'production' 
    ? '/api'  // In production, use relative path
    : 'http://localhost:3001/api'  // In development, use full URL
);

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
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Kunde routes
router.get('/kunde', (req, res) => {
  res.render('kunde/index', { title: 'Kunde Portal' });
});

router.get('/kunde/scan', (req, res) => {
  const items = req.session.basket || [];
  res.render('kunde/scan', { 
    title: 'Scan Items',
    items: items 
  });
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
  if (!str) return 'unknown';  // Handle null/undefined case
  return str
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/Æ/g, 'Ae')
    .replace(/Ø/g, 'Oe')
    .replace(/Å/g, 'Aa')
    .replace(/[^a-z0-9]/gi, '_'); // Replace any non-alphanumeric chars with underscore
}

// Add this new route
router.get('/generate/:id', async (req, res) => {
  try {
    const id = req.params.id;   
    const item = await api.getById('/items', id);
    
    console.log('Item for QR generation:', item); // Debug log
    
    if (!item) {
      return res.status(404).send('Item not found');
    }
    
    // Create a data object for the QR code with all needed fields
    const qrData = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      date_added: item.date_added,
      category_id: item.category_id,
      expiration_date: item.expiration_date,
      in_stock: item.in_stock ? 'true' : 'false',  // Convert boolean to string
      ean_country_code: item.ean_country_code || '570', // Default value if empty
      ean_manufacturer_code: item.ean_manufacturer_code,
      ean_product_code: item.ean_product_code,
      ean_check_digit: item.ean_check_digit
    };

    console.log('QR Data being encoded:', qrData); // Debug log

    QRCode.toDataURL(JSON.stringify(qrData), (err, url) => {
      if (err) {
        console.error('QR Code generation failed:', err);
        return res.status(500).send('Failed to generate QR code');
      }

      const base64Image = url.split(',')[1];
      const imgBuffer = Buffer.from(base64Image, 'base64');
      const fileName = sanitizeFileName(item.name || 'item') + '.png';
      
      res.setHeader('Content-Disposition', `attachment; filename="qr-${fileName}"`);
      res.setHeader('Content-Type', 'image/png');
      res.send(imgBuffer);
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).send('Error generating QR code');
  }
});

// Create/Update form route (GET)
router.get('/create', async (req, res) => {
  try {
    const categories = await api.getCategories();
    res.render('medarbejder/create-item', { 
      title: 'Create New Item', 
      item: null,
      categories
    });
  } catch (error) {
    res.status(500).send('Error loading form');
  }
});

router.post('/create', async (req, res) => {
  try {
    const { 
      name, price, date_added, expiration_date, quantity, in_stock,
      category_id, ean_country_code, ean_manufacturer_code,
      ean_product_code, ean_check_digit 
    } = req.body;
    
    // Validate that we received data
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Empty request body');
      return res.status(400).send('No data received');
    }
    
    // Validate required fields
    if (!name || !price || !date_added || !expiration_date || 
        quantity === undefined || in_stock === undefined || 
        !category_id || !ean_country_code || 
        !ean_manufacturer_code || !ean_product_code || 
        !ean_check_digit) {
      console.log('Missing required fields:', { 
        name, 
        price, 
        date_added, 
        expiration_date, 
        quantity, 
        in_stock,
        category_id,
        ean_country_code,
        ean_manufacturer_code,
        ean_product_code,
        ean_check_digit 
      });
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
    await api.post('/items', { 
      name, price, date_added, expiration_date, quantity, in_stock,
      category_id, ean_country_code, ean_manufacturer_code,
      ean_product_code, ean_check_digit 
    });
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
    const [item, categories] = await Promise.all([
      api.getById('/items', id),
      api.getCategories()
    ]);
    res.render('medarbejder/create-item', { 
      title: 'Update Item', 
      item,
      categories
    });
  } catch (error) {
    res.status(500).send('Error fetching item');
  }
});

// Change the PUT route to POST temporarily for debugging
router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, price, date_added, expiration_date, quantity, in_stock,
      category_id, ean_country_code, ean_manufacturer_code,
      ean_product_code, ean_check_digit 
    } = req.body;
    
    // Improved validation
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Empty request body');
      return res.status(400).send('No data received');
    }
    
    if (!name || !price || !date_added || !expiration_date || 
        quantity === undefined || in_stock === undefined || 
        !category_id || !ean_country_code || 
        !ean_manufacturer_code || !ean_product_code || 
        !ean_check_digit) {
      console.log('Missing required fields:', { 
        name, 
        price, 
        date_added, 
        expiration_date, 
        quantity, 
        in_stock,
        category_id,
        ean_country_code,
        ean_manufacturer_code,
        ean_product_code,
        ean_check_digit 
      });
      return res.status(400).send('Missing required fields');
    }
    
    await api.put(`/items/${id}`, { 
      name, price, date_added, expiration_date, quantity, in_stock,
      category_id, ean_country_code, ean_manufacturer_code,
      ean_product_code, ean_check_digit 
    });
    res.redirect('/medarbejder/varer');
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Error updating item');
  }
});

router.get('/scan', async (req, res) => {
    try {
        console.log('Scan route accessed');
        console.log('Query parameters:', req.query); // Add debug log
        
        // Make sure all required fields are present
        const scannedItem = {
            id: req.query.id,
            name: req.query.name,
            price: req.query.price,
            quantity: req.query.quantity,
            date_added: req.query.date_added,
            expiration_date: req.query.expiration_date,
            in_stock: req.query.in_stock === 'true', 
            category_id: req.query.category_id,
            ean_country_code: req.query.ean_country_code,
            ean_manufacturer_code: req.query.ean_manufacturer_code,
            ean_product_code: req.query.ean_product_code,
            ean_check_digit: req.query.ean_check_digit
        };
        
        console.log('Processed scanned item:', scannedItem); // Add debug log

        res.render('medarbejder/scan-result', {
            title: 'Scan Result',
            scannedItem: scannedItem,
            req: req
        });
    } catch (error) {
        console.error('Error in scan route:', error);
        res.status(500).render('error', { 
            message: 'Error processing scan',
            error: error
        });
    }
});

// Add this helper function to fetch meal suggestions
async function fetchMealSuggestions(ingredient) {
    try {
        console.log('Fetching suggestions for:', ingredient);
        const response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`
        );
        const data = await response.json();
        console.log('API response:', data);
        return data.meals || [];
    } catch (error) {
        console.error('Error fetching meal suggestions:', error);
        return [];
    }
}

router.post('/kunde/basket/add', async (req, res) => {
    try {
        const { name, details } = req.body;
        console.log('Adding item:', name, details);
        
        if (!req.session.basket) {
            req.session.basket = [];
        }
        
        const suggestedMeals = await fetchMealSuggestions(name);
        console.log('Suggested meals:', suggestedMeals);
        
        req.session.basket.push({
            name,
            details,
            amount: 1,
            suggestedMeals: suggestedMeals
        });

        console.log('Updated basket:', req.session.basket);
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding item to basket:', error);
        res.json({ success: false, error: error.message });
    }
});

// Update the scan route to include basket items
router.get('/kunde/scan', (req, res) => {
    const items = req.session.basket || [];
    res.render('kunde/scan', { 
        title: 'Scan Items',
        items: items 
    });
});

router.delete('/kunde/basket/remove', (req, res) => {
    try {
        const { name } = req.body;
        
        if (!req.session.basket) {
            throw new Error('Basket not found');
        }
        
        // Remove item from basket
        req.session.basket = req.session.basket.filter(item => item.name !== name);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing item from basket:', error);
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;