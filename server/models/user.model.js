const Address = require("./address.model.js");

class User {
  constructor({ id, email, first_name, last_name, phone_number, password, created_at, address }) {
    this.id = id;
    this.email = email;
    this.firstName = first_name;
    this.lastName = last_name;
    this.phoneNumber = phone_number;
    this.hasPassword = !!password; // true if password exists, false otherwise
    this.createdAt = created_at;
    this.address = address ? new Address(address) : null;
  }
}

module.exports = User;