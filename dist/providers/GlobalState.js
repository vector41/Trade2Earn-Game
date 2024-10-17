"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalState = void 0;
const Bot_1 = require("./Bot");
const CoinManager_1 = __importDefault(require("./CoinManager/CoinManager"));
const Transaction_1 = __importDefault(require("./Transaction"));
class GlobalState {
}
exports.GlobalState = GlobalState;
GlobalState.coinPerRank = [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100];
GlobalState.ratePerRankInChallenge = [0.5, 0.25, 0.125, 0.083, 0.042];
GlobalState.btcPrices = [];
GlobalState.stop = false;
GlobalState.stopBot = false;
GlobalState.winRatioFor24H = 0;
GlobalState.allTimeWinsPaid = 0;
GlobalState.livePlayersFor24H = 0;
GlobalState.winsPaidFor24H = 0;
GlobalState.contestPrize = 0;
GlobalState.txnManager = Transaction_1.default.createInstance();
GlobalState.coinManager = new CoinManager_1.default();
GlobalState.highRollers = [];
GlobalState.topWinRatioPlayers = [];
GlobalState.top100WinnersForToday = [];
GlobalState.top100WinnersForThisWeek = [];
GlobalState.top100WinnersForThisMonth = [];
GlobalState.top100WinnersForAllTime = [];
GlobalState.botPlayers = new Bot_1.Bot();
GlobalState.currentChallengeRound = null;
GlobalState.nextChallengeRound = null;
GlobalState.lastExpredChallengeRound = null;
