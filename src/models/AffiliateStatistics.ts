import mongoose, { Schema, Document } from 'mongoose'

export interface IAffiliateStatistics extends Document {
    Address: string
    AllTime: {
        Tier1Paid: number
        Tier2Paid: number
        Tier3Paid: number
        TotalPaid: number
    }
    ThisMonth: {
        Tier1Paid: number
        Tier2Paid: number
        Tier3Paid: number
        TotalPaid: number
    }
    ThisWeek: {
        Tier1Paid: number
        Tier2Paid: number
        Tier3Paid: number
        TotalPaid: number
    }
    Yesterday: {
        Tier1Paid: number
        Tier2Paid: number
        Tier3Paid: number
        TotalPaid: number
    }
    Today: {
        Tier1Paid: number
        Tier2Paid: number
        Tier3Paid: number
        TotalPaid: number
    }
}

const AffiliateStatisticsSchema: Schema = new Schema({
    Address: { type: String, required: true },
    AllTime: {
        Tier1Paid: { type: Number, default: 0 },
        Tier2Paid: { type: Number, default: 0 },
        Tier3Paid: { type: Number, default: 0 },
        TotalPaid: { type: Number, default: 0 },
    },
    ThisMonth: {
        Tier1Paid: { type: Number, default: 0 },
        Tier2Paid: { type: Number, default: 0 },
        Tier3Paid: { type: Number, default: 0 },
        TotalPaid: { type: Number, default: 0 },
    },
    ThisWeek: {
        Tier1Paid: { type: Number, default: 0 },
        Tier2Paid: { type: Number, default: 0 },
        Tier3Paid: { type: Number, default: 0 },
        TotalPaid: { type: Number, default: 0 },
    },
    Yesterday: {
        Tier1Paid: { type: Number, default: 0 },
        Tier2Paid: { type: Number, default: 0 },
        Tier3Paid: { type: Number, default: 0 },
        TotalPaid: { type: Number, default: 0 },
    },
    Today: {
        Tier1Paid: { type: Number, default: 0 },
        Tier2Paid: { type: Number, default: 0 },
        Tier3Paid: { type: Number, default: 0 },
        TotalPaid: { type: Number, default: 0 },
    },
})

export default mongoose.model<IAffiliateStatistics>(
    'AffiliateStatistics',
    AffiliateStatisticsSchema
)
