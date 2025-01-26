# Node.js PostgreSQL CRUD API

This project is a simple Node.js API that performs CRUD (Create, Read, Update, Delete) operations on a PostgreSQL database. It uses Express for handling HTTP requests and the `pg` library for database interactions.

## Project Structure

```
node-postgres-crud-api
├── src
│   ├── controllers
│   │   └── index.js
│   ├── models
│   │   └── index.js
│   ├── routes
│   │   └── index.js
│   ├── config
│   │   └── database.js
│   └── app.js
├── package.json
├── .gitignore
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd node-postgres-crud-api
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure the database:**
   Update the `src/config/database.js` file with your PostgreSQL connection details.

4. **Run the application:**
   ```
   npm start
   ```

## API Usage

### Endpoints

- **Create a new record**
  - `POST /api/records`
  
- **Read all records**
  - `GET /api/records`
  
- **Read a single record**
  - `GET /api/records/:id`
  
- **Update a record**
  - `PUT /api/records/:id`
  
- **Delete a record**
  - `DELETE /api/records/:id`

## License

This project is licensed under the MIT License.