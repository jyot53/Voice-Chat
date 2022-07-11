const jimp = require('jimp'); 
const path = require('path');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');
class ActivateController{

    async activateUser(req, res) {

        const {name,avatar} = req.body;
        if(!name || !avatar){
            res.status(400).json({error:'All fields are required'});
        }

        //activate not tested after writing middleware

        const buffer = Buffer.from(
            avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
            'base64'
        );
        const imagepath = `${Date.now()}-${Math.round(Math.random() *1e9)}.png`;

        try {
            const jimpres = await jimp.read(buffer);
            jimpres.resize(150,jimp.AUTO).write(path.resolve(__dirname,`../storage/${imagepath}`));
        } catch (error) {
            res.status(500).json({error:'Could not process the image'});
        }

        
        try {
            
            const user = await userService.findUser({_id:req.user._id});
            if(!user){
                res.status(404).json({ error: "User not found"});
            }
     
            user.activated = true;
            user.name = name;
            user.avatar = `/storage/${imagepath}`;
            user.save();
            res.json({ message: "User Activated" , user : new UserDto(user) , auth:true });

        } catch (error) {
            console.log(error);
            res.status(500).json({error:'Database error activate controller'});
        }

    }

}

module.exports = new ActivateController();