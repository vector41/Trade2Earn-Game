"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = __importDefault(require("../middlewares/Log"));
const BalanceService_1 = require("./BalanceService");
class AdminService {
    static feeTo(fee, userId, session) {
        try {
            (0, BalanceService_1.singleUpdateBalance)(userId, fee, session);
        }
        catch (error) {
            // Handle errors
            Log_1.default.error(`AdminService :: feeTo => Error increasing balance: ${error}`);
            throw error;
        }
    }
}
exports.default = AdminService;
