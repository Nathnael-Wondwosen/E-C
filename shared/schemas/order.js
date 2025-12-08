const Joi = require('joi');

const orderSchema = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().positive().required(),
    price: Joi.number().positive().required()
  })).required(),
  totalAmount: Joi.number().positive().required(),
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').default('pending'),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now)
});

module.exports = orderSchema;