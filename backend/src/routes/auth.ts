import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import config from '../config';

const router = express.Router();
const userRepository = new UserRepository();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await userRepository.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            config.jwt.secret,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                permissions: user.permissions
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

export const authRouter = router; 