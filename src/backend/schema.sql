CREATE TABLE IF NOT EXISTS supermarket_data (
  id INTEGER PRIMARY KEY,
  price REAL NOT NULL,
  date_added TEXT NOT NULL,
  expiration_date TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  in_stock BOOLEAN NOT NULL
);
