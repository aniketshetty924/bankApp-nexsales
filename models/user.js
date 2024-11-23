"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user.hasMany(models.account);
      user.hasMany(models.document);
    }
  }
  user.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      fullName: DataTypes.STRING,
      dateOfBirth: DataTypes.DATEONLY,
      isAdmin: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "user",
      underscored: true,
      paranoid: true,

      hooks: {
        beforeUpdate: (user) => {
          if (user.changed("firstName") || user.changed("lastName")) {
            user.fullName = `${user.firstName} ${user.lastName}`;
          }
        },
      },
    }
  );
  return user;
};
