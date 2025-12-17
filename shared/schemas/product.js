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
  thumbnail: Joi.string().uri().optional(),
  isFeatured: Joi.boolean().default(false),
  isHotDeal: Joi.boolean().default(false),
  isPremium: Joi.boolean().default(false),
  discountPercentage: Joi.number().min(0).max(100).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.object().optional(),
  variants: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).default(0),
    sku: Joi.string().required(),
    images: Joi.array().items(Joi.string().uri()).optional()
  })).optional(),
  // B2B-specific fields
  productType: Joi.string().valid('B2C', 'B2B').default('B2C'),
  moq: Joi.number().integer().min(1).optional(), // Minimum Order Quantity
  bulkPricing: Joi.array().items(Joi.object({
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().positive().required()
  })).optional(),
  leadTime: Joi.number().integer().min(0).optional(), // in days
  shippingOptions: Joi.array().items(Joi.string()).optional(),
  certifications: Joi.array().items(Joi.string()).optional(),
  supplierId: Joi.string().optional(),
  companyId: Joi.string().optional(),
  businessType: Joi.string().valid('manufacturer', 'distributor', 'wholesaler', 'retailer').optional(),
  country: Joi.string().optional(),
  createdAt: Joi.date().default(Date.now),
  updatedAt: Joi.date().default(Date.now)
});

module.exports = productSchema;