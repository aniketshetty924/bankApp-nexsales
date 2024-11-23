"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      document.belongsTo(models.user, {
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        hooks: true,
      });
    }
  }
  document.init(
    {
      fileLinks: DataTypes.TEXT,
      status: {
        type: DataTypes.STRING,
        defaultValue: "not submitted",
        validate: {
          isIn: [["not done", "submitted", "pending", "approved", "rejected"]],
        },
      },
      adminNote: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "document",
      underscored: true,
      paranoid: true,
    }
  );
  return document;
};
