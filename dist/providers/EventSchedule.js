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
exports.EventSchedule = void 0;
const GlobalState_1 = require("./GlobalState");
const TransactionService_1 = require("../api/services/TransactionService");
const TradingStatisticsService_1 = require("../api/services/TradingStatisticsService");
const Balance_1 = __importDefault(require("../models/Balance"));
class EventSchedule {
    fullStatistics() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { success, data, error } = yield (0, TransactionService_1.getFullStatistics)();
            if (success && data) {
                GlobalState_1.GlobalState.livePlayersFor24H = data.LivePlayersFor24H;
                GlobalState_1.GlobalState.winRatioFor24H = data.WinRatioFor24H;
                GlobalState_1.GlobalState.winsPaidFor24H = data.WinsPaidFor24H;
            }
            // console.log("Jackpot Address: ", this.jackpotAddress);
            GlobalState_1.GlobalState.contestPrize =
                ((_a = (yield Balance_1.default.findOne({ User: GlobalState_1.GlobalState.weeklyChallengeUser._id }))) === null || _a === void 0 ? void 0 : _a.Balance) || 0;
            GlobalState_1.GlobalState.highRollers = yield (0, TradingStatisticsService_1.getHighRollersForToday)();
            GlobalState_1.GlobalState.top100WinnersForToday = yield (0, TradingStatisticsService_1.getTop100WinnersForToday)();
            GlobalState_1.GlobalState.topWinRatioPlayers = yield (0, TradingStatisticsService_1.getTopWinRatioPlayers)();
        });
    }
    runFullStatisticsSchedule() {
        this.fullStatistics();
        setInterval(this.fullStatistics, 1 * 60 * 1000);
    }
    // start schedule
    start() {
        this.runFullStatisticsSchedule();
    }
    // create instance
    static createInstance() {
        return new EventSchedule();
    }
}
exports.EventSchedule = EventSchedule;
