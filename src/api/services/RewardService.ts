import mongoose from 'mongoose'
import { IReturnData } from '../../interfaces/IReturnData'
import Reward, { IReward, IRewardModel } from '../../models/Reward'
import Log from '../middlewares/Log'

export const insertRewards = async (
    rewards: IReward[],
    session?: mongoose.ClientSession
): Promise<IReward[]> => {
    try {
        const options: any = {}
        if (session) {
            options.session = session
        }

        const insertedRewards = await Reward.insertMany<IReward>(
            rewards,
            options
        )

        return insertedRewards
    } catch (error) {
        Log.error(`RewardService :: Error adding batch rewards: ${error}`)

        throw error
    }
}


export async function getUnclaimedRewards() {
    try {
      // Query to find rewards where claimed is false
      const unclaimedRewards: IRewardModel[] = await Reward.find({ claimed: false });
  
      return unclaimedRewards;
    } catch (error) {
      // Handle error
      console.error('Error fetching unclaimed rewards:', error);
      throw error;
    }
  }
