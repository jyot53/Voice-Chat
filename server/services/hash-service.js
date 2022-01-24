const crypto = require('crypto');

class hashService{
    async hashOtp(data){
        const hash = crypto.createHmac('sha256',process.env.secretHash).update(data).digest('hex');
        return hash;
    }
}

module.exports = new hashService();