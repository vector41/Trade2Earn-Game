import BTCChallengePool, { IBTCChallengePool, IBTCChallengePoolModel } from "../../models/BTCChallengePool";

// Function to get the current round in progress
export const getCurrentRoundInProgress = async (): Promise<IBTCChallengePoolModel | null> => {
    try {
        // Get the current date and time
        const now = new Date();

        // Find the round in progress where StartTime < Now and EndTime > Now
        const roundInProgress = await BTCChallengePool.findOne({
            StartTime: { $lt: now },
            EndTime: { $gt: now },
            StartPrice: {$gt: 0},
            EndPrice: {$eq: 0}
        }).exec();

        return roundInProgress;
    } catch (error) {
        console.error("Error occurred while getting current round in progress:", error);
        return null;
    }
};


export const getNextRoundInProgress = async (): Promise<IBTCChallengePoolModel | null> => {
    try {
        // Get the current date and time
        const now = new Date();
        const nextTimeInProgress = new Date(now);
        nextTimeInProgress.setUTCDate(now.getUTCDate() + 7);
        // nextTimeInProgress.setUTCMinutes(now.getUTCMinutes() + 1);
        // nextTimeInProgress.setUTCHours(now.getUTCHours() + 1);

        // Find the round in progress where StartTime < Now and EndTime > Now
        const nextRoundInProgress = await BTCChallengePool.findOne({
            StartTime: { $lt: nextTimeInProgress },
            EndTime: { $gt: nextTimeInProgress },
            StartPrice: {$eq: 0},
            EndPrice: {$eq: 0}
        }).exec();

        return nextRoundInProgress;
    } catch (error) {
        console.error("Error occurred while getting current round in progress:", error);
        return null;
    }
};
