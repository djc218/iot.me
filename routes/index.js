var express = require('express'),
    router = express.Router(),
    helper = require('../utils'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Dataset = mongoose.model('Dataset');

// POST setup request
router.post('/setup', function(req, res) {
    // Get values from POST request
    var username = req.body.username;
    var password = req.body.password;

    // Create new user document
    User.create({
        name: username,
        password: password
    }, function(req, res) {
        if (err) {
            console.log("Error creating the user: " + err);
            req.session.error = "An error occured creating the user.";
            req.location('setup');
            req.redirect('/setup');
        } else {
            console.log("POST creating new user: " + user);
            // Generate new session holding the newly created user's info
            req.session.regenerate(function() {
                req.session.user = user;
                res.redirect('/index');
            });
        }
    });
});

// POST login request
router.post('/login', function(req, res) {
    // Get values from the POST request
    var username = req.body.username;
    var password = req.body.password;

    // Find a user document by username
    // If a user is returned but the passwords don't match, send error message
    // indicating wrong password
    // If no user is returned, send an error message indicating wrong username
    User.findOne({name:username}, function(err, user) {
        if (err) {
            console.log("Error retrieving user: " + err);
            req.session.error = "A problem occured while retrieving the user";
        } else if (user) {
            // Use the method registered on the User model to compare entered
            // password with user password
            user.comparePassword(password, function(err, isMatch) {
                if (err) throw err;

                if (isMatch) {
                    req.session.generate(function() {
                        req.session.user = user;
                        req.session.success = "Authenticated as " + user.name;
                        res.redirect('/index');
                    });
                } else {
                    req.session.error = "Authentication failed, please check your password.";
                    res.redirect('/');
                }
            });
        } else {
            req.session.error = "Authentication failed, please check your username.";
            res.redirect('/');
        };
    });
});

// GET logout request
router.get('/logout', helper.authenticate, function(req, res) {
    var errorMessage = req.session.error;
    var successMessage = req.session.success;

    // Regenerate the new session: session.destroy() is not used as we still
    // want the error/success message to be served to the endpoint
    req.session.regenerate(function() {
        req.session.error = errorMessage;
        req.session.success = successMessage;
        res.redirect('/');
    });
});


