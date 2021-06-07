const { collection } = require("forest-express-sequelize");
const models = require("../models");

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection("users", {
  actions: [],
  fields: [
    {
      field: "dataSizeInOctets",
      type: "Number",
      description: "Size of the encrypted data in octets.",
      isReadOnly: true,
      isRequired: true,
      get: (user) => {
        return user.encryptedData ? user.encryptedData.length : null;
      },
    },
    {
      field: "nbDevices",
      type: "Number",
      description: "Number of devices currently authorized for this user.",
      isReadOnly: true,
      get: (user) => {
        return models.userDevices.count({ where: { user_id: user.id } });
      },
    },
    {
      field: "nbSharedAccounts",
      type: "Number",
      description: "Number of shared accounts this user has access to.",
      isReadOnly: true,
      get: (user) => {
        return models.sharedAccountUsers.count({ where: { user_id: user.id } });
      },
    },
    {
      field: "nbAccounts",
      type: "Number",
      description: "Number of accounts",
      isReadOnly: true,
      get: async (user) => {
        const query = `SELECT nb_accounts from data_stats where user_id = ${user.id} ORDER BY date DESC LIMIT 1`;
        const res = await models.connections.default.query(query, { type: "SELECT" });
        return res[0] ? res[0].nb_accounts : 0;
      },
    },
    {
      field: "nbAccStrong",
      type: "Number",
      description: "Number of accounts with a strong password",
      isReadOnly: true,
      get: async (user) => {
        const query = `SELECT nb_accounts_strong from data_stats where user_id = ${user.id} ORDER BY date DESC LIMIT 1`;
        const res = await models.connections.default.query(query, { type: "SELECT" });
        return res[0] ? res[0].nb_accounts_strong : 0;
      },
    },
    {
      field: "nbAccMedium",
      type: "Number",
      description: "Number of accounts with a medium strength password",
      isReadOnly: true,
      get: async (user) => {
        const query = `SELECT nb_accounts_medium from data_stats where user_id = ${user.id} ORDER BY date DESC LIMIT 1`;
        const res = await models.connections.default.query(query, { type: "SELECT" });
        return res[0] ? res[0].nb_accounts_medium : 0;
      },
    },
    {
      field: "nbAccWeak",
      type: "Number",
      description: "Number of accounts with a weak password",
      isReadOnly: true,
      get: async (user) => {
        const query = `SELECT nb_accounts_weak from data_stats where user_id = ${user.id} ORDER BY date DESC LIMIT 1`;
        const res = await models.connections.default.query(query, { type: "SELECT" });
        return res[0] ? res[0].nb_accounts_weak : 0;
      },
    },
    {
      field: "nbCodes",
      type: "Number",
      description: "Number of codes",
      isReadOnly: true,
      get: async (user) => {
        const query = `SELECT nb_codes from data_stats where user_id = ${user.id} ORDER BY date DESC LIMIT 1`;
        const res = await models.connections.default.query(query, { type: "SELECT" });
        return res[0] ? res[0].nb_codes : 0;
      },
    },
  ],
  segments: [],
});
