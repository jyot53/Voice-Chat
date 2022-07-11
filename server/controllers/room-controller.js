const roomService = require("../services/room-service");
const RoomDto = require("../dtos/room-dto");
class RoomController{

    async createRoom(req, res) {
        const {topic,roomType} = req.body;
        if(!roomType || !topic){
            res.status(400).json({error:'All fields are required'});
        }

        const room = await roomService.create({
            topic,
            roomType,
            ownerId : req.user._id,
        });

        const roomDto = new RoomDto(room);

        return res.status(200).json({room:roomDto})

    }

    async fetchRooms(req, res){
        console.log("fetchRooms");
        const rooms = await roomService.fetchRooms(['open']);
        const allRooms = rooms.map(room => new RoomDto(room));
        return res.status(200).json({allRooms});
    }

    async fetchRoom(req, res) {
        const room = await roomService.fetchRoom(req.params.roomId);

        return res.json(room);
    }

}

module.exports = new RoomController();
