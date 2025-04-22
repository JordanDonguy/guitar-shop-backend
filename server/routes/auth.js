const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { registerUser, findUserByEmail } = require('../models/userModels');
const { checkAuthenticatd, checkNotAuthenticated} = require('../middlewares/checkAuth');
const { registerAddress } = require('../models/addressModels');
const { getAllCountries } = require('../models/countryModels');

// Register route

router.get('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const countries = await getAllCountries();
        res.render('register.ejs', { countries });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error loading registration form');
      }
});

router.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const existingUser = await findUserByEmail(req.body.email);
        if (existingUser) return res.status(400).render('register.ejs', { error: 'Email already registered' });

        const newUser = await registerUser(req.body);

        const addressData = {
            user_id: newUser.id,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            postal_code: req.body.postal_code,
            country: req.body.country
        }

        const newAddress = await registerAddress(addressData);

        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.status(500).render('register.ejs', { error: 'Internal server error' });
    }
});

// Login route

router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
});

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

// Logout route

router.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/auth/login');
    });
  });

module.exports = router;