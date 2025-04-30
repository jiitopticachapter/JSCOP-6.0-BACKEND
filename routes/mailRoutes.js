const router = require('express').Router();
const mailSender = require('../controllers/mailController.js');
const catchAsync = require('../utils/CatchAsync.js');
const { isAdmin } = require('../middleware.js');
const { Router } = require('express');


router.route('/')
    .post(isAdmin, catchAsync(mailSender.sendMail));

router.route('/scheduleMail')
    .post(isAdmin, catchAsync(mailSender.scheduleMail));



module.exports = router;

