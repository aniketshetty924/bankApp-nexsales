const { Op } = require("sequelize");
const db = require("../../models");

class DocumentConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      fileLinks: "fileLinks",
      userId: "userId",
      status: "status",
      adminNote: "adminNote",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt",
    };
    this.model = db.document;
    this.modelName = db.document.name;
    this.tableName = db.document.options.tableName;
    this.columnMapping = {
      id: this.model.rawAttributes[this.fieldMapping.id].field,
      fileLinks: this.model.rawAttributes[this.fieldMapping.fileLinks].field,
      userId: this.model.rawAttributes[this.fieldMapping.userId].field,
      status: this.model.rawAttributes[this.fieldMapping.status].field,
      adminNote: this.model.rawAttributes[this.fieldMapping.adminNote].field,
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

      fileLinks: (val) => {
        return {
          [`${this.columnMapping.fileLinks}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },
      status: (val) => {
        return {
          [`${this.columnMapping.status}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },
      adminNote: (val) => {
        return {
          [`${this.columnMapping.adminNote}`]: {
            [Op.like]: `%${val}%`,
          },
        };
      },
    };
  }
}

const documentConfig = new DocumentConfig();

module.exports = documentConfig;
