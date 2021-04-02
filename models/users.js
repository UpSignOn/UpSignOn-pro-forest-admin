// This model was generated by Lumber. However, you remain in control of your models.

const { upsignonError } = require("../helpers/preventCRUD");

// Learn how here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/models/enrich-your-models
module.exports = (sequelize, DataTypes) => {
  const { Sequelize } = sequelize;
  // This section contains the fields of your model, mapped to your table's columns.
  // Learn more here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/models/enrich-your-models#declaring-a-new-field-in-a-model
  const Users = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      encryptedData: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(0)"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP(0)"),
      },
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: false,
      schema: process.env.DATABASE_SCHEMA,
    }
  );

  // This section contains the relationships for this model. See: https://docs.forestadmin.com/documentation/v/v6/reference-guide/relationships#adding-relationships.
  Users.associate = (models) => {
    Users.hasMany(models.userDevices, {
      foreignKey: "user_id",
      sourceKey: "id",
    });
    Users.hasMany(models.sharedAccountUsers, {
      foreignKey: "user_id",
      sourceKey: "id",
      as: "sharedAccounts",
    });
  };

  Users.beforeBulkCreate(upsignonError);
  Users.beforeBulkDestroy(upsignonError);
  Users.beforeBulkUpdate(upsignonError);
  Users.beforeCreate(upsignonError);
  Users.beforeDestroy(upsignonError);
  Users.beforeUpdate(upsignonError);
  Users.beforeSave(upsignonError);
  Users.beforeUpsert(upsignonError);

  return Users;
};
