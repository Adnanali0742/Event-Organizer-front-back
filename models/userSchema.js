const { dangerouslyDisableDefaultSrc } = require('helmet/dist/middlewares/content-security-policy')
const mongoose = require('mongoose')

const userModel = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    profilePicture:{
        type: String,
        require: false
    },
    fullName: {
        type: String,
        require: true
    },
    jobTitle:{
        type: String,
        require: false
    },
    totalRating: {
        type: Number,
        require: false
    },
    numberOfRatings:{
        type: Number,
        require: false
    },
    dateOfBirth:{
        type: Date,
        require: true
    },
    skills:{
        type: [],
        require: false
    },
    userEvents:{
        type:[],
        require: false
    }
    
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated-at'
    }
})

module.exports = mongoose.model('users',userModel)