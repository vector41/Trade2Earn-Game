"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Define schema for the Record document
const recordSchema = new mongoose_1.Schema({
    recordId: { type: String, unique: true, index: true },
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'User', index: true },
    coinId: { type: Number },
    createdAt: { type: Date, default: Date.now },
    status: { type: String },
    chain: { type: String },
    amount: { type: Number },
    txId: { type: String, unique: true },
    toAddress: { type: String },
    fromAddress: { type: String },
    type: { type: String },
    accepted: { type: Boolean, default: false },
});
// Create and export the Record model
const Record = mongoose_1.default.model('Record', recordSchema);
exports.default = Record;
