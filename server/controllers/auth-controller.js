const otpService = require("../services/otp-service");
const hashService = require("../services/hash-service");
const userService = require("../services/user-service");
const tokenService = require("../services/token-service");
const UserDto = require('../dtos/user-dto');

class AuthController {
  async sendOtp(req, res) {
    const { phone } = req.body;
    if (!phone) {
      res.status(404).json({ error: "phone field is required" });
    }

    const otp = await otpService.generateOtp();
    const ttl = 1000 * 60 * 2; //2min
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;

    const hash = await hashService.hashOtp(data);

    try {
      // await otpService.sendBySms(phone, otp);
      return res.json({
        hash: `${hash}.${expires}`,
        phone,
        otp,
      });
    } catch (error) {
      console.log("Error in sending msg " + error);
      res.status(500).json({ error: "Error in sending msg" });
    }

    // res.status(200).json({ otp: otp, hash: hash });
  }

  async verifyOtp(req, res) {
    const { phone, hash, otp } = req.body;
    if (!phone || !hash || !otp) {
      res.status(404).json({ error: "All fields are required" });
    }

    const [hashedOtp, expires] = hash.split(".");
    if (Date.now() > +expires) {
      res.status(404).json({ error: "OTP Expired" });
    }

    const data = `${phone}.${otp}.${expires}`;
    // const oldhash = await hashService.hashOtp(data);

    // if(oldhash != hashedOtp){
    //     res.status(404).json({ error:"Wrong OTP"});
    // }

    const isValid = await otpService.verifyOtp(hashedOtp, data);
    if (!isValid) {
      res.status(404).json({ error: "Wrong OTP" }); 
    }

    let user;
    try {
      user = await userService.findUser({ phone });

      if (!user) {
        user = await userService.createUser({ phone });
      }
    } catch (err) {
      console.log("Error in findUser Auth Controller ", err);
      res.status(500).json({ error: "database error :- " + err });
    }


    const {accessToken, refreshToken} = tokenService.generateTokens({'_id':user._id,'activated':false});

    await tokenService.storeRefreshToken(refreshToken,user._id);

    res.cookie('refreshToken',refreshToken,{
      maxAge: 1000*60*60*24*30, // 30 days
      httpOnly: true,
    });
    res.cookie('accessToken',accessToken,{
      maxAge: 1000*60*60*24*30, // 30 days 
      httpOnly: true,
    });

    const userDto = new UserDto(user);

    res.json({auth:true,user:userDto});

  }

  async refreshUser(req, res) {
    const {refreshToken:refreshTokenCookie} = req.cookies;
    let userData;
    try {
      userData = await tokenService.verifyRefreshToken(refreshTokenCookie);
      if(!userData) return res.status(401).json({error: 'Invalid userdata'});
    }catch (error) {
      return res.status(401).json({error: 'Invalid Token userdata'});
    }

    try {
      const tokenData = await tokenService.findRefreshToken(refreshTokenCookie, userData._id);
      if(!tokenData) return res.status(401).json({error: 'Invalid Token tokendata'});

    } catch (error) {
      return res.status(501).json({error: 'Internal Error'});
    }

    const user = await userService.findUser({_id: userData._id});
    if(!user) return res.status(401).json({error: 'No User'});

    const {accessToken, refreshToken} = tokenService.generateTokens({_id:userData._id});
    
    try {
      await tokenService.updateRefreshToken(refreshToken, userData._id);
    } catch (error) {
      return res.status(501).json({error: 'Internal Error'});
    }

    res.cookie('refreshToken',refreshToken,{
      maxAge: 1000*60*60*24*30, // 30 days
      httpOnly: true,
    });
    res.cookie('accessToken',accessToken,{
      maxAge: 1000*60*60*24*30, // 30 days 
      httpOnly: true,
    });

    const userDto = new UserDto(user);

    res.json({auth:true,user:userDto});

  }

  async logout(req, res){

    const {refreshToken} = req.cookies;
    await tokenService.removeToken(refreshToken);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({user:null,auth:false});

  }

}

module.exports = new AuthController();
