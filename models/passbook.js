"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class passbook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      passbook.belongsTo(models.account);
    }
  }
  passbook.init(
    {
      entry: DataTypes.STRING(5000),
    },
    {
      sequelize,
      modelName: "passbook",
      underscored: true,
      paranoid: true,
    }
  );
  return passbook;
};
