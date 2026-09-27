import { authService } from '@/services/auth.service';
import type { Request, Response } from 'express';

export const authController = {
  async signup(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.signup(email, password);
    return res.status(201).json(result);
  },
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  },
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const userId = String(req.params);
    await authService.logout(userId, refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });
    return res.status(204).send();
  },
};
