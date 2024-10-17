import mongoose, { Schema, Document, Types } from 'mongoose'
import { IUser } from './User'

export interface ITransaction {
    TradeSize: number
    Direction: boolean
    Result?: boolean
    CreatedAt?: Date
    PoolId: string
    NewTotal: number
    CountryCode?: string
    Avatar?: string
    RoundId: string
    User: Schema.Types.ObjectId
    IsBot?: boolean
}
export interface ITransactionModel extends Document {
    TradeSize: number
    Direction: boolean
    Result: boolean
    CreatedAt?: Date
    RoundId: string
    PoolId: string
    User: Types.ObjectId | IUser // Define a type for the user reference
}

const TransactionSchema: Schema = new Schema({
    TradeSize: { type: Number, required: true },
    Direction: { type: Boolean, required: true },
    Result: { type: Boolean, required: true },
    CreatedAt: { type: Date, required: true, default: Date.now },
    PoolId: { type: String, required: true },
    RoundId: { type: String, require: true },
    User: { type: Schema.Types.ObjectId, ref: 'User', index: true },
})

export default mongoose.model<ITransactionModel>(
    'Transaction',
            TransactionSchema
)
