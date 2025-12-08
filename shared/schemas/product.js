const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  category: Joi.string().required(),
  stock: Joi.number().integer().min(0).default(0),
  sku: Joi.string().required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now)
});

module.exports = productSchema;