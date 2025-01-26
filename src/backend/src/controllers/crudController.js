const { Pool } = require('pg');
const dbConfig = require('../config/database');

class CRUDController {
  constructor() {
    this.pool = new Pool(dbConfig);
  }

  async getItems(req, res) {
    try {
      const result = await this.pool.query('SELECT * FROM supermarket_data');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).send('Error fetching items');
    }
  }

  async createItem(req, res) {
    const { name, description } = req.body;
    try {
      const result = await this.pool.query(
        'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).send('Error creating item');
    }
  }

  async updateItem(req, res) {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
      const result = await this.pool.query(
        'UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description, id]
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
      await this.pool.query('DELETE FROM items WHERE id = $1', [id]);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).send('Error deleting item');
    }
  }
}

module.exports = CRUDController;