const { HttpStatusCode } = require("axios");
const UserService = require("../service/user");
const { createUUID, validateUUID } = require("../../../utils/uuid.js");
const { setXTotalCountHeader } = require("../../../utils/response.js");
const Logger = require("../../../utils/logger.js");
const badRequest = require("../../../errors/badRequest.js");
const bcrypt = require("bcrypt");

const {
  validateFirstName,
  validateLastName,
  validateAge,
} = require("../../../utils/validations.js");
const { Payload } = require("../../../middleware/authService.js");

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async login(req, res, next) {
    try {
      Logger.info("Login controller started");
      const { username, password, userId } = req.body;
      if (typeof username != "string")
        throw new badRequest("invalid username type");
      if (typeof password != "string")
        throw new badRequest("invalid password type");
      validateUUID(userId);

      const user = await this.userService.findUser(username);
      if (!user) throw new NotFoundError("user does not exists...");

      if (await bcrypt.compare(password, user.password)) {
        let payload = Payload.newPayload(userId, user.isAdmin);
        let token = payload.signPayload();
        res.cookie("auth", `Bearer ${token}`);

        res.set("auth", `Bearer ${token}`);
        res.status(200).send(token);
      } else {
        res.status(403).json({
          message: "password incorrect",
        });
      }
      Logger.info("Login controller ended...");
    } catch (error) {
      next(error);
    }
  }
  async createAdmin(req, res, next) {
    try {
      Logger.info("Create user controller started...");
      const { firstName, lastName, username, password, age } = req.body;
      validateFirstName(firstName);
      validateLastName(lastName);
      validateAge(age);
      if (firstName === lastName)
        throw new badRequest("first name and last name cannot be same...");
      if (typeof username != "string")
        throw new badRequest("invalid username type");
      if (typeof password != "string")
        throw new badRequest("invalid password type");

      let response = await this.userService.createUser(
        createUUID(),
        firstName,
        lastName,
        username,
        password,
        age,
        true
      );
      Logger.info("Create user controller ended...");
      res.status(HttpStatusCode.Created).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      Logger.info("Create user controller started...");

      const { firstName, lastName, age, username, password } = req.body;
      validateFirstName(firstName);
      validateLastName(lastName);
      validateAge(age);
      if (typeof username != "string")
        throw new badRequest("invalid username type");
      if (typeof password != "string")
        throw new badRequest("invalid password type");

      let response = await this.userService.createUser(
        createUUID(),
        firstName,
        lastName,
        username,
        password,
        age,
        false
      );
      Logger.info("Create user controller ended...");
      res.status(HttpStatusCode.Created).json(response);
    } catch (error) {
      next(error);
    }
  }
}

const userController = new UserController();
module.exports = userController;
