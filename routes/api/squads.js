const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Squad = require('../../models/Squad');
const Game = require('../../models/Game');
const validateSquadInput = require('../../validation/squads');

// INDEX SQUAD
router.get('/', (req, res) => {
    Squad.find(req.query)
      .find({squadFull:false})
      .populate({ path: 'members', populate: { path: 'userStats'}})
      .populate('game')
      .sort({ date: -1})
      .then((squads) => res.json(squads))
      .catch((err) =>
          res.status(404).json({ nosquadsfound: "No squads found" })
      );

})

// SHOW SQUAD
router.get('/:id', (req, res) => {
  Squad.findById(req.params.id)
    .populate({ path: 'members', populate: { path: 'userStats' }})
    .populate({ path: "requests", populate: {path: 'userStats'}})
    .populate("game")
    .then((squad) => res.json(squad))
    .catch((err) =>
      res.status(404).json({ nosquadfound: "No squad found with that ID" })
    );
  });

// SHOW SQUAD MESSAGES
router.get("/:id/messages", (req, res) => {
  Squad.findById(req.params.id)
    .then((squad) => res.json(squad.messages))
    .catch((err) =>
      res.status(404).json({ nosquadfound: "No squad found with that ID" })
    );
});

router.put("/:id/messages", (req, res) => {
let id = req.params.id;
let update = { $push: { messages: {
    squad: req.body.squad,
    sender: req.body.sender,
    content: req.body.content 
}}};
Squad
    .findByIdAndUpdate(id, update, {new: true})
    .populate({ path: 'members', populate: { path: 'userStats' }})
    .populate({ path: "requests", populate: {path: 'userStats'}})
    .populate("game")
    .then(squad => res.json(squad))
    .catch(err =>
        res.status(404).json({ nosquadfound: 'Could not process request.' })
    );
})
  
// CREATE SQUAD
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    const { errors, isValid } = validateSquadInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    
    const newSquad = new Squad({
      leader: req.user.id,
      name: req.body.name,
      generalBio: req.body.generalBio,
      members: req.user.id,
      skillLevel: req.body.skillLevel,
      game: req.body.game,
      squadSize: req.body.squadSize
    });
    
    newSquad.save()
    .then(squad => {
      let update = { $push: { squads: squad._id } };

      User.findByIdAndUpdate(req.user.id, update, { new: true })
        .then((user) => res.json(squad))
    })

  });

// POST squad message
router.put("/:id/messages", (req, res) => {
    let id = req.params.id;
    let update = { $push: { messages: {
        squad: req.body.squad,
        sender: req.body.sender,
        content: req.body.content 
    }}};
    Squad
        .findByIdAndUpdate(id, update, {new: true})
        .populate({ path: 'members', populate: { path: 'userStats' }})
        .populate({ path: "requests", populate: {path: 'userStats'}})
        .populate("game")
        .then(squad => res.json(squad))
        .catch(err =>
            res.status(404).json({ nosquadfound: 'Could not process request.' })
        );
})

// UPDATE SQUAD
router.put("/:id", (req, res) => {
     let id = req.params.id;
     let update, remove;
    switch (req.body.type) {
      case "addRequest":
        update = { $addToSet: { requests: req.body.newMemberId } };
        Squad.findByIdAndUpdate(id, update, { new: true })
            .populate({ path: 'members', populate: { path: 'userStats' }})
            .populate({ path: "requests", populate: {path: 'userStats'}})
            .populate("game")
          .then((squad) => res.json(squad))
          .catch((err) =>
            res.status(404).json({ nosquadfound: "Could not process request." })
          );
        break;

      case "declineRequest":
        remove = { $pull: { requests: req.body.requestId } };
        Squad.findByIdAndUpdate(id, remove, { new: true })
            .populate({ path: 'members', populate: { path: 'userStats' }})
            .populate({ path: "requests", populate: {path: 'userStats'}})
            .populate("game")
          .then((squad) => res.json(squad))
          .catch((err) =>
            res.status(404).json({ nosquadfound: "Could not process request." })
          );
        break;

      case "acceptMember":
        update = {
          $addToSet: { members: req.body.requestId },
          $pull: { requests: req.body.requestId },
        };

        Squad.findById(id)
        .populate("game")
        .then(squad=> {
          if (squad.members.length >= squad.squadSize) {
            squad.squadFull=true
            squad.save()
          }

          if (squad.squadFull) {
            return res.status(404).json({ nosquadfound: "This squad is full."})
          }

          if (!squad.squadFull) {
            Squad.findByIdAndUpdate(req.params.id, update, { new: true })            
              .populate({ path: 'members', populate: { path: 'userStats' }})
              .populate({ path: "requests", populate: {path: 'userStats'}})
              .populate("game")
              .then((squad) => {
                
                if (squad.members.length >= squad.squadSize) {
                  squad.squadFull=true
                  squad.save()
                }
                let userUpdate = { $push: { squads: id } };
                User.findByIdAndUpdate(req.body.requestId, userUpdate, { new: true })
                  .then((user) => {
                    res.json(squad)
                  }
                  )
              })
              .catch((err) =>
              
                res.status(404).json({ nosquadfound: "Could not process request." })
              );
          }
        })
        break;

      case "removeMember":
        remove = { $pull: { members: req.body.memberId } };
        Squad.findByIdAndUpdate(id, remove, { new: true })
            .populate({ path: 'members', populate: { path: 'userStats' }})
            .populate({ path: "requests", populate: {path: 'userStats'}})
            .populate("game")
          .then((squad) => {
            squad.squadFull=false
            squad.save()
            let userUpdate = { $pull: { squads: id } };

            User.findByIdAndUpdate(req.body.memberId, userUpdate, { new: true })
              .then((user) => res.json(squad))
          })
          .catch((err) =>
            res.status(404).json({ nosquadfound: "Could not process request." })
          );
        break;

      case "editBio":
          update = { $set: { generalBio: req.body.generalBio }}
          Squad.findByIdAndUpdate(id, update, {new: true})
            .populate({ path: 'members', populate: { path: 'userStats' }})
            .populate({ path: "requests", populate: {path: 'userStats'}})
            .populate("game")            
            .then((squad) => {
              squad.save();
              res.json(squad)
            })
        break;

      default:
        Squad.findById(id)
          .populate({ path: 'members', populate: { path: 'userStats' }})
          .populate({ path: "requests", populate: {path: 'userStats'}})
          .populate("game")
          .then((squad) => res.json(squad))
          .catch((err) =>
            res.status(404).json({ nosquadfound: "Could not process request." })
          );
    };
});
  

router.delete("/:id", (req, res) => {
    
    Squad.findByIdAndDelete(req.params.id)
    .then(squad => {
        squad.members.forEach(memberId => {;
            let deleteSquad = { $pull: { squads: mongoose.Types.ObjectId(req.params.id) } }; 
            User.findByIdAndUpdate(memberId, deleteSquad, { new: true } )
                .then(user => {
                    console.log(user.squads); 
                });
            ;
        });
    })
    .catch(err => 
      res.status(404).json({ nosquadfound: "Could not process request." })
      );
  });


module.exports = router;








