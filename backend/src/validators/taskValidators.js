const { z } = require('zod');

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Renk #RRGGBB formatında olmalı');

const dueAt = z
  .union([
    z.string().datetime('Geçerli bir tarih/saat girin'),
    z.null(),
  ])
  .optional();

const category = z
  .string()
  .trim()
  .max(40, 'Kategori en fazla 40 karakter olmalı')
  .optional()
  .default('');

const taskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Görev başlığı gerekli')
    .max(160, 'Görev başlığı en fazla 160 karakter olmalı'),
  description: z.string().trim().max(1000, 'Açıklama en fazla 1000 karakter olmalı').optional().default(''),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  color: hexColor.optional().default('#6750A4'),
  category,
  dueAt,
}).strict();

const taskUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Görev başlığı gerekli')
    .max(160, 'Görev başlığı en fazla 160 karakter olmalı')
    .optional(),
  description: z.string().trim().max(1000, 'Açıklama en fazla 1000 karakter olmalı').optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  color: hexColor.optional(),
  category: z.string().trim().max(40, 'Kategori en fazla 40 karakter olmalı').optional(),
  dueAt,
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'Güncellenecek en az bir alan gerekli',
});

module.exports = { taskCreateSchema, taskUpdateSchema };
