import mongoose, { Schema, Document, Model } from 'mongoose'
import User, { IUser } from './User'

export interface ITradingStatistics {
    User: Schema.Types.ObjectId | IUser
    ThisMonth: {
        TradingVolume: number
        NumberOfWins: number
        NumberOfTrades: number
        NetProfit: number
    }
    ThisWeek: {
        TradingVolume: number
        NumberOfWins: number
        NumberOfTrades: number
        NetProfit: number
    }
    // Yesterday?: {
    //     TradingVolume: number
    //     NumberOfWins: number
    //     NumberOfTrades: number
    //     NetProfit: number
    // }
    Today: {
        TradingVolume: number
        NumberOfWins: number
        NumberOfTrades: number
        NetProfit: number
    }
    AllTime: {
        TradingVolume: number
        NumberOfWins: number
        NumberOfTrades: number
        NetProfit: number
    }
}

export interface ITradingStatisticsDocument extends Document, ITradingStatistics { }

export interface ITradingStatisticsModel extends Model<ITradingStatisticsDocument> {
    resetThisMonthData(): Promise<void>;
    resetTodayData(): Promise<void>;
    resetThisWeekData(): Promise<void>;
}

const TradingStatisticsSchema: Schema = new Schema({
    User: { type: Schema.ObjectId, ref: 'User', index: true },
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
        NetProfit: { type: Number, default: 0 , index: true},
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
        NetProfit: { type: Number, default: 0 , index: true},
    },
})


// Method to reset today's data fields
TradingStatisticsSchema.statics.resetTodayData = async function() {
    try {
        await this.updateMany({ 'Today.TradingVolume': { $gt: 0 } }, { Today: { TradingVolume: 0, NumberOfWins: 0, NumberOfTrades: 0, NetProfit: 0 } });
        console.log("Today's data fields have been reset successfully.");
    } catch (error) {
        console.error("Error resetting today's data fields:", error);
        throw error;
    }
};

TradingStatisticsSchema.statics.resetThisWeekData = async function() {
    try {
        await this.updateMany({ 'ThisWeek.TradingVolume': { $gt: 0 } }, { ThisWeek: { TradingVolume: 0, NumberOfWins: 0, NumberOfTrades: 0, NetProfit: 0 } });
        console.log("This week's data fields have been reset successfully.");
    } catch (error) {
        console.error("Error resetting this week's data fields:", error);
        throw error;
    }
};

TradingStatisticsSchema.statics.resetThisMonthData = async function() {
    try {
        await this.updateMany({ 'ThisMonth.TradingVolume': { $gt: 0 } }, { ThisMonth: { TradingVolume: 0, NumberOfWins: 0, NumberOfTrades: 0, NetProfit: 0 } });
        console.log("This month's data fields have been reset successfully.");
    } catch (error) {
        console.error("Error resetting this month's data fields:", error);
        throw error;
    }
}
    

export default mongoose.model<ITradingStatisticsDocument, ITradingStatisticsModel>('TradingStatistics', TradingStatisticsSchema);


