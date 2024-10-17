"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const futureBTCChallengeSchema = new mongoose_1.Schema({
    User: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    Position: { type: Number, required: true },
    BTCChallengePool: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BTCChallengePool', required: true },
    Place: { type: Number },
    Reward: { type: Number }
});
const FutureBTCChallenge = (0, mongoose_1.model)('FutureBTCChallenge', futureBTCChallengeSchema);
exports.default = FutureBTCChallenge;
