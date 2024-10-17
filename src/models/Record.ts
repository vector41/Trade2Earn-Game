import mongoose, { Schema, Document } from 'mongoose'

// Define interface for the Record document
export interface IRecord extends Document {
    recordId: string
    userId: mongoose.Types.ObjectId
    coinId: number
    createdAt: number
    status: string
    chain: string
    amount: number
    txId: string
    toAddress: string
    fromAddress: string
    type: string
    accepted: boolean
}

// Define schema for the Record document
const recordSchema: Schema = new Schema({
    recordId: { type: String, unique: true, index: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', index: true },
    coinId: { type: Number },
    createdAt: { type: Date, default: Date.now },
    status: { type: String },
    chain: { type: String },
    amount: { type: Number },
    txId: { type: String, unique: true },
    toAddress: { type: String },
    fromAddress: { type: String },
    type: { type: String },
    accepted: { type: Boolean, default: false },
})

// Create and export the Record model
const Record = mongoose.model<IRecord>('Record', recordSchema)

export default Record
