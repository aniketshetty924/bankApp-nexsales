const { Op } = require("sequelize");
const db = require("../../models");

class DocumentConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      fileLinks: "fileLinks",
      userId: "userId",

      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt",
    };
    this.model = db.ledger;
    this.modelName = db.ledger.name;
    this.tableName = db.ledger.options.tableName;
    this.columnMapping = {
      id: this.model.rawAttributes[this.fieldMapping.id].field,
      fileLinks: this.model.rawAttributes[this.fieldMapping.fileLinks].field,
      userId: this.model.rawAttributes[this.fieldMapping.userId].field,

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

      userId: (val) => {
        validateUUID(val);
        return {
          [`${this.columnMapping.userId}`]: {
            [Op.eq]: val,
          },
        };
      },
    };
  }
}

const documentConfig = new DocumentConfig();

module.exports = documentConfig;
