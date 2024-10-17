import mongoose, { Document, Schema } from 'mongoose'

export interface INonce extends Document {
    address: string
    nonce: string
    createdAt: Date
}

const NonceSchema: Schema = new Schema({
    address: {
        type: String,
        required: true,
        unique: true,
    },
    nonce: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.model<INonce>('Nonce', NonceSchema)
