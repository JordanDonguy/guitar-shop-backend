const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const parseFullName = require("../utils/parseFullName");
const userDatamapper = require("../datamappers/user.datamapper");
const cartDatamapper = require("../datamappers/cart.datamapper");
const mergeTemporaryCart = require("../utils/mergeTemporaryCart");

function initialize(passport) {
  // Local Strategy
  const authenticateUser = async (email, password, done) => {
    let user;
    try {
      user = await userDatamapper.findByEmail(email);
    } catch (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false, { message: "No user found with that email" });
    }

    if (!user.hasPassword) {
      return done(null, false, {
        message:
          "This account was created via Google. Please login with Google or create a password.",
      });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
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

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleId = profile.id;
          const temporaryCart = req.session.temporaryCart || [];

          let user = await userDatamapper.findByGoogleId(googleId);
          if (user) {
            await mergeTemporaryCart(user.id, temporaryCart);
            return done(null, user);
          }

          user = await userDatamapper.findByEmail(email);
          if (user) {
            await userDatamapper.linkGoogleIdToUser(user.id, googleId);
            await mergeTemporaryCart(user.id, temporaryCart);
            return done(null, { ...user, google_id: googleId });
          }

          if (!user) {
            const { first_name, last_name } = parseFullName(
              profile.displayName,
            );
            user = await userDatamapper.createGoogleUser({
              googleId: googleId,
              email: email,
              first_name,
              last_name,
            });
            await cartDatamapper.createCart(user.id);
            await mergeTemporaryCart(user.id, temporaryCart);
            return done(null, user, { isNewUser: true });
          }
        } catch (err) {
          console.error("Error in Google strategy:", err);
          return done(err);
        }
      },
    ),
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userDatamapper.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = initialize;
