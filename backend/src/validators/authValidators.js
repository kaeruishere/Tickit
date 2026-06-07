const { z } = require('zod');

const email = z
  .string()
  .trim()
  .email('Geçerli bir email girin')
  .toLowerCase();

const password = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalı')
  .max(128, 'Şifre en fazla 128 karakter olmalı')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
  .refine((value) => !['password', 'password123', '12345678', 'qwerty123', 'Password1'].includes(value), {
    message: 'Bu şifre çok zayıf',
  });

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'Kullanıcı adı en az 2 karakter olmalı')
    .max(40, 'Kullanıcı adı en fazla 40 karakter olmalı'),
  email,
  password,
}).strict();

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Şifre gerekli'),
}).strict();

module.exports = { registerSchema, loginSchema };
