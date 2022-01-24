const otpService = require("../services/otp-service");
const hashService = require("../services/hash-service");

class AuthController {
  async sendOtp(req, res) {
    const { phone } = req.body;
    if (!phone) {
      res.status(404).json({error:"phone field is required"});
    }

    const otp = await otpService.generateOtp();
    const ttl = 1000 * 60 * 2; //2min
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;

    const hash = await hashService.hashOtp(data);

    try {
      await otpService.sendBySms(phone, otp);
      return res.status(200).json({ 
          hash: `${hash}.${expires}`,
          phone
        });
    } catch (error) {
      console.log("Error in sending msg " + error);
      res.status(404).json({ error: "Error in sending msg" });
    }

    res.status(200).json({ otp: otp, hash: hash });
  }

  async verifyOtp(req, res) {
    const {phone,hash,otp} = req.body;
    if(!phone || !hash || !otp){
        res.status(404).json({ error:"All fields are required"});
    }

    const [hashedOtp,expires] = hash.split('.');
    if(Date.now() > +expires){
        res.status(404).json({ error:"OTP Expired"});
    } 

    const data = `${phone}.${otp}.${expires}`;
    // const oldhash = await hashService.hashOtp(data);

    // if(oldhash != hashedOtp){
    //     res.status(404).json({ error:"Wrong OTP"});
    // }

    const isvalid = otpService.verifyOtp(data,hashedOtp);
    if(!isvalid){
        res.status(404).json({ error:"Wrong OTP"});
    }
    // res.status(200).json({message:"OTP Verified"});

    let user;
    let accessToken;
    let refreshToken;
    

  }


}

module.exports = new AuthController();
