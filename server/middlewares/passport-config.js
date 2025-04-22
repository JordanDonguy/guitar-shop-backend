const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const { findUserByEmail, findUserById } = require('../models/userModels');

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        const user = await findUserByEmail(email);
        if (user == null) {
            return done(null, false, { message: 'No user found with that email' })
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'The password is incorrect' })
            }
        } catch(err) {
            return done(err)
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user, done) => {
        return done(null, user.id)
    });
    passport.deserializeUser(async (id, done) => {
        const user = await findUserById(id)
        return done(null, user)
    })
};

module.exports = initialize;