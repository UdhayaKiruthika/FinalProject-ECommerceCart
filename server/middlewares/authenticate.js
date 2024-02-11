const ErrorHandler = require("../utils/errorHandler");
const jwt = require('jsonwebtoken')
const catchAsyncError = require("./catchAsyncError")
const user=require('../models/userModel')

exports.isAuthenticatedUser= catchAsyncError(async (req,res,next)=>{
   const {token}=req.cookies;
   if(!token){
       return next(new ErrorHandler('Login first to handle the resource',400))
   }

   const decoded = jwt.verify(token,process.env.JWT_SECRET)
   req.user = await user.findById(decoded.id)
   next();
})

exports.authorizedRoles = (...role) => {
    return (req,res,next) =>
    {
        if(!role.includes(req.user.role))
       { return next(new ErrorHandler(`Role ${req.user.role} is not allowed`,401))
       }
    next();
}
}

