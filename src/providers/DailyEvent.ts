import schedule from 'node-schedule'
import {
    getHighRollersForToday,
    getTopWinRatioPlayers,
} from '../api/services/TradingStatisticsService'
import { IHightRoller } from '../interfaces/IHighRoller'
import Balance, { IBalance } from '../models/Balance'
import { GlobalState } from './GlobalState'
import { insertRewards } from '../api/services/RewardService'
import mongoose from 'mongoose'
import { IReward } from '../models/Reward'
import Affiliate, { IAffiliate } from '../models/Affiliate'
import Log from '../api/middlewares/Log'
import { ITopWinRatioPlayer } from '../interfaces/ITopWinRatio'
import TradingStatistics from '../models/TradingStatistics'


// Top High Rollers: Schedule the daily contest to run at 00:00 UTC every day
const topHighRollerContest = async () => {
    console.log('Starting daily contest...')

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // Get top 10 high rollers
        const topHighRollers: IHightRoller[] = (
            await getHighRollersForToday()
        ).filter(x => x.Turnover >= 500).slice(0, 10)

        // Notify participants and perform contest operations
        if (topHighRollers.length > 0) {
            console.log('Top 10 High Rollers:')
            // const prize = await Balance.findOneAndUpdate(
            //     { User: GlobalState.weeklyChallengeUser._id }, // Query condition to find the balance document for the user
            //     { $set: { Balance: 0 } }, // Reduce the balance by the specified amount
            //     { session }
            // )

            const rewards: IReward[] = []

            // if (prize && prize?.Balance > 0) {
                topHighRollers.forEach((highRoller, index) => {
                    rewards.push({
                        amount:
                            GlobalState.coinPerRank[index], // Cast the array index to a numeric type
                        currency: "Coin",
                        user: highRoller.UserId,
                        claimed: false,
                        description: 'Top High Roller',
                    })
                })

                await insertRewards(rewards, session)
            // }
        } else {
            console.log('No eligible participants for the daily high roller contest.')
        }

        await session.commitTransaction()
    } catch (error) {
        console.error('Error in daily contest:', error)
        Log.error(`DailyEvent :: dailyContest => ${error}`)
        await session.abortTransaction()
    } finally {
        session.endSession()
    }
}

const topWinRatioContest = async () => {
    console.log('Starting win ratio contest...')

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        // Get top 10 high rollers
        const topwinRatioPlayers: ITopWinRatioPlayer[] = (
            await getTopWinRatioPlayers()
        ).filter(x => x.NumberOfTrades >= 50).slice(0, 10);

        // Notify participants and perform contest operations
        if (topwinRatioPlayers.length > 0) {
            console.log('Top 10 Win Ratio Players:')
            // const prize = await Balance.findOneAndUpdate(
            //     { User: GlobalState.weeklyChallengeUser._id }, // Query condition to find the balance document for the user
            //     { $set: { Balance: 0 } }, // Reduce the balance by the specified amount
            //     { session }
            // )

            const rewards: IReward[] = []

            // if (prize && prize?.Balance > 0) {
                topwinRatioPlayers.forEach((winRatioPlayer, index) => {
                    rewards.push({
                        amount:
                            GlobalState.coinPerRank[index], // Cast the array index to a numeric type
                        currency: "Coin",
                        user: winRatioPlayer.UserId,
                        claimed: false,
                        description: 'Top Win Ratio',
                    })
                })

                await insertRewards(rewards, session)
            // }
        } else {
            console.log('No eligible participants for the daily win ratio contest.')
        }

        await session.commitTransaction()
    } catch (error) {
        console.error('Error in daily contest:', error)
        Log.error(`DailyEvent :: dailyContest => ${error}`)
        await session.abortTransaction()
    } finally {
        session.endSession()
    }
}

const dailyAffiliateRewardDistribution = async () => {
    console.log('Starting daily claiming of unclaimed affiliate rewards...');

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find affiliates with unclaimed rewards before updating
        const affiliatesWithUnclaimedRewards: IAffiliate[] = await Affiliate.find({
            $or: [
                { Tier1Unclaimed: { $gt: 0 } },
                { Tier2Unclaimed: { $gt: 0 } },
                { Tier3Unclaimed: { $gt: 0 } }
            ]
        }).session(session);

        // Update unclaimed rewards for all tiers in a single query
        await Affiliate.updateMany(
            {
                $or: [
                    { Tier1Unclaimed: { $gt: 0 } },
                    { Tier2Unclaimed: { $gt: 0 } },
                    { Tier3Unclaimed: { $gt: 0 } }
                ]
            },
            {
                $set: {
                    Tier1Unclaimed: 0,
                    Tier2Unclaimed: 0,
                    Tier3Unclaimed: 0
                }
            }
        ).session(session);

        const rewards: IReward[] = [];

        // Create rewards for each affiliate
        affiliatesWithUnclaimedRewards.forEach(aff => {
            if(aff.Tier1Unclaimed > 0) {
                rewards.push(
                    {
                        amount: aff.Tier1Unclaimed,
                        user: aff.User,
                        claimed: false,
                        currency: "USDT",
                        description: "Affiliate Tier 1 Reward",
                    });
            }

            if(aff.Tier2Unclaimed > 0) {
                rewards.push(
                    {
                        amount: aff.Tier2Unclaimed,
                        user: aff.User,
                        claimed: false,
                        currency: "USDT",
                        description: "Affiliate Tier 2 Reward",
                    });
            }

            if(aff.Tier3Unclaimed > 0) {
                rewards.push(
                    {
                        amount: aff.Tier3Unclaimed,
                        user: aff.User,
                        claimed: false,
                        currency: "USDT",
                        description: "Affiliate Tier 3 Reward",
                    });
            }
        });

        // Insert rewards with the session
        await insertRewards(rewards, session);

        // Commit the transaction
        await session.commitTransaction();

        console.log('Daily claiming of unclaimed rewards completed.');
    } catch (error) {
        Log.error(`DailyEvent :: dailyClaimingJob => ${error}`)
        console.error('Error processing daily claiming of unclaimed rewards:', error);
        // Rollback the transaction if an error occurs
        await session.abortTransaction();
    } finally {
        session.endSession();
    }
};

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
console.log('Daily contest scheduled to run at 00:00 UTC every day.')
