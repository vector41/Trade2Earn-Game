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
const Balance_1 = __importDefault(require("../../models/Balance"));
const Log_1 = __importDefault(require("../middlewares/Log"));
class BalanceController {
    static getBalance(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req.body;
                // Find the balance document for the specified user ID
                const balance = yield Balance_1.default.findOne({ User: user._id }).exec();
                if (!balance) {
                    return res
                        .status(404)
                        .json({ message: 'Balance not found for the user' });
                }
                res.status(200).send({ result: true, balance: balance.Balance, coin: balance.Coin });
            }
            catch (error) {
                Log_1.default.error(`BalanceContgroller:: getBalance() : Error retrieving user balance: ${error}`);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
}
exports.default = BalanceController;
