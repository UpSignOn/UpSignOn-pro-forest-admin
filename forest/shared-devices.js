const { collection } = require("forest-express-sequelize");

collection("sharedDevices", {
  isSearchable: true,
  fields: [
    {
      field: "device_unique_id",
      type: "String",
    },
    {
      field: "id",
      type: "String",
    },
    {
      field: "userEmails",
      type: "String",
    },
  ],
});
