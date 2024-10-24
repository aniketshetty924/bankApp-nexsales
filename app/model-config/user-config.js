const db = require("../../models");

class UserConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      firstName: "firstName",
      lastName: "lastName",
      fullName: "fullName",
      username: "username",
      password: "password",
      age: "age",
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
      age: this.model.rawAttributes[this.fieldMapping.age].field,
      isAdmin: this.model.rawAttributes[this.fieldMapping.isAdmin].field,
      username: this.model.rawAttributes[this.fieldMapping.username].field,
      password: this.model.rawAttributes[this.fieldMapping.password].field,

      createdAt: this.model.rawAttributes[this.fieldMapping.createdAt].field,
      updatedAt: this.model.rawAttributes[this.fieldMapping.updatedAt].field,
      deletedAt: this.model.rawAttributes[this.fieldMapping.deletedAt].field,
    };
  }
}

const userConfig = new UserConfig();

module.exports = userConfig;
