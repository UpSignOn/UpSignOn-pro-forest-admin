const { RecordSerializer } = require("forest-express-sequelize");
const express = require("express");
const router = express.Router();
const models = require("../models");
const Sequelize = require("sequelize");

router.get("/sharedDevices", (req, res, next) => {
  const limit = parseInt(req.query.page.size) || 20;
  const offset = (parseInt(req.query.page.number) - 1) * limit;
  let conditionSearch = "";
  if (req.query.search) {
    conditionSearch = `users.email LIKE '%${req.query.search.replace(
      /\'/g,
      "''"
    )}%' OR user_devices.device_unique_id LIKE '%${req.query.search.replace(/\'/g, "''")}%'`;
  }

  const queryData = `
    SELECT user_devices.device_unique_id AS device_unique_id, user_devices.device_unique_id AS id, STRING_AGG(users.email,' ; ') AS userEmails FROM user_devices INNER JOIN users ON users.id=user_devices.user_id
    ${conditionSearch ? `WHERE ${conditionSearch}` : ""}
    GROUP BY user_devices.device_unique_id
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC, user_devices.device_unique_id ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const queryCount = `
    SELECT COUNT(DISTINCT user_devices.device_unique_id) FROM user_devices INNER JOIN users ON users.id=user_devices.user_id
    ${conditionSearch ? `WHERE ${conditionSearch}` : ""}
    GROUP BY user_devices.device_unique_id
    HAVING COUNT(*) > 1
  `;

  Promise.all([
    models.connections.default.query(queryData, { type: "SELECT" }),
    models.connections.default.query(queryCount, { type: "SELECT" }),
  ])
    .then(async ([sharedDevicesList, sharedDevicesCount]) => {
      const customerStatsSerializer = new RecordSerializer({ name: "sharedDevices" });
      const customerStats = await customerStatsSerializer.serialize(sharedDevicesList);
      const count = sharedDevicesCount[0] ? sharedDevicesCount[0].count : 0;
      res.send({ ...customerStats, meta: { count: count } });
    })
    .catch((err) => next(err));
});

module.exports = router;
