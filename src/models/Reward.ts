import mongoose, { Schema, Document, ObjectId } from 'mongoose'
import { IUser } from './User'

export interface IReward {
    user: ObjectId | IUser
    amount: number
    currency: string,
    description: string
    claimed: boolean
    CreatedAt?: Date
}

export interface IRewardModel extends Document, IReward {}

const RewardSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, require: true,  enum: ['USDT', 'Coin'], },
    description: { type: String, required: true },
    claimed: { type: Boolean, default: false },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.model<IRewardModel>('Reward', RewardSchema)
