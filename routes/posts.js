const express = require('express');
const router = express.Router();
const passport = require('passport');
const model = require('../models/post-model');

router.post('/new-post', function(req, res, next) {
    model.addPost(req.body, (err, post) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else if (post) {
            res.status(200).send(post);
        }
        console.log(err, post)
    })
});

router.get('/all-posts', function(req, res, next) {
    model.getPosts((err, post) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else if (post) {
            res.status(200).send(post);
        }
    })
});

router.post('/my-posts', function(req, res, next) {
    model.getUserPosts(req.body, (err, post) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else if (post) {
            res.status(200).send(post);
        }
    })
});

router.put('/update', function(req, res) {
    if (req.body.cover_image === '') {
        let update = {
            title: req.body.title,
            //cover_image: req.body.cover_image,
            article: req.body.article
        }
        model.updatePost(update, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else if (result) {
                res.status(200).send(result);
            } else if (!result) {
                res.status(500).send(result);
            }
        })
    } else if (req.body.cover_image !== '') {
        let update = {
            title: req.body.title,
            cover_image: req.body.cover_image,
            article: req.body.article
        }
        model.updatePost(req.body, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else if (result) {
                res.status(200).send(result);
            } else if (!result) {
                res.status(500).send(result);
            }
        })
    }
})

router.delete('/delete/:id', function(req, res) {
	let id = req.params.id;
	model.deletePost(id, function(err, result) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(result);
        }
	})
})

module.exports = router;
