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
exports.getFullStatistics = exports.getNumberOfUsers = exports.get24HWinRatio = exports.getTransactionsByUser = exports.addBatchTransactions = void 0;
const Transaction_1 = __importDefault(require("../../models/Transaction"));
const Log_1 = __importDefault(require("../middlewares/Log"));
const utils_1 = __importDefault(require("../../utils/utils"));
const addBatchTransactions = (transactions) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const insertedTransactions = yield Transaction_1.default.insertMany(transactions);
        return { success: true, data: insertedTransactions };
    }
    catch (error) {
        Log_1.default.error(`TransactionService :: Error adding batch transactions: ${error}`);
        return { success: false, error };
    }
});
exports.addBatchTransactions = addBatchTransactions;
const getTransactionsByUser = (User, offset = 0, limit = 100) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find transactions where the User field matches the provided user
        const transactions = yield Transaction_1.default.find({ User }, [
            'TradeSize',
            'Direction',
            'Result',
            'PoolId',
        ])
            .limit(limit)
            .skip(1);
        return { success: true, data: transactions };
    }
    catch (error) {
        // Handle any errors
        Log_1.default.error(`TransactionService :: Error filtering transactions by User: ${error}`);
        return { success: false, error };
    }
});
exports.getTransactionsByUser = getTransactionsByUser;
const get24HWinRatio = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const winRatio = yield Transaction_1.default.aggregate([
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
        ]);
        return { success: true, data: winRatio[0].winRatio };
    }
    catch (error) {
        Log_1.default.error(`TransactionService :: Error occurred while calculating win ratio: ${error}`);
        return { success: false, error };
    }
});
exports.get24HWinRatio = get24HWinRatio;
const getNumberOfUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const twentyFourHoursAgo = utils_1.default.getTimestamp() - 60 * 60 * 24;
    try {
        const numbersOfUsers = yield Transaction_1.default.aggregate([
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
        ]);
        return {
            success: true,
            data: numbersOfUsers.length > 0 ? numbersOfUsers[0].totalCount : 0,
        };
    }
    catch (error) {
        return { success: false, error };
    }
});
exports.getNumberOfUsers = getNumberOfUsers;
const getFullStatistics = () => __awaiter(void 0, void 0, void 0, function* () {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
        const statistics = yield Transaction_1.default.aggregate([
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
        ]);
        const { tradingVolume, numberOfUsers, winRatio } = statistics.length > 0
            ? statistics[0]
            : { tradingVolume: 0, numberOfUsers: 0, winRatio: 0 };
        return {
            success: true,
            data: {
                WinRatioFor24H: winRatio,
                LivePlayersFor24H: numberOfUsers,
                WinsPaidFor24H: tradingVolume,
            },
        };
    }
    catch (error) {
        Log_1.default.error(`TransactionService :: Error occurred while calculating 24-hour metrics: ${error}`);
        return { success: false, error };
    }
});
exports.getFullStatistics = getFullStatistics;
