require('dotenv').config();
const express = require('express');
const app = express();

const router = require('./routes.js');
const dbConnect = require('./database/database.js');


const port = process.env.PORT || 5000;
dbConnect();

app.use(express.json());
app.use(router);


app.listen(port,(req, res) => {
    console.log(`Listening to port ${port}`);
})