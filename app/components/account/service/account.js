const { transaction, rollBack, commit } = require("../../../utils/transaction");
const userConfig = require("../../../model-config/user-config");
const accountConfig = require("../../../model-config/account-config");
const bankConfig = require("../../../model-config/bank-config");
const NotFoundError = require("../../../errors/notFoundError");
const Decimal = require("decimal.js");
const Logger = require("../../../utils/logger");
const {
  parseSelectFields,
  parseLimitAndOffset,
  parseFilterQueries,
} = require("../../../utils/request");
const passbookConfig = require("../../../model-config/passbook-config");
const ledgerConfig = require("../../../model-config/ledger-config");
const { createUUID } = require("../../../utils/uuid");
const badRequest = require("../../../errors/badRequest");

class AccountService {
  #associationMap = {
    passbook: {
      model: passbookConfig.model,
      required: true,
    },
  };

  #createAssociations(includeQuery) {
    const associations = [];

    if (!Array.isArray(includeQuery)) {
      includeQuery = [includeQuery];
    }
    if (includeQuery?.includes(accountConfig.association.passbook)) {
      associations.push(this.#associationMap.passbook);
    }
    return associations;
  }
  async createAccount(id, userId, bankId, t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("create account service started...");
      const user = await userConfig.model.findOne({
        where: { id: userId },
        transaction: t,
      });

      if (user.dataValues.id != userId)
        throw new NotFoundError(`User with id ${userId} does not exists...`);

      const bank = await bankConfig.model.findOne({
        where: { id: bankId },
        transaction: t,
      });

      if (bank.dataValues.id != bankId)
        throw new NotFoundError(`Bank with id ${bankId} does not exists...`);
      let bankName = bank.dataValues.bankName;
      console.log(`Bank Name : ${bankName}`);
      let balance = 1000;
      const newAccount = await accountConfig.model.create(
        {
          id,
          userId: user.dataValues.id,
          bankId: bank.dataValues.id,
          bankName,
          balance,
        },
        { t }
      );
      await commit(t);
      Logger.info("create account service ended...");
      return newAccount;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async getAllAccounts(userId, query, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get all accounts service started...");
      let selectArray = parseSelectFields(query, accountConfig.fieldMapping);
      if (!selectArray) {
        selectArray = Object.values(accountConfig.fieldMapping);
      }

      const includeQuery = query.include || [];
      let association = [];
      if (includeQuery) {
        association = this.#createAssociations(includeQuery);
      }

      const arg = {
        attributes: selectArray,
        ...parseLimitAndOffset(query),
        transaction: t,
        where: {
          userId: userId,
        },
        ...parseFilterQueries(query, accountConfig.filters),
        include: association,
      };

      const { count, rows } = await accountConfig.model.findAndCountAll(arg);
      commit(t);
      Logger.info("get all accounts service ended...");
      return { count, rows };
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async getAccountById(userId, accountId, query, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get account by id service called...");
      let selectArray = parseSelectFields(query, accountConfig.fieldMapping);
      if (!selectArray) {
        selectArray = Object.values(accountConfig.fieldMapping);
      }

      const includeQuery = query.include || [];
      let association = [];
      if (includeQuery) {
        association = this.#createAssociations(includeQuery);
      }

      const arg = {
        attributes: selectArray,
        where: {
          userId: userId,
          id: accountId,
        },
        transaction: t,
        include: association,
      };

      const response = await accountConfig.model.findOne(arg);
      await commit(t);
      Logger.info("get account by id service ended...");
      return response;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async deleteAccountById(userId, accountId, t) {
    if (!t) {
      t = await transaction(t);
    }

    try {
      Logger.info("delete account by id service started...");
      const user = await userConfig.model.findByPk(userId, { transaction: t });

      if (!user) {
        throw new NotFoundError(
          `User with id ${userId} has already been deleted or  does not exist.`
        );
      }

      const rowsDeleted = await accountConfig.model.destroy(
        {
          where: { id: accountId },
        },
        { transaction: t }
      );
      console.log("dfdfadf", rowsDeleted);

      if (rowsDeleted === 0)
        throw new NotFoundError(`Account with id ${accountId} does not exists`);

      await commit(t);
      Logger.info("delete account by id service ended...");
      return rowsDeleted;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async depositUserAccount(userId, bankId, accountId, amount, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("deposit user account service started...");
      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      const account = await accountConfig.model.findOne(
        {
          where: {
            id: accountId,
          },
        },
        { transaction: t }
      );
      if (!account) {
        throw new NotFoundError(`account with id ${accountId} does not exist.`);
      }
      // console.log("Before balance", account.balance);
      // console.log("amount", amount);
      account.balance += amount;

      //console.log("after", account.balance);
      await account.save({ transaction: t });

      Logger.info("create passbook entry started...");
      let currentDate = new Date();
      let entry = `Amount of ${amount} has been deposited in account id : ${accountId} with bankID : ${bankId} at ${currentDate}`;
      const id = createUUID();
      await passbookConfig.model.create(
        {
          id,
          entry: entry,
          accountId: accountId,
        },
        { t }
      );
      await commit(t);
      Logger.info("create passbook entry ended...");

      Logger.info("deposit user account service ended...");
      return account;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async withDrawUserAccount(userId, bankId, accountId, amount, t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("Withdraw user account service started...");
      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      const account = await accountConfig.model.findOne(
        {
          where: {
            id: accountId,
          },
        },
        { transaction: t }
      );
      if (!account) {
        throw new NotFoundError(`account with id ${accountId} does not exist.`);
      }
      if (account.balance <= 1000)
        throw new badRequest(
          "oops you cannot withdraw money since you have to maintain a minimum of Rs 1000 in account!"
        );
      account.balance -= amount;
      await account.save({ transaction: t });
      const balance = account.balance;

      Logger.info("create passbook entry started...");
      let currentDate = new Date();
      let entry = `Amount of ${amount} has been withdrawn  from  account id : ${accountId} with bankID : ${bankId} at ${currentDate} and the remaining balance is ${balance}`;
      const id = createUUID();
      await passbookConfig.model.create(
        {
          id,
          entry: entry,
          accountId: accountId,
        },
        { t }
      );
      await commit(t);
      Logger.info("create passbook entry ended...");

      Logger.info("withdraw  user account service ended...");
      return account;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async getBalanceUserAccount(userId, accountId, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get balance user account service called...");

      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      const account = await accountConfig.model.findOne(
        {
          where: {
            id: accountId,
          },
        },
        { transaction: t }
      );
      if (!account) {
        throw new NotFoundError(`account with id ${accountId} does not exist.`);
      }

      await commit(t);
      Logger.info("get balance user account service ended...");
      return account.balance;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async getTotalBalance(userId, bankId, t) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("get total balance of user service started...");
      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      const bank = await bankConfig.model.findOne(
        {
          where: {
            id: bankId,
          },
        },
        { t }
      );
      if (!bank)
        throw new NotFoundError(`Bank with id ${bankId} does not exists...`);

      const totalBalance = await accountConfig.model.sum("balance", {
        where: {
          userId: userId,
          bankId: bankId,
        },
      });

      await commit(t);
      Logger.info("get total balance of user service ended...");
      return totalBalance;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async transferWithinDifferentBankId(
    userId,
    senderAccountId,
    receiverAccountId,
    amount,
    t
  ) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("transfer within diff bank id service started...");
      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { transaction: t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      let senderBankAccount = await accountConfig.model.findOne(
        {
          where: {
            id: senderAccountId,
          },
        },
        { transaction: t }
      );
      if (!senderBankAccount)
        throw new badRequest(
          `Sender account with account id ${senderAccountId} does not exists...`
        );

      const senderBankId = senderBankAccount.bankId;
      const senderBankName = senderBankAccount.bankName;

      let receiverBankAccount = await accountConfig.model.findOne(
        {
          where: {
            id: receiverAccountId,
          },
        },
        { transaction: t }
      );
      if (!receiverBankAccount)
        throw new badRequest(
          `receiver account with account id ${receiverAccountId} does not exists...`
        );

      const receiverBankId = receiverBankAccount.bankId;
      const receiverBankName = receiverBankAccount.bankName;

      senderBankAccount.balance -= amount;
      try {
        receiverBankAccount.balance += amount;
      } catch (error) {
        senderBankAccount.balance += amount;
        Logger.error("Transaction failed...");
        throw error;
      }

      await senderBankAccount.save({ transaction: t });
      await receiverBankAccount.save({ transaction: t });

      const senderBalance = senderBankAccount.balance;
      const receiverBalance = receiverBankAccount.balance;

      Logger.info("sender passbook entry started...");
      let currentDate = new Date();
      let senderEntry = `Amount of ${amount} has been debited  from  account id : ${senderAccountId} with bank name : ${senderBankName}  credited to receiver ${receiverAccountId} with bank name : ${receiverBankName} at ${currentDate} and the remaining balance is ${senderBalance}`;
      const senderPassbookId = createUUID();
      await passbookConfig.model.create(
        {
          id: senderPassbookId,
          entry: senderEntry,
          accountId: senderAccountId,
        },
        { t }
      );

      Logger.info("sender passbook entry ended...");

      Logger.info("receiver passbook entry started...");
      let receiverEntry = `Amount of ${amount} has been debited  from  account id : ${senderAccountId} with bank name : ${senderBankName}  credited to receiver ${receiverAccountId} with bank name : ${receiverBankName} at ${currentDate} and the remaining balance is ${receiverBalance}`;
      const receiverPassbookId = createUUID();
      await passbookConfig.model.create(
        {
          id: receiverPassbookId,
          entry: receiverEntry,
          accountId: receiverAccountId,
        },
        { t }
      );

      Logger.info("receiver passbook entry ended...");

      await this.ledgerEntry(
        senderBankId,
        receiverBankId,
        senderBankName,
        receiverBankName,
        amount
      );

      await commit(t);
      Logger.info("transfer within diff bank id service started...");
      return senderBalance;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async transferWithinSameBankId(
    userId,
    senderAccountId,
    receiverAccountId,
    amount,
    t
  ) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("transfer within same bank id service started...");
      Logger.info("transfer within diff bank id service started...");
      const user = await userConfig.model.findOne(
        {
          where: {
            id: userId,
          },
        },
        { transaction: t }
      );

      if (!user) {
        throw new NotFoundError(`User with id ${userId} does not exist.`);
      }

      let senderBankAccount = await accountConfig.model.findOne(
        {
          where: {
            id: senderAccountId,
          },
        },
        { transaction: t }
      );
      if (!senderBankAccount)
        throw new badRequest(
          `Sender account with account id ${senderAccountId} does not exists...`
        );

      const senderBankId = senderBankAccount.bankId;
      const senderBankName = senderBankAccount.bankName;

      let receiverBankAccount = await accountConfig.model.findOne(
        {
          where: {
            id: receiverAccountId,
          },
        },
        { transaction: t }
      );
      if (!receiverBankAccount)
        throw new badRequest(
          `receiver account with account id ${receiverAccountId} does not exists...`
        );

      const receiverBankId = receiverBankAccount.bankId;
      const receiverBankName = receiverBankAccount.bankName;

      senderBankAccount.balance -= amount;
      try {
        receiverBankAccount.balance += amount;
      } catch (error) {
        senderBankAccount.balance += amount;
        Logger.error("Transaction failed...");
        throw error;
      }

      await senderBankAccount.save({ transaction: t });
      await receiverBankAccount.save({ transaction: t });

      const senderBalance = senderBankAccount.balance;
      const receiverBalance = receiverBankAccount.balance;

      Logger.info("sender passbook entry started...");
      let currentDate = new Date();
      let senderEntry = `Amount of ${amount} has been debited  from  account id : ${senderAccountId} with bank name : ${senderBankName}  credited to receiver ${receiverAccountId} with bank name : ${receiverBankName} at ${currentDate} and the remaining balance is ${senderBalance}`;
      const senderPassbookId = createUUID();
      await passbookConfig.model.create(
        {
          id: senderPassbookId,
          entry: senderEntry,
          accountId: senderAccountId,
        },
        { t }
      );

      Logger.info("sender passbook entry ended...");

      Logger.info("receiver passbook entry started...");
      let receiverEntry = `Amount of ${amount} has been debited  from  account id : ${senderAccountId} with bank name : ${senderBankName}  credited to receiver ${receiverAccountId} with bank name : ${receiverBankName} at ${currentDate} and the remaining balance is ${receiverBalance}`;
      const receiverPassbookId = createUUID();
      await passbookConfig.model.create(
        {
          id: receiverPassbookId,
          entry: receiverEntry,
          accountId: receiverAccountId,
        },
        { t }
      );

      await commit(t);
      Logger.info("receiver passbook entry ended...");
      return senderBalance;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async ledgerEntry(
    senderBankId,
    receiverBankId,
    senderBankName,
    receiverBankName,
    amount,
    t
  ) {
    if (!t) {
      t = await transaction();
    }

    try {
      Logger.info("ledger entry service started...");
      let senderToReceiver = await ledgerConfig.model.findOne(
        {
          where: {
            senderBankId: senderBankId,
            receiverBankId: receiverBankId,
          },
        },
        { transaction: t }
      );

      if (!senderToReceiver) {
        await ledgerConfig.model.create(
          {
            senderBankId: senderBankId,
            receiverBankId: receiverBankId,
            senderBankName: senderBankName,
            receiverBankName: receiverBankName,
            totalAmount: -amount,
          },
          { transaction: t }
        );

        await ledgerConfig.model.create(
          {
            senderBankId: receiverBankId,
            receiverBankId: senderBankId,
            senderBankName: receiverBankName,
            receiverBankName: senderBankName,
            totalAmount: amount,
          },
          { transaction: t }
        );
      } else {
        await senderToReceiver.reload({ transaction: t });
        senderToReceiver.totalAmount -= amount;
        senderToReceiver.lastUpdated = new Date();

        let receiverToSender = await ledgerConfig.model.findOne(
          {
            where: {
              senderBankId: receiverBankId,
              receiverBankId: senderBankId,
            },
          },
          {
            transaction: t,
          }
        );
        console.log("dfdfdfdf", receiverToSender.totalAmount);
        if (receiverToSender) {
          await receiverToSender.reload({ transaction: t });
          receiverToSender.totalAmount = new Decimal(
            receiverToSender.totalAmount
          )
            .plus(amount)
            .toFixed(2);
          console.log("hello", receiverToSender.totalAmount);
          receiverToSender.lastUpdated = new Date();
        } else {
          throw new Error("Receiver to sender entry not found..");
        }

        await senderToReceiver.save({ transaction: t });
        await receiverToSender.save({ transaction: t });
      }

      await commit(t);
      Logger.info("ledger entry service ended...");
    } catch (error) {
      await rollBack(t);
      throw error;
    }
  }
}

module.exports = AccountService;
