import { Document, Schema, model } from 'mongoose';
import { IUser } from './User';

export interface IFutureBTCChallenge extends Document {
  User: Schema.Types.ObjectId | IUser;
  Position: number;
  BTCChallengePool: Schema.Types.ObjectId;
  Place: number;
  Reward: number;
}

const futureBTCChallengeSchema = new Schema<IFutureBTCChallenge>({
  User: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  Position: { type: Number, required: true },
  BTCChallengePool: { type: Schema.Types.ObjectId, ref: 'BTCChallengePool', required: true },
  Place: { type: Number },
  Reward: { type: Number }
});

const FutureBTCChallenge = model<IFutureBTCChallenge>('FutureBTCChallenge', futureBTCChallengeSchema);

export default FutureBTCChallenge;
