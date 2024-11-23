const { HttpStatusCode } = require("axios");
const Logger = require("../../../utils/logger");
const InvalidError = require("../../../errors/invalidError");
const KycService = require("../service/kyc");
const { validateUUID } = require("../../../utils/uuid");

class KycController {
  constructor() {
    this.kycService = new KycService();
  }

  async getUserKyc(req, res, next) {
    try {
      Logger.info("Get user kyc controller started...");
      const { userId } = req.params;
      const response = await this.kycService.getUserKyc(userId);
      res.status(HttpStatusCode.Ok).json(response);
      Logger.info("Get user kyc controller ended...");
    } catch (error) {
      next(error);
    }
  }

  async submitKyc(req, res, next) {
    try {
      Logger.info("Submit kyc controller started...");
      const { userId } = req.params;
      const { file } = req.body;

      validateUUID(userId);

      if (!file) throw new InvalidError("Document file is required");

      const kyc = await this.kycService.submitKyc(userId, file);
      res.status(HttpStatusCode.Created).json(kyc);
      Logger.info("Submit kyc controller ended...");
    } catch (error) {
      next(error);
    }
  }

  async getSubmittedKYCs(req, res, next) {
    try {
      Logger.info("get submitted kyc controller started...");

      const { count, kycs } = await this.kycService.getSubmittedKycs();
      setXTotalCountHeader(res, count);
      res.status(HttpStatusCode.Ok).json(kycs);
      Logger.info("get submitted kyc controller ended...");
    } catch (error) {
      next(error);
    }
  }

  async updateKYCStatus(req, res, next) {
    try {
      Logger.info("Updating KYC status controller started...");

      const { userId, status, adminNote } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        throw new InvalidError(
          "Invalid status. Only 'approved' or 'rejected' allowed"
        );
      }

      const kyc = await this.kycService.updateKycStatus(
        userId,
        status,
        adminNote
      );
      res.status(HttpStatusCode.Ok).json(kyc);
      Logger.info("Updating KYC status controller ended...");
    } catch (error) {
      next(error);
    }
  }
}

const kycController = new KycController();
module.exports = kycController;
