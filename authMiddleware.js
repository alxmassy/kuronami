const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Getting the token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // 2. Check if the token is present
    if (token == null) {
        return res.sendStatus(401);
    }
    // 3. Verify the token
    jwt.verify(token, 'YOUR_SECRET_KEY', (err, user) => {
        if (err) {
            return res.sendStatus(403); 
        }
    // 4. Attach the user to the request object
        req.user = user;
        next(); // Move to the next 
    });    
};

module.exports = authMiddleware;