class DatabaseModel {
    constructor(pool) {
        this.pool = pool;
    }

    async create(data) {
        const query = 'INSERT INTO supermarket_data (price, date_added, expiration_date, quantity, in_stock) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const values = [data.price, data.date_added, data.expiration_date, data.quantity, data.in_stock];
        const res = await this.pool.query(query, values);
        return res.rows[0];
    }

    async read(id) {
        const query = 'SELECT * FROM supermarket_data WHERE id = $1';
        const values = [id];
        const res = await this.pool.query(query, values);
        return res.rows[0];
    }

    async update(id, data) {
        const query = 'UPDATE supermarket_data SET price = $1, date_added = $2, expiration_date = $3, quantity = $4, in_stock = $5 WHERE id = $6 RETURNING *';
        const values = [data.price, data.date_added, data.expiration_date, data.quantity, data.in_stock, id];
        const res = await this.pool.query(query, values);
        return res.rows[0];
    }

    async delete(id) {
        const query = 'DELETE FROM supermarket_data WHERE id = $1 RETURNING *';
        const values = [id];
        const res = await this.pool.query(query, values);
        return res.rows[0];
    }
}

module.exports = DatabaseModel;