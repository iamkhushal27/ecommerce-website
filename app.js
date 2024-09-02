const connection=require('./db/connection')
const userRouter=require('./routes/users')
const productRouter=require('./routes/product')
const categoryRouter=require('./routes/category')
const ownerRouter=require('./routes/owner')
const cartRouter=require('./routes/cart')
const orderRouter=require('./routes/order')
const paymentRouter=require('./routes/payment')

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')


const indexRouter = require('./routes/index');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

require('dotenv').config()
app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use("/api/users",userRouter)
app.use("/api/users/products",productRouter)
app.use("/api/users/category",categoryRouter)
app.use("/api/users/owner",ownerRouter)
app.use("/api/users/cart",cartRouter)
app.use("/api/users/order",orderRouter)
app.use("/api/users/payment",paymentRouter)



// catch 404 and forward to error handler



// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   // res.locals.message = err.message;
//   // res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });


// code is start from here
console.log('here')


connection().then(()=>{
  console.log("connection is made")
}).catch((error)=>{
console.log('error is',error)
})

module.exports = app;
