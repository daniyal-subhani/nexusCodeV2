import { Router } from 'express';

const authRouter = Router();

authRouter.post('/signup');
authRouter.post('/login');
authRouter.post('/logout');
