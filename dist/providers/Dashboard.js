"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const GlobalState_1 = require("./GlobalState");
const utils_1 = __importDefault(require("../utils/utils"));
const Log_1 = __importDefault(require("../api/middlewares/Log"));
class Dashboard {
    static getLatestFullStatistics(poolId) {
        var _a;
        const roundResults = (_a = this.roundResults.get(poolId)) !== null && _a !== void 0 ? _a : [];
        return {
            AllTimeWinsPaid: GlobalState_1.GlobalState.allTimeWinsPaid,
            LivePlayersFor24H: GlobalState_1.GlobalState.livePlayersFor24H,
            WinRatioFor24H: GlobalState_1.GlobalState.winRatioFor24H,
            WinsPaidFor24H: GlobalState_1.GlobalState.winsPaidFor24H,
            RoundResult: roundResults.slice(-10),
            BtcPrices: GlobalState_1.GlobalState.btcPrices,
            ContestPrize: GlobalState_1.GlobalState.contestPrize,
            Traders: GlobalState_1.GlobalState.txnManager.getFilteredTransactionsByPoolId(poolId),
            Top100Winners: GlobalState_1.GlobalState.top100WinnersForToday
        };
    }
    static saveWinsPaid() {
        const timestamp = utils_1.default.getTimestamp();
        const filename = `${timestamp}.json`;
        const filePath = path.join(this.gameStateDirectory, filename);
        if (!fs.existsSync(this.gameStateDirectory)) {
            fs.mkdirSync(this.gameStateDirectory);
        }
        const data = JSON.stringify({
            allTimeWinsPaid: GlobalState_1.GlobalState.allTimeWinsPaid,
        });
        fs.writeFileSync(filePath, data, 'utf-8');
        // Remove excess files
        this.removeExcessFiles();
    }
    static removeExcessFiles() {
        const files = fs.readdirSync(this.gameStateDirectory);
        const sortedFiles = files.sort((a, b) => {
            return (fs
                .statSync(path.join(this.gameStateDirectory, b))
                .mtime.getTime() -
                fs
                    .statSync(path.join(this.gameStateDirectory, a))
                    .mtime.getTime());
        });
        for (let i = 10; i < sortedFiles.length; i++) {
            const filePath = path.join(this.gameStateDirectory, sortedFiles[i]);
            fs.unlinkSync(filePath);
        }
    }
    static getLatestAllTimeWinsPaidFile() {
        const files = fs.readdirSync(this.gameStateDirectory);
        const sortedFiles = files.sort((a, b) => {
            return (fs
                .statSync(path.join(this.gameStateDirectory, b))
                .mtime.getTime() -
                fs
                    .statSync(path.join(this.gameStateDirectory, a))
                    .mtime.getTime());
        });
        return path.join(this.gameStateDirectory, sortedFiles[0]);
    }
    static loadAllTimeWinsPaidFile() {
        try {
            const latestFile = this.getLatestAllTimeWinsPaidFile();
            const data = fs.readFileSync(latestFile, 'utf-8');
            GlobalState_1.GlobalState.allTimeWinsPaid = JSON.parse(data).allTimeWinsPaid;
        }
        catch (error) {
            Log_1.default.error(`Dashboard :: loadAllTimeWinsPaidFile${error}`);
        }
    }
    static addRoundResult(startPrice, endPrice, roundId, poolId) {
        let poolRoundResults = this.roundResults.get(poolId);
        if (!poolRoundResults) {
            poolRoundResults = [];
            this.roundResults.set(poolId, poolRoundResults);
        }
        poolRoundResults.push({ startPrice, endPrice, roundId });
        if (poolRoundResults.length > 20) {
            poolRoundResults = poolRoundResults.slice(-20);
            this.roundResults.set(poolId, poolRoundResults);
        }
    }
}
exports.Dashboard = Dashboard;
Dashboard.gameStateDirectory = 'gameState';
Dashboard.roundResults = new Map();
