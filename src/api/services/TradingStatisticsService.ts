import TradingStatistics, {
    ITradingStatistics,
    ITradingStatisticsDocument,
    ITradingStatisticsModel,
} from '../../models/TradingStatistics'
import Log from '../middlewares/Log'
import { IReturnData } from '../../interfaces/IReturnData'
import mongoose from 'mongoose'
import Utils from '../../utils/utils'
import User, { IUser } from '../../models/User'
import { IHightRoller } from '../../interfaces/IHighRoller'
import { ITopWinRatioPlayer } from '../../interfaces/ITopWinRatio'
import { ITop100Winner } from '../../interfaces/ITop100Winner'

export const updateBatchTradingStatistics = async (
    statistics: ITradingStatistics[],
    session?: mongoose.mongo.ClientSession
): Promise<IReturnData<ITradingStatistics[]>> => {
    try {
        // Create an array to store bulk write operations
        const bulkOperations = []

        for (const statistic of statistics) {
            // Define the filter criteria to find existing statistics
            const filter = { User: statistic.User }

            // Define the update operation
            const update = {
                $inc: {
                    // Increment the fields by the corresponding values from the incoming statistic
                    'AllTime.NetProfit': statistic.AllTime.NetProfit,
                    'AllTime.NumberOfTrades': statistic.AllTime.NumberOfTrades,
                    'AllTime.NumberOfWins': statistic.AllTime.NumberOfWins,
                    'AllTime.TradingVolume': statistic.AllTime.TradingVolume,
                    'ThisMonth.NetProfit': statistic.ThisMonth.NetProfit,
                    'ThisMonth.NumberOfTrades':
                        statistic.ThisMonth.NumberOfTrades,
                    'ThisMonth.NumberOfWins': statistic.ThisMonth.NumberOfWins,
                    'ThisMonth.TradingVolume':
                        statistic.ThisMonth.TradingVolume,
                    'ThisWeek.NetProfit': statistic.ThisWeek.NetProfit,
                    'ThisWeek.NumberOfTrades':
                        statistic.ThisWeek.NumberOfTrades,
                    'ThisWeek.NumberOfWins': statistic.ThisWeek.NumberOfWins,
                    'ThisWeek.TradingVolume': statistic.ThisWeek.TradingVolume,
                    'Today.NetProfit': statistic.Today.NetProfit,
                    'Today.NumberOfTrades': statistic.Today.NumberOfTrades,
                    'Today.NumberOfWins': statistic.Today.NumberOfWins,
                    'Today.TradingVolume': statistic.Today.TradingVolume,
                },
            }

            // Create an updateOne operation for each statistic
            bulkOperations.push({
                updateOne: {
                    filter,
                    update,
                },
            })
        }

        // Execute the bulk write operation
        await TradingStatistics.bulkWrite(bulkOperations, { session })

        return { success: true }
    } catch (error: any) {
        // if(session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }
        Log.error(
            `TradingStatisticsService :: updateBatchTradingStatistics: ${error}`
        )
        // return { success: false, error }
        throw error
    }
}

export const getHighRollersForToday = async (): Promise<IHightRoller[]> => {
    try {
        // Find users with high net profit for today
        const highRollers = await TradingStatistics.find({
            'Today.TradingVolume': { $gt: 0 },
        })
            .populate({
                path: 'User',
                select: 'Username CountryCode Avatar ',
            })
            .select('Today.TradingVolume Today.NumberOfTrades')
            .sort({ 'Today.TradingVolume': -1 }) // Sort in descending order of net profit

        return highRollers.map((hr) => ({
            UserId: (hr.User as IUser)._id,
            Username: (hr.User as IUser).Username,
            CountryCode: (hr.User as IUser).CountryCode,
            Avatar: (hr.User as IUser).Avatar,
            Turnover: hr.Today.TradingVolume,
            NumberOfTrades: hr.Today.NumberOfTrades,
        })) as IHightRoller[]
    } catch (error) {
        console.error('Error fetching high rollers:', error)
        throw error // Handle the error appropriately
    }
}

