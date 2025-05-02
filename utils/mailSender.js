const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    let config = {
        service: 'gmail',
        auth: {
            user: `${process.env.EMAIL}`,
            pass: `${process.env.PASSWORD}`
        }
    };
    // Create a Transporter to send emails
    let transporter = nodemailer.createTransport(config);
    // Send emails to users

    const mailOptions = {
        from: `${process.env.EMAIL}`,
        to: `${email}`,
        subject: `${title}`, // subject
        html: body,
    };

    transporter.sendMail(mailOptions)
    .then(() => console.log('email sent'))
    .catch((err) => console.log(err));       

};

module.exports = mailSender;
