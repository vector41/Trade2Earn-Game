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
exports.MessageType = void 0;
const ws_1 = __importDefault(require("ws"));
const Log_1 = __importDefault(require("../api/middlewares/Log"));
const Auth_1 = __importDefault(require("../api/middlewares/Auth"));
const Balance_1 = __importDefault(require("../models/Balance"));
const GlobalState_1 = require("./GlobalState");
const IRoundStatus_1 = require("../interfaces/IRoundStatus");
const Config_1 = __importDefault(require("../Config"));
var MessageType;
(function (MessageType) {
    MessageType[MessageType["BTC_PRICE"] = 0] = "BTC_PRICE";
    MessageType[MessageType["SUBMITTED_TRADER"] = 1] = "SUBMITTED_TRADER";
    MessageType[MessageType["ERROR"] = 2] = "ERROR";
    MessageType[MessageType["BALANCE"] = 3] = "BALANCE";
    MessageType[MessageType["DEPOSIT"] = 4] = "DEPOSIT";
    MessageType[MessageType["PONG"] = 5] = "PONG";
    MessageType[MessageType["WITHDRAW"] = 6] = "WITHDRAW";
    MessageType[MessageType["NORMAL_ALERT"] = 7] = "NORMAL_ALERT";
    MessageType[MessageType["SUBMIT_ORDER"] = 8] = "SUBMIT_ORDER";
})(MessageType || (exports.MessageType = MessageType = {}));
class Publisher {
    constructor(httpServer) {
        this.httpServer = httpServer;
        this.playerConnections = new Map();
        this.wss = new ws_1.default.Server({ server: httpServer });
        this.playerConnections = new Map();
        this.wss.on('connection', (ws) => {
            Log_1.default.info('Publisher :: Client was Connected!');
            this.onMessageFromClient(ws);
            this.onCloseFromClient(ws);
        });
    }
    static createInstance(httpServer) {
        return new Publisher(httpServer);
    }
    onCloseFromClient(ws) {
        // Event listener for closing the connection
        ws.on('close', () => {
            // Find and remove the WebSocket connection from the playerConnections map
            for (const [key, value] of this.playerConnections.entries()) {
                if (value === ws) {
                    this.playerConnections.delete(key);
                    Log_1.default.warn(`WebSocket disconnected for player ID ${key}`);
                    break;
                }
            }
            Log_1.default.error('Publisher :: Client disconnected');
        });
    }
    submitTradeOrder(user, poolId, direction, tradeSize, isBot, ws, updatedBalance) {
        const txn = GlobalState_1.GlobalState.txnManager.listen(user, poolId, direction, tradeSize, isBot);
        if (!isBot && updatedBalance && ws)
            ws.send(JSON.stringify({
                messageType: MessageType.BALANCE,
                data: {
                    balance: updatedBalance.Balance,
                    coin: updatedBalance.Coin
                },
            }));
        this.broadcast(JSON.stringify({
            messageType: MessageType.SUBMITTED_TRADER,
            data: {
                UserId: txn.User,
                TradeSize: txn.TradeSize,
                Direction: txn.Direction,
                PoolId: txn.PoolId,
                NewTotal: txn.NewTotal,
                CountryCode: txn.CountryCode,
                Avatar: txn.Avatar,
            },
        }));
    }
    onMessageFromClient(ws) {
        // Event listener for closing the connection
        ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            const data = JSON.parse(message.toString());
            {
                try {
                    const { jwtToken, msg } = data;
                    if (jwtToken && msg && msg === 'ping') {
                        const user = yield Auth_1.default.jwtToken2User(jwtToken);
                        this.playerConnections.set(String(user._id), ws);
                        ws.send(JSON.stringify({
                            messageType: MessageType.PONG,
                        }));
                        return;
                    }
                }
                catch (error) {
                    console.error('Error processing message from client:', error);
                }
            }
            try {
                if (GlobalState_1.GlobalState.stop) {
                    ws.send(JSON.stringify({
                        messageType: MessageType.ERROR,
                        data: 'Maintenance is in progress.',
                    }));
                    return;
                }
                const { jwtToken, direction, tradeSize, poolId, messageType } = data;
                if (messageType === MessageType.SUBMIT_ORDER && jwtToken && tradeSize && poolId) {
                    const user = yield Auth_1.default.jwtToken2User(jwtToken);
                    this.playerConnections.set(String(user._id), ws);
                    const balance = yield Balance_1.default.findOne({
                        User: user._id,
                    }).exec();
                    if ((balance && balance.Balance < tradeSize) || !balance) {
                        ws.send(JSON.stringify({
                            messageType: MessageType.ERROR,
                            data: 'Insufficient balance',
                        }));
                        return;
                    }
                    if (tradeSize > Config_1.default.maxTradeSize) {
                        ws.send(JSON.stringify({
                            messageType: MessageType.ERROR,
                            data: 'Maximum trade size exceeded',
                        }));
                        return;
                    }
                    if (tradeSize < Config_1.default.minTradeSize) {
                        ws.send(JSON.stringify({
                            messageType: MessageType.ERROR,
                            data: 'Minimum transaction size exceeded',
                        }));
                        return;
                    }
                    if (GlobalState_1.GlobalState.gameRound.currentPosition === IRoundStatus_1.RoundPosition.LOCKING || GlobalState_1.GlobalState.gameRound.currentPosition === IRoundStatus_1.RoundPosition.DISTRIBUTING) {
                        ws.send(JSON.stringify({
                            messageType: MessageType.ERROR,
                            data: 'Wait next round',
                        }));
                        return;
                    }
                    // Find the balance document for the user
                    Balance_1.default.findOneAndUpdate({ User: user._id, Balance: { $gte: tradeSize } }, // Query condition to find the balance document for the user
                    { $inc: { Balance: -tradeSize, Coin: tradeSize / 5 } }, // Reduce the balance by the specified amount
                    { new: true } // Return the updated document
                    )
                        .then((updatedBalance) => {
                        if (updatedBalance) {
                            this.submitTradeOrder(user, poolId, direction, tradeSize, false, ws, updatedBalance);
                        }
                        else {
                            console.log('Balance document not found for the user:', user._id);
                        }
                    })
                        .catch((error) => {
                        console.error('Error reducing balance:', error);
                    });
                }
            }
            catch (error) {
                console.error('Error processing message from client:', error);
            }
        }));
    }
    broadcast(message) {
        // Broadcast the message to all connected clients
        this.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(message);
            }
        });
    }
}
exports.default = Publisher;
