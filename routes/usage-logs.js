const express = require("express");
const { PermissionMiddlewareCreator } = require("forest-express-sequelize");
const { usageLogs } = require("../models");

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator("usageLogs");

// This file contains the logic of every route in Forest Admin for the collection usageLogs:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Usage Log
router.post("/usageLogs", permissionMiddlewareCreator.create(), (request, response, next) => {
  throw new Error();
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Usage Log
router.put("/usageLogs/:recordId", permissionMiddlewareCreator.update(), (request, response, next) => {
  throw new Error();
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
  next();
});

// Delete a Usage Log
router.delete("/usageLogs/:recordId", permissionMiddlewareCreator.delete(), (request, response, next) => {
  throw new Error();
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Usage Logs
router.get("/usageLogs", permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
  next();
});

// Get a number of Usage Logs
router.get("/usageLogs/count", permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
  next();
});

// Get a Usage Log
router.get("/usageLogs/:recordId(?!count)", permissionMiddlewareCreator.details(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
  next();
});

// Export a list of Usage Logs
router.get("/usageLogs.csv", permissionMiddlewareCreator.export(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

// Delete a list of Usage Logs
router.delete("/usageLogs", permissionMiddlewareCreator.delete(), (request, response, next) => {
  throw new Error();
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  next();
});

module.exports = router;
