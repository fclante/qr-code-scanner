const express = require('express');
const CRUDController = require('../controllers/crudController'); // Ensure this path is correct

function setRoutes(app) {
  const controller = new CRUDController(); // Ensure CRUDController is a constructor
  app.get('/items', (req, res) => {
    if (req.query.id) {
      return controller.getItemById.bind(controller)(req, res);
    }
    if (req.query.name) {
      return controller.getItemByName.bind(controller)(req, res);
    }
    return controller.getItems.bind(controller)(req, res);
  });
  app.post('/items', controller.createItem.bind(controller));
  app.put('/items/:id', controller.updateItem.bind(controller));
  app.delete('/items/:id', controller.deleteItem.bind(controller));
  app.get('/categories', controller.getCategories.bind(controller));
}

module.exports = setRoutes;