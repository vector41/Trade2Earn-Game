import { Response, Request } from "express";
import mongoose from "mongoose";
import FutureBTCChallenge, { IFutureBTCChallenge } from "../../models/FutureBTCChallenge";
import { GlobalState } from "../../providers/GlobalState";
import Balance, { IBalance } from "../../models/Balance";

export class FutureBTCChallengeController {
    public static async futureBTCChallenge(req: Request, res: Response): Promise<Response> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { user, position } = req.body;
            const perPosition = 500;

            // Validate required fields
            if (position === undefined || position === null || typeof position !== 'number' || isNaN(position) || position <= 0) {
                return res.status(400).json({ error: 'Position is required and must be a positive number.' });
            }

            // Find the BTCChallengePool document
            if (!GlobalState.nextChallengeRound) {
                return res.status(404).json({ error: 'Next BTC Challenge Pool not found.' });
            }

            // Find the user's balance
            const userBalance = await Balance.findOne({ User: user._id }).session(session);
            if (!userBalance || userBalance.Coin < perPosition) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Insufficient coin balance.' });
            }

            // Reduce the user's balance by the specified amount
            const updatedBalance = await Balance.findOneAndUpdate<IBalance>(
                { User: user._id, Coin: { $gte: perPosition } }, // Query condition to find the balance document for the user
                { $inc: { Coin: -perPosition } }, // Reduce the balance by the specified amount
                { new: true, session } // Return the updated document and use the session
            );

            // Create a new FutureBTCChallenge document
            const newPosition = new FutureBTCChallenge({
                User: user._id,
                Position: position,
                BTCChallengePool: GlobalState.nextChallengeRound?._id,
            });

            // Save the document to the database
            await newPosition.save({ session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            // Respond with the saved document and updated balance
            return res.status(201).json({ coin: updatedBalance?.Coin, newPosition });
        } catch (error) {
            // Abort the transaction in case of error
            await session.abortTransaction();
            session.endSession();
            console.error('Error occurred while creating future BTC challenge:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    public static async getPositions(req: Request, res: Response): Promise<Response> {
        try {
            const populateOptions = { path: 'User', select: 'Username Avatar CountryCode' };

            const expiredPositions = GlobalState.lastExpredChallengeRound
                ? await FutureBTCChallenge.find({ BTCChallengePool: GlobalState.lastExpredChallengeRound._id }).populate(populateOptions)
                : null;

            const livePositions = GlobalState.currentChallengeRound
                ? await FutureBTCChallenge.find({ BTCChallengePool: GlobalState.currentChallengeRound._id }).populate(populateOptions)
                : null;

            const nextPositions = GlobalState.nextChallengeRound
                ? await FutureBTCChallenge.find({ BTCChallengePool: GlobalState.nextChallengeRound._id }).populate(populateOptions)
                : null;

            console.log(nextPositions)

            return res.json({
                expiredChallengeStatus: {
                    positions: expiredPositions,
                    status: GlobalState.lastExpredChallengeRound,
                },
                liveChallengeStatus: {
                    positions: livePositions,
                    status: GlobalState.currentChallengeRound,
                },
                nextChallengeStatus: {
                    positions: nextPositions,
                    status: GlobalState.nextChallengeRound,
                }
            });
        } catch (error) {
            console.error("Error retrieving challenge positions:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
