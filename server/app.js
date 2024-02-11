const express = require('express');
const app = express();
const errorMiddleware = require('./middlewares/error')
const path = require('path')
const dotenv = require('dotenv')
const cookieParser= require('cookie-parser')
dotenv.config({path: path.join(__dirname,"config/config.env")});


app.use(express.json())
app.use(cookieParser());
app.use('/uploads',express.static(path.join(__dirname,'uploads')))

const products= require('./routes/product')
const order=require('./routes/order')
const auth=require('./routes/auth')
const payment = require('./routes/payments')

app.use('/api/v1/',products);
app.use('/api/v1/',auth)
app.use('/api/v1/',order)
app.use('/api/v1',payment)



if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '../app/build')));
    app.get('*', (req, res) =>{
        res.sendFile(path.resolve(__dirname, '../app/build/index.html'))
    })
}



app.use(errorMiddleware)
module.exports = app;