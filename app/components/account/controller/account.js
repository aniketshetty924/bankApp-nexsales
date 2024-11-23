const AccountService = require("../service/account");
const { createUUID, validateUUID } = require("../../../utils/uuid");
const Logger = require("../../../utils/logger");
const { HttpStatusCode } = require("axios");
const { setXTotalCountHeader } = require("../../../utils/response");
const badRequest = require("../../../errors/badRequest");
const NotFoundError = require("../../../errors/notFoundError");
const accountConfig = require("../../../model-config/account-config");
class AccountController {
  constructor() {
    this.accountService = new AccountService();
  }

  async createAccount(req, res, next) {
    try {
      Logger.info("create account controller started...");

      const { userId, bankId } = req.params;
      console.log(`userId : ${userId}`);
      if (!validateUUID(userId)) throw new Error("invalid userId...");
      if (!validateUUID(bankId)) throw new Error("invalid bankId...");

      const response = await this.accountService.createAccount(
        createUUID(),
        userId,
        bankId
      );

      Logger.info("create account controller ended...");
      res.status(HttpStatusCode.Created).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllAccounts(req, res, next) {
    try {
      Logger.info("get all accounts controller called...");
      const { userId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      const { count, rows } = await this.accountService.getAllAccounts(
        userId,
        req.query
      );
      setXTotalCountHeader(res, count);
      res.status(HttpStatusCode.Ok).json(rows);
    } catch (error) {
      next(error);
    }
  }

  async getAccountById(req, res, next) {
    try {
      Logger.info("get account by id controller called...");
      const { userId, accountId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      const response = await this.accountService.getAccountById(
        userId,
        accountId,
        req.query
      );
      Logger.info("get account by id controller ended..");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccountById(req, res, next) {
    try {
      Logger.info("delete account by id controller started...");
      const { userId, accountId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      const response = await this.accountService.deleteAccountById(
        userId,
        accountId
      );
      if (!response)
        throw new NotFoundError("account not found or deletion failed...");

      Logger.info("delete account by id controller started...");
      res.status(HttpStatusCode.Ok).json({
        message: `Account with id ${accountId} is deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async depositUserAccount(req, res, next) {
    try {
      Logger.info("Deposit user account controller called...");
      const { amount } = req.body;
      const { userId, accountId } = req.params;

      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }

      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      if (amount <= 0)
        throw new badRequest(
          "invalid amount... amount cannot be less than or equal to zero"
        );

      const response = await this.accountService.depositUserAccount(
        userId,

        accountId,
        amount
      );

      if (!response)
        throw new NotFoundError("account not found or deposit failed...");
      Logger.info("deposit user account controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async withdrawUserAccount(req, res, next) {
    try {
      Logger.info("withdraw user account controller started...");
      const { amount } = req.body;
      const { userId, accountId } = req.params;

      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      if (amount <= 0)
        throw new badRequest(
          "invalid amount... amount cannot be less than or equal to zero"
        );

      const response = await this.accountService.withDrawUserAccount(
        userId,

        accountId,
        amount
      );
      if (!response)
        throw new NotFoundError("account not found or deposit failed...");

      Logger.info("withdraw user controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getBalanceUserAccount(req, res, next) {
    try {
      Logger.info("get balance user account controller started...");

      const { userId, accountId } = req.params;

      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(accountId)) {
        throw new Error("invalid account id...");
      }

      const response = await this.accountService.getBalanceUserAccount(
        userId,
        accountId
      );
      Logger.info("get balance user account controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }
  async getTotalBalance(req, res, next) {
    try {
      Logger.info("get total balance controller started...");
      const { userId, bankId } = req.params;
      if (!validateUUID(userId)) {
        throw new Error("invalid user id...");
      }
      if (!validateUUID(bankId)) {
        throw new Error("invalid bank id...");
      }
      const response = await this.accountService.getTotalBalance(
        userId,
        bankId
      );
      res.status(HttpStatusCode.Ok).json(response);
      Logger.info("get total balance controller ended...");
    } catch (error) {
      next(error);
    }
  }

  async transferWithinDiffBankId(req, res, next) {
    try {
      Logger.info("transfer within diff bank id controller started...");
      const { userId, accountId } = req.params;
      const { receiverAccountId, amount } = req.body;

      const response = await this.accountService.transferWithinDifferentBankId(
        userId,
        accountId,
        receiverAccountId,
        amount
      );
      if (!response) throw new badRequest("transfer failed...");
      Logger.info("transfer within diff bank id controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async transferWithinSameBankId(req, res, next) {
    try {
      Logger.info("transfer within same bank id controller started...");
      const { userId, accountId } = req.params;
      const { receiverAccountId, amount } = req.body;

      const response = await this.accountService.transferWithinSameBankId(
        userId,
        accountId,
        receiverAccountId,
        amount
      );
      if (!response) throw new badRequest("transfer failed...");
      Logger.info("transfer within  same bank id controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const accountController = new AccountController();

module.exports = accountController;
