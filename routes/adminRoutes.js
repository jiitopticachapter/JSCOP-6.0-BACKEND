const router = require("express").Router();
const catchAsync = require("../utils/CatchAsync");
const admin = require("../controllers/adminController.js");
const { isAdmin } = require("../middleware.js");
const ticket = require("../controllers/qrController.js");

router.route("/login").post(catchAsync(admin.adminlogin));

router.route("/logout").get(catchAsync(admin.adminlogout));

router
    .route("/allUsers")
    .get(catchAsync(isAdmin), catchAsync(admin.getAllUsers));

router
    .route("/user/:id")
    .get(catchAsync(admin.getUser))
    .delete(isAdmin, catchAsync(admin.deleteUser))
    .put(isAdmin, catchAsync(admin.updateUser));

// (same delete as above)
// router.route('/delete/:id')
//     .delete(isAdmin, catchAsync(admin.deleteUser));

router.route("/search/:name").get(isAdmin, catchAsync(admin.searchUser));
//this is by name only further we can do by email or enrollment number

//to verify the users
router.route("/verify/:userid").get(isAdmin, catchAsync(admin.verifyUser));

router.route("/unverified").get(isAdmin, admin.unverifiedUser);

router.route("/verified").get(isAdmin, admin.verifiedUser);

router
    .route("/sendTicket/:userid")
    .post(isAdmin, catchAsync(ticket.generateQRCode));

router
    .route("/sendTicketafterVerification/:userid")
    .post(isAdmin, catchAsync(ticket.sendQrCodeThroughEmail));

router
    .route("/verifyTicket/:ticketid")
    .post(catchAsync(admin.validateTicket));


router
    .route("/getQrUser/:id")
    .get(catchAsync(admin.getQrCode));

module.exports = router;
