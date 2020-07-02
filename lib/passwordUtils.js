const crypto = require('crypto');



// Encript Password when saving database.
function encritPassword(password) {
    var salt = crypto.randomBytes(256).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}

// validate password when use is logs in. 
function validatePassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

module.exports.validatePassword = validatePassword;
module.exports.encritPassword =  encritPassword;