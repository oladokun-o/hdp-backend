// admin.controller.js

const UserModel = require('../models/admin.model');
// const bcrypt = require('bcrypt');
const { readEmailTemplate, sendEmail } = require('../templates/mailsender');

exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Validate input data
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }
        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);
        // Create the user with the hashed password
        const newUser = await UserModel.createUser({ username, email, password });
        res.status(201).json({ message: 'User created successfully', user: newUser });
        
        //send email to new user
        const filename = "newuser.template.html", replacements = {
            reply: "Your login details are below:",
            loginurl: "https://admin.heavydutypub.com/#/login",
            username: newUser.username,
            email:  newUser.email,
            password: newUser.password,
            from: `"CEO at Heavy Duty Pub" <ceo@heavydutypub.com>`,
            subject: 'Welcome to the team!'
        };
        readEmailTemplate(filename, replacements)
            .then(async data => {
                const mail = await sendEmail(newUser.email, data.from, data.subject, data.html);
                if (mail) console.log("Email sent successfully to " + newUser.email);
                else console.error("EmailTransporter failed to send email to " + newUser.email, mail.error);
            })
            .catch(error => {
                console.error('Error reading email template:', error);
            });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        // Check if user exists
        const user = await UserModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Delete the user
        await UserModel.deleteUser(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        // Check if user exists
        const user = await UserModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Delete the user
        await UserModel.updateUser(userId, req.body);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
