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
const mongoose_1 = __importStar(require("mongoose"));
const TradingStatisticsSchema = new mongoose_1.Schema({
    User: { type: mongoose_1.Schema.ObjectId, ref: 'User', index: true },
    ThisMonth: {
        TradingVolume: { type: Number, default: 0, index: true },
        NumberOfWins: { type: Number, default: 0 },
        NumberOfTrades: { type: Number, default: 0 },
        NetProfit: { type: Number, default: 0, index: true },
    },
    ThisWeek: {
        TradingVolume: { type: Number, default: 0, index: true },
        NumberOfWins: { type: Number, default: 0 },
        NumberOfTrades: { type: Number, default: 0 },
        NetProfit: { type: Number, default: 0, index: true },
    },
    // Yesterday: {
    //     TradingVolume: { type: Number, default: 0 },
    //     NumberOfWins: { type: Number, default: 0 },
    //     NumberOfTrades: { type: Number, default: 0 },
    //     NetProfit: { type: Number, default: 0 },
    // },
    Today: {
        TradingVolume: { type: Number, default: 0, index: true },
        NumberOfWins: { type: Number, default: 0, index: true },
        NumberOfTrades: { type: Number, default: 0 },
        NetProfit: { type: Number, default: 0, index: true },
    },
    AllTime: {
        TradingVolume: { type: Number, default: 0 },
        NumberOfWins: { type: Number, default: 0 },
        NumberOfTrades: { type: Number, default: 0 },
        NetProfit: { type: Number, default: 0, index: true },
    },
});
// Method to reset today's data fields
TradingStatisticsSchema.statics.resetTodayData = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield this.updateMany({ 'Today.TradingVolume': { $gt: 0 } }, { Today: { TradingVolume: 0, NumberOfWins: 0, NumberOfTrades: 0, NetProfit: 0 } });
            console.log("Today's data fields have been reset successfully.");
        }
        catch (error) {
            console.error("Error resetting today's data fields:", error);
            throw error;
        }
    });
};
TradingStatisticsSchema.statics.resetThisWeekData = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield this.updateMany({ 'ThisWeek.TradingVolume': { $gt: 0 } }, { ThisWeek: { TradingVolume: 0, NumberOfWins: 0, NumberOfTrades: 0, NetProfit: 0 } });
            console.log("This week's data fields have been reset successfully.");
        }
        catch (error) {
            console.error("Error resetting this week's data fields:", error);
            throw error;
        }
    });
};
TradingStatisticsSchema.statics.resetThisMonthData = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield this.updateMany({ 'ThisMonth.TradingVolume': { $gt: 0 } }, { ThisMonth: { TradingVolume: 0, NumberOfWins: 0, NumberOfTrades: 0, NetProfit: 0 } });
            console.log("This month's data fields have been reset successfully.");
        }
        catch (error) {
            console.error("Error resetting this month's data fields:", error);
            throw error;
        }
    });
};
exports.default = mongoose_1.default.model('TradingStatistics', TradingStatisticsSchema);
