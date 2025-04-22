const express = require('express');
const router = express.Router();
const { checkAuthenticated, checkNotAuthenticated } = require('../middlewares/checkAuth');
const { findUserById } = require('../models/userModels');

// Get user informations

router.get('/', checkAuthenticated, (req, res) => {
    res.redirect(`/user/${req.user.id}`)
});
  

router.get('/:id', checkAuthenticated, async (req, res) => {
    try {
        const requestedId = req.params.id;
        const loggedInUserId = req.user.id;
        console.log('Session:', req.session);
        console.log('User:', req.user);
        
        // Deny access if the user is trying to access someone else's data
        if (requestedId !== String(loggedInUserId)) {
          return res.status(403).json({ error: 'Unauthorized access' });
        };

        const userInfos = await findUserById(req.params.id);

        if (!userInfos) return res.status(404).send({ error: 'User informations not found' });
        res.status(200).json(userInfos)
        
    } catch (error) {
        res.status(500).send(error)
    }
});

module.exports = router;