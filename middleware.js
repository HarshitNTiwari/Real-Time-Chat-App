import jwt from 'jsonwebtoken';

function isAuthenticated(req, res, next) {
    console.log(req.headers);
    const {authorization} = req.headers;
    
    if(!authorization) {
        // res.status(401);
        // throw new Error('User unauthorized!');
        console.log("YEs");
        res.redirect('/login');
    }
    
    try {
        console.log(authorization);
        const token = authorization.split(' ')[1];
        console.log(token);
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.payload = payload;
    } catch (err) {
        res.status(401);
        if(err.name == 'TokenExpiredError') {
            throw new Error(err.name);
        }
        throw new Error('User unauthorized!');
    }

    return next();
}

export {isAuthenticated};