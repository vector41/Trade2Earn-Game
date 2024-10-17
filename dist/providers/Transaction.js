"use strict";
/**
 * Represents transaction-related functionalities such as listening for trades, analyzing transactions, and saving statistics.
 * Author: Isom D. <isom19901122@gmail.com>
 */
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
const alchemy_sdk_1 = require("alchemy-sdk");
const ethers_1 = require("ethers");
const Locals_1 = __importDefault(require("./Locals"));
const GlobalState_1 = require("./GlobalState");
const Dashboard_1 = require("./Dashboard");
const TransactionService_1 = require("../api/services/TransactionService");
const UserService_1 = require("../api/services/UserService");
const TradingStatisticsService_1 = require("../api/services/TradingStatisticsService");
const AffiliateService_1 = require("../api/services/AffiliateService");
const mongoose_1 = __importDefault(require("mongoose"));
const BalanceService_1 = require("../api/services/BalanceService");
const Publisher_1 = require("./Publisher");
class Transaction {
    constructor() {
        this.fee = Locals_1.default.config().fee;
        this.tier1Fee = Locals_1.default.config().tier1;
        this.tier2Fee = Locals_1.default.config().tier2;
        this.tier3Fee = Locals_1.default.config().tier3;
        this.poolId30_15 = Locals_1.default.config().poolId30_15;
        this.settings = {
            apiKey: Locals_1.default.config().alchemyApiKey,
            network: alchemy_sdk_1.Network.MATIC_MAINNET,
        };
        this.alchemy = new alchemy_sdk_1.Alchemy(this.settings);
        this.filter = {
            address: Locals_1.default.config().smartContractAddress,
            topics: [
                ethers_1.ethers.id('TradePlaced(bytes,address,uint256,string,uint256,bytes,address,string,string,int64,string)'),
            ],
        };
        this.transactions = [];
    }
    static createInstance() {
        return new Transaction();
    }
    decode(data) {
        return ethers_1.ethers.AbiCoder.defaultAbiCoder().decode([
            'bytes',
            'address',
            'uint256',
            'string',
            'uint256',
            'string',
            'string',
            'int64',
            'string',
        ], data);
    }
    getNewTotal(direction, poolId) {
        return this.getFilteredTransactionsByPoolId(poolId)
            .filter((t) => t.Direction === direction)
            .reduce((accumulator, currentValue) => {
            return accumulator + currentValue.TradeSize;
        }, 0);
    }
    listen(User, PoolId, Direction, TradeSize, IsBot) {
        const txn = {
            TradeSize,
            Direction,
            PoolId,
            NewTotal: this.getNewTotal(Direction, PoolId) + TradeSize,
            Avatar: User.Avatar,
            CountryCode: User.CountryCode,
            RoundId: GlobalState_1.GlobalState.gameRound.roundId,
            User: User._id,
            IsBot,
        };
        GlobalState_1.GlobalState.allTimeWinsPaid += txn.TradeSize;
        this.transactions.push(txn);
        GlobalState_1.GlobalState.gameRound.publisher.broadcast(JSON.stringify(txn));
        return txn;
    }
    removeAllListeners() {
        this.alchemy.ws.removeAllListeners();
    }
    setWin(startPrice, endPrice, poolId) {
        const transactionsFiltedByPoolId = this.getFilteredTransactionsByPoolId(poolId);
        if (startPrice === endPrice) {
            this.clear(poolId);
            return;
        }
        for (let i = 0; i < transactionsFiltedByPoolId.length; i++) {
            if ((transactionsFiltedByPoolId[i].Direction &&
                endPrice > startPrice) ||
                (!transactionsFiltedByPoolId[i].Direction &&
                    endPrice < startPrice))
                transactionsFiltedByPoolId[i].Result = true;
            else
                transactionsFiltedByPoolId[i].Result = false;
        }
    }
    clear(poolId) {
        this.transactions = this.transactions.filter((txn) => txn.PoolId !== poolId);
    }
    getFilteredTransactionsByPoolId(poolId) {
        return this.transactions.filter((txn) => txn.PoolId === poolId);
    }
    save(poolId, roundId) {
        return __awaiter(this, void 0, void 0, function* () {
            // this.transactions = utils.removeDuplicates<ITransaction>(
            //     this.transactions,
            //     'TxnHash'
            // )
            yield (0, TransactionService_1.addBatchTransactions)(this.getFilteredTransactionsByPoolId(poolId).filter((tx) => !tx.IsBot));
            yield this.analyzeTransactionAndSave(poolId);
            this.clear(poolId);
        });
    }
    getTotalPool(direction, poolId) {
        const FilteredTransactionsByPoolId = this.getFilteredTransactionsByPoolId(poolId);
        const upTotalPoolSize = FilteredTransactionsByPoolId.filter((tx) => tx.Direction === direction).reduce((sum, tx) => sum + tx.TradeSize, 0);
        const maxNewTotal = FilteredTransactionsByPoolId.filter((tx) => tx.Direction === direction).reduce((maxNewTotal, tx) => Math.max(maxNewTotal, tx.NewTotal), 0);
        return Math.max(upTotalPoolSize, maxNewTotal);
    }
    getTotalPoolWithoutBot(direction, poolId) {
        const NotBotTxns = this.getFilteredTransactionsByPoolId(poolId).filter((txn) => !txn.IsBot);
        const totalPoolSize = NotBotTxns.filter((tx) => tx.Direction === direction).reduce((sum, tx) => sum + tx.TradeSize, 0);
        return totalPoolSize;
    }
    getNetProfitAndFee(transaction, upPoolSize, downPoolSize, upPoolSizeNoBot, downPoolSizeNoBot) {
        const tradeSize = transaction.TradeSize;
        if (!transaction.Result) {
            return { netProfit: -tradeSize, commission: 0 };
        }
        let profit = (transaction.Direction
            ? tradeSize / upPoolSize
            : tradeSize / downPoolSize) *
            (transaction.Direction ? downPoolSize : upPoolSize);
        let profitNoBot = (transaction.Direction
            ? tradeSize / upPoolSizeNoBot
            : tradeSize / downPoolSizeNoBot) *
            (transaction.Direction ? downPoolSizeNoBot : upPoolSizeNoBot);
        const netProfit = profit * (1 - this.fee);
        const commission = profitNoBot * this.fee;
        return { netProfit, commission };
    }
    analyzeTransactionAndSave(poolId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            Dashboard_1.Dashboard.saveWinsPaid();
            const filteredTransactionsByPoolId = this.getFilteredTransactionsByPoolId(poolId);
            const NotbotTransactions = filteredTransactionsByPoolId.filter((tx) => !tx.IsBot);
            if (NotbotTransactions.length === 0)
                return;
            const tradingStatistics = [];
            const affiliateStatistics = [];
            const upPoolSize = this.getTotalPool(true, poolId);
            const downPoolSize = this.getTotalPool(false, poolId);
            const upPoolSizeNoBot = this.getTotalPoolWithoutBot(true, poolId);
            const downPoolSizeNoBot = this.getTotalPoolWithoutBot(false, poolId);
            // Create a Map to store address indices
            const addressIndices = new Map();
            const userIds = [];
            let totalFee = 0;
            NotbotTransactions.forEach((transaction) => {
                const { netProfit, commission } = this.getNetProfitAndFee(transaction, upPoolSize, downPoolSize, upPoolSizeNoBot, downPoolSizeNoBot);
                const statistics = {
                    NetProfit: netProfit,
                    NumberOfTrades: 1,
                    NumberOfWins: transaction.Result ? 1 : 0,
                    TradingVolume: transaction.TradeSize,
                };
                tradingStatistics.push({
                    User: transaction.User,
                    ThisMonth: statistics,
                    ThisWeek: statistics,
                    Today: statistics,
                    AllTime: statistics,
                });
                if (!transaction.Result)
                    return;
                const userId = transaction.User;
                if (addressIndices.has(userId)) {
                    // Address already exists, update distribution
                    const index = addressIndices.get(userId);
                    affiliateStatistics[index].Distribution[0] +=
                        commission * this.tier1Fee;
                    affiliateStatistics[index].Distribution[1] +=
                        commission * this.tier2Fee;
                    affiliateStatistics[index].Distribution[2] +=
                        commission * this.tier3Fee;
                }
                else {
                    // Address doesn't exist, push new item
                    addressIndices.set(userId, affiliateStatistics.length);
                    affiliateStatistics.push({
                        User: userId,
                        Distribution: [
                            commission * this.tier1Fee,
                            commission * this.tier2Fee,
                            commission * this.tier3Fee,
                        ],
                    });
                    userIds.push(userId);
                }
                totalFee += commission;
            });
            const { success, data: users, error } = yield (0, UserService_1.getBatchUsers)(userIds);
            if (success && users) {
                // Iterate over affiliateStatistics
                affiliateStatistics.forEach((affiliate) => {
                    // Find the corresponding user by Address
                    const user = users.find((u) => String(u._id) === String(affiliate.User));
                    if (user) {
                        // Update InvitedPath with affiliate statistics
                        affiliate.InvitedPath = user.InvitedPath.split('#');
                    }
                });
            }
            // Create a Map to store referralId indices
            const referralIdIndices = new Map();
            const affiliateReward = [];
            affiliateStatistics.forEach((aff) => {
                if (!aff.InvitedPath)
                    return;
                for (var i = 0; i < aff.InvitedPath.length; i++) {
                    if (referralIdIndices.has(aff.InvitedPath[i])) {
                        const index = referralIdIndices.get(aff.InvitedPath[i]);
                        affiliateReward[index][`Tier${i + 1}Paid`] +=
                            aff.Distribution[i];
                        affiliateReward[index][`Tier${i + 1}Unclaimed`] +=
                            aff.Distribution[i];
                    }
                    else {
                        referralIdIndices.set(aff.InvitedPath[i], affiliateReward.length);
                        const newAffReward = {
                            ReferralId: aff.InvitedPath[i],
                            Tier1Paid: 0,
                            Tier1Unclaimed: 0,
                            Tier2Paid: 0,
                            Tier2Unclaimed: 0,
                            Tier3Paid: 0,
                            Tier3Unclaimed: 0,
                        };
                        newAffReward[`Tier${i + 1}Paid`] +=
                            aff.Distribution[i];
                        newAffReward[`Tier${i + 1}Unclaimed`] +=
                            aff.Distribution[i];
                        affiliateReward.push(newAffReward);
                    }
                }
            });
            const balanceUpdates = NotbotTransactions.filter((ftxn) => ftxn.Result).map((ftxn) => {
                const { netProfit } = this.getNetProfitAndFee(ftxn, upPoolSize, downPoolSize, upPoolSizeNoBot, downPoolSizeNoBot);
                return {
                    Amount: ftxn.TradeSize + netProfit,
                    User: ftxn.User,
                };
            });
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                yield (0, TradingStatisticsService_1.updateBatchTradingStatistics)(tradingStatistics, session);
                yield (0, AffiliateService_1.updateBatchAffiliate)(affiliateReward, session);
                if (totalFee > 0) {
                    const weeklyChallengeShare = Locals_1.default.config().weeklyChallengeShare;
                    const revenue = 1 -
                        (weeklyChallengeShare +
                            this.tier1Fee +
                            this.tier2Fee +
                            this.tier3Fee);
                    const distrFee = [
                        {
                            Amount: totalFee * weeklyChallengeShare,
                            User: (_a = GlobalState_1.GlobalState.weeklyChallengeUser) === null || _a === void 0 ? void 0 : _a._id,
                        },
                        {
                            Amount: totalFee * revenue,
                            User: (_b = GlobalState_1.GlobalState.admin) === null || _b === void 0 ? void 0 : _b._id,
                        },
                    ];
                    yield (0, BalanceService_1.batchUpdateBalance)(distrFee, session);
                }
                const { success, data: updatedBalances } = yield (0, BalanceService_1.batchUpdateBalance)(balanceUpdates, session);
                if (success && balanceUpdates.length > 0) {
                    updatedBalances.forEach((ub) => {
                        const clientWS = GlobalState_1.GlobalState.gameRound.publisher.playerConnections.get(String(ub.User));
                        const message = {
                            messageType: Publisher_1.MessageType.BALANCE,
                            data: {
                                balance: ub.Balance,
                            },
                        };
                        clientWS === null || clientWS === void 0 ? void 0 : clientWS.send(JSON.stringify(message));
                    });
                }
                yield session.commitTransaction();
                yield session.endSession();
            }
            catch (error) {
                console.error('An error occurred:', error);
                // Handle the error as needed, such as rolling back the transaction
                yield session.abortTransaction();
                session.endSession();
            }
        });
    }
}
exports.default = Transaction;
