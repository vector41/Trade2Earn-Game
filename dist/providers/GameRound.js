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
const BalanceService_1 = require("../api/services/BalanceService");
const IRoundStatus_1 = require("../interfaces/IRoundStatus");
const utils_1 = __importDefault(require("../utils/utils"));
const Dashboard_1 = require("./Dashboard");
const GlobalState_1 = require("./GlobalState");
const Locals_1 = __importDefault(require("./Locals"));
const Publisher_1 = require("./Publisher");
const uuid_1 = require("uuid");
class GameRound {
    constructor(publisher, subscriber) {
        this.publisher = publisher;
        this.subscriber = subscriber;
        this.maxSlice = Locals_1.default.config().maxSlice;
        this.betDuration = Locals_1.default.config().betDuration;
        this.tradeDuration = Locals_1.default.config().tradeDuration;
        this.cycle = Locals_1.default.config().localCycle;
        this.batchSize = Locals_1.default.config().batchSize;
        this.tradeStartIndex = 0;
        this.endFrameIndex = 0;
        this.endPrice = 0;
        this.currentLocalFrameIndex = 0;
        this.startFrameIndex = 0;
        this.startPrice = 0;
        this.currentPosition = IRoundStatus_1.RoundPosition.NONE;
        this.previousPosition = IRoundStatus_1.RoundPosition.NONE;
        this.currentBtcPrice = { localTimeIndex: 0, value: 0 };
        this.roundId = (0, uuid_1.v4)();
        this.poolId = Locals_1.default.config().poolId30_15;
    }
    static createInstance(publisher, subscriber) {
        return new GameRound(publisher, subscriber);
    }
    initRound() {
        this.startFrameIndex = this.endFrameIndex;
        this.tradeStartIndex = this.startFrameIndex + this.betDuration;
        this.endFrameIndex =
            this.startFrameIndex + this.betDuration + this.tradeDuration;
        this.roundId = (0, uuid_1.v4)();
        GlobalState_1.GlobalState.botPlayers.generate(this.startFrameIndex, this.tradeStartIndex);
    }
    reset() {
        this.startPrice = 0;
        this.endPrice = 0;
    }
    start() {
        this.initRound();
        this.lifeCycle();
    }
    lifeCycle() {
        return __awaiter(this, void 0, void 0, function* () {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const lastPrice = this.subscriber.lastData === ''
                    ? 0
                    : Number(Number((_a = JSON.parse(this.subscriber.lastData)) === null || _a === void 0 ? void 0 : _a.p).toFixed(3));
                if (lastPrice > 0) {
                    if (this.endFrameIndex === this.currentLocalFrameIndex &&
                        !GlobalState_1.GlobalState.stop) {
                        this.endPrice = lastPrice;
                        this.previousPosition = this.currentPosition;
                        this.currentPosition = IRoundStatus_1.RoundPosition.DISTRIBUTING;
                        const txns = GlobalState_1.GlobalState.txnManager.getFilteredTransactionsByPoolId(this.poolId);
                        if (txns.length > 0) {
                            if (this.startPrice === this.endPrice ||
                                !(txns.filter((txn) => txn.Direction === true)
                                    .length > 0 &&
                                    txns.filter((txn) => txn.Direction === false)
                                        .length > 0)) {
                                const balanceUpdates = txns
                                    .filter((txn) => !txn.IsBot)
                                    .map((ftxn) => {
                                    return {
                                        Amount: ftxn.TradeSize,
                                        User: ftxn.User,
                                    };
                                });
                                (0, BalanceService_1.batchUpdateBalance)(balanceUpdates).then(({ data: updatedBalances, success, error }) => {
                                    if (success) {
                                        ;
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
                                });
                                GlobalState_1.GlobalState.txnManager.clear(this.poolId);
                            }
                            else {
                                GlobalState_1.GlobalState.txnManager.setWin(this.startPrice, this.endPrice, this.poolId);
                                GlobalState_1.GlobalState.txnManager.save(this.poolId, this.roundId);
                            }
                        }
                        this.initRound();
                        utils_1.default.delay(2500).then(() => __awaiter(this, void 0, void 0, function* () {
                            this.previousPosition = this.currentPosition;
                            this.currentPosition = IRoundStatus_1.RoundPosition.DISTRIBUTED;
                            Dashboard_1.Dashboard.addRoundResult(this.startPrice, this.endPrice, this.roundId, this.poolId);
                            this.reset();
                        }));
                    }
                    if (this.tradeStartIndex === this.currentLocalFrameIndex &&
                        !GlobalState_1.GlobalState.stop) {
                        this.startPrice = lastPrice;
                        this.previousPosition = this.currentPosition;
                        this.currentPosition = IRoundStatus_1.RoundPosition.LOCKING;
                    }
                    if (this.currentLocalFrameIndex < this.tradeStartIndex) {
                        GlobalState_1.GlobalState.botPlayers.trade(this.currentLocalFrameIndex);
                    }
                    this.currentBtcPrice = {
                        localTimeIndex: this.currentLocalFrameIndex,
                        value: lastPrice,
                    };
                    GlobalState_1.GlobalState.btcPrices.push(this.currentBtcPrice);
                    GlobalState_1.GlobalState.btcPrices = GlobalState_1.GlobalState.btcPrices.slice(-this.maxSlice);
                    const roundStatus = {
                        currentLocalFrameIndex: this.currentLocalFrameIndex,
                        currentBtcPrice: this.currentBtcPrice,
                        startFrameIndex: this.startFrameIndex,
                        startPrice: this.startPrice,
                        endPrice: this.endPrice,
                        currentPosition: this.currentPosition,
                        previousPosition: this.previousPosition,
                    };
                    this.currentLocalFrameIndex++;
                    this.publisher.broadcast(JSON.stringify({
                        messageType: Publisher_1.MessageType.BTC_PRICE,
                        data: roundStatus,
                    }));
                    if (this.currentPosition === IRoundStatus_1.RoundPosition.DISTRIBUTED)
                        this.currentPosition = IRoundStatus_1.RoundPosition.NONE;
                }
                this.lifeCycle();
            }), this.cycle);
        });
    }
}
exports.default = GameRound;
