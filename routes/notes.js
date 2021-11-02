const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const {body, validationResult} = require('express-validator');

//Get Notes
router.get('/fetchNotes',
    fetchuser,
    async (req, res) => {
        try {
            const notes = await Notes.find({user: req.user.id});
            res.send(notes);
        } catch (error) {
            return res.status(500).json({errors: error});
        }
    })

//Add Note
router.post('/addNote', fetchuser,
    body('title', 'Title cant be empty').isLength({min: 0}),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
            const {title, description, tag} = req.body;

            const note = await new Notes({user: req.user.id, title, description, tag});
            const savedNode = await note.save();
            res.json(savedNode);
        } catch (error) {
            return res.status(500).json({errors: error});
        }
    })

//Update Note
router.put('/updateNote/:id', fetchuser,
    async (req, res) => {
        try {
            const {title, description, tag} = req.body;
            //check if note exists
            let note = await Notes.findById(req.params.id);
            if (!note)
                return res.status(404).send("Not Found!");

            //check whether note belongs to user or not
            if (note.user.toString() !== req.user.id)
                return res.status(401).send("Access Denied");

            const newNote = {};
            if (title) newNote.title = title;
            if (description) newNote.description = description;
            if (tag) newNote.tag = tag;
            note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
            //new -> if there would be any new field found while updating, it will add it
            res.json({note});

        } catch (error) {
            return res.status(500).json({errors: "Internal Server Error - " + error});
        }
    })

//Update Note
router.delete('/deleteNote/:id', fetchuser,
    async (req, res) => {
        try {
            //check if note exists
            let note = await Notes.findById(req.params.id);
            if (!note)
                return res.status(404).send("Not Found!");

            //check whether note belongs to user or not
            if (note.user.toString() !== req.user.id)
                return res.status(401).send("Access Denied");

            note = await Notes.findByIdAndDelete(req.params.id);
            res.json({note});

        } catch (error) {
            return res.status(500).json({errors: "Internal Server Error - " + error});
        }
    })

module.exports = router;