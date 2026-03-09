const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    role: { type: String, default: 'buyer', index: true },
    roles: { type: [String], default: ['buyer'], index: true },
    displayName: { type: String, default: '' },
    profile: {
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      jobTitle: { type: String, default: '' }
    },
    sourceRefs: {
      ecUserId: { type: String, default: null },
      tradUserId: { type: String, default: null }
    },
    authProvider: { type: String, default: 'local' },
    googleId: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    resetPasswordTokenHash: { type: String, default: '' },
    resetPasswordExpiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const User = mongoose.models.IdentityUser || mongoose.model('IdentityUser', userSchema);

module.exports = User;
