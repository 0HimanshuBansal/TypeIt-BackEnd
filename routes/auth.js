const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const {json} = require("express");
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'TypeItJWT$Token';

router.post(
    '/createAccount',
    body('name', 'Name must have atleast 3 characters').isLength({min: 3}),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password must be 5 character long').isLength({min: 5}),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({errors: errors.array()});
        try {
            let user = await User.findOne({email: req.body.email})
            console.log("line 29" + user)
            if (user) return res.status(400).json({error: "User with same E-mail already exists"})
            console.log("line 31" + user)
            const salt = await bcrypt.genSalt(10);
            const encryptPass = await bcrypt.hash(req.body.password, salt)

            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: encryptPass,
            });
            const data = {
                user: {
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

router.post(
    '/login',
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password cannot be blank').isLength({min: 1}),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
        const {email, password} = req.body;
        try {
            let user = await User.findOne({email: email});
            console.log("line 34" + user);
            if (user) {
                const passCompare = bcrypt.compare(password, user.password);
                if (!passCompare) return res.status(400).json({error: "Wrong password"});

                const data = {
                    user: {
                        id: user.id
                    }
                }
                const jwtToken = jwt.sign(data, JWT_SECRET);
                console.log(jwtToken);
                res.status(200).json({
                    message: "Successfully logged in",
                    token: jwtToken
                });
            } else
                return res.status(400).json({error: "Failed to LogIn, please try again"})
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error");
        }
    })

router.post(
    '/getUser',
    fetchuser,
    async (req, res) => {
        try {
            let userId = req.user.id;
            const user = await User.findById(userId).select("-password");
            res.send(user)
        } catch (error) {
            console.log(error.message);
        }
    })

module.exports = router