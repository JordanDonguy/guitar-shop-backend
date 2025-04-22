const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { registerUser, findUserByEmail } = require('../models/userModels');

// Register route

router.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
});

router.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const existingUser = await findUserByEmail(req.body.email);
        if (existingUser) return res.status(400).render('register.ejs', { error: 'Email already registered' });

        const newUser = await registerUser(req.body);
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.status(500).render('register.ejs', { error: 'Email already registered' });
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

// Already authenticated check functions

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
};

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

module.exports = router;
