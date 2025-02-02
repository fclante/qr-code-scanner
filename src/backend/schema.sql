CREATE TABLE IF NOT EXISTS supermarket_data (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  date_added TEXT NOT NULL,
  expiration_date TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  in_stock BOOLEAN NOT NULL
);
