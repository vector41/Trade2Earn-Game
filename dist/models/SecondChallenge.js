"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const secondChallengeSchema = new mongoose_1.Schema({
    User: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    Direction: { type: Boolean, required: true },
    BTCChallengePool: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BTCChallengePool', required: true },
    Result: { type: Boolean },
    Reward: { type: Number }
});
const SecondChallenge = (0, mongoose_1.model)('SecondChallenge', secondChallengeSchema);
exports.default = SecondChallenge;
