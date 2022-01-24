const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone:{
        type: String,
        required: true,
    },
    activated:{
        type: Boolean,
        required: true,
        default: false
    }
},{
    timestamps: true,
});

module.exports = mongoose.model('User',userSchema);