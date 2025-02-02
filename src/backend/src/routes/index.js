const express = require('express');
const CRUDController = require('../controllers/crudController'); // Ensure this path is correct

function setRoutes(app) {
  const controller = new CRUDController(); // Ensure CRUDController is a constructor
  app.get('/items', controller.getItems.bind(controller));
  app.get('/items/:id', controller.getItemById.bind(controller));
  app.post('/items', controller.createItem.bind(controller));
  app.put('/items/:id', controller.updateItem.bind(controller));
  app.delete('/items/:id', controller.deleteItem.bind(controller));
}

module.exports = setRoutes;