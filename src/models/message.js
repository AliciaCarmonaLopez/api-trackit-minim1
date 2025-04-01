"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
// models/Message.ts
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
exports.MessageModel = (0, mongoose_1.model)('Message', messageSchema);
