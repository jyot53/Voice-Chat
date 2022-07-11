const router = require('express').Router();
const authController = require('./controllers/auth-controller');
const activateController = require('./controllers/activate-controller');
const roomController = require('./controllers/room-controller');
const activateMiddleware = require('./middlewares/activate-middleware');

router.post('/api/send-otp',authController.sendOtp);
router.post('/api/verify-otp',authController.verifyOtp);
router.post('/api/activate-user',activateMiddleware,activateController.activateUser);
router.get('/api/refresh',authController.refreshUser);
router.post('/api/logout-user',activateMiddleware,authController.logout);
router.post('/api/create-room',activateMiddleware,roomController.createRoom);
router.get('/api/fetch-rooms',activateMiddleware,roomController.fetchRooms);
router.get('/api/rooms/:roomId', activateMiddleware, roomController.fetchRoom);


module.exports = router;