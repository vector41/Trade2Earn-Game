"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const balanceSchema = new mongoose_1.Schema({
    Balance: {
        type: Number,
        default: 0,
        require: true,
        index: true,
    },
    Coin: {
        type: Number,
        default: 0,
        require: true,
        index: true,
    },
    User: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        index: true
    },
});
exports.default = (0, mongoose_1.model)('Balance', balanceSchema);
