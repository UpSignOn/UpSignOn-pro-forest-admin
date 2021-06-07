const { collection } = require("forest-express-sequelize");

collection("sharedDevices", {
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
      field: "emails",
      type: "String",
    },
    {
      field: "device_names",
      type: "String",
    },
    {
      field: "date",
      type: "Date",
    },
  ],
});
