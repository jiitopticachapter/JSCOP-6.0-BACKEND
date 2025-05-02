const router = require('express').Router();
const catchAsync = require('../utils/CatchAsync');
const admin = require('../controllers/adminController.js');
const volunteer = require('../controllers/volunteerController.js');
const {isVolunteer} = require('../middleware.js');
const ticket = require('../controllers/qrController.js')


router.route('/login')
    .post(catchAsync(volunteer.volunteerLogin));

router.route('/logout')
    .get(catchAsync(volunteer.volunteerLogout));

router.route('/verifyTicket/:ticketid')
    .post(catchAsync(admin.validateTicket));


module.exports = router;