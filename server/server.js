require('dotenv').config();
const express = require('express');
const cors = require('cors');
const router = require('./routes.js');
const app = express();
const port = process.env.PORT || 5000;
const dbConnect = require('./database/database.js');
const cookieParser = require('cookie-parser');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors:{
        origin: 'https://localhost:3000',
        methods: ['GET', 'POST']
    }
} );
const ACTIONS = require('./actions');

const corsOptions = {
    credentials:true,
    origin:['http://localhost:3000'],
}

dbConnect();

app.use(cookieParser());
app.use(cors(corsOptions));
app.use('/storage',express.static('storage'));
app.use(express.json({limit:'8mb'}));
app.use(router);

//Socket logic
const socketUserMapping = {};
io.on('connection' ,(socket) =>{
    // console.log("new connection");
    // console.log(socket.id);
    socket.on(ACTIONS.JOIN, ({roomId,user})=>{
        socketUserMapping[socket.id] = user;
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        // console.log(clients);
        clients.forEach(clientId => { //clientId or socketId
            io.to(clientId).emit(ACTIONS.ADD_PEER,{
                peerId: socket.id,
                createOffer: false,
                user,
            });
            socket.emit(ACTIONS.ADD_PEER,{
                peerId:clientId,
                createOffer: true,
                user : socketUserMapping[clientId],
            });
        });

        socket.join(roomId);

    } );

    //handle relay ice
    socket.on(ACTIONS.RELAY_ICE,({peerId,icecandidate}) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE,{
            peerId:socket.id,
            icecandidate,
        })
    });
    //handle relay sdp
    socket.on(ACTIONS.RELAY_SDP,({peerId,sessionDescription}) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION,{
            peerId:socket.id,
            sessionDescription,
        })
    });

    //handle mute 
    socket.on(ACTIONS.MUTE,({userId,roomId}) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    //handle unmute 
    socket.on(ACTIONS.UNMUTE,({userId,roomId}) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    //handle leave room
    const leaveRoom = ({roomId}) => {
        const {rooms} = socket;
        Array.from(rooms).forEach(roomId => {
            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [] );
            clients.forEach(clientId => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER,{
                    peerId : socket.id,
                    userId : socketUserMapping[socket.id]?.id,
                });

                socket.emit(ACTIONS.REMOVE_PEER,{
                    peerId:clientId,
                    userId : socketUserMapping[clientId]?.id,
                })
            });
            socket.leave(roomId);
        });
        delete socketUserMapping[socket.id];
    }
    socket.on(ACTIONS.LEAVE , leaveRoom);
    socket.on('disconnecting', leaveRoom);
    
} )

server.listen(port,(req, res) => {
    console.log(`Listening to port ${port}`);
})