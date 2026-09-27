import { Router } from 'express';

const authRouter = Router();

authRouter.post('/auth/signup');
authRouter.post('/auth/login');
authRouter.post('/auth/logout');
