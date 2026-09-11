import { Router } from 'express';

const authRouter = Router();

authRouter.get('/auth/user');
authRouter.post('/auth/signup');
authRouter.post('/auth/login');
authRouter.post('/auth/refresh');
authRouter.post('/auth/logout');
authRouter.post('/auth/forgot-password');
authRouter.post('/auth/reset-password');
authRouter.post('/auth/verify-email');
