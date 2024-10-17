import { Schema, Document, model, Types } from 'mongoose'
import { IUser } from './User'

export interface IBalance extends Document {
    Balance: number
    Coin: number
    User: Types.ObjectId | IUser // Define a type for the user reference
}

const balanceSchema = new Schema({
    Balance: {
        type: Number,
        default: 0,
        require: true,
        index: true,
    },
    Coin: {
        type: Number,
        default: 0,
        require: true,
        index: true,
    },
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        index: true
    },
})

export default model<IBalance>('Balance', balanceSchema)
