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
exports.AffiliateType = void 0;
var AffiliateType;
(function (AffiliateType) {
    AffiliateType["FRIEND_METHOD"] = "FRIEND_METHOD";
    AffiliateType["PARTNERSHIP"] = "PARTNERSHIP";
})(AffiliateType || (exports.AffiliateType = AffiliateType = {}));
const mongoose_1 = __importStar(require("mongoose"));
const affiliateSchema = new mongoose_1.Schema({
    AffiliateType: {
        type: String,
        required: true,
    },
    ReferralId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    Name: {
        type: String,
        required: true,
    },
    Tier1Paid: {
        type: Number,
        default: 0,
    },
    Tier2Paid: {
        type: Number,
        default: 0,
    },
    Tier3Paid: {
        type: Number,
        default: 0,
    },
    Tier1Unclaimed: {
        type: Number,
        default: 0,
        index: true,
    },
    Tier2Unclaimed: {
        type: Number,
        index: true,
        default: 0,
    },
    Tier3Unclaimed: {
        type: Number,
        default: 0,
        index: true,
    },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
    User: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
});
exports.default = mongoose_1.default.model('Affiliate', affiliateSchema);
