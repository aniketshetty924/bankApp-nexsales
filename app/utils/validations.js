const badRequest = require("../errors/badRequest.js");
const validateFirstName = (firstName) => {
  if (firstName == "" || !firstName)
    throw new badRequest("Invalid firstName...");
  if (typeof firstName != "string")
    throw new badRequest("Invalid firstName type...");
};
const validateLastName = (lastName) => {
  if (lastName == "" || !lastName) throw new badRequest("Invalid lastName...");
  if (typeof lastName != "string")
    throw new badRequest("Invalid lastName type...");
};

const validateAge = (age) => {
  if (typeof age != "number") throw new badRequest("Invalid age type...");
  if (!age) throw new badRequest("Invalid age...");

  if (age <= 18)
    throw new badRequest("Age cannot be less than 18... You are under age...");
};

const validateBankName = (bankName) => {
  if (typeof bankName != "string")
    throw new badRequest("invalid bank name type...");

  if (bankName == "" || !bankName) throw new badRequest("invalid bank name...");
};

const validateAbbreviation = (abbreviation) => {
  if (typeof abbreviation != "string")
    throw new badRequest("invalid bank name type...");

  if (abbreviation == "" || !abbreviation)
    throw new badRequest("invalid bank name...");
};

module.exports = {
  validateAge,
  validateFirstName,
  validateLastName,
  validateBankName,
  validateAbbreviation,
};
