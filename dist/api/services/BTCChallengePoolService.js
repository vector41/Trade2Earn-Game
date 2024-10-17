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
exports.getNextRoundInProgress = exports.getCurrentRoundInProgress = void 0;
const BTCChallengePool_1 = __importDefault(require("../../models/BTCChallengePool"));
// Function to get the current round in progress
const getCurrentRoundInProgress = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the current date and time
        const now = new Date();
        // Find the round in progress where StartTime < Now and EndTime > Now
        const roundInProgress = yield BTCChallengePool_1.default.findOne({
            StartTime: { $lt: now },
            EndTime: { $gt: now },
            StartPrice: { $gt: 0 },
            EndPrice: { $eq: 0 }
        }).exec();
        return roundInProgress;
    }
    catch (error) {
        console.error("Error occurred while getting current round in progress:", error);
        return null;
    }
});
exports.getCurrentRoundInProgress = getCurrentRoundInProgress;
const getNextRoundInProgress = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the current date and time
        const now = new Date();
        const nextTimeInProgress = new Date(now);
        nextTimeInProgress.setUTCDate(now.getUTCDate() + 7);
        // nextTimeInProgress.setUTCMinutes(now.getUTCMinutes() + 1);
        // nextTimeInProgress.setUTCHours(now.getUTCHours() + 1);
        // Find the round in progress where StartTime < Now and EndTime > Now
        const nextRoundInProgress = yield BTCChallengePool_1.default.findOne({
            StartTime: { $lt: nextTimeInProgress },
            EndTime: { $gt: nextTimeInProgress },
            StartPrice: { $eq: 0 },
            EndPrice: { $eq: 0 }
        }).exec();
        return nextRoundInProgress;
    }
    catch (error) {
        console.error("Error occurred while getting current round in progress:", error);
        return null;
    }
});
exports.getNextRoundInProgress = getNextRoundInProgress;
