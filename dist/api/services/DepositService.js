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
exports.depositRecord = exports.RecordType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ICoinManager_1 = require("../../providers/CoinManager/Interfaces/ICoinManager");
const Record_1 = __importDefault(require("../../models/Record"));
const Log_1 = __importDefault(require("../middlewares/Log"));
const BalanceService_1 = require("./BalanceService");
const GlobalState_1 = require("../../providers/GlobalState");
const Config_1 = __importDefault(require("../../providers/CoinManager/Config"));
const utils_1 = __importDefault(require("../../utils/utils"));
var RecordType;
(function (RecordType) {
    RecordType["DEPOSIT"] = "deposit";
    RecordType["WITHDRAW"] = "withdraw";
})(RecordType || (exports.RecordType = RecordType = {}));
function depositRecord(deposit) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Check if a record with the same recordId exists
            const existingRecord = yield Record_1.default.findOne({
                recordId: deposit.recordId,
            }).session(session);
            if (existingRecord) {
                if (deposit.status === existingRecord.status) {
                    yield session.abortTransaction();
                    return { success: true };
                }
                existingRecord.status = deposit.status;
                if (deposit.status === ICoinManager_1.OrderStatus.SUCCESS) {
                    const orderId = utils_1.default.generateOrderId();
                    const userTransferAmount = (Number(deposit.amount) *
                        (1 - 0.031 / 100)).toString();
                    try {
                        yield GlobalState_1.GlobalState.coinManager.userTransfer(deposit.userId, Config_1.default.CCPaymentApiId, Config_1.default.USDT, orderId, userTransferAmount, 'DepositToAdmin');
                        existingRecord.accepted = true;
                    }
                    catch (error) {
                        existingRecord.accepted = false;
                        Log_1.default.error(`DepositService :: DepositToAdmin: ${error}`);
                    }
                    // Save the updated record to the database
                    const savedRecord = yield existingRecord.save({ session });
                    const { data: updatedBalance } = yield (0, BalanceService_1.singleUpdateBalance)(savedRecord.userId, savedRecord.amount, session);
                    // Commit the transaction
                    yield session.commitTransaction();
                    // Return the updated record
                    return { success: true, data: { savedRecord, updatedBalance } };
                }
                const savedRecord = yield existingRecord.save({ session });
                // Commit the transaction
                yield session.commitTransaction();
                return { success: true, data: { savedRecord } };
            }
            else {
                // If no record with the same recordId exists, create a new one
                const newRecord = new Record_1.default({
                    recordId: deposit.recordId,
                    userId: new mongoose_1.default.Types.ObjectId(deposit.userId),
                    coinId: deposit.coinId,
                    status: deposit.status,
                    chain: deposit.chain,
                    amount: Number(deposit.amount),
                    txId: deposit.txId,
                    toAddress: deposit.toAddress,
                    fromAddress: deposit.fromAddress,
                    type: RecordType.DEPOSIT,
                    accepted: false,
                });
                if (deposit.status === ICoinManager_1.OrderStatus.SUCCESS) {
                    const orderId = utils_1.default.generateOrderId();
                    const userTransferAmount = (Number(deposit.amount) *
                        (1 - 0.031 / 100)).toString();
                    try {
                        yield GlobalState_1.GlobalState.coinManager.userTransfer(deposit.userId, Config_1.default.CCPaymentApiId, Config_1.default.USDT, orderId, userTransferAmount, 'DepositToAdmin');
                        newRecord.accepted = true;
                    }
                    catch (error) {
                        newRecord.accepted = false;
                        Log_1.default.error(`DepositService :: DepositToAdmin: ${error}`);
                    }
                    const savedRecord = yield newRecord.save({ session });
                    const { data: updatedBalance } = yield (0, BalanceService_1.singleUpdateBalance)(savedRecord.userId, savedRecord.amount, session);
                    // Commit the transaction
                    yield session.commitTransaction();
                    return { success: true, data: { savedRecord, updatedBalance } };
                }
                const savedRecord = yield newRecord.save({ session });
                // Commit the transaction
                yield session.commitTransaction();
                return { success: true, data: { savedRecord } };
            }
        }
        catch (error) {
            // Abort the transaction if an error occurs
            yield session.abortTransaction();
            Log_1.default.error(`DepositService :: depositRecord: ${error}`);
            return { success: false, error };
        }
        finally {
            // End the session
            session.endSession();
        }
    });
}
exports.depositRecord = depositRecord;
