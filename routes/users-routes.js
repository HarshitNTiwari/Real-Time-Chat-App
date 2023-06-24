import express from 'express';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient(); 

const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json({users: users.rows});
    }catch (error) {
        res.status(500).json({error: error.message});
    }

})

// router.post('/register', )

export default router;
