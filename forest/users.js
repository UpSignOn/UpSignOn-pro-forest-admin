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
        return user.encryptedData.length;
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
  ],
  segments: [],
});
