import { Request, Response } from "express";
import Reward, { IReward, IRewardModel } from "../../models/Reward";
import { singleUpdateBalance, singleUpdateCoin } from "../services/BalanceService";
import mongoose from "mongoose";

class RewardsController {

    public static async claim(req: Request, res: Response) {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const { user, rewardId } = req.body;
    
            // Find the reward by ID and user ID
            const reward: IRewardModel | null = await Reward.findOne({ _id: rewardId, user: user._id }).session(session);
    
            if (!reward) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ result: false, message: 'Reward not found or user does not own the reward.' });
            }
    
            // Check if the reward has already been claimed
            if (reward.claimed) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ result: false, message: 'Reward has already been claimed.' });
            }
    
            // Update the reward to mark it as claimed
            reward.claimed = true;
            await reward.save();
    
            // Update user balance
            if (reward.currency === "USDT") await singleUpdateBalance(user._id, reward.amount, session);
            if (reward.currency === "Coin") await singleUpdateCoin(user._id, reward.amount, session);
    
            await session.commitTransaction();
            session.endSession();
    
            return res.status(200).json({ result: true, message: 'Reward claimed successfully.' });
        } catch (error) {
            console.error('Error claiming reward:', error);
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({ result: false, message: 'An error occurred while claiming the reward.' });
        }
    }

    public static async notifications(req: Request, res: Response) {
        try {
            const { user } = req.body
            // Query unclaimed rewards
            const unclaimedRewards: IReward[] = await Reward.find({ claimed: false, user: user._id });
        
            // Send the unclaimed rewards as the response
            res.json(unclaimedRewards);
          } catch (error) {
            // Handle errors
            console.error('Error fetching unclaimed rewards:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
    }
}

export default RewardsController;
