const db = require("../../models");

class LedgerConfig {
  constructor() {
    this.fieldMapping = {
      id: "id",
      senderBankId: "senderBankId",
      receiverBankId: "receiverBankId",
      senderBankName: "senderBankName",
      receiverBankName: "receiverBankName",
      totalAmount: "totalAmount",
      lastUpdated: "lastUpdated",

      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt",
    };
    this.model = db.ledger;
    this.modelName = db.ledger.name;
    this.tableName = db.ledger.options.tableName;
    this.columnMapping = {
      id: this.model.rawAttributes[this.fieldMapping.id].field,
      senderBankId:
        this.model.rawAttributes[this.fieldMapping.senderBankId].field,
      receiverBankId:
        this.model.rawAttributes[this.fieldMapping.receiverBankId].field,
      senderBankName:
        this.model.rawAttributes[this.fieldMapping.senderBankName].field,
      receiverBankName:
        this.model.rawAttributes[this.fieldMapping.receiverBankName].field,
      totalAmount:
        this.model.rawAttributes[this.fieldMapping.totalAmount].field,
      lastUpdated:
        this.model.rawAttributes[this.fieldMapping.lastUpdated].field,

      createdAt: this.model.rawAttributes[this.fieldMapping.createdAt].field,
      updatedAt: this.model.rawAttributes[this.fieldMapping.updatedAt].field,
      deletedAt: this.model.rawAttributes[this.fieldMapping.deletedAt].field,
    };
  }
}

const ledgerConfig = new LedgerConfig();

module.exports = ledgerConfig;
