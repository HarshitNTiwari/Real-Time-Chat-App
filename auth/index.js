import express from 'express';
import {router as authRouter} from './routes/auth.routes.js';
import {router as userRouter} from './routes/users.routes.js'

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'API - 👋🌎🌍🌏'
    });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);

export {router};