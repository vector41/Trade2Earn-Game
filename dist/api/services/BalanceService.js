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
exports.singleUpdateCoin = exports.singleUpdateBalance = exports.batchUpdateBalance = void 0;
const Balance_1 = __importDefault(require("../../models/Balance"));
const Log_1 = __importDefault(require("../middlewares/Log"));
const batchUpdateBalance = (balanceUpdates, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bulkOps = balanceUpdates.map((update) => ({
            updateOne: {
                filter: { User: update.User },
                update: { $inc: { Balance: update.Amount } },
            },
        }));
        yield Balance_1.default.bulkWrite(bulkOps, { session });
        const userIds = balanceUpdates.map((b) => b.User);
        const updatedBalances = session
            ? yield Balance_1.default.find({
                User: { $in: userIds },
            })
                .session(session)
                .exec()
            : yield Balance_1.default.find({
                User: { $in: userIds },
            }).exec();
        return { success: true, data: updatedBalances };
    }
    catch (error) {
        // if(session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }
        Log_1.default.error(`BalanceService :: BalanceUpdate => Error during bulk write operation: ${error}`);
        // return { success: false, error }
        throw error;
        // Handle the error as needed
    }
});
exports.batchUpdateBalance = batchUpdateBalance;
const singleUpdateBalance = (User, Amount, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the balance document for the user and update it
        const updatedBalance = yield Balance_1.default.findOneAndUpdate({ User }, { $inc: { Balance: Amount } }, { new: true, session });
        // Handle the updated balance if needed
        // For example, you can return it or perform additional actions
        return { success: true, data: updatedBalance };
    }
    catch (error) {
        // if (session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }
        // Handle errors
        Log_1.default.error(`BalanceService :: singleUpdateBalance => Error increasing balance: ${error}`);
        // return { success: false, error }
        throw error;
    }
});
exports.singleUpdateBalance = singleUpdateBalance;
const singleUpdateCoin = (User, Amount, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the balance document for the user and update it
        const updatedBalance = yield Balance_1.default.findOneAndUpdate({ User }, { $inc: { Coin: Amount } }, { new: true, session });
        // Handle the updated balance if needed
        // For example, you can return it or perform additional actions
        return { success: true, data: updatedBalance };
    }
    catch (error) {
        // if (session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }
        // Handle errors
        Log_1.default.error(`BalanceService :: singleUpdateBalance => Error increasing balance: ${error}`);
        // return { success: false, error }
        throw error;
    }
});
exports.singleUpdateCoin = singleUpdateCoin;
