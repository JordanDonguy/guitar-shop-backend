const express = require('express');
const router = express.Router();
const { checkAuthenticated, checkNotAuthenticated } = require('../middlewares/checkAuth');
const { findUserById, getUserInfosById, updateUserAndAddress } = require('../models/userModels');
const { getAllCountries } = require('../models/countryModels');

// Get user informations

router.get('/', checkAuthenticated, (req, res) => {
    res.redirect(`/user/${req.user.id}`)
});

router.get('/:id', checkAuthenticated, async (req, res) => {
    try {
        const requestedId = String(req.params.id);
        const loggedInUserId = String(req.user.id);
        console.log('Session:', req.session);
        console.log('User:', req.user);

        // Deny access if the user is trying to access someone else's data
        if (requestedId !== String(loggedInUserId)) {
            return res.status(403).json({ error: 'Unauthorized access' });
        };

        const userInfos = await getUserInfosById(req.params.id);

        if (!userInfos) return res.status(404).send({ error: 'User informations not found' });
        const countries = await getAllCountries();
        res.render('user-profile.ejs', { user: userInfos, error: null, countries })

    } catch (error) {
        res.status(500).send(error)
    }
});

router.post('/:id/update', checkAuthenticated, async (req, res) => {
    try {
        const requestedId = String(req.params.id);
        const loggedInUserId = String(req.user.id);

        if (requestedId !== loggedInUserId) {
            return res.status(403).send('Unauthorized access');
        };

        await updateUserAndAddress(requestedId, req.body);
        res.redirect(`/user/${requestedId}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('user-profile.ejs', {
            user: req.body, // reuse input if there's an error
            error: 'Something went wrong while updating your profile.'
        });
    }
});

module.exports = router;