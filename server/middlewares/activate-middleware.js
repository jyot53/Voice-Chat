const tokenService = require('../services/token-service');
const activateMiddleware = async (req,res,next) => {
    try {
        
        const {accessToken} = req.cookies;
        if(!accessToken){
            console.log("not accesstoken");
            throw new Error()
        }
        /*eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWY1NmFkNmQzZmI4Y2E0OGVjMjU1OTMiLCJhY3RpdmF0ZWQiOmZhbHNlLCJpYXQiOjE2NDM2MzI4MjcsImV4cCI6MTY0MzYzNjQyN30.g-YPq5VUWffYvsZbN6pl_NLGcUle5Vkq51jYngYjdKQ*/

        const userData = await tokenService.verifyAccessToken(accessToken);
        if(!userData){
            console.log("not userdata");
            throw new Error();
        }
        // console.log(userData);

        req.user = userData;
        console.log("activate controller passed");
        next();

    } catch (error) {
        console.log("catch in middleware");
        console.log(error);
        res.status(401).json({message: 'Invalid Token'})
    }

}

module.exports = activateMiddleware;