export async function getTopWinRatioPlayers(): Promise<ITopWinRatioPlayer[]> {
    try {
        const topPlayers = await TradingStatistics.aggregate([
            {
                $addFields: {
                    // Calculate win ratio for each player
                    winRatio: { $divide: ['$Today.NumberOfWins', '$Today.NumberOfTrades'] }
                }
            },
            {
                $match: {
                    'Today.NumberOfTrades': { $gt: 0 } // Filter players with at least 50 trades for today
                }
            },
            {
                $sort: { winRatio: -1 } // Sort by win ratio in descending order
            },
            // {
            //     $limit: limit // Limit the results to the specified number
            // },
            {
                $lookup: {
                    from: 'users', // Collection name of the User model
                    localField: 'User',
                    foreignField: '_id',
                    as: 'users'
                }
            },
        ])

        return topPlayers.map((tp) => {
            const topWinRatioPlayer: ITopWinRatioPlayer = {
                UserId: (tp.users[0] as IUser)._id,
                Username: (tp.users[0] as IUser).Username,
                CountryCode: (tp.users[0] as IUser).CountryCode,
                Avatar: (tp.users[0] as IUser).Avatar,
                NumberOfTrades: tp.Today.NumberOfTrades,
                NumberOfWins: tp.Today.NumberOfWins,
                WinRatio: tp.winRatio
            }

            return topWinRatioPlayer;
            
        })

    } catch (error) {
        Log.error(`TradingStatisticService:: getTopWinRatioPlayers => Error fetching top win ratio players: ${error}`);
        throw error; // Throw error for handling in caller function
    }
}


export async function getTop100WinnersForToday(): Promise<ITop100Winner[]> {
    try {
        const topWinners = await TradingStatistics
            .find({'Today.NetProfit': { $gt: 0 } }) // Filter for net profit greater than 0
            .populate({
                path: 'User',
                select: 'Username CountryCode Avatar',
            })
            .sort({ 'Today.NetProfit': -1 }) // Sort by net profit in descending order
            .limit(100); // Limit the results to 100 documents

            return topWinners.map((tw) => ({
                Username: (tw.User as IUser).Username,
                CountryCode: (tw.User as IUser).CountryCode,
                Avatar: (tw.User as IUser).Avatar,
                NumberOfTrades: tw.Today.NumberOfTrades,
                NumberOfWins: tw.Today.NumberOfWins,
                NetProfit: tw.Today.NetProfit
            })) as ITop100Winner[]
    } catch (error) {
        console.error('Error retrieving top winners:', error);
        throw error;
    }
}

export async function getTop100WinnersForThisMonth(): Promise<ITop100Winner[]> {
    try {
        const topWinners = await TradingStatistics
            .find({'ThisMonth.NetProfit': { $gt: 0 } }) // Filter for net profit greater than 0
            .populate({
                path: 'User',
                select: 'Username CountryCode Avatar',
            })
            .sort({ 'ThisMonth.NetProfit': -1 }) // Sort by net profit in descending order
            .limit(100); // Limit the results to 100 documents

            return topWinners.map((tw) => ({
                Username: (tw.User as IUser).Username,
                CountryCode: (tw.User as IUser).CountryCode,
                Avatar: (tw.User as IUser).Avatar,
                NumberOfTrades: tw.ThisMonth.NumberOfTrades,
                NumberOfWins: tw.ThisMonth.NumberOfWins,
                NetProfit: tw.ThisMonth.NetProfit
            })) as ITop100Winner[]
    } catch (error) {
        console.error('Error retrieving top winners:', error);
        throw error;
    }
}


export async function getTop100WinnersForThisWeek(): Promise<ITop100Winner[]> {
    try {
        const topWinners = await TradingStatistics
            .find({'ThisWeek.NetProfit': { $gt: 0 } }) // Filter for net profit greater than 0
            .populate({
                path: 'User',
                select: 'Username CountryCode Avatar',
            })
            .sort({ 'ThisWeek.NetProfit': -1 }) // Sort by net profit in descending order
            .limit(100); // Limit the results to 100 documents

            return topWinners.map((tw) => ({
                Username: (tw.User as IUser).Username,
                CountryCode: (tw.User as IUser).CountryCode,
                Avatar: (tw.User as IUser).Avatar,
                NumberOfTrades: tw.ThisWeek.NumberOfTrades,
                NumberOfWins: tw.ThisWeek.NumberOfWins,
                NetProfit: tw.ThisWeek.NetProfit
            })) as ITop100Winner[]
    } catch (error) {
        console.error('Error retrieving top winners:', error);
        throw error;
    }
}

export async function getTop100WinnersForAllTime(): Promise<ITop100Winner[]> {
    try {
        const topWinners = await TradingStatistics
            .find({'AllTime.NetProfit': { $gt: 0 } }) // Filter for net profit greater than 0
            .populate({
                path: 'User',
                select: 'Username CountryCode Avatar',
            })
            .sort({ 'AllTime.NetProfit': -1 }) // Sort by net profit in descending order
            .limit(100); // Limit the results to 100 documents

            return topWinners.map((tw) => ({
                Username: (tw.User as IUser).Username,
                CountryCode: (tw.User as IUser).CountryCode,
                Avatar: (tw.User as IUser).Avatar,
                NumberOfTrades: tw.AllTime.NumberOfTrades,
                NumberOfWins: tw.AllTime.NumberOfWins,
                NetProfit: tw.AllTime.NetProfit
            })) as ITop100Winner[]
    } catch (error) {
        console.error('Error retrieving top winners:', error);
        throw error;
    }
}

