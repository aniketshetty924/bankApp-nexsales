const db = require("../../models");

class AccountConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      userId: "userId",
      bankId: "bankId",
      bankName: "bankName",
      balance: "balance",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt",
    };
    this.model = db.account;
    this.modelName = db.account.name;
    this.tableName = db.account.options.tableName;
    this.columnMapping = {
      id: this.model.rawAttributes[this.fieldMapping.id].field,

      userId: this.model.rawAttributes[this.fieldMapping.userId].field,

      bankId: this.model.rawAttributes[this.fieldMapping.bankId].field,

      bankName: this.model.rawAttributes[this.fieldMapping.bankName].field,

      balance: this.model.rawAttributes[this.fieldMapping.balance].field,

      createdAt: this.model.rawAttributes[this.fieldMapping.createdAt].field,
      updatedAt: this.model.rawAttributes[this.fieldMapping.updatedAt].field,
      deletedAt: this.model.rawAttributes[this.fieldMapping.deletedAt].field,
    };

    this.association = {
      passbook: "passbook",
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

      userId: (val) => {
        validateUUID(val);
        return {
          [`${this.columnMapping.userId}`]: {
            [Op.eq]: val,
          },
        };
      },
      bankId: (val) => {
        validateUUID(val);
        return {
          [`${this.columnMapping.bankId}`]: {
            [Op.eq]: val,
          },
        };
      },

      bankName: (val) => {
        validateUUID(val);
        return {
          [`${this.columnMapping.bankName}`]: {
            [Op.eq]: val,
          },
        };
      },
    };
  }
}
const accountConfig = new AccountConfig();

module.exports = accountConfig;
