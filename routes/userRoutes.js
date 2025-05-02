const router = require("express").Router();
const new_user_model = require("../models/userModel");
const cloudinary = require("../utils/cloudinary")

router.get("/try", (req, res) => {
    res.send("this is route");
});

router.post("/register-new", async (req, res) => {
    console.log(req.body);

   // res.json({ code: 200, status: "Message Sent"});
     const { name, email, phone, batch, enroll, enrollmentType, branch, college, image, selectedDay } = req.body;
     try {
        if (!name || !email || !phone || !college || !image || !selectedDay) {
            console.log("Please fill all the fields!!");
            return res.status(400).json({ msg: "Please fill all the fields!!" });
        }        
        const CheckEmail = await new_user_model.findOne({ email: email });
        if (CheckEmail) {
            console.log("Email already exists!!");
            return res.status(400).json({ msg: "Email already exists!!" });
        } else {
        const result = await cloudinary.uploader.upload(image, {
            folder: "jscop",
        });

        const User_details = {
            name,
            email,
            phoneNo: phone,
            batch,
            enrollmentNo: enroll,
            branch,
            enrollmentType,
            selectedDay,
            verified: false,
            college,
            payment: {
                public_id: result.public_id,
                url: result.secure_url
            }
         }
        console.log(User_details);
        const new_data = await new new_user_model(User_details).save();
        console.log("User data saved in the database!!");        

        res.status(201).json({
            success: true,
            message: "User data saved in the database!!",
            data: new_data,
        });
    }
     } catch (err) {
        console.log(err);
        res.status(404).json({msg: "Error in saving the data in the database!!"});
     }
     
});

router.get("/trying", async (req, res) => {
    await new_user_model.deleteMany({});
    res.send("this is route");

});

module.exports = router;