const _ = require("lodash");
const P = require("bluebird");
const express = require("express");
const router = express.Router();
const Liana = require("forest-express-sequelize");
const moment = require("moment");
const models = require("../models");
const Sequelize = require("sequelize");
const { values } = require("../config/databases");

const fillForEmptyDates = (values, options) => {
  const result = [];
  const orderedValues = values
    .map((v) => ({ ...v, label: moment(v.label).startOf("day") }))
    .sort((a, b) => (a.label.isBefore(b.label) ? -1 : 1));
  const maxDate = moment().endOf("day");
  let nextDate = orderedValues[0].label;
  let lastKnownValueIndex = 0;
  while (nextDate.isBefore(maxDate)) {
    const lastKnownValue = orderedValues[lastKnownValueIndex] || orderedValues[orderedValues.length - 1];
    const nextKnownValue = orderedValues[lastKnownValueIndex + 1] || orderedValues[orderedValues.length - 1];
    console.log(lastKnownValue.label.format(), nextDate.format());
    if (nextDate.isSame(lastKnownValue.label)) {
      result.push({ label: nextDate.format(), values: { value: lastKnownValue.values.value } });
    } else if (nextDate.isSame(nextKnownValue.label)) {
      result.push({ label: nextDate.format(), values: { value: nextKnownValue.values.value } });
      lastKnownValueIndex++;
    } else {
      if (options.with === "PREVIOUS_VALUE") {
        result.push({
          label: nextDate.format(),
          values: { value: lastKnownValue.values.value },
        });
      } else {
        result.push({
          label: nextDate.format(),
          values: { value: 0 },
        });
      }
    }
    nextDate = nextDate.clone().add(1, "day");
  }
  return result;
};

/* Cumulated nb of registered users */
router.post("/stats/cumulated-nb-users", async (req, res) => {
  const query = `SELECT
  COUNT(DISTINCT users.id) AS count,
  date_trunc('day',users.created_at) AS day
  FROM users
  GROUP BY day
  ORDER BY day ASC
  `;
  const queryResult = await models.connections.default.query(query, { type: "SELECT" });
  let acc = 0;
  const values = queryResult.map((r) => {
    acc += parseInt(r.count);
    return { label: r.day, values: { value: acc } };
  });
  let json = new Liana.StatSerializer({
    value: fillForEmptyDates(values, { with: "PREVIOUS_VALUE" }),
  }).perform();
  res.send(json);
});

/* Nb active users per day */
router.post("/stats/nb-active-users-per-day", async (req, res) => {
  const query = `SELECT
  COUNT(DISTINCT users.id) AS count,
  date_trunc('day',logs.date) AS day
  FROM users
  INNER JOIN user_devices AS ud ON users.id = ud.user_id
  INNER JOIN usage_logs AS logs ON ud.id = logs.device_id
  WHERE AGE(logs.date) < interval '15 days'
  GROUP BY day
  `;
  const queryResult = await models.connections.default.query(query, { type: "SELECT" });
  const values = queryResult.map((r) => ({ label: r.day, values: { value: r.count } }));
  let json = new Liana.StatSerializer({
    value: fillForEmptyDates(values, { with: "0" }),
  }).perform();
  res.send(json);
});

/* Total nb sessions per day */
router.post("/stats/total-nb-sessions-per-day", async (req, res) => {
  const query = `SELECT
  COUNT(logs.*) AS count,
  date_trunc('day',logs.date) AS day
  FROM usage_logs AS logs
  WHERE AGE(logs.date) < interval '15 days'
  GROUP BY day
  ORDER BY day
  `;
  const queryResult = await models.connections.default.query(query, { type: "SELECT" });
  const values = queryResult.map((r) => ({ label: r.day, values: { value: r.count } }));
  let json = new Liana.StatSerializer({
    value: fillForEmptyDates(values, { with: "0" }),
  }).perform();
  res.send(json);
});

/* Avg sessions per user per day */
router.post("/stats/average-sessions-per-user-per-day", async (req, res) => {
  const query = `SELECT
  AVG(sessions) AS average_sessions,
  day
  FROM (SELECT
    COUNT(logs.*) AS sessions,
    date_trunc('day',logs.date) AS day,
    users.id AS user_id
    FROM users
    LEFT JOIN user_devices AS ud ON users.id = ud.user_id
    LEFT JOIN usage_logs AS logs ON ud.id = logs.device_id
    WHERE AGE(logs.date) < interval '15 days'
    GROUP BY day, users.id
    ) AS subquery
    GROUP BY day
    ORDER BY day
    `;

  const queryResult = await models.connections.default.query(query, { type: "SELECT" });
  const values = queryResult.map((r) => ({ label: r.day, values: { value: r.average_sessions } }));
  let json = new Liana.StatSerializer({
    value: fillForEmptyDates(values, { with: "0" }),
  }).perform();
  res.send(json);
});

/* Avg sessions per active user per day */
router.post("/stats/average-sessions-per-active-user-per-day", async (req, res) => {
  const query = `SELECT
  AVG(sessions) AS average_sessions,
  day
  FROM (SELECT
    COUNT(logs.*) AS sessions,
    date_trunc('day',logs.date) AS day,
    users.id AS user_id
    FROM users
    INNER JOIN user_devices AS ud ON users.id = ud.user_id
    INNER JOIN usage_logs AS logs ON ud.id = logs.device_id
    WHERE AGE(logs.date) < interval '15 days'
    GROUP BY day, users.id
    ) AS subquery
    GROUP BY day
    ORDER BY day
    `;

  const queryResult = await models.connections.default.query(query, { type: "SELECT" });
  const values = queryResult.map((r) => ({ label: r.day, values: { value: r.average_sessions } }));
  let json = new Liana.StatSerializer({
    value: fillForEmptyDates(values, { with: "0" }),
  }).perform();
  res.send(json);
});

/* Nb weak passwords */
router.post("/stats/total-weak-passwords", async (req, res) => {
  const query = `SELECT
  ARRAY_AGG(nb_accounts_weak order by date DESC) AS array
  FROM data_stats
  GROUP BY user_id
  `;
  const queryResult = await models.connections.default.query(query, { type: "SELECT" });
  const total = queryResult.reduce((acc, val) => acc + val.array[0], 0);
  let json = new Liana.StatSerializer({
    value: total,
  }).perform();
  res.send(json);
});

/* Nb medium passwords */
router.post("/stats/total-medium-passwords", async (req, res) => {
  const query = `SELECT
  ARRAY_AGG(nb_accounts_medium order by date DESC) AS array
  FROM data_stats
  GROUP BY user_id
  `;
  const queryResult = await models.connections.default.query(query, { type: "SELECT" });
  const total = queryResult.reduce((acc, val) => acc + val.array[0], 0);
  let json = new Liana.StatSerializer({
    value: total,
  }).perform();
  res.send(json);
});

/* Nb strong passwords */
router.post("/stats/total-strong-passwords", async (req, res) => {
  const query = `SELECT
        ARRAY_AGG(nb_accounts_strong order by date DESC) AS array
        FROM data_stats
        GROUP BY user_id
    `;
  const queryResult = await models.connections.default.query(query, { type: "SELECT" });
  const total = queryResult.reduce((acc, val) => acc + val.array[0], 0);
  let json = new Liana.StatSerializer({
    value: total,
  }).perform();
  res.send(json);
});

module.exports = router;
