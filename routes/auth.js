const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const {json} = require("express");

const JWT_SECRET = 'TypeItJWT$Token';

// router.get('/', (req, res)=>{
//     res.json({
//         name: "MyName",
//         id: 100
//     })
// })

router.post(
    '/',
    body('name').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        try {
            let user = await User.findOne({ email: req.body.email })
            if (user) return res.status(400).json({ error: "User with same E-mail already exists" })
            const salt = await bcrypt.genSalt(10);
            const encryptPass = await bcrypt.hash(req.body.password, salt)

            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: encryptPass,
            });
            const data = {
                user : {
                    id: user.id
                }
            }
            const jwtToken = jwt.sign(data, JWT_SECRET);
            console.log(jwtToken);
            res.json(jwtToken)

        } catch (error) {
            console.log(error.message);
            res.status(500).send("Unable to create user");
        }
    })

module.exports = router