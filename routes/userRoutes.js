const userModel = require('../models/userSchema')

const express = require('express')
const router = express.Router()
const {v4: uuidv4} = require('uuid')

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/')

    },
    filename: function(req, file, cb){
         cb(null, file.originalname)       
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png')
        cb(null,true)
    else
        cb(new Error('File needs to be a jpeg or png'),false)
}
const upload = multer({storage: storage, limits:{
    fileSize: 1024 *1024 * 5
}, 
    fileFilter:fileFilter
})

const checkAuth = require('../middlewares/check-auth');

router.post('/',/*checkAuth,*/upload.single('profilePicture'), (req,res,next) => {
    let picturePath = undefined
    if(req.file != undefined)
        picturePath = req.file.path

    let user = new userModel({
        username: req.body.username,
        password: req.body.password,
        fullName: req.body.fullName,
        dateOfBirth: req.body.dateOfBirth,
        jobTitle: req.body.jobTitle,
        profilePicture: picturePath
    })

    user.save()
    .then(user => {res.status(200).send(user)})
    .catch(error => {next(error)})

    
})

router.get('/',/*checkAuth,*/ (req, res, next) =>{
    userModel.find()
    .select('username password fullName jobTitle dateOfBirth profilePicture totalRating numberOfRatings skills userEvents')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(doc => {
                return{
                    _id: doc._id,
                    username:doc.username,
                    fullName: doc.fullName,
                    dateOfBirth: doc.dateOfBirth,
                    profilePicture: doc.profilePicture,
                    jobTitle: doc.jobTitle,
                    rating: doc.totalRating / doc.numberOfRatings,
                    skills: doc.skills,
                    userEvents: doc.userEvents,
                    profilePicture: req.protocol + '://' + req.get('host') +'/' + doc.profilePicture,
                    request:{
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') +'/users/' + doc._id 
                    }
                }
            })
        }
        res.status(200).json(response);
       
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.get('/:userId',/*checkAuth,*/ (req, res, next) =>{
    const id = req.params.userId;
    userModel.findById(id)
    .select('username password fullName jobTitle dateOfBirth profilePicture totalRating numberOfRatings skills userEvents')
    .exec()
    .then(doc =>{
        const result = {
            _id: doc._id,
            username: doc.username,
            fullName: doc.fullName,
            dateOfBirth: doc.dateOfBirth,
            profilePicture: doc.profilePicture,
            rating: doc.totalRating / doc.numberOfRatings,
            skills: doc.skills,
            userEvents: doc.userEvents,
            jobTitle: doc.jobTitle,
            profilePicture: req.protocol + '://' + req.get('host') +'/' + doc.profilePicture,
            request:{
                type: 'GET',
                url: req.protocol + '://' + req.get('host') +'/users/' + doc._id 
            }
        }
        if(doc){
            res.status(200).json(result);
        } else{
            res.status(404).json({
                message: "No valid entry found for provided ID"
            });
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.delete('/:userId',/*checkAuth,*/ (req, res) => {
    const id = req.params.userId;
    userModel.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message:'User deleted'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
   })

router.patch('/:userId', /*checkAuth,*/upload.single('profilePicture'), (req, res, next) =>{
    let picturePath = undefined
    if(req.file != undefined)
        picturePath = req.file.path

    const id = req.params.userId;

    //This part gets the former rating in order to increment
    let newTotalRating = 0
    let newNumberOfRatings = 0

    let username = req.body.username
    let password = req.body.password
    let dateOfBirth = req.body.dateOfBirth
    let fullName = req.body.fullName
    let jobTitle = req.body.jobTitle
    let skills = req.body.skills
    let userEvents = req.body.userEvents

    console.log(username)

    userModel.findById(id)
    .select('totalRating numberOfRatings')
    .exec()
    .then(doc =>{
        if(doc.totalRating != undefined){
            newTotalRating = doc.totalRating 
            newNumberOfRatings = doc.numberOfRatings 
        }
        if (typeof username == 'undefined')
            username = doc.username
        if (typeof password == 'undefined')
            password = doc.password
        if (typeof fullName == 'undefined')
            fullName = doc.fullName
        if (typeof dateOfBirth == 'undefined')
            dateOfBirth = doc.dateOfBirth
        if (typeof jobTitle == 'undefined')
            jobTitle = doc.jobTitle
        if (typeof skills == 'undefined')
            skills = doc.skills
        if (typeof userEvents == 'undefined')
            userEvents = doc.userEvents
        
    })
    //It checks if the request contains a rating
    if(req.body.rating != undefined){
        newTotalRating += req.body.rating
        newNumberOfRatings += 1
    }

    const updateOps = {
        username: username,
        password: password,
        fullName: fullName,
        jobTitle: jobTitle,
        dateOfBirth: dateOfBirth,
        totalRating: newTotalRating,
        numberOfRatings: newNumberOfRatings,
        skills: skills,
        userEvents: userEvents,
        profilePicture: picturePath
    }
    userModel.updateOne({_id: id}, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            message:'User updated',
            request:{
                type:'GET',
                url: req.protocol + '://' + req.get('host') +'/users/' + id
            }
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}); 

router.get('/byUsername/:username',/*checkAuth,*/ (req, res, next) =>{
    const username = req.params.username;
    userModel.find()
    .select('username password fullName jobTitle dateOfBirth profilePicture totalRating numberOfRatings skills userEvents')
    .exec()
    .then(docs => {
        const response = docs.map(doc => {
            if(doc.username == username){
                return{
                    _id: doc._id,
                    username:doc.username,
                    fullName: doc.fullName,
                    dateOfBirth: doc.dateOfBirth,
                    jobTitle: doc.jobTitle,
                    profilePicture: doc.profilePicture,
                    rating: doc.totalRating / doc.numberOfRatings,
                    skills: doc.skills,
                    userEvents: doc.userEvents,
                    profilePicture: req.protocol + '://' + req.get('host') +'/' + doc.profilePicture,
                    request:{
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') +'/users/' + doc._id 
                    }
                }
            }        
        })
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router