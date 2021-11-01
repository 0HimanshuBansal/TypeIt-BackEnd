const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
    res.json({
        type: "Notes"
    })
})

module.exports = router