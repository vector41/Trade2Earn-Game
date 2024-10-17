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
const GlobalState_1 = require("../../providers/GlobalState");
const ICoinManager_1 = require("../../providers/CoinManager/Interfaces/ICoinManager");
const Config_1 = __importDefault(require("../../providers/CoinManager/Config"));
const DepositService_1 = require("../services/DepositService");
const Publisher_1 = require("../../providers/Publisher");
const utils_1 = __importDefault(require("../../utils/utils"));
const Balance_1 = __importDefault(require("../../models/Balance"));
const mongoose_1 = __importDefault(require("mongoose"));
const WithdrawService_1 = require("../services/WithdrawService");
class CoinController {
    static getDepositAddressAndWithdrawFee(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user, chain } = req.body; // Assuming userId and chain are present in request body
            if (chain) {
                try {
                    const data = yield GlobalState_1.GlobalState.coinManager.getOrCreateUserDepositAddress(user._id, chain);
                    const { fee } = yield GlobalState_1.GlobalState.coinManager.getWithdrawFee(Config_1.default.USDT, chain);
                    return res.json({ result: true, address: data.address, chain, minWithdraw: Config_1.default.MinWithdraw, fee: Number(fee.amount) * 1.3 }); // Sending the address as response
                }
                catch (error) {
                    if (error instanceof Error) {
                        console.error('Error:', error.message);
                        return res.status(500).json({ error: error.message }); // Sending error message as response
                    }
                    else {
                        console.error('An unknown error occurred:', error);
                        return res.status(500).json({ error: 'An unknown error occurred' }); // Sending generic error message as response
                    }
                }
            }
            return res.status(400).send('Chain is required!');
        });
    }
    static getNetworks(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { coin } = yield GlobalState_1.GlobalState.coinManager.getCoinItem(Config_1.default.USDT);
                const networks = Object.keys(coin.networks)
                    .map((chain) => (Object.assign({}, coin.networks[chain])))
                    .filter((network) => network.canDeposit && network.canWithdraw);
                res.json({ result: true, networks }); // Sending the address as response
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error:', error.message);
                    res.status(500).json({ error: error.message }); // Sending error message as response
                }
                else {
                    console.error('An unknown error occurred:', error);
                    res.status(500).json({ error: 'An unknown error occurred' }); // Sending generic error message as response
                }
            }
        });
    }
    static getNetworkFeeAndMinWithdraw(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chain } = req.body;
            if (chain) {
                try {
                    const { fee } = yield GlobalState_1.GlobalState.coinManager.getWithdrawFee(Config_1.default.USDT, chain);
                    return res.send({
                        minWithdraw: Config_1.default.MinWithdraw,
                        fee: Number(fee.amount),
                    });
                }
                catch (error) {
                    if (error instanceof Error) {
                        console.error('Error:', error.message);
                        return res.status(500).json({ error: error.message }); // Sending error message as response
                    }
                    else {
                        console.error('An unknown error occurred:', error);
                        return res
                            .status(500)
                            .json({ error: 'An unknown error occurred' }); // Sending generic error message as response
                    }
                }
            }
            return res.status(400).send('Chain is required!');
        });
    }
    static withdraw(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chain, amount, user, toAddress } = req.body;
            if (chain && amount > 0) {
                const session = yield mongoose_1.default.startSession();
                try {
                    session.startTransaction();
                    const { fee } = yield GlobalState_1.GlobalState.coinManager.getWithdrawFee(Config_1.default.USDT, chain);
                    const balance = yield Balance_1.default.findOne({
                        User: user._id,
                    }).session(session);
                    if (Number.parseFloat(fee.amount) + Config_1.default.MinWithdraw > amount) {
                        yield session.abortTransaction();
                        yield session.endSession();
                        return res
                            .status(400)
                            .send('Enter an amount greater than the minimum allowed.');
                    }
                    if (balance && (balance === null || balance === void 0 ? void 0 : balance.Balance) < amount) {
                        yield session.abortTransaction();
                        yield session.endSession();
                        return res.status(400).send('Insufficient balance');
                    }
                    if (balance) {
                        const updatedBalance = yield Balance_1.default.findOneAndUpdate({ User: user._id, Balance: { $gte: amount } }, // Query condition to find the balance document for the user
                        { $inc: { Balance: -amount } }, // Reduce the balance by the specified amount
                        { new: true, session } // Return the updated document
                        ).then((balance) => __awaiter(this, void 0, void 0, function* () {
                            if (balance && (balance === null || balance === void 0 ? void 0 : balance.Balance) >= 0) {
                                yield GlobalState_1.GlobalState.coinManager.applyUserWithdrawToNetwork(Config_1.default.USDT, toAddress, `${utils_1.default.generateOrderId()}-${String(user._id)}`, Config_1.default.CCPaymentApiId, chain, String(amount));
                            }
                            return balance;
                        }));
                        yield session.commitTransaction();
                        yield session.endSession();
                        return res.send({
                            result: true,
                            balance: updatedBalance === null || updatedBalance === void 0 ? void 0 : updatedBalance.Balance,
                        });
                    }
                }
                catch (error) {
                    yield session.abortTransaction();
                    session.endSession();
                    if (error instanceof Error) {
                        console.error('Error:', error.message);
                        return res.status(500).json({ error: error.message }); // Sending error message as response
                    }
                    else {
                        console.error('An unknown error occurred:', error);
                        return res
                            .status(500)
                            .json({ error: 'An unknown error occurred' }); // Sending generic error message as response
                    }
                }
            }
            return res.status(400).send('Bad request');
        });
    }
    static webHook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // return res.send('success');
            const { headers, body } = req;
            if (Object.keys(body).length === 0) {
                return res.send("success");
            }
            try {
                const timestamp = headers['timestamp'] || '';
                const signature = headers['sign'] || '';
                const bodyText = JSON.stringify(body);
                const { type, msg } = req.body;
                if (timestamp &&
                    signature &&
                    utils_1.default.verifyCCPWebhook(bodyText, signature, Config_1.default.CCPaymentApiId, Config_1.default.CCPaymentAppSecret, timestamp) &&
                    type &&
                    msg &&
                    msg.coinId === Config_1.default.USDT) {
                    if (type === ICoinManager_1.WebHookMessageType.USER_DEPOSIT) {
                        const { record } = yield GlobalState_1.GlobalState.coinManager.getUserDepositRecord(msg.recordId);
                        const { success, data, error } = yield (0, DepositService_1.depositRecord)(record);
                        if (success && (data === null || data === void 0 ? void 0 : data.updatedBalance) && (data === null || data === void 0 ? void 0 : data.savedRecord)) {
                            const ws = GlobalState_1.GlobalState.gameRound.publisher.playerConnections.get(msg.userId);
                            ws === null || ws === void 0 ? void 0 : ws.send(JSON.stringify({
                                messageType: Publisher_1.MessageType.DEPOSIT,
                                data: {
                                    amount: data.savedRecord.amount,
                                    balance: data.updatedBalance.Balance,
                                },
                            }));
                        }
                        // if (!success) {
                        //     return res.status(400).send('Invalid Record')
                        // }
                        return res.send('success');
                    }
                    // Handles User Withdraw Event
                    if (type === ICoinManager_1.WebHookMessageType.USER_WITHDRAWAL) {
                        const { record } = yield GlobalState_1.GlobalState.coinManager.getUserWithdrawRecord(msg.recordId);
                        record.userId = record.orderId.split('-')[1];
                        // record.fromAddress = '0x'
                        // record.toAddress = record.ToAddress || record.toAddress
                        const { success, data: savedRecord } = yield (0, WithdrawService_1.withdrawRecord)(record);
                        if (success &&
                            (savedRecord === null || savedRecord === void 0 ? void 0 : savedRecord.status) === ICoinManager_1.OrderStatus.SUCCESS) {
                            // send withdraw message
                            const ws = GlobalState_1.GlobalState.gameRound.publisher.playerConnections.get(String(savedRecord.userId));
                            ws === null || ws === void 0 ? void 0 : ws.send(JSON.stringify({
                                messageType: Publisher_1.MessageType.NORMAL_ALERT,
                                data: `${savedRecord.amount} USDT withdraw successfully`,
                            }));
                        }
                        return res.send('success');
                    }
                }
                else {
                    res.status(400).send('Invalid signature');
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error:', error.message);
                    res.status(500).json({ error: error.message }); // Sending error message as response
                }
                else {
                    console.error('An unknown error occurred:', error);
                    res.status(500).json({ error: 'An unknown error occurred' }); // Sending generic error message as response
                }
            }
        });
    }
}
exports.default = CoinController;
