const express = require("express");
const { v4 } = require("uuid");
const nodemailer = require("nodemailer");
const { PermissionMiddlewareCreator, RecordsGetter } = require("forest-express-sequelize");
const { passwordResetRequest, users, userDevices } = require("../models");

const router = express.Router();
const permissionMiddlewareCreator = new PermissionMiddlewareCreator("passwordResetRequest");

// This file contains the logic of every route in Forest Admin for the collection passwordResetRequest:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Password Reset Request
router.post("/passwordResetRequest", permissionMiddlewareCreator.create(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
  next();
});

// Update a Password Reset Request
router.put("/passwordResetRequest/:recordId", permissionMiddlewareCreator.update(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
  next();
});

// Delete a Password Reset Request
router.delete("/passwordResetRequest/:recordId", permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
  next();
});

// Get a list of Password Reset Requests
router.get("/passwordResetRequest", permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
  next();
});

// Get a number of Password Reset Requests
router.get("/passwordResetRequest/count", permissionMiddlewareCreator.list(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
  next();
});

// Get a Password Reset Request
router.get(
  "/passwordResetRequest/:recordId(?!count)",
  permissionMiddlewareCreator.details(),
  (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
    next();
  }
);

// Export a list of Password Reset Requests
router.get("/passwordResetRequest.csv", permissionMiddlewareCreator.export(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
  next();
});

// Delete a list of Password Reset Requests
router.delete("/passwordResetRequest", permissionMiddlewareCreator.delete(), (request, response, next) => {
  // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
  next();
});

router.post("/actions/grant-password-reset-request", permissionMiddlewareCreator.smartAction(), (req, res) => {
  return new RecordsGetter(passwordResetRequest).getIdsFromRequest(req).then((requestIds) => {
    const expDuration = 10 * 60 * 1000; // 10 minutes
    const expDate = Date.now() + expDuration;
    const date = new Date();
    date.setTime(expDate);
    const expirationDate = date.toISOString();
    const requestToken = v4().substring(0, 8);
    return passwordResetRequest
      .update(
        {
          status: "ADMIN_AUTHORIZED",
          resetToken: requestToken,
          resetTokenExpirationDate: expirationDate,
        },
        { where: { id: requestIds } }
      )
      .then(() => {
        return userDevices.findAll({
          attributes: ["deviceName"],
          include: [
            { model: users, as: "user", attributes: ["email"], required: true },
            { model: passwordResetRequest, as: "passwordResetRequest", required: true, where: { id: requestIds } },
          ],
        });
      })
      .then((searchResult) => {
        const emailAddress = searchResult[0].dataValues.user.email;
        const deviceName = searchResult[0].dataValues.deviceName;
        console.log(emailAddress, deviceName);
        const transportOptions = {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_PORT === 465,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        };
        const transporter = nodemailer.createTransport(transportOptions);
        const expirationTime = `${date.getHours()}:${date
          .getMinutes()
          .toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;
        console.log("HERE !");
        return transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailAddress,
          subject: "Réinitialisation de votre mot de passe UpSignOn PRO",
          text: `Bonjour,\nVous avez effectué une demande de réinitialisation de votre mot de passe depuis votre appareil "${deviceName}".\n\nPour réinitiliaser votre mot de passe UpSignOn PRO, saisissez le code suivant.\n\n${requestToken}\n\nAttention, ce code n'est valide que pour l'appareil "${deviceName}" et expirera à ${expirationTime}.\n\nBonne journée,\nUpSignOn`,
        });
      })
      .then(() => {
        console.log("OK");
        res.send({ success: "Un email a été envoyé à l'utilisateur." });
      })
      .catch((e) => {
        console.log(e);
        res.send({ error: "An error occured." });
      });
  });
});

module.exports = router;
