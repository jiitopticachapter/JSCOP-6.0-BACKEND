const qrCode = require("../models/qrCodeModel");
const User = require("../models/adminModel");
const generalUsers = require("../models/userModel");
const sendMail = require("../utils/mailSender");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports.adminlogin = async (req, res) => {
    console.log("Admin Login");
    let { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) res.status(400).json("missing fields");
    else {
        email = email.toLowerCase();
        const user = await User.findOne({ email: email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user._id }, `${process.env.SECRET}`, {
                expiresIn: "5h",
            });
            res.cookie("jwt", token, { signed: true, maxAge: 1000 * 60 * 60 });
            res.status(200).json({ ...user.toObject(), jwt: token });
        } else {
            res.status(400).json("login failed");
        }
    }
};

module.exports.adminlogout = (req, res) => {
    res.clearCookie("jwt").json("logout");
};

module.exports.getAllUsers = async (req, res) => {
    console.log("hello world");
    const users = await generalUsers.find({});
    console.log(users);
    res.json(users);
};

module.exports.getUser = async (req, res) => {
    const { id } = req.params;
    const user = await generalUsers.findById(id);
    res.json(user);
};

module.exports.getQrCode = async (req, res) => {
    console.log("getQrCode called");
    const { id } = req.params;
    console.log("Received id:", id);

    try {
        const data = await qrCode.findOne({ qr_id: id });

        if (!data) {
            return res.status(404).json({ success: false, message: "QR code not found" });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching QR code:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


module.exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    await generalUsers.findByIdAndDelete(id);
    res.json("User Deleted");
};

module.exports.updateUser = async (req, res) => {
    res.json("user updated");
    const { id } = req.params;
    const { name, email, phone, batch, enrollment, branch, selectedDay  } = req.body;

    try {

        await generalUsers.findOneAndUpdate({
            _id : id,
        },{
            name: name,
            email: email,
            phoneNo: phone,
            batch: batch,
            enrollmentNo: enrollment,
            branch: branch,
            selectedDay: selectedDay
        },{
            new: false,
            upseert: true,
        }).then((data) => {
            res.status(200).json(data);
            console.log("User data updated in the database!!");
        })
    } 
    catch (error) {
        console.log(error);
        res.status(400).json("Error in updating the user data!!");
    }
};

module.exports.searchUser = async (req, res) => {
    const { name } = req.params;
    const user = await generalUsers.findOne({ name: name });
    res.json(user);
};

//This verifies the unverified user
module.exports.verifyUser = async (req, res) => {
    const { userid } = req.params;
    let user = await generalUsers.findById(userid);
    if (!user) {
        return res.status(400).json("user not found");
    } else {
        user = await generalUsers.findByIdAndUpdate(userid, {
            verified: true,
        });
        // console.log(user)
        console.log("after save")
        res.status(200).json("User Verified");
    }
};

// this returns all the unverfied users
module.exports.unverifiedUser = async (req, res) => {
    const unverifedUser = generalUsers.find({ verified: false });
    res.status(200).send(unverifedUser);
};

module.exports.verifiedUser = async (req, res) => {
    const verifedUser = generalUsers.find({ verified: true });
    res.status(200).send(verifedUser);
};

// Ticket Validation
module.exports.validateTicket = async (req, res) => {
    const { ticketid } = req.params;
    console.log("Ticket ID:", ticketid);

    const ticketFound = await qrCode.findOne({ qr_id: ticketid });
    const getUserDay = await generalUsers.findOne({ _id: ticketFound.user });

    if (!ticketFound) {
        return res.status(400).json({
            success: false,
            message: "Invalid Ticket ID",
        });
    }

    // 📅 Get today's date
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // May = 4
    const currentYear = today.getFullYear();

    // 🕒 Log date info
    console.log("Current Date:", `${currentDay}-${currentMonth + 1}-${currentYear}`);

    // 🎯 Check selected day and enforce allowed dates
    const selectedDay = getUserDay.selectedDay.toLowerCase(); // Normalize
    console.log("Selected Day:", selectedDay);

    const isMay3 = currentDay === 3 && currentMonth === 4 && currentYear === 2025;
    const isMay4 = currentDay === 4 && currentMonth === 4 && currentYear === 2025;

    if (
        (selectedDay === "day1" && !isMay3) ||
        (selectedDay === "day2" && !isMay4)
    ) {
        return res.status(400).json({
            success: false,
            message: `This ticket is only valid on ${
                selectedDay === "day1" ? "3 May 2025" : "4 May 2025"
            }`,
        });
    }

    // 🛑 Already redeemed
    if (ticketFound.redeemed_count >= 1) {
        return res.status(400).json({
            success: false,
            message: "Ticket already redeemed",
        });
    }

   // 🕒 18-hour cooldown check
    if (
        ticketFound.reedeemed_timestamp &&
        Date.now() - ticketFound.reedeemed_timestamp < 18 * 60 * 60 * 1000
    ) {
        return res.status(400).json({
            success: false,
            message: "Ticket cannot be redeemed before 18 hours",
        });
    }


    // 👤 Fetch and validate user
    const user = await ticketFound.populate("user");
    if (!user || !user.user) {
        return res.status(400).json({
            success: false,
            message: "User not found",
        });
    }

    const email = user.user.email;

    // 🔁 Re-check QR code for user
    const qrCodeUser = await qrCode.findOne({ user: user.user._id });
    if (!qrCodeUser) {
        return res.status(400).send("User does not have a QR Code");
    }

    if (qrCodeUser.redeemed_count >= 1) {
        return res.status(400).send("Ticket already redeemed");
    }

    // ✅ Redeem ticket
    qrCodeUser.redeemed_count += 1;
    qrCodeUser.reedeemed_timestamp = Date.now();
    console.log("Updated QR Data:", qrCodeUser);
    await qrCodeUser.save();

    // 📧 Send confirmation email
    sendMail(
        email,
        "Ticket Validated",
        `Your ticket has been validated successfully and redeemed ${qrCodeUser.redeemed_count} time(s).`
    );

    return res.json({
        success: true,
        message: "Ticket validated successfully",
    });
};





// module.exports.adminregister = async (req, res) => {
//     let { username, email, password } = req.body;
//     email = email.toLowerCase();
//     const registeredEmail = await User.findOne({email: email});

//     if(registeredEmail){
//         res.status(400).json('email already exists');
//     }

//     else{
//         const salt = bcrypt.genSaltSync(10);
//         const hash = bcrypt.hashSync(password, salt);
//         const user = await User.create({username, email, password: hash});
//         res.json('register');
//     }
// }
