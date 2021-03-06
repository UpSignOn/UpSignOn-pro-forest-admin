// This model was generated by Lumber. However, you remain in control of your models.

const { upsignonError } = require("../helpers/preventCRUD");

// Learn how here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/models/enrich-your-models
module.exports = (sequelize, DataTypes) => {
  const { Sequelize } = sequelize;
  // This section contains the fields of your model, mapped to your table's columns.
  // Learn more here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/models/enrich-your-models#declaring-a-new-field-in-a-model
  const SharedAccounts = sequelize.define(
    "sharedAccounts",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      url: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      login: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.ENUM(["ACCOUNT", "SINGLE_CODE"]),
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(0)"),
      },
    },
    {
      tableName: "shared_accounts",
      underscored: true,
      timestamps: false,
      schema: process.env.DATABASE_SCHEMA,
    }
  );

  // This section contains the relationships for this model. See: https://docs.forestadmin.com/documentation/v/v6/reference-guide/relationships#adding-relationships.
  SharedAccounts.associate = (models) => {
    SharedAccounts.hasMany(models.sharedAccountUsers, {
      foreignKey: {
        name: "sharedAccountIdKey",
        field: "shared_account_id",
      },
      sourceKey: "id",
      as: "users",
      onDelete: "CASCADE",
      hooks: true,
    });
  };

  SharedAccounts.beforeBulkCreate(upsignonError);
  SharedAccounts.beforeBulkDestroy(() => {
    throw new Error("You need to delete the account from the account page");
  });
  SharedAccounts.beforeBulkUpdate(upsignonError);
  SharedAccounts.beforeCreate(upsignonError);
  // SharedAccounts.beforeDestroy(upsignonError);
  SharedAccounts.beforeUpdate(upsignonError);
  SharedAccounts.beforeSave(upsignonError);
  SharedAccounts.beforeUpsert(upsignonError);

  return SharedAccounts;
};
