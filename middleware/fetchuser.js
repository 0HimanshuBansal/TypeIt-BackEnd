const jwt = require('jsonwebtoken');
const JWT_SECRET = 'TypeItJWT$Token';

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) res.status(401).send({error: "Please get an authentication code"});
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error: "Authenticate using valid code"});
    }
}

module.exports = fetchuser;