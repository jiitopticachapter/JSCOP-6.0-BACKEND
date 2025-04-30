const User = require('../models/adminModel');
const generalUsers = require('../models/userModel');
const sendMail = require('../utils/mailSender');


module.exports.sendMail = async (req, res) => {
    const selectedEmails = req.body.selectedEmails;
    const customText = req.body.customText
    const subject = req.body.subject;
    console.log(selectedEmails);

    for (let i = 0; i < selectedEmails.length; i++) {
        try {
            const mail = await selectedEmails[i];
            console.log(mail);
            await sendMail(mail, subject,customText);
            console.log("mail sent!!");
            res.status(200).send("Mail sent successfully!!");
        }
        catch (error) {
            console.error('Error Sending Mail:', error);
            res.status(500).send('Error Sending Mail');
        }
    }

};

