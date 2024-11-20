const jwt = require("jsonwebtoken");
const Logger = require("../utils/logger");
const UnAuthorizedError = require("../errors/unauthorizedError");
const secreteKey = "bankApp@123";
const verifyAdmin = (req, res, next) => {
  try {
    Logger.info("verifying admin started...");
    console.log("cookies", req.cookies["auth"]);
    console.log("cookies", req.headers["auth"]);

    if (!req.cookies["auth"] && !req.headers["auth"]) {
      throw new UnAuthorizedError("Cookie Not Found...");
    }

    let token = req.cookies["auth"].split(" ")[2];
    let payload = Payload.verifyToken(token);
    if (!payload.isAdmin) throw new UnAuthorizedError("Unauthorized access...");

    Logger.info("Verifying admin ended...");
    Logger.info("next called...");
    next();
  } catch (error) {
    next(error);
  }
};

const verifyUser = (req, res, next) => {
  try {
    Logger.info("Verifying user started...");
    if (!req.cookies["auth"] && !req.headers["auth"]) {
      throw new UnAuthorizedError("Cookie not found...");
    }

    let token = req.cookies["auth"].split(" ")[2];
    let payload = Payload.verifyToken(token);
    console.log("Payload", payload);
    if (payload.isAdmin)
      throw new UnAuthorizedError(
        "Admin can't do this operations , only users can do..."
      );
    req.userId = payload.id;

    Logger.info("Verifying ended...");
    Logger.info("next called");
    next();
  } catch (error) {
    next(error);
  }
};

const verifyUserID = (req, res, next) => {
  try {
    const { userId } = req.params;
    const id = req.userId;
    console.log("here", id);
    if (userId != id)
      throw new UnAuthorizedError(
        "You are not authorized to access this account..."
      );
    next();
  } catch (error) {
    next(error);
  }
};

class Payload {
  constructor(id, isAdmin) {
    this.id = id;
    this.isAdmin = isAdmin;
  }

  static newPayload(id, isAdmin) {
    try {
      return new Payload(id, isAdmin);
    } catch (error) {
      throw error;
    }
  }

  static verifyToken(token) {
    let payload = jwt.verify(token, secreteKey);
    return payload;
  }

  signPayload() {
    try {
      return `Bearer ${jwt.sign(
        {
          id: this.id,
          isAdmin: this.isAdmin,
        },
        secreteKey,
        { expiresIn: "10hr" }
      )}`;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = { Payload, verifyAdmin, verifyUser, verifyUserID };
