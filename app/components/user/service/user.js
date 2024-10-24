const userConfig = require("../../../model-config/user-config.js");
const Logger = require("../../../utils/logger.js");
const bcrypt = require("bcrypt");

const {
  transaction,
  rollBack,
  commit,
} = require("../../../utils/transaction.js");

class UserService {
  async findUser(username, t) {
    if (!t) {
      t = await transaction();
    }
    try {
      Logger.info("Find user by username service started...");
      const user = await userConfig.model.findOne(
        {
          where: { username },
        },
        { t }
      );
      commit(t);
      Logger.info("Find user by username service started...");
      return user;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }

  async createUser(
    id,
    firstName,
    lastName,
    username,
    password,
    age,
    isAdmin,
    t
  ) {
    Logger.info("create user service started...");
    if (!t) {
      t = await transaction();
    }

    try {
      let fullName = firstName + " " + lastName;

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(`password ${hashedPassword}`);
      let response = await userConfig.model.create(
        {
          id,
          firstName,
          lastName,
          fullName,
          username,
          password: hashedPassword,
          age,
          isAdmin,
        },
        { t }
      );
      commit(t);
      Logger.info("create user service ended...");
      return response;
    } catch (error) {
      await rollBack(t);
      Logger.error(error);
    }
  }
}

module.exports = UserService;
