const express = require('express');
const CRUDController = require('../controllers/crudController'); // Ensure this path is correct

function setRoutes(app) {
  const controller = new CRUDController(); // Ensure CRUDController is a constructor
  const router = express.Router();  // Create a router instance

  router.get('/items', (req, res) => {
    if (req.query.id) {
      return controller.getItemById.bind(controller)(req, res);
    }
    if (req.query.name) {
      return controller.getItemByName.bind(controller)(req, res);
    }
    return controller.getItems.bind(controller)(req, res);
  });
  router.post('/items', controller.createItem.bind(controller));
  router.put('/items/:id', controller.updateItem.bind(controller));
  router.delete('/items/:id', controller.deleteItem.bind(controller));
  router.get('/categories', controller.getCategories.bind(controller));

  return router;  // Return the router
}

module.exports = setRoutes;