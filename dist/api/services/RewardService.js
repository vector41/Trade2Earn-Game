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
exports.getUnclaimedRewards = exports.insertRewards = void 0;
const Reward_1 = __importDefault(require("../../models/Reward"));
const Log_1 = __importDefault(require("../middlewares/Log"));
const insertRewards = (rewards, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = {};
        if (session) {
            options.session = session;
        }
        const insertedRewards = yield Reward_1.default.insertMany(rewards, options);
        return insertedRewards;
    }
    catch (error) {
        Log_1.default.error(`RewardService :: Error adding batch rewards: ${error}`);
        throw error;
    }
});
exports.insertRewards = insertRewards;
function getUnclaimedRewards() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Query to find rewards where claimed is false
            const unclaimedRewards = yield Reward_1.default.find({ claimed: false });
            return unclaimedRewards;
        }
        catch (error) {
            // Handle error
            console.error('Error fetching unclaimed rewards:', error);
            throw error;
        }
    });
}
exports.getUnclaimedRewards = getUnclaimedRewards;
