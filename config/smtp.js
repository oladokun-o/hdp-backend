const nodemailer = require('nodemailer');

// Create the transporter
const EmailTransporter = nodemailer.createTransport({
    host: "mail.heavydutypub.com",
    port: 465,
    secure: true,
    auth: {
        user: "billing@heavydutypub.com",
        pass: "billing@HDP24",
    },
});

// Export the transporter
module.exports = EmailTransporter;