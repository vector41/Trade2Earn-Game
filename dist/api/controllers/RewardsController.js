"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Reward_1 = __importDefault(require("../../models/Reward"));
const BalanceService_1 = require("../services/BalanceService");
const mongoose_1 = __importDefault(require("mongoose"));
class RewardsController {
    static claim(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            try {
                session.startTransaction();
                const { user, rewardId } = req.body;
                // Find the reward by ID and user ID
                const reward = yield Reward_1.default.findOne({ _id: rewardId, user: user._id }).session(session);
                if (!reward) {
                    yield session.abortTransaction();
                    session.endSession();
                    return res.status(404).json({ result: false, message: 'Reward not found or user does not own the reward.' });
                }
                // Check if the reward has already been claimed
                if (reward.claimed) {
                    yield session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ result: false, message: 'Reward has already been claimed.' });
                }
                // Update the reward to mark it as claimed
                reward.claimed = true;
                yield reward.save();
                // Update user balance
                if (reward.currency === "USDT")
                    yield (0, BalanceService_1.singleUpdateBalance)(user._id, reward.amount, session);
                if (reward.currency === "Coin")
                    yield (0, BalanceService_1.singleUpdateCoin)(user._id, reward.amount, session);
                yield session.commitTransaction();
                session.endSession();
                return res.status(200).json({ result: true, message: 'Reward claimed successfully.' });
            }
            catch (error) {
                console.error('Error claiming reward:', error);
                yield session.abortTransaction();
                session.endSession();
                return res.status(500).json({ result: false, message: 'An error occurred while claiming the reward.' });
            }
        });
    }
    static notifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req.body;
                // Query unclaimed rewards
                const unclaimedRewards = yield Reward_1.default.find({ claimed: false, user: user._id });
                // Send the unclaimed rewards as the response
                res.json(unclaimedRewards);
            }
            catch (error) {
                // Handle errors
                console.error('Error fetching unclaimed rewards:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
}
exports.default = RewardsController;
