var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10; //used to resist rainbow tables and brute force

// declare schema
var userSchema = new mongoose.Schema({
    name: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    created_on: {type: Date, default: Date.now}
});

userSchema.pre('save', function(next) {
    var user = this;

    // only hash password if it has been modified (or if it is new)
    if (!user.isModified('password')) return next();

    //generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        //hash the password using the new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, next) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        next(null, isMatch);
    });
}

// export schema
mongoose.model('User', userSchema);
