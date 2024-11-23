"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("accounts", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { key: "id", model: "users" },
        allowNull: false,
        onDelete: "CASCADE",
      },
      bank_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { key: "id", model: "banks" },
        onDelete: "CASCADE",
      },
      bank_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      balance: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("accounts");
  },
};
