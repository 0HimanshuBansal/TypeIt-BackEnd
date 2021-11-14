const mongoose = require('mongoose');
const { Schema } = mongoose;

// const d = new Date();
// let currDate = d.toLocaleTimeString();

const NotesSchema = new Schema ({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    tag:{
        type: String,
        default: "General"
    },
    bgColor:{
        type: String,
        default: "light"
    },
    date:{
        type: String,
        default: Date.toLocaleTimeString
    },
});

module.exports = mongoose.model('notes', NotesSchema);
