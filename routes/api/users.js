const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const Stat = require("../../models/Stat");
const Game = require("../../models/Game");
const Squad = require("../../models/Squad");

router.get("/test", (req, res) => res.json({ msg: "This is the users route" }));

// RETURNS USER STATE
router.get('/:userId', (req, res) => {
    User.findById(req.params.userId)
        .populate("userStats")
        .populate({path: "squads", populate: { path: "game"}})
        .populate({path: "squads", options: { sort: { 'date': -1 } }, populate: { path: "members  "}})
        .then(user => res.json(user))
        .catch(err =>
            res.status(404).json({ nouserfound: 'No user found' }  
        )
    );
});

router.put('/:userId', (req, res) => {
  let update = { 
    platform: req.body.username,
    bio: req.body.bio
  } 
  User.findByIdAndUpdate(req.params.userId, update, { new: true })
    .populate("userStats")
    .populate({path: "squads", populate: { path: "game"}})
    .populate({path: "squads", options: { sort: { 'date': -1 } }, populate: { path: "members  "}})
    .then((user) => res.json(user))
    .catch(err =>
        res.status(404).json({ dataTypeError: 'Wrong data type or no user found' }  ))
});

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ username: req.body.username }).then(user => {
    if (user) {
      errors.username = "User already exists";
      return res.status(400).json(errors);
    } else {
      const newUser = new User({
        username: req.body.username,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {

              const payload = { id: user.id, username: user.username };         

              jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token
                });
              });
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});


router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username }).then(user => {
    if (!user) {
      errors.username = "Provide a valid username";
      return res.status(400).json(errors);
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = { id: user.id, username: user.username };

        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        errors.password = "Incorrect password";
        return res.status(400).json(errors);
      }
    });
  });
});


router.post("/:id/stats", passport.authenticate('jwt', { session: false }), (req, res) => {


    const newStat = new Stat({
        user: req.params.id,
        game: req.body.gameId,
        gameName: req.body.gameName,
        stats: req.body.stats
    });

    newStat.save().then((stat) => {

      let update = { $push: { userStats: stat._id } };

      User.findByIdAndUpdate(req.params.id, update, { new: true })
        .populate("userStats")
        .populate({path: "squads", options: { sort: { 'date': -1 } }, populate: { path: 'members' }, populate: { path: "game"}})
        .then((user) => res.json(user))

    });
})


router.put("/:id/stats", (req, res) => {
    Stat.findByIdAndUpdate(req.body.statId, {stats : req.body.stats}, {new: true})
      .then(stat => 
        User.findById(req.params.id)
          .populate("userStats")
          .populate({path: "squads", options: { sort: { 'date': -1 } }, populate: { path: 'members' }, populate: { path: "game"}})
          .then(user => res.json(user)))
})
 


const awskeys = require("../../config/keys")
const aws = require( 'aws-sdk' );
const multerS3 = require( 'multer-s3' );
const multer = require('multer');
const path = require( 'path' );
const url = require('url');

const s3 = new aws.S3({
 accessKeyId: awskeys.accessKeyId,
 secretAccessKey: awskeys.secretAccessKey,
 bucket: awskeys.bucket
});



const profileImgUpload = multer({
 storage: multerS3({
  s3: s3,
  bucket: 'squadmaker',
  acl: 'public-read',
  key: function (req, file, cb) {
   cb(null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
  }
 }),
 limits:{ fileSize: 2000000 }, //2 MB
 fileFilter: function( req, file, cb ){
  checkFileType( file, cb );
 }
}).single('profileImage');
/**
 * @param file
 * @param cb
 * @return {*}
 */
function checkFileType( file, cb ){

 const filetypes = /jpeg|jpg|png|gif/;
 const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
 const mimetype = filetypes.test( file.mimetype );
if( mimetype && extname ){
  return cb( null, true );
 } else {
  cb( 'Error: Images Only!' );
 }
}
/**
 * @route 
 * @desc 
 * @access public
 */
router.post( '/:id/img-upload', ( req, res ) => {
profileImgUpload( req, res, ( error ) => {

  if( error ){
   console.log( 'errors', error );
   res.json( { error: error } );
  } else {

   if( req.file === undefined ){
    console.log( 'Error: No File Selected!' );
    res.json( 'Error: No File Selected' );
   } else {

    const imageName = req.file.key;
    const imageLocation = req.file.location;

    let update = { $push: { profileImages: imageLocation } };

    User.findByIdAndUpdate(req.params.id, update, { new: true })
    .then(user => console.log(user))
  res.json( {
     image: imageName,
     location: imageLocation
    } );
   }
  }
 });
});

router.put( '/:id/img-delete', ( req, res ) => {

  const imageLocation = req.body.location

  let deleteImage = { $pull: { profileImages: imageLocation } }
  
  User.findByIdAndUpdate(req.params.id, deleteImage, { new: true })
    .populate('squads')
    .populate({path: "squads", options: { sort: { 'date': -1 } }, populate: { path: 'members' }, populate: { path: "game"}})
    .then(user => res.json(user))
})

module.exports = router;  
