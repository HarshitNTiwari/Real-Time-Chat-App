import express from 'express';
import { isAuthenticated } from '../../middleware.js';
import { findUserById } from '../services/users.services.js';

const router = express.Router();

router.get('/profile', isAuthenticated, async(res, req, next) => {
    try {
        const {userId} = req.payload;
        const user = await findUserById(userId);
        delete user.password;
        res.json(user);
    } catch (err) {
        next(err);
    }
});

export {router};