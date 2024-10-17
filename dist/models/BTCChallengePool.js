"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
;
const btcChallengePoolSchema = new mongoose_1.Schema({
    StartTime: { type: Date, required: true },
    EndTime: { type: Date, required: true },
    StartPrice: { type: Number, required: true, default: 0 },
    EndPrice: { type: Number, required: true, default: 0 },
    NextId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BTCChallengePool' },
    PrevId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BTCChallengePool' },
    Prize: { type: Number, required: true, default: 0 }
});
const BTCChallengePool = (0, mongoose_1.model)('BTCChallengePool', btcChallengePoolSchema);
exports.default = BTCChallengePool;
