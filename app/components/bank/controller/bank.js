const { HttpStatusCode } = require("axios");
const Logger = require("../../../utils/logger");
const { createUUID, validateUUID } = require("../../../utils/uuid");
const {
  validateAbbreviation,
  validateBankName,
} = require("../../../utils/validations");
const BankService = require("../service/bank");
const { setXTotalCountHeader } = require("../../../utils/response");
const { rollBack } = require("../../../utils/transaction");
const NotFoundError = require("../../../errors/notFoundError");

class BankController {
  constructor() {
    this.bankService = new BankService();
  }

  async createBank(req, res, next) {
    try {
      Logger.info("create bank controller started...");
      const { bankName, abbreviation } = req.body;
      validateAbbreviation(abbreviation);
      validateBankName(bankName);

      const response = await this.bankService.createBank(
        createUUID(),
        bankName,
        abbreviation
      );
      Logger.info("create bank controller ended...");
      res.status(HttpStatusCode.Created).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllBanks(req, res, next) {
    try {
      Logger.info("get all banks controller started...");
      const { count, rows } = await this.bankService.getAllBanks(req.query);
      setXTotalCountHeader(res, count);
      Logger.info("get all banks controller ended...");
      res.status(HttpStatusCode.Ok).json(rows);
    } catch (error) {
      next(error);
    }
  }

  async getBankById(req, res, next) {
    try {
      Logger.info("get bank by id controller called...");
      const { bankId } = req.params;
      if (!validateUUID(bankId)) {
        throw new Error("invalid bank id...");
      }

      const response = await this.bankService.getBankById(bankId, req.query);
      Logger.info("get bank by id controller ended...");
      res.status(HttpStatusCode.Ok).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateBankById(req, res, next) {
    try {
      Logger.info("update bank by id controller called...");
      const { bankId } = req.params;
      const { parameter, value } = req.body;

      if (typeof parameter != "string")
        throw new badRequest("invalid parameter type....");
      if (!validateUUID(bankId)) {
        throw new Error("invalid user id...");
      }

      const response = await this.bankService.updateBankById(
        bankId,
        parameter,
        value
      );
      if (!response)
        throw new NotFoundError("bank not found or bank updation failed...");
      res
        .status(HttpStatusCode.Ok)
        .json({ message: `Bank with id ${bankId} is updated successfully` });
    } catch (error) {
      next(error);
    }
  }

  async deleteBankById(req, res, next) {
    try {
      Logger.info("delete bank by id controller started...");
      const { bankId } = req.params;
      if (!validateUUID(bankId)) {
        throw new Error("invalid bank id...");
      }
      const response = await this.bankService.deleteBankById(bankId);
      if (!response)
        throw new NotFoundError("bank not found or deletion failed...");

      res.status(HttpStatusCode.Ok).json({
        message: `bank with id ${bankId} is deleted successfully`,
      });
      Logger.info("delete bank by id controller started...");
    } catch (error) {
      next(error);
    }
  }
}

const bankController = new BankController();
module.exports = bankController;
