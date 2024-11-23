const NotFoundError = require("../../../errors/notFoundError");
const sendEmail = require("../../../utils/email");
const documentConfig = require("../../../model-config/document-config");
const userConfig = require("../../../model-config/user-config");
const Logger = require("../../../utils/logger");
const { transaction, commit, rollBack } = require("../../../utils/transaction");
const { Op } = require("sequelize");

class KycService {
  async getUserKyc(userId, t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("Get user kyc service started...");
      const response = await documentConfig.model.findOne({
        where: {
          userId: userId,
        },
        transaction: t,
      });

      if (!response) throw new NotFoundError("KYC data not found!");
      await commit(t);
      Logger.info("Get user kyc service ended...");
      return response;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
      throw error;
    }
  }

  async submitKyc(userId, file, t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("Submit kyc service started...");
      const document = await documentConfig.model.findOne({
        where: {
          userId: userId,
        },
        transaction: t,
      });
      if (!document) throw new NotFoundError("KYC record not found");
      document.fileLinks = file;
      document.status = "submitted";
      document.adminNote = "";
      await document.save({ transaction: t });
      const user = await userConfig.model.findByPk(userId, { transaction: t });
      await commit(t);

      Logger.info("kyc submitted successfully");
      await sendEmail(
        user.email,
        "KYC Submitted Successfully",
        `Hi ${user.fullName}! Your KYC has been successfully submitted.`
      );
      Logger.info("Submit kyc service ended...");
      return document;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
      throw error;
    }
  }

  async getSubmittedKycs(t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info(
        "Get all submitted and pending kycs for admin service started..."
      );

      const { count, rows: kycs } = await documentConfig.model.findAndCountAll({
        where: {
          status: {
            [Op.or]: ["submitted", "pending"],
          },
        },
        transaction: t,
      });

      for (const kyc of kycs) {
        if (kyc.status != "pending") {
          kyc.status = "pending";
          await kyc.save({ transaction: t });
        }
      }
      await commit(t);
      Logger.info("Fetched and updated submitted Kycs to pending");
      Logger.info("get all submitted kycs service ended");
      return { count, kycs };
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
      throw error;
    }
  }

  async updateKycStatus(userId, status, adminNote, t) {
    if (!t) t = await transaction();

    try {
      Logger.info("update kyc status service started...");
      const kyc = await documentConfig.model.findOne({
        where: { userId: userId },
        transaction: t,
      });
      if (!kyc) throw new NotFoundError("KYC record not found");
      console.log("rejected admin ", adminNote);
      if (status === "rejected" && !adminNote) {
        throw new InvalidError("Rejection requires an admin note");
      }

      kyc.status = status;
      if (status === "approved") {
        kyc.adminNote = "";
      } else if (adminNote) kyc.adminNote = adminNote;

      await kyc.save({ transaction: t });
      const user = await userConfig.model.findByPk(userId, { transaction: t });
      await commit(t);
      if (status === "approved") {
        await sendEmail(
          user.email,
          "KYC Approved",
          `Hi ${user.fullName}! Your KYC has been Approved.`
        );
      }
      if (status === "rejected") {
        await sendEmail(
          user.email,
          "KYC Rejected",
          `Hi ${user.fullName}! Your KYC request has been rejected. Reason for rejection is - ${adminNote}. fix the issue and submit your KYC again.`
        );
      }
      Logger.info("KYC status updated successfully");
      Logger.info("update kyc status service ended...");
      return kyc;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
      throw error;
    }
  }
}

module.exports = KycService;
