export enum AffiliateType {
    FRIEND_METHOD = 'FRIEND_METHOD',
    PARTNERSHIP = 'PARTNERSHIP',
}

import mongoose, { Document, ObjectId, Schema } from 'mongoose'
import { IUser } from './User'

export interface IAffiliateDistribution {
    Tier1Paid: number
    Tier2Paid: number
    Tier3Paid: number
    Tier1Unclaimed: number
    Tier2Unclaimed: number
    Tier3Unclaimed: number
    ReferralId: string
}

export interface IAffiliate extends Document {
    AffiliateType: string
    ReferralId: string
    Name: string
    Tier1Paid: number
    Tier2Paid: number
    Tier3Paid: number
    Tier1Unclaimed: number
    Tier2Unclaimed: number
    Tier3Unclaimed: number
    CreatedAt: Date
    User: ObjectId | IUser
}

const affiliateSchema: Schema = new Schema({
    AffiliateType: {
        type: String,
        required: true,
    },
    ReferralId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    Name: {
        type: String,
        required: true,
    },
    Tier1Paid: {
        type: Number,
        default: 0,
    },
    Tier2Paid: {
        type: Number,
        default: 0,
    },
    Tier3Paid: {
        type: Number,
        default: 0,
    },
    Tier1Unclaimed: {
        type: Number,
        default: 0,
        index: true,
    },
    Tier2Unclaimed: {
        type: Number,
        index: true,
        default: 0,
    },
    Tier3Unclaimed: {
        type: Number,
        default: 0,
        index: true,
    },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
})

export default mongoose.model<IAffiliate>('Affiliate', affiliateSchema)
