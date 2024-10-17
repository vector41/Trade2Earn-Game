import TransactionModel, {
    ITransaction,
    ITransactionModel,
} from '../../models/Transaction'
import Log from '../middlewares/Log'
import utils from '../../utils/utils'
import { IFullStatistics } from '../../interfaces/IFullStatistics'
import { GlobalState } from '../../providers/GlobalState'
import { IReturnData } from '../../interfaces/IReturnData'
import { ObjectId } from 'mongoose'
import TradingStatistics, { ITradingStatistics } from '../../models/TradingStatistics'

export const addBatchTransactions = async (
    transactions: ITransaction[]
): Promise<IReturnData<ITransaction[]>> => {
    try {
        const insertedTransactions =
            await TransactionModel.insertMany<ITransaction>(transactions)
        return { success: true, data: insertedTransactions }
    } catch (error: any) {
        Log.error(
            `TransactionService :: Error adding batch transactions: ${error}`
        )
        return { success: false, error }
    }
}

export const getTransactionsByUser = async (
    User: ObjectId,
    offset: number = 0,
    limit: number = 100
): Promise<IReturnData<ITransactionModel[]>> => {
    try {
        // Find transactions where the User field matches the provided user
        const transactions = await TransactionModel.find({ User }, [
            'TradeSize',
            'Direction',
            'Result',
            'PoolId',
        ])
            .limit(limit)
            .skip(1)
        return { success: true, data: transactions }
    } catch (error) {
        // Handle any errors
        Log.error(
            `TransactionService :: Error filtering transactions by User: ${error}`
        )

        return { success: false, error }
    }
}

export const get24HWinRatio = async (): Promise<IReturnData<number>> => {
    try {
        const winRatio: { winRatio: number }[] =
            await TransactionModel.aggregate([
                { $sort: { _id: -1 } }, // Sort transactions by _id in descending order
                { $limit: 30000 }, // Limit the aggregation to the first 10000 documents
                {
                    $group: {
                        _id: null,
                        totalTransactions: { $sum: 1 },
                        totalWins: {
                            $sum: { $cond: [{ $eq: ['$Result', true] }, 1, 0] },
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        winRatio: {
                            $cond: [
                                { $eq: ['$totalTransactions', 0] },
                                0,
                                {
                                    $divide: [
                                        '$totalWins',
                                        '$totalTransactions',
                                    ],
                                },
                            ],
                        },
                    },
                },
            ])

        return { success: true, data: winRatio[0].winRatio }
    } catch (error: any) {
        Log.error(
            `TransactionService :: Error occurred while calculating win ratio: ${error}`
        )
        return { success: false, error }
    }
}

export const getNumberOfUsers = async (): Promise<IReturnData<number>> => {
    const twentyFourHoursAgo = utils.getTimestamp() - 60 * 60 * 24

    try {
        const numbersOfUsers = await TransactionModel.aggregate([
            {
                $match: {
                    CreatedAt: { $gte: twentyFourHoursAgo },
                },
            },
            {
                $group: {
                    _id: '$User',
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                },
            },
        ])

        return {
            success: true,
            data: numbersOfUsers.length > 0 ? numbersOfUsers[0].totalCount : 0,
        }
    } catch (error) {
        return { success: false, error }
    }
}

export const getFullStatistics = async (): Promise<
    IReturnData<IFullStatistics>
> => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        const statistics = await TransactionModel.aggregate([
            {
                $match: {
                    CreatedAt: { $gte: twentyFourHoursAgo },
                },
            },
            {
                $group: {
                    _id: null,
                    totalVolume: { $sum: '$TradeSize' }, // Summing up the tradeSize field for each group
                    distinctUseres: { $addToSet: '$User' }, // Collecting distinct addresses
                    totalTransactions: { $sum: 1 }, // Counting total transactions
                    totalWins: {
                        $sum: { $cond: [{ $eq: ['$Result', true] }, 1, 0] },
                    }, // Counting total wins
                },
            },
            {
                $project: {
                    _id: 0,
                    tradingVolume: '$totalVolume',
                    numberOfUsers: { $size: '$distinctUseres' }, // Counting the size of the distinctUseres array
                    winRatio: {
                        $cond: [
                            { $eq: ['$totalTransactions', 0] },
                            0,
                            { $divide: ['$totalWins', '$totalTransactions'] },
                        ],
                    }, // Calculating win ratio
                },
            },
        ])

        const { tradingVolume, numberOfUsers, winRatio } =
            statistics.length > 0
                ? statistics[0]
                : { tradingVolume: 0, numberOfUsers: 0, winRatio: 0 }

        return {
            success: true,
            data: {
                WinRatioFor24H: winRatio,
                LivePlayersFor24H: numberOfUsers,
                WinsPaidFor24H: tradingVolume,
            },
        }
    } catch (error) {
        Log.error(
            `TransactionService :: Error occurred while calculating 24-hour metrics: ${error}`
        )

        return { success: false, error }
    }
}


