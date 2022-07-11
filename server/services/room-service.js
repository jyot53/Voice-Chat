const RoomModel = require("../database/Models/room-model");
class RoomService {
  async create(data) {
    const { topic, roomType, ownerId } = data;
    const room = await RoomModel.create({
      topic,
      roomType,
      ownerId,
      speakers: [ownerId],
    });

    return room;
  }

  async fetchRooms(roomTypes){
    const rooms = await RoomModel.find({roomType : {$in: roomTypes}}).populate('speakers').populate('ownerId').exec();
    return rooms;
  }

  async fetchRoom(roomId) {
    const room = await RoomModel.findOne({ _id: roomId });
    return room;
}
}

module.exports = new RoomService();
