const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const { findUserByEmail, findUserById } = require("../models/userModels");

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    let user;
    try {
      user = await findUserByEmail(email);
    } catch (err) {
      return done(err);
    }

    if (user == null) {
      return done(null, false, { message: "No user found with that email" });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "The password is incorrect" });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser,
    ),
  );

  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await findUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = initialize;
