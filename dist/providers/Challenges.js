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
const node_schedule_1 = require("node-schedule");
const BTCChallengePool_1 = __importDefault(require("../models/BTCChallengePool"));
const GlobalState_1 = require("./GlobalState");
const BTCChallengePoolService_1 = require("../api/services/BTCChallengePoolService");
const Log_1 = __importDefault(require("../api/middlewares/Log"));
const FutureBTCChallenge_1 = __importDefault(require("../models/FutureBTCChallenge"));
const Balance_1 = __importDefault(require("../models/Balance"));
const RewardService_1 = require("../api/services/RewardService");
const nextRoundTime = () => {
    // Get the current date and time
    const currentDate = new Date();
    const nextStartTime = new Date(currentDate);
    // unit = 1 week
    nextStartTime.setUTCDate(currentDate.getUTCDate() + (7 - currentDate.getUTCDay()));
    nextStartTime.setUTCHours(0);
    nextStartTime.setUTCMinutes(0);
    nextStartTime.setUTCSeconds(0);
    nextStartTime.setUTCMilliseconds(0);
    const nextEndTime = new Date(nextStartTime);
    nextEndTime.setUTCDate(nextStartTime.getUTCDate() + 7);
    console.log(nextStartTime, nextEndTime);
    console.log(currentDate.getUTCHours());
    // // unit = 1 hour
    // nextStartTime.setUTCHours(currentDate.getUTCHours() + 1);
    // nextStartTime.setUTCMinutes(0);
    // nextStartTime.setUTCSeconds(0);
    // nextStartTime.setUTCMilliseconds(0);
    // const nextEndTime = new Date(nextStartTime);
    // nextEndTime.setUTCHours(nextStartTime.getUTCHours() + 1);
    // //    unit = 1 minute
    //     nextStartTime.setUTCMinutes(currentDate.getUTCMinutes() + 1);
    //     nextStartTime.setUTCSeconds(0);
    //     nextStartTime.setUTCMilliseconds(0);
    //     const nextEndTime = new Date(nextStartTime);
    //     nextEndTime.setUTCMinutes(nextStartTime.getUTCMinutes() + 1);
    return {
        nextStartTime,
        nextEndTime
    };
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        GlobalState_1.GlobalState.currentChallengeRound = yield (0, BTCChallengePoolService_1.getCurrentRoundInProgress)();
        GlobalState_1.GlobalState.nextChallengeRound = yield (0, BTCChallengePoolService_1.getNextRoundInProgress)();
        if (GlobalState_1.GlobalState.nextChallengeRound) {
            Balance_1.default.findOneAndUpdate({ User: GlobalState_1.GlobalState.weeklyChallengeUser._id }, // Query condition to find the balance document for the user
            { $set: { Balance: 0 } }).then((lastBalance) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                if (!lastBalance || lastBalance.Balance <= 0)
                    return;
                const positions = yield FutureBTCChallenge_1.default.find({ BTCChallengePool: (_a = GlobalState_1.GlobalState.nextChallengeRound) === null || _a === void 0 ? void 0 : _a._id }).exec();
                positions.sort((p1, p2) => {
                    let d1 = 0, d2 = 0;
                    if (GlobalState_1.GlobalState.nextChallengeRound) {
                        d1 = Math.abs(p1.Position - GlobalState_1.GlobalState.nextChallengeRound.EndPrice);
                        d2 = Math.abs(p2.Position - GlobalState_1.GlobalState.nextChallengeRound.EndPrice);
                    }
                    return d1 - d2;
                });
                positions.map(p => {
                });
                const rewards = [];
                // if (prize && prize?.Balance > 0) {
                positions.forEach((position, index) => {
                    if (index < GlobalState_1.GlobalState.ratePerRankInChallenge.length) {
                        rewards.push({
                            amount: GlobalState_1.GlobalState.ratePerRankInChallenge[index] * (lastBalance === null || lastBalance === void 0 ? void 0 : lastBalance.Balance),
                            currency: "USDT",
                            user: position.User,
                            claimed: false,
                            description: `Weekly BTC Challenge #${index + 1}`,
                        });
                    }
                });
                if (rewards.length > 0)
                    yield (0, RewardService_1.insertRewards)(rewards);
            }));
        }
        //===================================================
        //===================================================
        if (!GlobalState_1.GlobalState.nextChallengeRound) {
            const { nextStartTime, nextEndTime } = nextRoundTime();
            const nextChallengeRound = new BTCChallengePool_1.default({
                StartTime: nextStartTime,
                EndTime: nextEndTime,
                StartPrice: 0,
                EndPrice: 0,
                Prize: 0,
            });
            GlobalState_1.GlobalState.nextChallengeRound = yield nextChallengeRound.save();
        }
        (0, node_schedule_1.scheduleJob)({ second: 0, minute: 0, hour: 0, dayOfWeek: 0, tz: "Etc/UTC" }, () => __awaiter(void 0, void 0, void 0, function* () {
            var _b, _c;
            // scheduleJob({  second: 0, minute: 0, tz: "Etc/UTC" }, async () => {
            // scheduleJob("* * * * *", async () => {
            const price = GlobalState_1.GlobalState.gameRound.currentBtcPrice;
            if (GlobalState_1.GlobalState.currentChallengeRound) {
                GlobalState_1.GlobalState.currentChallengeRound.EndPrice = price.value;
                GlobalState_1.GlobalState.currentChallengeRound.NextId = (_b = GlobalState_1.GlobalState.nextChallengeRound) === null || _b === void 0 ? void 0 : _b._id;
                GlobalState_1.GlobalState.lastExpredChallengeRound = yield GlobalState_1.GlobalState.currentChallengeRound.save();
                // =========== Closed ==============
                console.log("Expired: ", GlobalState_1.GlobalState.lastExpredChallengeRound);
            }
            GlobalState_1.GlobalState.currentChallengeRound = GlobalState_1.GlobalState.nextChallengeRound;
            if (GlobalState_1.GlobalState.currentChallengeRound) {
                GlobalState_1.GlobalState.currentChallengeRound.StartPrice = price.value;
                GlobalState_1.GlobalState.currentChallengeRound = yield GlobalState_1.GlobalState.currentChallengeRound.save();
                console.log("Live: ", GlobalState_1.GlobalState.currentChallengeRound);
            }
            const { nextStartTime, nextEndTime } = nextRoundTime();
            const nextChallengeRound = new BTCChallengePool_1.default({
                StartTime: nextStartTime,
                EndTime: nextEndTime,
                StartPrice: 0,
                EndPrice: 0,
                Prize: 0,
                PrevId: (_c = GlobalState_1.GlobalState.currentChallengeRound) === null || _c === void 0 ? void 0 : _c._id
            });
            GlobalState_1.GlobalState.nextChallengeRound = yield nextChallengeRound.save();
            if (GlobalState_1.GlobalState.currentChallengeRound) {
                GlobalState_1.GlobalState.currentChallengeRound.NextId = GlobalState_1.GlobalState.nextChallengeRound._id;
                GlobalState_1.GlobalState.currentChallengeRound = yield GlobalState_1.GlobalState.currentChallengeRound.save();
            }
            console.log("Next: ", GlobalState_1.GlobalState.nextChallengeRound);
            // Distributes rewards to winners
            if (GlobalState_1.GlobalState.lastExpredChallengeRound) {
                Balance_1.default.findOneAndUpdate({ User: GlobalState_1.GlobalState.weeklyChallengeUser._id }, // Query condition to find the balance document for the user
                { $set: { Balance: 0 } }).then((lastBalance) => __awaiter(void 0, void 0, void 0, function* () {
                    var _d;
                    const positions = yield FutureBTCChallenge_1.default.find({ BTCChallengePool: (_d = GlobalState_1.GlobalState.lastExpredChallengeRound) === null || _d === void 0 ? void 0 : _d._id }).exec();
                    positions.sort((p1, p2) => {
                        let d1 = 0, d2 = 0;
                        if (GlobalState_1.GlobalState.lastExpredChallengeRound) {
                            d1 = Math.abs(p1.Position - GlobalState_1.GlobalState.lastExpredChallengeRound.EndPrice);
                            d2 = Math.abs(p2.Position - GlobalState_1.GlobalState.lastExpredChallengeRound.EndPrice);
                        }
                        return d1 - d2;
                    });
                }));
            }
            console.log("==================================================");
        }));
    }
    catch (error) {
        Log_1.default.error(`Challenge :: ${error}`);
    }
}))();
