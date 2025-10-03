class Address {
  constructor({ id, user_id, street, city, state, postal_code, country }) {
    this.id = id;
    this.userId = user_id;
    this.street = street;
    this.city = city;
    this.state = state;
    this.postalCode = postal_code;
    this.country = country;
  }
}

module.exports = Address;
