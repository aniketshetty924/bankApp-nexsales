const { Op } = require("sequelize");
const db = require("../../models");
const { validateUUID } = require("../utils/uuid");

class UserConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      firstName: "firstName",
      lastName: "lastName",
      fullName: "fullName",
      username: "username",
      password: "password",
      email: "email",
      dateOfBirth: "dateOfBirth",

      isAdmin: "isAdmin",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt",
    };
    this.model = db.user;
    this.modelName = db.user.name;
    this.tableName = db.user.options.tableName;
    this.columnMapping = {
      id: this.model.rawAttributes[this.fieldMapping.id].field,
      firstName: this.model.rawAttributes[this.fieldMapping.firstName].field,
      lastName: this.model.rawAttributes[this.fieldMapping.lastName].field,
      fullName: this.model.rawAttributes[this.fieldMapping.fullName].field,

      isAdmin: this.model.rawAttributes[this.fieldMapping.isAdmin].field,
      username: this.model.rawAttributes[this.fieldMapping.username].field,
      password: this.model.rawAttributes[this.fieldMapping.password].field,
      email: this.model.rawAttributes[this.fieldMapping.email].field,
      dateOfBirth:
        this.model.rawAttributes[this.fieldMapping.dateOfBirth].field,

      createdAt: this.model.rawAttributes[this.fieldMapping.createdAt].field,
      updatedAt: this.model.rawAttributes[this.fieldMapping.updatedAt].field,
      deletedAt: this.model.rawAttributes[this.fieldMapping.deletedAt].field,
    };

    this.association = {
      account: "account",
      document: "document",
    };

    this.filters = {
      id: (val) => {
        validateUUID(val);
        return {
          [`${this.columnMapping.id}`]: {
            [Op.eq]: val,
          },
        };
      },

      firstName: (val) => {
        return {
          [`${this.columnMapping.firstName}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },
      fullName: (val) => {
        return {
          [`${this.columnMapping.fullName}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },

      lastName: (val) => {
        return {
          [`${this.columnMapping.lastName}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },

      fullName: (val) => {
        return {
          [`${this.columnMapping.fullName}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },
      username: (val) => {
        return {
          [`${this.columnMapping.username}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },
      email: (val) => {
        return {
          [`${this.columnMapping.email}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },

      isAdmin: (val) => {
        return {
          [`${this.columnMapping.isAdmin}`]: {
            [Op.eq]: val === "true",
          },
        };
      },

      dateOfBirthGreaterThan: (val) => {
        return {
          [`${this.columnMapping.dateOfBirth}`]: {
            [Op.gt]: val,
          },
        };
      },
      dateOfBirthLessThan: (val) => {
        return {
          [`${this.columnMapping.dateOfBirth}`]: {
            [Op.lt]: val,
          },
        };
      },
    };
  }
}

const userConfig = new UserConfig();

module.exports = userConfig;
