import * as z from 'zod';

export const signUpSchema = z.object({
  username: z
    .string()
    .min(6, 'Username must be atleast 6 digits long')
    .max(20, 'Username should below 20')
    .nonempty()
    .lowercase(),
  email: z.email().includes('@').lowercase(),
  password: z.string().min(8, 'Password should be atleast 8 characters long'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Key is required').nonempty(),
  password: z.string().nonempty(),
});

export const otpVerifySchema = z.object({
  otpCode: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.email().lowercase(),
});

export const verifyEmailSchema = z.object({
  email: z.string().min(1),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});


export const loginResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    email: z.email(),
  })
})

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>
