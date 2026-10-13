import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        // await User.findByIdAndUpdate(userId,{refreshToken})
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend/req.body
    // validation(all possible)(not empty)
    // check if user already exist(email,username)
    // check for images
    // check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    //  check for user creation
    // return response/ error

    // ---------------------------------------------
    // step 1 :get user details from frontend/req.body
    // console.log(req.body);

    const { username, email, fullName, password } = req.body
    // console.log('email : ', email);
    // res.json({
    //     message:"ok done"
    // })
    //---------------------------------------------
    // if(fullName===""){
    //     throw new ApiError(400,"Fullname is required")
    // } // similarly for all

    // step 2-validation(all possible)(not empty)
    if ([username, email, fullName, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }
    // -----------------------------------------------

    //step 3- check if user already exist(email,username)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }
    // --------------------------------------------------
    // step 4 -check for images, avatar
    // console.log(req.files);

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    } else {
        throw new ApiError(400, "Avatar file is required-localpath check")
    }
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required-localpath check")
    // }
    // --------------------------------------------
    // step 5- upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required-cloudinary check")
    }

    // ---------------------------------------------
    // step 6 - create user object and create entry into database

    const user = await User.create({
        username,
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })
    // -------------------------------------------------------
    // step 7- remove password and refreshToken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // -----------------------------------------------
    // step 8 -check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // ----------------------------------------------------
    // step 9 - return response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
    // console.log('User created');

})

const loginUser = asyncHandler(async (req, res) => {
    // fetch all data from req.body
    // username or email present or not and validate
    // find the user
    // password check
    // access and refresh token create
    // send cookies(secure)

    // step1-fetch all data from req.body
    const { username, email, password } = req.body;

    // step 2- username or email present or not and validate
    // if(username.trim()==="" && email.trim()===""){}
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // step 3 - find the user
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!existedUser) {
        throw new ApiError(404, "User does not exist")
    }

    // step 4- password check
    const isPasswordValid = await existedUser.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User credentials")
    }

    // step-5 -access and refresh token  generate
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existedUser._id)

    // optional but good practice
    const loggedInUser = await User.findById(existedUser._id).select(
        "-password -refreshToken"
    )

    // step 6-send cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    // if user wants to store the cookies in localstorage
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
        {
            // modified user will be sent
            returnDocument: "after"
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out "))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user=await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken!=user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res
            .status(200)
            .cookie("accessToken",accessToken, options)
            .cookie("refreshToken",newRefreshToken, options)
            .json(new ApiResponse(
                200,
                {accessToken, refreshToken:newRefreshToken},
                "Access token refreshed successfully"
            ))
    } catch (error) {
        throw new ApiError(401,error?.message ||"Invalid Refresh Token")
    }

})

export { registerUser, loginUser, logoutUser, refreshAccessToken }