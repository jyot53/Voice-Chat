const crypto = require('crypto');
const hashService = require('./hash-service');
const twilio = require('twilio')(process.env.twilioSid,process.env.twilioAuth,{
    lazyLoading:true
});

class OtpService{
    async generateOtp(){
        const otp = crypto.randomInt(1000,9999);
        return otp;
    }

    async sendBySms(phone,otp){
        return await twilio.messages.create({
            to:phone,
            from:process.env.twilioPhone,
            body:`Your Jyot's house OTP is ${otp} and it is valid for 2mins only.`
        });
    }

    sendByMail(){

    }

    async verifyOtp(hashedOtp, data){

        let oldhash = await hashService.hashOtp(data);
        // console.log("oldhash " ,oldhash);
        // console.log("givenhash " ,hashedOtp);
        return oldhash === hashedOtp;

    }
}

module.exports = new OtpService()