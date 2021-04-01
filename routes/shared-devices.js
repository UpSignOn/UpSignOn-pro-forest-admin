const { RecordSerializer } = require("forest-express-sequelize");
const express = require("express");
const router = express.Router();
const models = require("../models");
const Sequelize = require("sequelize");

router.get("/sharedDevices", (req, res, next) => {
  const limit = parseInt(req.query.page.size) || 20;
  const offset = (parseInt(req.query.page.number) - 1) * limit;

  const queryData = `
    SELECT
      user_devices.device_unique_id AS device_unique_id,
      user_devices.device_unique_id AS id,
      MAX(user_devices.created_at) AS date,
      STRING_AGG(users.email,' ; ') AS emails
    FROM user_devices
    INNER JOIN users ON users.id=user_devices.user_id
    WHERE user_devices.authorization_status='AUTHORIZED'
    GROUP BY user_devices.device_unique_id
    HAVING COUNT(*) > 1
    ORDER BY date DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const queryCount = `
    SELECT COUNT(DISTINCT user_devices.device_unique_id) FROM user_devices INNER JOIN users ON users.id=user_devices.user_id
    GROUP BY user_devices.device_unique_id
    HAVING COUNT(*) > 1
  `;

  Promise.all([
    models.connections.default.query(queryData, { type: "SELECT" }),
    models.connections.default.query(queryCount, { type: "SELECT" }),
  ])
    .then(async ([sharedDevicesList, sharedDevicesCount]) => {
      const sharedDevicesSerializer = new RecordSerializer({ name: "sharedDevices" });
      const sharedDevices = await sharedDevicesSerializer.serialize(sharedDevicesList);
      const count = sharedDevicesCount[0] ? sharedDevicesCount[0].count : 0;
      res.send({ ...sharedDevices, meta: { count: count } });
    })
    .catch((err) => next(err));
});

// Get a shared device
router.get("/sharedDevices/:recordId", (request, response, next) => {
  const queryData = `
    SELECT user_devices.device_unique_id AS device_unique_id, user_devices.device_unique_id AS id, MAX(user_devices.created_at) AS date, STRING_AGG(users.email,' ; ') AS emails FROM user_devices INNER JOIN users ON users.id=user_devices.user_id
    WHERE user_devices.device_unique_id = '${request.params.recordId}'
    GROUP BY user_devices.device_unique_id
  `;
  models.connections.default
    .query(queryData, { type: "SELECT" })
    .then(async (sharedDeviceItem) => {
      const sharedDeviceItemSerializer = new RecordSerializer({ name: "sharedDevices" });
      const sharedDevice = await sharedDeviceItemSerializer.serialize(sharedDeviceItem);
      response.send(sharedDevice);
    })
    .catch((err) => next(err));
});

module.exports = router;
