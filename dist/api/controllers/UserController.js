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
Object.defineProperty(exports, "__esModule", { value: true });
const TransactionService_1 = require("../services/TransactionService");
class UserController {
    static getUserGameHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user } = req.body;
                const { success, data, error } = yield (0, TransactionService_1.getTransactionsByUser)(user._id, 10);
                if (success && data) {
                    // If transactions are successfully retrieved, send them in the response
                    return res.status(200).send({ success: true, data: data });
                }
                else if (!success && error) {
                    // If there was an error while retrieving transactions, send an error response
                    return res.status(500).send({ success: false, error: error });
                }
                else {
                    // If no transactions found, send an empty array
                    return res.status(200).send({ success: true, data: [] });
                }
            }
            catch (error) {
                // Handle any unexpected errors
                console.error('Error in getUserGameHistory:', error);
                return res
                    .status(500)
                    .send({ success: false, error: 'Internal server error' });
            }
        });
    }
}
exports.default = UserController;
