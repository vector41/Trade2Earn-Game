import { Document, Schema, model } from 'mongoose';
import { IUser } from './User';

interface ISecondChallenge extends Document {
  User: Schema.Types.ObjectId | IUser;
  Direction: boolean;
  BTCChallengePool: Schema.Types.ObjectId;
  Result: boolean;
  Reward: number;
}

const secondChallengeSchema = new Schema<ISecondChallenge>({
  User: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  Direction: { type: Boolean, required: true },
  BTCChallengePool: { type: Schema.Types.ObjectId, ref: 'BTCChallengePool', required: true },
  Result: { type: Boolean },
  Reward: { type: Number }
});

const SecondChallenge = model<ISecondChallenge>('SecondChallenge', secondChallengeSchema);

export default SecondChallenge;
