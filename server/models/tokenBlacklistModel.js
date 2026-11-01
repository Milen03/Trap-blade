const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: String,
}, { timestamps: { createdAt: 'created_at' } });

// Токенът така или иначе изтича след 365 дни (SESSION_DAYS в controllers/auth.js),
// затова MongoDB сама трие записите след толкова време — списъкът не расте безкрайно.
tokenBlacklistSchema.index({ created_at: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });


module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);