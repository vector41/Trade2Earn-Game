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
exports.withdrawRecord = exports.RecordType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Record_1 = __importDefault(require("../../models/Record"));
const Log_1 = __importDefault(require("../middlewares/Log"));
var RecordType;
(function (RecordType) {
    RecordType["DEPOSIT"] = "deposit";
    RecordType["WITHDRAW"] = "withdraw";
})(RecordType || (exports.RecordType = RecordType = {}));
function withdrawRecord(withdraw) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if a record with the same recordId exists
            const existingRecord = yield Record_1.default.findOne({
                recordId: withdraw.recordId,
            });
            if (existingRecord) {
                if (existingRecord.status === withdraw.status) {
                    return { success: true };
                }
                // If a record with the same recordId exists, update it
                existingRecord.status = withdraw.status;
                existingRecord.txId = withdraw.txId;
                // Save the updated record to the database
                const savedRecord = yield existingRecord.save();
                return { success: true, data: savedRecord };
            }
            else {
                // If no record with the same recordId exists, create a new one
                const newRecord = new Record_1.default({
                    recordId: withdraw.recordId,
                    userId: new mongoose_1.default.Types.ObjectId(withdraw.userId),
                    coinId: withdraw.coinId,
                    status: withdraw.status,
                    chain: withdraw.chain,
                    amount: Number(withdraw.amount),
                    txId: withdraw.txId,
                    toAddress: withdraw.toAddress,
                    fromAddress: withdraw.fromAddress,
                    type: RecordType.WITHDRAW,
                    accepted: true,
                });
                // Save the new record to the database
                const savedRecord = yield newRecord.save();
                // Return the newly created record
                return { success: true, data: savedRecord };
            }
        }
        catch (error) {
            Log_1.default.error(`WithdrawService :: withdrawRecord: ${error}`);
            return { success: false, error };
        }
    });
}
exports.withdrawRecord = withdrawRecord;
