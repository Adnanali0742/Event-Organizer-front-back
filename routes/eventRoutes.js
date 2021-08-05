const eventModel = require('../models/eventSchema')

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

router.post('/',/*checkAuth,*/upload.single('picture'),(req,res,next) => {
    let picturePath = undefined
    if(req.file != undefined)
        picturePath = req.file.path

    let event = new eventModel({
        name: req.body.name,
        dateOfEvent: req.body.dateOfEvent,
        location: req.body.location,
        hostId: req.body.hostId,
        guests: req.body.guests,
        completed: req.body.completed,
        category: req.body.category,
        inviteType: req.body.inviteType,
        picture: picturePath,
        requirements: req.body.requirements,
        materials: req.body.materials
    })

    event.save()
    .then(event => {res.status(200).send(event)})
    .catch(error => {next(error)})

    
})

router.get('/',/*checkAuth,*/ (req, res, next) =>{
    eventModel.find()
    .select('name dateOfEvent location guests hostId completed category inviteType requirements materials picture')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            events: docs.map(doc => {
                return{
                    _id: doc._id,
                    name: doc.name,
                    dateOfEvent: doc.dateOfEvent,
                    location: doc.location,
                    hostId: doc.hostId,
                    guests: doc.guests,
                    completed: doc.completed,
                    category: doc.category,
                    inviteType: doc.inviteType,
                    requirements: doc.requirements,
                    materials: doc.materials,
                    picture: req.protocol + '://' + req.get('host') +'/' + doc.picture,
                    request:{
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') +'/events/' + doc._id 
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

router.get('/:eventId',/*checkAuth,*/ (req, res, next) =>{
    const id = req.params.eventId;
    eventModel.findById(id)
    .select('name dateOfEvent location guests hostId completed category inviteType requirements materials picture')
    .exec()
    .then(doc =>{
        console.log(doc);
        if(doc){
            res.status(200).json(doc);
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

router.delete('/:eventId',/*checkAuth,*/ (req, res) => {
    const id = req.params.eventId;
    eventModel.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message:'event deleted'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
   })

router.put('/:eventId', /*checkAuth,*/upload.single('picture'), (req, res, next) =>{

    let picturePath = undefined
    if(req.file != undefined)
        picturePath = req.file.path

    const id = req.params.eventId;

    let newMat = req.body.materials
    let newReq = req.body.requirements

    /*eventModel.findById(id)
    .select('materials requirements')
    .exec()
    .then(doc =>{
        newMat = doc.materials.concat(newMat)
        newReq = doc.requirements.concat(newReq)
    })*/

    const updateOps = {
        name: req.body.name,
        dateOfEvent: req.body.dateOfEvent,
        location: req.body.location,
        hostId: req.body.hostId,
        guests: req.body.guests,
        completed: req.body.completed,
        category: req.body.category,
        inviteType: req.body.inviteType,
        requirements: newReq,
        materials: newMat,
        picture: picturePath
    }
    eventModel.updateOne({_id: id}, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            message:'Event updated',
            request:{
                type:'GET',
                url: req.protocol + '://' + req.get('host') +'/events/' + id
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

router.put('/byName/:eventName', /*checkAuth,*/upload.single('picture'), (req, res, next) =>{
    let picturePath = undefined
    if(req.file != undefined)
        picturePath = req.file.path

    const name = req.params.eventName;

    let newMat = req.body.materials
    let newReq = req.body.requirements

    const updateOps = {
        dateOfEvent: req.body.dateOfEvent,
        location: req.body.location,
        hostId: req.body.hostId,
        guests: req.body.guests,
        completed: req.body.completed,
        category: req.body.category,
        inviteType: req.body.inviteType,
        picture: picturePath
    }
    eventModel.updateOne({name: name}, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            message:'Event updated',
            request:{
                type:'GET',
                url: req.protocol + '://' + req.get('host') +'/events/' + id
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

router.get('/byName/:eventName',/*checkAuth,*/ (req, res, next) =>{
    const name = req.params.eventName;
    eventModel.find()
    .select('name dateOfEvent location guests hostId completed category inviteType requirements materials picture')
    .exec()
    .then(docs => {
        const response = docs.map(doc => {
            if(doc.name == name){
                return{
                    _id: doc._id,
                    name: doc.name,
                    dateOfEvent: doc.dateOfEvent,
                    location: doc.location,
                    hostId: doc.hostId,
                    guests: doc.guests,
                    completed: doc.completed,
                    category: doc.category,
                    inviteType: doc.inviteType,
                    requirements: doc.requirements,
                    materials: doc.materials,
                    picture: req.protocol + '://' + req.get('host') +'/' + doc.picture,
                    request:{
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') +'/events/' + doc._id 
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

// router.patch('/byName/:eventName', /*checkAuth,*/upload.single('picture'), (req, res, next) =>{
//     let picturePath = undefined
//     if(req.file != undefined)
//         picturePath = req.file.path

//     const name = req.params.eventName;
//     const updateOps = {
//         dateOfEvent: req.body.dateOfEvent,
//         location: req.body.location,
//         hostId: req.body.hostId,
//         completed: req.body.completed,
//         category: req.body.category,
//         inviteType: req.body.inviteType,
//         requirements: req.body.requirements,
//         materials: req.body.materials,
//         picture: picturePath
//     }
//     eventModel.updateOne({name: name}, { $set: updateOps })
//     .exec()
//     .then(result => {
//         res.status(200).json({
//             message:'Event updated',
//             request:{
//                 type:'GET',
//                 url: req.protocol + '://' + req.get('host') +'/events/' + id
//             }
//         })
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     });
// });

router.get('/byHostId/:hostId',/*checkAuth,*/ (req, res, next) =>{
    const hostId = req.params.hostId;
    eventModel.find()
    .select('name dateOfEvent location guests hostId completed category inviteType requirements materials picture')
    .exec()
    .then(docs => {
        const response = docs.map(doc => {
            if(doc.hostId == hostId){
                return{
                    _id: doc._id,
                    name: doc.name,
                    dateOfEvent: doc.dateOfEvent,
                    location: doc.location,
                    hostId: doc.hostId,
                    guests: doc.guests,
                    completed: doc.completed,
                    category: doc.category,
                    inviteType: doc.inviteType,
                    requirements: doc.requirements,
                    materials: doc.materials,
                    picture: req.protocol + '://' + req.get('host') +"/" + doc.picture,
                    request:{
                        type: 'GET',
                        url: req.protocol + '://' + req.get('host') +'/events/' + doc._id 
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