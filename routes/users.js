const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authModel = require('../models/index.model');
const userModel = require('../models/user-model');
/* GET users listing. */
router.post('/', function(req, res, next) {
	authModel.findById(req.body.user.id, (err, user) => {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		} else if (user) {
			console.log(user)
			let User = {
				id: user[0].id,
				username: user[0].username,
				email: user[0].email,
				level: user[0].level,
				is_active: user[0].is_active,
				read: user[0].read,
				update: user[0].update,
				delete: user[0].delete
			}
			res.status(200).send(User);
		}console.log(user)
	})
});

router.get('/admins', (req, res) => {
	console.log('admins',req.body)
	authModel.findByLevel('admin', (err, data) => {
		if (err) {
			console.log(err.sqlMessage);
			res.status(500).send(err);
		} else if (data) {
			res.status(200).send(data);
		}
	})
})

//get user by id
router.post('/getuserbyid', async (req, res) => {
	let payload = {
		id: req.body.id
	}
	const user = await authModel.findById(payload.id)
	if (!user.length) {
		const isadmin = await authModel.findAdminById(payload.id);
		if (isadmin.length) {
			res.status(200).json({
				code: 200,
				message: 'Success',
				data: isadmin[0]
			})
		} else {
			return res.status(500).json({
				code: 500,
				message: 'User with id not found!',
				data: {}
			})
		}
	} else {
		return res.status(200).json({
			code: 200,
			message: 'Success',
			data: user[0]
		})
	}
});


module.exports = router;
