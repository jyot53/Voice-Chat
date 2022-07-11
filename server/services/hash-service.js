const crypto = require('crypto');

class hashService{
    async hashOtp(data){
        return crypto.createHmac('sha256',process.env.secretHash).update(data).digest('hex');
    }
}

module.exports = new hashService();