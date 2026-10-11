import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
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
    const { username, email, fullName, password } = req.body
    console.log('email : ', email);
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
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }
    // --------------------------------------------------
    // step 4 -check for images, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    // --------------------------------------------
    // step 5- upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // ---------------------------------------------
    // step 6 - create user object and create entry into database

    const user = await User.create({
        username: username.toLowerCase(),
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
    res.status(201).json(
        new ApiResponse(200, createdUser,"User registered successfullly")
    )
})

export { registerUser }