const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { json } = require("express");
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'TypeItJWT$Token';

router.post(
    '/createAccount',
    body('name', 'Name must have atleast 3 characters').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password must be 5 character long').isLength({ min: 5 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({success: false, errors: errors.array() });
        try {
            let user = await User.findOne({ email: req.body.email })
            if (user) return res.status(400).json({ success: false, error: "User with same E-mail already exists" })
            const salt = await bcrypt.genSalt(10);
            const encryptPass = await bcrypt.hash(req.body.password, salt)

            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: encryptPass,
                date: req.body.date
            });
            const data = { user: { id: user.id } }
            const jwtToken = jwt.sign(data, JWT_SECRET);
            // console.log(jwtToken);
            res.json({ success: true, token: jwtToken });
        } catch (error) {
            // console.log(error.message);
            res.status(500).send({ success: false, error: error.message });
        }
    })

router.post(
    '/login',
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password cannot be blank').isLength({ min: 1 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email: email });
            // console.log("line 34" + user);
            if (user) {
                const passCompare = bcrypt.compare(password, user.password);
                if (!passCompare) return res.status(400).json({ success: false, error: "Wrong password" });

                const data = { user: { id: user.id } }
                const jwtToken = jwt.sign(data, JWT_SECRET);
                // console.log(jwtToken);
                res.status(200).json({
                    success: true,
                    token: jwtToken
                });
            } else return res.status(400).json({success: false, error: "Failed to LogIn, please try again" })
        } catch (error) {
            // console.log(error.message);
            res.status(500).send({ success: false, error: "Internal Server Error" });
        }
    })

router.post(
    '/getUser',
    fetchuser,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select("-password");
            res.json({ success: true, user: user });
        } catch (error) {
            res.status(500).send({ success: false, error: "Unable to get the requested item" });
        }
    })

router.delete(
    '/deleteAccount',
    fetchuser,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findByIdAndDelete(userId).select("-password");
            res.json({ success: true, message: user.name + ", your account has been deleted" });
        } catch (error) {
            res.status(500).send({ success: false, error: "Failed to delete your account" });
        }
    })

module.exports = router