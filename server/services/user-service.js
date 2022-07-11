const UserModel = require('../database/Models/user-model');

class userService{
    async findUser(filter){
        const user = await UserModel.findOne(filter);
        return user;
    }

    async createUser(data){
        const newuser = await UserModel.create(data);
        return newuser;
    } 

}



module.exports = new userService();