const { Op } = require("sequelize");
const db = require("../../models");

class PassbookConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      entry: "entry",
      accountId: "accountId",

      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt",
    };
    this.model = db.passbook;
    this.modelName = db.passbook.name;
    this.tableName = db.passbook.options.tableName;
    this.columnMapping = {
      id: this.model.rawAttributes[this.fieldMapping.id].field,

      entry: this.model.rawAttributes[this.fieldMapping.entry].field,

      accountId: this.model.rawAttributes[this.fieldMapping.accountId].field,

      createdAt: this.model.rawAttributes[this.fieldMapping.createdAt].field,
      updatedAt: this.model.rawAttributes[this.fieldMapping.updatedAt].field,
      deletedAt: this.model.rawAttributes[this.fieldMapping.deletedAt].field,
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
      accountId: (val) => {
        validateUUID(val);
        return {
          [`${this.columnMapping.accountId}`]: {
            [Op.eq]: val,
          },
        };
      },
    };
  }
}
const passbookConfig = new PassbookConfig();

module.exports = passbookConfig;
