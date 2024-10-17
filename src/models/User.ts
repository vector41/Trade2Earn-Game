export interface UserViewModel {
    Address: string
    Email?: string
    Avatar?: string
    ReferralLink: string
    CountryCode: string
    WhiteLabel?: string
    Enabled?: boolean
    WalletProvider: string
    Signature?: string
    CreatedAt?: number
}

import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
    Address: string
    Username: string
    Email?: string
    Avatar?: string
    InvitedPath: string
    CountryCode: string
    WhiteLabel: string
    Enabled: boolean
    WalletProvider: string
    CreatedAt: Date
    Role: string
}

export interface IUserViewModel {
    Username: string
    UserId: string
    Avatar?: string
    CountryCode: string
    WhiteLabel?: string
    Role?: string
}

const userSchema: Schema = new Schema({
    Address: {
        type: String,
        required: true,
        unique: true,
    },
    Username: String,
    Email: String,
    Avatar: String,
    InvitedPath: {
        type: String,
        required: true,
    },
    CountryCode: {
        type: String,
        required: true,
    },
    WhiteLabel: String,
    Enabled: {
        type: Boolean,
        default: true,
    },
    WalletProvider: {
        type: String,
        required: true,
    },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
    Role: {
        type: String,
        enum: [
            'admin',
            'user',
            'jackpot_weekly',
            'jackpot_monthly',
            'daily_contest',
        ],
        default: 'user',
    },
})

export default mongoose.model<IUser>('User', userSchema)
