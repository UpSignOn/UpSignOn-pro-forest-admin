const { collection } = require("forest-express-sequelize");
const models = require("../models");

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments
collection("passwordResetRequest", {
  actions: [
    {
      name: "Accepter la demande de reset de mot de passe",
      type: "single",
      endpoint: "/forest/actions/grant-password-reset-request",
    },
  ],
  fields: [
    {
      field: "userEmail",
      type: "String",
      description: "",
      isReadOnly: true,
      get: async (resetRequest) => {
        const userEmail = await models.connections.default.query(
          `SELECT email FROM users AS u INNER JOIN user_devices AS ud ON ud.user_id=u.id INNER JOIN password_reset_request AS prr ON prr.device_id=ud.id WHERE prr.id=$1`,
          { type: "SELECT", bind:[resetRequest.id] }
        );
        return userEmail[0].email;
      },
    },
  ],
  segments: [],
});
