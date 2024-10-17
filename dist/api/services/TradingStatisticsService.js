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
exports.getTop100WinnersForAllTime = exports.getTop100WinnersForThisWeek = exports.getTop100WinnersForThisMonth = exports.getTop100WinnersForToday = exports.getTopWinRatioPlayers = exports.getHighRollersForToday = exports.updateBatchTradingStatistics = void 0;
const TradingStatistics_1 = __importDefault(require("../../models/TradingStatistics"));
const Log_1 = __importDefault(require("../middlewares/Log"));
const updateBatchTradingStatistics = (statistics, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create an array to store bulk write operations
        const bulkOperations = [];
        for (const statistic of statistics) {
            // Define the filter criteria to find existing statistics
            const filter = { User: statistic.User };
            // Define the update operation
            const update = {
                $inc: {
                    // Increment the fields by the corresponding values from the incoming statistic
                    'AllTime.NetProfit': statistic.AllTime.NetProfit,
                    'AllTime.NumberOfTrades': statistic.AllTime.NumberOfTrades,
                    'AllTime.NumberOfWins': statistic.AllTime.NumberOfWins,
                    'AllTime.TradingVolume': statistic.AllTime.TradingVolume,
                    'ThisMonth.NetProfit': statistic.ThisMonth.NetProfit,
                    'ThisMonth.NumberOfTrades': statistic.ThisMonth.NumberOfTrades,
                    'ThisMonth.NumberOfWins': statistic.ThisMonth.NumberOfWins,
                    'ThisMonth.TradingVolume': statistic.ThisMonth.TradingVolume,
                    'ThisWeek.NetProfit': statistic.ThisWeek.NetProfit,
                    'ThisWeek.NumberOfTrades': statistic.ThisWeek.NumberOfTrades,
                    'ThisWeek.NumberOfWins': statistic.ThisWeek.NumberOfWins,
                    'ThisWeek.TradingVolume': statistic.ThisWeek.TradingVolume,
                    'Today.NetProfit': statistic.Today.NetProfit,
                    'Today.NumberOfTrades': statistic.Today.NumberOfTrades,
                    'Today.NumberOfWins': statistic.Today.NumberOfWins,
                    'Today.TradingVolume': statistic.Today.TradingVolume,
                },
            };
            // Create an updateOne operation for each statistic
            bulkOperations.push({
                updateOne: {
                    filter,
                    update,
                },
            });
        }
        // Execute the bulk write operation
        yield TradingStatistics_1.default.bulkWrite(bulkOperations, { session });
        return { success: true };
    }
    catch (error) {
        // if(session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }
        Log_1.default.error(`TradingStatisticsService :: updateBatchTradingStatistics: ${error}`);
        // return { success: false, error }
        throw error;
    }
});
exports.updateBatchTradingStatistics = updateBatchTradingStatistics;
const getHighRollersForToday = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find users with high net profit for today
        const highRollers = yield TradingStatistics_1.default.find({
            'Today.TradingVolume': { $gt: 0 },
        })
            .populate({
            path: 'User',
            select: 'Username CountryCode Avatar ',
        })
            .select('Today.TradingVolume Today.NumberOfTrades')
            .sort({ 'Today.TradingVolume': -1 }); // Sort in descending order of net profit
        return highRollers.map((hr) => ({
            UserId: hr.User._id,
            Username: hr.User.Username,
            CountryCode: hr.User.CountryCode,
            Avatar: hr.User.Avatar,
            Turnover: hr.Today.TradingVolume,
            NumberOfTrades: hr.Today.NumberOfTrades,
        }));
    }
    catch (error) {
        console.error('Error fetching high rollers:', error);
        throw error; // Handle the error appropriately
    }
});
exports.getHighRollersForToday = getHighRollersForToday;
function getTopWinRatioPlayers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topPlayers = yield TradingStatistics_1.default.aggregate([
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
            ]);
            return topPlayers.map((tp) => {
                const topWinRatioPlayer = {
                    UserId: tp.users[0]._id,
                    Username: tp.users[0].Username,
                    CountryCode: tp.users[0].CountryCode,
                    Avatar: tp.users[0].Avatar,
                    NumberOfTrades: tp.Today.NumberOfTrades,
                    NumberOfWins: tp.Today.NumberOfWins,
                    WinRatio: tp.winRatio
                };
                return topWinRatioPlayer;
            });
        }
        catch (error) {
            Log_1.default.error(`TradingStatisticService:: getTopWinRatioPlayers => Error fetching top win ratio players: ${error}`);
            throw error; // Throw error for handling in caller function
        }
    });
}
exports.getTopWinRatioPlayers = getTopWinRatioPlayers;
function getTop100WinnersForToday() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topWinners = yield TradingStatistics_1.default
                .find({ 'Today.NetProfit': { $gt: 0 } }) // Filter for net profit greater than 0
                .populate({
                path: 'User',
                select: 'Username CountryCode Avatar',
            })
                .sort({ 'Today.NetProfit': -1 }) // Sort by net profit in descending order
                .limit(100); // Limit the results to 100 documents
            return topWinners.map((tw) => ({
                Username: tw.User.Username,
                CountryCode: tw.User.CountryCode,
                Avatar: tw.User.Avatar,
                NumberOfTrades: tw.Today.NumberOfTrades,
                NumberOfWins: tw.Today.NumberOfWins,
                NetProfit: tw.Today.NetProfit
            }));
        }
        catch (error) {
            console.error('Error retrieving top winners:', error);
            throw error;
        }
    });
}
exports.getTop100WinnersForToday = getTop100WinnersForToday;
function getTop100WinnersForThisMonth() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topWinners = yield TradingStatistics_1.default
                .find({ 'ThisMonth.NetProfit': { $gt: 0 } }) // Filter for net profit greater than 0
                .populate({
                path: 'User',
                select: 'Username CountryCode Avatar',
            })
                .sort({ 'ThisMonth.NetProfit': -1 }) // Sort by net profit in descending order
                .limit(100); // Limit the results to 100 documents
            return topWinners.map((tw) => ({
                Username: tw.User.Username,
                CountryCode: tw.User.CountryCode,
                Avatar: tw.User.Avatar,
                NumberOfTrades: tw.ThisMonth.NumberOfTrades,
                NumberOfWins: tw.ThisMonth.NumberOfWins,
                NetProfit: tw.ThisMonth.NetProfit
            }));
        }
        catch (error) {
            console.error('Error retrieving top winners:', error);
            throw error;
        }
    });
}
exports.getTop100WinnersForThisMonth = getTop100WinnersForThisMonth;
function getTop100WinnersForThisWeek() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topWinners = yield TradingStatistics_1.default
                .find({ 'ThisWeek.NetProfit': { $gt: 0 } }) // Filter for net profit greater than 0
                .populate({
                path: 'User',
                select: 'Username CountryCode Avatar',
            })
                .sort({ 'ThisWeek.NetProfit': -1 }) // Sort by net profit in descending order
                .limit(100); // Limit the results to 100 documents
            return topWinners.map((tw) => ({
                Username: tw.User.Username,
                CountryCode: tw.User.CountryCode,
                Avatar: tw.User.Avatar,
                NumberOfTrades: tw.ThisWeek.NumberOfTrades,
                NumberOfWins: tw.ThisWeek.NumberOfWins,
                NetProfit: tw.ThisWeek.NetProfit
            }));
        }
        catch (error) {
            console.error('Error retrieving top winners:', error);
            throw error;
        }
    });
}
exports.getTop100WinnersForThisWeek = getTop100WinnersForThisWeek;
function getTop100WinnersForAllTime() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topWinners = yield TradingStatistics_1.default
                .find({ 'AllTime.NetProfit': { $gt: 0 } }) // Filter for net profit greater than 0
                .populate({
                path: 'User',
                select: 'Username CountryCode Avatar',
            })
                .sort({ 'AllTime.NetProfit': -1 }) // Sort by net profit in descending order
                .limit(100); // Limit the results to 100 documents
            return topWinners.map((tw) => ({
                Username: tw.User.Username,
                CountryCode: tw.User.CountryCode,
                Avatar: tw.User.Avatar,
                NumberOfTrades: tw.AllTime.NumberOfTrades,
                NumberOfWins: tw.AllTime.NumberOfWins,
                NetProfit: tw.AllTime.NetProfit
            }));
        }
        catch (error) {
            console.error('Error retrieving top winners:', error);
            throw error;
        }
    });
}
exports.getTop100WinnersForAllTime = getTop100WinnersForAllTime;
