const fs = require("fs");
const defaultEmail = "billing@heavydutypub.com";
const EmailTransporter = require("../config/smtp");
const handlebars = require("handlebars");

// Function to send email with HTML content
const sendEmail = async (to, from, subject, html) => {
    try {
        await EmailTransporter.sendMail({
            from: from ? from : defaultEmail,
            to: to,
            subject: subject,
            html: html,
        });
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return { error: error };
    }
};

// Read email HTML template from file
const readEmailTemplate = (fileName, replacements) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`./templates/${fileName}`, { encoding: "utf-8" }, function (err, htmlFile) {
            if (err) {
                reject(err);
            } else {
                let template = handlebars.compile(htmlFile);

                const data = {
                    ...replacements,
                    html: template(replacements),
                };
                resolve(data);
            }
        });
    });
};

module.exports = { sendEmail, readEmailTemplate };
