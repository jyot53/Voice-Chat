const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roomsSchema = new mongoose.Schema({
    topic:{
        type: String,
        required: true,
    },
    roomType:{
        type: String,
        required: true,
    },
    ownerId:{
        type: Schema.Types.ObjectId,
        ref:'User',
    },
    speakers:{
        type:[
            {
                type: Schema.Types.ObjectId,
                ref:'User',
            }
        ],
        required: false
    }
},{
    timestamps: true,
});

module.exports = mongoose.model('Room',roomsSchema,'rooms');