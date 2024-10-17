import { Document, Schema, model } from 'mongoose';

export interface IBTCChallengePool {
  StartTime: Date;
  EndTime: Date;
  StartPrice: number;
  EndPrice: number;
  NextId?: Schema.Types.ObjectId;
  PrevId?: Schema.Types.ObjectId;
  Prize: number;
}

export interface IBTCChallengePoolModel extends Document, IBTCChallengePool {};

const btcChallengePoolSchema = new Schema<IBTCChallengePoolModel>({
  StartTime: { type: Date, required: true },
  EndTime: { type: Date, required: true },
  StartPrice: { type: Number, required: true, default: 0 },
  EndPrice: { type: Number, required: true, default: 0 },
  NextId: { type: Schema.Types.ObjectId, ref: 'BTCChallengePool' },
  PrevId: { type: Schema.Types.ObjectId, ref: 'BTCChallengePool' },
  Prize: { type: Number, required: true, default: 0 }
});

const BTCChallengePool = model<IBTCChallengePoolModel>('BTCChallengePool', btcChallengePoolSchema);

export default BTCChallengePool;
