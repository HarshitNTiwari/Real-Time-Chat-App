import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {generateTokens} from '../utils/jwt.js';
import {addRefreshTokenToWhitelist, findRefreshTokenById, deleteRefreshToken, revokeTokens} from '../services/auth.services.js';
import {findUserByEmail, createUserByEmailAndPassword} from '../services/users.services.js'
import bcrypt from 'bcrypt';
import {hashToken} from '../utils/hashToken.js'
import bodyParser from 'body-parser';

const router = express.Router();
const app = express();  

router.get('/', (req, res) => {
    res.json({
        message: 'In the auth'
    });
});

router.post('/register', async(req, res, next) => {
    console.log("Inside /register route");
    try {
        console.log(req.email);
        const {email, password} = req.body;
        console.log(email, password);
        if(!email || !password) {
            res.status(400);
            throw new Error('You must provide both an email and a password!');
        }

        const existingUser = await findUserByEmail(email);
        if(existingUser) {
            res.status(400);
            throw new Error('Email already used by another user!');
        }

        const user = await createUserByEmailAndPassword({ email, password });
        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(user, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

        res.json({
            accessToken,
            refreshToken,
        });
        res.redirect('/create-chat');

    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    console.log("Inside /login route");
    try {
        const {email, password} = req.body;
        if(!email || !password){
            res.status(400);
            throw new Error('You must provide both an email and a password!');
        }

        const existingUser = await findUserByEmail(email);

        if (!existingUser) {
            res.status(403);
            throw new Error('Invalid login credentials!');
        }

        const validPassword = await bcrypt.compare(password, existingUser.password);
        if (!validPassword) {
            res.status(403);
            throw new Error('Invalid login credentials!');
        }

        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(existingUser, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });

        // res.json({
        //     accessToken,
        //     refreshToken
        // });
        res.set({'Authorization': refreshToken});
        res.redirect('/create-chat');

    } catch (err) {
        next(err);
    }
});

router.post('/refreshToken', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400);
            throw new Error('Missing refresh token.');
        }

        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const savedRefreshToken = await findRefreshTokenById(payload.jti);

        if (!savedRefreshToken || savedRefreshToken.revoked === true) {
            res.status(401);
            throw new Error('Unauthorized');
        }

        const hashedToken = hashToken(refreshToken);
        if (hashedToken !== savedRefreshToken.hashedToken) {
            res.status(401);
            throw new Error('Unauthorized');
        }

        const user = await findUserById(payload.userId);
        if (!user) {
            res.status(401);
            throw new Error('Unauthorized');
        }

        await deleteRefreshToken(savedRefreshToken.id);
        const jti = uuidv4();
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });

        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (err) {
        next(err);
    }
});

export {router};