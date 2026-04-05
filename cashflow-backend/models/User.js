const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['Admin', 'Standard'], default: 'Standard' },
	adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Linked Admin for standard users
	balance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
