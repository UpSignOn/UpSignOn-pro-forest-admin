const { collection } = require("forest-express-sequelize");
const models = require("../models");

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection("sharedAccounts", {
  actions: [],
  fields: [
    {
      field: "nbUsers",
      type: "Number",
      description: "Number of users that have access to this shared account.",
      isReadOnly: true,
      get: (sharedAccount) => {
        return models.sharedAccountUsers.count({ where: { shared_account_id: sharedAccount.id } });
      },
    },
  ],
  segments: [],
});
