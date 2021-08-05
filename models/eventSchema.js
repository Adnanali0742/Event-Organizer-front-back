const { dangerouslyDisableDefaultSrc } = require('helmet/dist/middlewares/content-security-policy')
const mongoose = require('mongoose')

const eventModel = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    picture:{
        type: String,
        require: false
    },
    dateOfEvent:{
        type: Date,
        require: true
    },
    location:{
        type: String,
        require: true
    },
    hostId:{
        type: Object,
        require: true
    },
    guests:{
        type: [],
        require: false
    },
    completed:{
        type: Boolean,
        require: true,
    },
    category:{
        type: Object,
        require: true
    },
    inviteType:{
        type: String,
        requrie: true,
    },
    requirements:{
        type:[],
        require: false
    },
    materials:{
        type: [],
        require: false
    }
    
},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated-at'
    }
})

module.exports = mongoose.model('events',eventModel)