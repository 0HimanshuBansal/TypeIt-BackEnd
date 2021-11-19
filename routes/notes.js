const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//Get Notes
router.get('/fetchNotes',
    fetchuser,
    async (req, res) => {
        try {
            const notes = await Notes.find({ user: req.user.id });
            res.json({ success: true, notes: notes });
        } catch (error) {
            return res.status(500).json({ success: false, errors: error });
        }
    })

//Add Note
router.post('/addNote', fetchuser,
    body('title', 'Title cant be empty').isLength({ min: 0 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
            const { title, description, tag, bgColor, date } = req.body;

            const note = await new Notes({ user: req.user.id, title, description, tag, bgColor, date });
            const savedNode = await note.save();
            res.json({ success: true, newNote: [savedNode] });
        } catch (error) {
            return res.status(500).json({ success: false, errors: error });
        }
    })

//Update Note
router.put('/updateNote/:id', fetchuser,
    async (req, res) => {
        try {
            const { title, description, tag, bgColor, date } = req.body;
            //check if note exists
            let note = await Notes.findById(req.params.id);
            if (!note)
                return res.status(404).json({ success: false, error: "Not Found!" });

            //check whether note belongs to user or not
            if (note.user.toString() !== req.user.id)
                return res.status(401).send({ success: false, error: "Access Denied" });

            const newNote = {};
            if (title) newNote.title = title;
            if (description) newNote.description = description;
            if (tag) newNote.tag = tag;
            if (bgColor) newNote.bgColor = bgColor;
            newNote.date = date;

            note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
            //new -> if there would be any new field found while updating, it will add it
            res.json({ success: true, note: note });

        } catch (error) {
            return res.status(500).json({ success: false, errors: "Internal Server Error - " + error });
        }
    })

//Update Note
router.delete('/deleteNote/:id', fetchuser,
    async (req, res) => {
        try {
            //check if note exists
            let note = await Notes.findById(req.params.id);
            if (!note)
                return res.status(404).json({ success: false, error: "Not Found!" });

            //check whether note belongs to user or not
            if (note.user.toString() !== req.user.id)
                return res.status(401).send({ success: false, error: "Access Denied" });

            note = await Notes.findByIdAndDelete(req.params.id);
            res.json({ success: true, note: note });

        } catch (error) {
            return res.status(500).json({ success: false, errors: "Internal Server Error - " + error });
        }
    })

module.exports = router;