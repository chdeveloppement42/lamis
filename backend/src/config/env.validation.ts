import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().required(),
  UPLOAD_DIR: Joi.string().default('./uploads'),

  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  PASSWORD_RESET_EXPIRES_IN: Joi.string().default('30m'),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  STORAGE_PROVIDER: Joi.string().valid('disk', 'cloudinary').default('disk'),
  CLOUDINARY_CLOUD_NAME: Joi.when('STORAGE_PROVIDER', {
    is: 'cloudinary',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  CLOUDINARY_API_KEY: Joi.when('STORAGE_PROVIDER', {
    is: 'cloudinary',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  CLOUDINARY_API_SECRET: Joi.when('STORAGE_PROVIDER', {
    is: 'cloudinary',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),

  // ─── SMTP / Email (Password reset) ─────────────────────────────
  // Optional at boot so the app can start even if SMTP isn't configured yet.
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().port().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  MAIL_FROM: Joi.string().email().optional(),
  CONTACT_EMAIL: Joi.string().email().required(),
});
