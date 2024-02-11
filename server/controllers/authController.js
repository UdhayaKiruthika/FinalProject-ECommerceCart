const catchAsyncError = require('../middlewares/catchAsyncError')
//const catchAsyncError=require('../middlewares/catchAsyncError')
const User = require('../models/userModel')
const sendEmail = require('../utils/email')
const ErrorHandler=require('../utils/errorHandler')
const crypto = require('crypto')
const sendToken = require('../utils/jwt')

//Register User - /api/v1/register
exports.registerUser=catchAsyncError(async(req,res,next)=>{
    const {name,email,password}=req.body
    let avatar;
    let BASE_URL= process.env.SERVER_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    if(req.file){
        avatar=`${BASE_URL}/uploads/user/${req.file.originalname}`
    // if(req.file){
    //     avatar=`${process.env.SERVER_URL}/uploads/user/${req.file.originalname}`
    }
    const user = await User.create({
        name,
        email,
        password,
        avatar
    });
    //setting cookies
const options={
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME *24 *60 *60 *1000),
    httpOnly : true,
}

    //creating JWT Token
    const token = user.getJwtToken()
    res.status(201).cookie('token',token,options).json({
        success:true,
        user,
        token
    })
})
//Login User - /api/v1/login
exports.loginUser = catchAsyncError(async(req,res,next)=>{
    const {email,password}=req.body
    if(!email || !password){
        return next(new ErrorHandler('Please enter email and password',400))
    }
    //find user from user database
    const user=await User.findOne({email}).select('+password')
    if(!user){
        return next(new ErrorHandler('Invalid email or password',401))
    }
     if(!await user.isValidPassword(password)){
        return next(new ErrorHandler('Invalid email or password',401))
    }
    //setting cookies
const options={
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME *24 *60 *60 *1000),
    httpOnly : true,
}
    const token = user.getJwtToken()
    res.status(201).cookie('token',token,options).json({
        success:true,
        user,
        token
    })
     
})
//logout user =/api/v1/logout
exports.logoutUser=(req,res,next)=>{
    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    }).status(200).json({
        success:true,
        message:'LoGOUT'
    })
}

// //forgot password-/api/v1/password/forgot
// exports.forgotPassword = catchAsyncError(async(req,res,next)=>{
//     const user=await User.findOne({email: req.body.email});
//     if(!user){
//         return next(new ErrorHandler('User not found with this email',404))
//     }
//     const resetToken = user.getResetToken();
//     //console.log(resetPasswordToken)
//     await user.save({validateBeforeSave : false})
    
//     //Create reset url
//    const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`
//    //const resetUrl = `${process.env.APP_URL}/password/reset/${resetToken}`
//     const message = `Your password reset url is as follows \n\n
//      ${resetUrl} \n\n if you have not request this email,then ignore it.`
//     try{
//         sendEmail({
//             email: user.email,
//             subject: "ECommerce Cart Password Recovery",
//             messages
//         })
//         res.status(200).json({
//             success:true,
//             message:`Email sent to  ${user.email}`
//         })
//     }catch(error){
//         user.resetPasswordToken= undefined;
//         user.resetPasswordTokenExpire=undefined;
//         await user.save({validateBeforeSave:false});
//         return next(new ErrorHandler(error.message),500)
//     }
// })
//Forgot Password - /api/v1/password/forgot
exports.forgotPassword = catchAsyncError( async (req, res, next)=>{
    const user =  await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ErrorHandler('User not found with this email', 404))
    }

    const resetToken = user.getResetToken();
    await user.save({validateBeforeSave: false})
    
    let BASE_URL = process.env.FRONTEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }


    //Create reset url
    const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;

    const message = `Your password reset url is as follows \n\n 
    ${resetUrl} \n\n If you have not requested this email, then ignore it.`;

    try{
        sendEmail({
            email: user.email,
            subject: "ECommerce-Cart Password Recovery",
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`
        })

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next(new ErrorHandler(error.message), 500)
    }

}) 
//Reset Password - /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError (async(req,res,next)=>{
       const resetPasswordToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
       const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire:{
            $gt : Date.now()
        }
       })
       
      if(!user){
        return next(new ErrorHandler('Passowrd reset token is invalid or expired'))
      }
      if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match'))
      }
      user.password = req.body.password;
      user.resetPasswordTokenExpire = undefined;
      await user.save({validateBeforeSave : false})
      sendToken(user,201,res)
    })






//Get User Profile - /api/v1/myprofile
exports.getUserProfile = catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user.id)
    res.status(200).json({
        sucess: true,
        user
    })
})

//Change Password -/api/v1/myprofile

exports.changePassword = catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user.id).select('+password')
    
    //check old password
    if(!await user.isValidPassword(req.body.oldPassword)){
           return next(new ErrorHandler('Old Password is incorrect',401))
    }
    //assigning new password
    user.password = req.body.password;
    await user.save();
    res.status(200).json({
        success:true,
        
    })
})

//Update Profile - /api/v1/update
exports.updateProfile = catchAsyncError(async (req,res,next)=>{
   let newUserData={
        name:req.body.name,
        email:req.body.email
    }
    let avatar;
    let BASE_URL= process.env.SERVER_URL;
    if(process.env.NODE_ENV ==="production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    if(req.file){
        avatar=`${BASE_URL}/uploads/user/${req.file.originalname}`
       // avatar=`${process.env.SERVER_URL}/uploads/user/${req.file.originalname}`
        newUserData={...newUserData,avatar}
    
    }
    const user=await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators:true,
    })
    res.status(200).json({
        success:true,
        user
    })
})
//Admin : Get All Users - /api/v1/admin/users
exports.getAllUsers = catchAsyncError(async(req,res,next)=>{
    const users=await User.find();
    res.status(200).json({
        success:true,
        users
    })
})

//Admin : Get Specific user-/api/v1/admin/user/:id
exports.getUser=catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User not found with this id : ${req.params.id}`))
    }
    res.status(200).json({
        success:true,
        user
    })
})
//Admin:Update User - /api/v1/admin/user/:id
exports.updateUser=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
    const user=await User.findByIdAndUpdate(req.params.id, newUserData,{
        new:true,
        runValidators:true,
    })
    res.status(200).json({
        success:true,
        user
    })
})

//Admin : Delete User -/api/v1/admin/user/:id
exports.deleteUser = catchAsyncError(async(req,res,next)=>{
    const user=await User.findByIdAndDelete(req.params.id)
    if(!user){
        return next(new ErrorHandler(`User not found with this id : ${req.params.id}`))
    }
    
    res.status(200).json({
        success:true,
        
        user
    })
})  