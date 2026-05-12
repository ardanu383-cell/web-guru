const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.post('/verify-invite', authController.verifyInvite);
router.put('/change-password', auth, authController.changePassword);
router.get('/invite-code', auth, authController.getInviteCode);
router.put('/invite-code', auth, authController.updateInviteCode);

module.exports = router;