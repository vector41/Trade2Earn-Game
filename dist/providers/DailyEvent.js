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
const TradingStatisticsService_1 = require("../api/services/TradingStatisticsService");
const GlobalState_1 = require("./GlobalState");
const RewardService_1 = require("../api/services/RewardService");
const mongoose_1 = __importDefault(require("mongoose"));
const Affiliate_1 = __importDefault(require("../models/Affiliate"));
const Log_1 = __importDefault(require("../api/middlewares/Log"));
// Top High Rollers: Schedule the daily contest to run at 00:00 UTC every day
const topHighRollerContest = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting daily contest...');
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Get top 10 high rollers
        const topHighRollers = (yield (0, TradingStatisticsService_1.getHighRollersForToday)()).filter(x => x.Turnover >= 500).slice(0, 10);
        // Notify participants and perform contest operations
        if (topHighRollers.length > 0) {
            console.log('Top 10 High Rollers:');
            // const prize = await Balance.findOneAndUpdate(
            //     { User: GlobalState.weeklyChallengeUser._id }, // Query condition to find the balance document for the user
            //     { $set: { Balance: 0 } }, // Reduce the balance by the specified amount
            //     { session }
            // )
            const rewards = [];
            // if (prize && prize?.Balance > 0) {
            topHighRollers.forEach((highRoller, index) => {
                rewards.push({
                    amount: GlobalState_1.GlobalState.coinPerRank[index], // Cast the array index to a numeric type
                    currency: "Coin",
                    user: highRoller.UserId,
                    claimed: false,
                    description: 'Top High Roller',
                });
            });
            yield (0, RewardService_1.insertRewards)(rewards, session);
            // }
        }
        else {
            console.log('No eligible participants for the daily high roller contest.');
        }
        yield session.commitTransaction();
    }
    catch (error) {
        console.error('Error in daily contest:', error);
        Log_1.default.error(`DailyEvent :: dailyContest => ${error}`);
        yield session.abortTransaction();
    }
    finally {
        session.endSession();
    }
});
const topWinRatioContest = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting win ratio contest...');
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Get top 10 high rollers
        const topwinRatioPlayers = (yield (0, TradingStatisticsService_1.getTopWinRatioPlayers)()).filter(x => x.NumberOfTrades >= 50).slice(0, 10);
        // Notify participants and perform contest operations
        if (topwinRatioPlayers.length > 0) {
            console.log('Top 10 Win Ratio Players:');
            // const prize = await Balance.findOneAndUpdate(
            //     { User: GlobalState.weeklyChallengeUser._id }, // Query condition to find the balance document for the user
            //     { $set: { Balance: 0 } }, // Reduce the balance by the specified amount
            //     { session }
            // )
            const rewards = [];
            // if (prize && prize?.Balance > 0) {
            topwinRatioPlayers.forEach((winRatioPlayer, index) => {
                rewards.push({
                    amount: GlobalState_1.GlobalState.coinPerRank[index], // Cast the array index to a numeric type
                    currency: "Coin",
                    user: winRatioPlayer.UserId,
                    claimed: false,
                    description: 'Top Win Ratio',
                });
            });
            yield (0, RewardService_1.insertRewards)(rewards, session);
            // }
        }
        else {
            console.log('No eligible participants for the daily win ratio contest.');
        }
        yield session.commitTransaction();
    }
    catch (error) {
        console.error('Error in daily contest:', error);
        Log_1.default.error(`DailyEvent :: dailyContest => ${error}`);
        yield session.abortTransaction();
    }
    finally {
        session.endSession();
    }
});
const dailyAffiliateRewardDistribution = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting daily claiming of unclaimed affiliate rewards...');
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Find affiliates with unclaimed rewards before updating
        const affiliatesWithUnclaimedRewards = yield Affiliate_1.default.find({
            $or: [
                { Tier1Unclaimed: { $gt: 0 } },
                { Tier2Unclaimed: { $gt: 0 } },
                { Tier3Unclaimed: { $gt: 0 } }
            ]
        }).session(session);
        // Update unclaimed rewards for all tiers in a single query
        yield Affiliate_1.default.updateMany({
            $or: [
                { Tier1Unclaimed: { $gt: 0 } },
                { Tier2Unclaimed: { $gt: 0 } },
                { Tier3Unclaimed: { $gt: 0 } }
            ]
        }, {
            $set: {
                Tier1Unclaimed: 0,
                Tier2Unclaimed: 0,
                Tier3Unclaimed: 0
            }
        }).session(session);
        const rewards = [];
        // Create rewards for each affiliate
        affiliatesWithUnclaimedRewards.forEach(aff => {
            if (aff.Tier1Unclaimed > 0) {
                rewards.push({
                    amount: aff.Tier1Unclaimed,
                    user: aff.User,
                    claimed: false,
                    currency: "USDT",
                    description: "Affiliate Tier 1 Reward",
                });
            }
            if (aff.Tier2Unclaimed > 0) {
                rewards.push({
                    amount: aff.Tier2Unclaimed,
                    user: aff.User,
                    claimed: false,
                    currency: "USDT",
                    description: "Affiliate Tier 2 Reward",
                });
            }
            if (aff.Tier3Unclaimed > 0) {
                rewards.push({
                    amount: aff.Tier3Unclaimed,
                    user: aff.User,
                    claimed: false,
                    currency: "USDT",
                    description: "Affiliate Tier 3 Reward",
                });
            }
        });
        // Insert rewards with the session
        yield (0, RewardService_1.insertRewards)(rewards, session);
        // Commit the transaction
        yield session.commitTransaction();
        console.log('Daily claiming of unclaimed rewards completed.');
    }
    catch (error) {
        Log_1.default.error(`DailyEvent :: dailyClaimingJob => ${error}`);
        console.error('Error processing daily claiming of unclaimed rewards:', error);
        // Rollback the transaction if an error occurs
        yield session.abortTransaction();
    }
    finally {
        session.endSession();
    }
});
// schedule.scheduleJob("* * * * *", async () => {
//     await topHighRollerContest();
//     await topWinRatioContest();
//     await dailyAffiliateRewardDistribution();
//     TradingStatistics.resetTodayData()
//     .then(() => {
//         console.log("Today's data fields have been reset successfully.");
//     })
//     .catch(error => {
//         console.error("Error resetting today's data fields:", error);
//     });
// })
// // Weekly Event
// schedule.scheduleJob("* * * * *", () => {
//         TradingStatistics.resetThisWeekData()
//     .then(() => {
//         console.log("This week's data fields have been reset successfully.");
//     })
//     .catch(error => {
//         console.error("Error resetting This week's data fields:", error);
//     });
// })
// // Monthly Event
// schedule.scheduleJob("* * * * *", () => {
//     TradingStatistics.resetThisMonthData()
// .then(() => {
//     console.log("This month's data fields have been reset successfully.");
// })
// .catch(error => {
//     console.error("Error resetting This month's data fields:", error);
// });
// })
// Log when the daily contest job is scheduled
console.log('Daily contest scheduled to run at 00:00 UTC every day.');
