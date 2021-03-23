// This model was generated by Lumber. However, you remain in control of your models.
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

  Users.beforeBulkCreate(async () => {
    throw new Error("This is currently not allowed by the UpSignOn team.");
  });
  Users.beforeBulkUpdate(async () => {
    throw new Error("This is currently not allowed by the UpSignOn team.");
  });
  Users.beforeCreate(async () => {
    throw new Error("This is currently not allowed by the UpSignOn team.");
  });
  Users.beforeUpdate(async () => {
    throw new Error("This is currently not allowed by the UpSignOn team.");
  });
  Users.beforeSave(async () => {
    throw new Error("This is currently not allowed by the UpSignOn team.");
  });
  Users.beforeUpsert(async () => {
    throw new Error("This is currently not allowed by the UpSignOn team.");
  });

  return Users;
};
