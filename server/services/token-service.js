const jwt = require('jsonwebtoken');
const RefreshModel = require('../database/Models/refresh-model');
class TokenService{

    generateTokens(payload){ //data or payload

        const accessToken = jwt.sign(payload,process.env.jwtAccessSecret,{
            expiresIn:'1m'
        })

        const refreshToken = jwt.sign(payload,process.env.jwtRefreshSecret,{
            expiresIn:'1y'
        })

        return {accessToken, refreshToken};

    }

    async storeRefreshToken(token,userId){

        try {
           await RefreshModel.create({
                token,
                userId
            })
        } catch (error) {
            console.log(error.message);
        }

    }

    async verifyAccessToken(accessToken){
        return jwt.verify(accessToken,process.env.jwtAccessSecret);
    }
    async verifyRefreshToken(refreshToken){
        return jwt.verify(refreshToken,process.env.jwtRefreshSecret);
    }

    async findRefreshToken(refreshToken,userId){

        return await RefreshModel.findOne({userId : userId,token:refreshToken});

    }

    async updateRefreshToken(refreshToken,userId){
        return await RefreshModel.updateOne({userId,token:refreshToken});
    }
    async removeToken(refreshToken){
        return await RefreshModel.deleteOne({token:refreshToken});
    }
}

module.exports = new TokenService();