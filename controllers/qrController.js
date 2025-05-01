const User = require("../models/userModel");
const qrCode = require("../models/qrCodeModel");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const tickettemPlate = require("../templates/tickettemplate");

//creating ticket and sending it to Email
module.exports.generateQRCode = async (req, res) => {
    const { userid } = req.params;
    const user = await User.findById(userid);
    const { name, email } = user;
    const qr_id = uuidv4();
    if (!name || !email) {
        return res.status(400).send("Please enter all fields");
    }

    const userfound = await User.findOne({ email });
    const exisitingUser = await qrCode.findOne({ user: userfound._id });
    if (exisitingUser) {
        console.log("User already has a QR Code");
        return res.status(400).send("User already has a QR Code");
    }

    if (userfound) {
        console.log("User found");
        owner = userfound._id;
        const newQrCode = new qrCode({ user: owner, qr_id });
        await newQrCode.save();
        await sendTicket(email, qr_id, name);
        res.status(201).json("QR Code generated successfully");
    } else {
        res.status(400).send("User does not exist");
    }
};

module.exports.sendQrCodeThroughEmail = async (req, res) => {
    const { userid } = req.params;
    const user = await User.findById(userid);
    const { email, name } = user;
    const qrCodeUser = await qrCode.findOne({ user: user._id });
    if (!qrCodeUser) {
        return res.status(400).send("User does not have a QR Code");
    }
    await sendTicket(email, qrCodeUser.qr_id, name);
    res.status(200).json("QR Code sent successfully");
};

const sendTicket = async (email, qr_id, name) => {
    let config = {
        host: 'mail.jiitopticachapter.com',
        port: 587,
        secure: false, // use TLS
        auth: {
            user: `${process.env.EMAIL}`,
            pass: `${process.env.PASSWORD}`
        },
        tls: {
            rejectUnauthorized: false // in case of any SSL certificate issues
        }
    };

   // const finalqrid = `${process.env.DOMAIN}/admin/sendOTP/${qr_id}`;

    const qrCodeimg = await QRCode.toDataURL(qr_id, {
        width: 400,
        margin: 2,
        color: {
            dark: "#335383FF",
            light: "#EEEEEEFF",
        },
    });

    const nodemailer = require("nodemailer");
    const hbs = require("nodemailer-express-handlebars");
    const path = require("path");
    // Create transporter
    let transporter = nodemailer.createTransport(config);
    
    // Configure handlebars
    transporter.use('compile', hbs({
        viewEngine: {
          extname: '.handlebars',
          layoutsDir: path.resolve('./templates'),
          defaultLayout: false,
          partialsDir: path.resolve('./templates'),
        },
        viewPath: path.resolve('./templates'),
        extName: '.handlebars',
      }));


    const mailOptions = {
        from: `${process.env.EMAIL}`,
        to:   `${email}`,
        subject: "Your Ticket For the Event is Here",
        template: "ticket", // Name of the .handlebars file (without extension)
        context: {
          // dynamic values used in the template
          username: name, // for example
          eventName: "My Cool Fest",
          cid: "unique@nodemailer.com", // referenced in the template
        },
        attachments: [
          {
            filename: "ticket.png",
            content: qrCodeimg.split("base64,")[1],
            encoding: "base64",
            cid: "unique@nodemailer.com", // 👈 used inside the template
          },
        ],
      };
      
    // let transporter = nodemailer.createTransport(config);
    // const mailOptions = {
    //     from: `${process.env.EMAIL}`,
    //     to: `${email}`,
    //     subject: "Your Ticket For the event is here", // subject
    //     html: tickettemPlate(),
    //     attachments: [
    //         {
    //             filename: "ticket.png",
    //             content: qrCodeimg.split("base64,")[1],
    //             encoding: "base64",
    //         },
    //     ],
    // };

    transporter
        .sendMail(mailOptions)
        .then(() => console.log("email sent"))
        .catch((err) => console.log(err));
};

// //frontend getting ticket
// module.exports.getQRCode = async (req, res) => {
//     const { email } = req.body;
//     if (!email) {
//         res.status(400).send('Please enter all fields');
//     }

//     const found = await user.findOne({ email });

//     if (!found) {
//         res.status(400).send('User does not exist');
//     }
//     else{
//         const qrCodeUser = await qrCode.findOne({ user: found._id });
//         if(qrCode){
//             const ticketurl = `${process.env.DOMAIN}/admin/sendOTP/${qrCodeUser.qr_id}`
//             res.status(200).json(ticketurl);
//         }
//         else{
//             res.status(400).send('User does not have a QR Code');
//         }

//     }
// }
