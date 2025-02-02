const { Pool } = require('pg');
const dbConfig = require('../config/database');

class CRUDController {
  constructor() {
    this.pool = new Pool(dbConfig);
  }

  async getCategories(req, res) {
    try {
      const result = await this.pool.query('SELECT * FROM food_categories');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).send('Error fetching categories');
    }
  }

  async getItems(req, res) {
    try {
      const result = await this.pool.query(`
        SELECT 
          s.*,
          f.name as category_name
        FROM supermarket_data s
        LEFT JOIN food_categories f ON s.category_id = f.id
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).send('Error fetching items');
    }
  }

  async getItemById(req, res) {
    const { id } = req.query;
    try {
      if (!id) {
        return res.status(400).send('ID parameter is required');
      }

      const result = await this.pool.query('SELECT * FROM supermarket_data WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).send('Item not found');
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching item:', error);
      res.status(500).send('Error fetching item');
    }
  }

  async getItemByName(req, res) {
    const { name } = req.query;
    try {
      if (!name) {
        return res.status(400).send('Name parameter is required');
      }

      // Using ILIKE for case-insensitive search and partial matches
      const result = await this.pool.query(
        'SELECT * FROM supermarket_data WHERE name ILIKE $1',
        [`%${name}%`]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).send('Item not found');
      }
      
      res.json(result.rows[0]); // Returns the first match
    } catch (error) {
      console.error('Error fetching item by name:', error);
      res.status(500).send('Error fetching item by name');
    }
  }

  async createItem(req, res) {
    const { 
      name, price, date_added, expiration_date, quantity, in_stock,
      category_id, ean_gsone_country_code, ean_manufacturer_code, 
      ean_product_code, ean_check_digit 
    } = req.body;
    try {
      const result = await this.pool.query(
        `INSERT INTO supermarket_data (
          name, price, date_added, expiration_date, quantity, in_stock,
          category_id, ean_gsone_country_code, ean_manufacturer_code, ean_product_code, ean_check_digit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [name, price, date_added, expiration_date, quantity, in_stock,
         category_id, ean_gsone_country_code, ean_manufacturer_code, ean_product_code, ean_check_digit]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).send('Error creating item');
    }
  }

  async updateItem(req, res) {
    const { id } = req.params;
    const { 
      name, price, date_added, expiration_date, quantity, in_stock,
      category_id, ean_gsone_country_code, ean_manufacturer_code, 
      ean_product_code, ean_check_digit 
    } = req.body;
    try {
      const result = await this.pool.query(
        `UPDATE supermarket_data SET 
          name = $1, price = $2, date_added = $3, expiration_date = $4, 
          quantity = $5, in_stock = $6, category_id = $7,
          ean_gsone_country_code = $8, ean_manufacturer_code = $9, 
          ean_product_code = $10, ean_check_digit = $11
        WHERE id = $12 RETURNING *`,
        [name, price, date_added, expiration_date, quantity, in_stock,
         category_id, ean_gsone_country_code, ean_manufacturer_code, 
         ean_product_code, ean_check_digit, id]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).send('Error updating item');
    }
  }

  async deleteItem(req, res) {
    const { id } = req.params;
    try {
      await this.pool.query('DELETE FROM supermarket_data WHERE id = $1', [id]);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).send('Error deleting item');
    }
  }
}

module.exports = CRUDController;