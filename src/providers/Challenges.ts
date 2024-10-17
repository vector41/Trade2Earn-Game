import { scheduleJob, Timezone, RecurrenceRule } from "node-schedule";
import BTCChallengePool, { IBTCChallengePool } from "../models/BTCChallengePool";
import Utils from "../utils/utils";
import { GlobalState } from "./GlobalState";
import { getCurrentRoundInProgress, getNextRoundInProgress } from "../api/services/BTCChallengePoolService";
import Log from "../api/middlewares/Log";
import FutureBTCChallenge, { IFutureBTCChallenge } from "../models/FutureBTCChallenge";
import Balance from "../models/Balance";
import { IReward } from "../models/Reward";
import { insertRewards } from "../api/services/RewardService";

const nextRoundTime = () => {
    // Get the current date and time
    const currentDate = new Date();
    const nextStartTime = new Date(currentDate);

    // unit = 1 week
    nextStartTime.setUTCDate(currentDate.getUTCDate() + ( 7 - currentDate.getUTCDay()));
    nextStartTime.setUTCHours(0);
    nextStartTime.setUTCMinutes(0);
    nextStartTime.setUTCSeconds(0);
    nextStartTime.setUTCMilliseconds(0);

    const nextEndTime = new Date(nextStartTime);
    nextEndTime.setUTCDate(nextStartTime.getUTCDate() + 7);

    console.log(nextStartTime, nextEndTime);
    console.log(currentDate.getUTCHours())

    // // unit = 1 hour
    // nextStartTime.setUTCHours(currentDate.getUTCHours() + 1);
    // nextStartTime.setUTCMinutes(0);
    // nextStartTime.setUTCSeconds(0);
    // nextStartTime.setUTCMilliseconds(0);

    // const nextEndTime = new Date(nextStartTime);
    // nextEndTime.setUTCHours(nextStartTime.getUTCHours() + 1);


// //    unit = 1 minute
//     nextStartTime.setUTCMinutes(currentDate.getUTCMinutes() + 1);
//     nextStartTime.setUTCSeconds(0);
//     nextStartTime.setUTCMilliseconds(0);

//     const nextEndTime = new Date(nextStartTime);
//     nextEndTime.setUTCMinutes(nextStartTime.getUTCMinutes() + 1);

    return {
        nextStartTime,
        nextEndTime
    }
}

(async () => {


    try {
        GlobalState.currentChallengeRound = await getCurrentRoundInProgress();
        GlobalState.nextChallengeRound = await getNextRoundInProgress();

        if (GlobalState.nextChallengeRound) {
            Balance.findOneAndUpdate(
                { User: GlobalState.weeklyChallengeUser._id }, // Query condition to find the balance document for the user
                { $set: { Balance: 0 } }, // Reduce the balance by the specified amount
            ).then(async(lastBalance) => {
                
                if(!lastBalance || lastBalance.Balance <= 0) return;

                const positions: IFutureBTCChallenge[] = await FutureBTCChallenge.find({BTCChallengePool: GlobalState.nextChallengeRound?._id}).exec();
                positions.sort((p1, p2) => {
                    let d1 = 0, d2 = 0;
                    if (GlobalState.nextChallengeRound) {
                        d1 = Math.abs(p1.Position - GlobalState.nextChallengeRound.EndPrice);
                        d2 = Math.abs(p2.Position - GlobalState.nextChallengeRound.EndPrice);
                    }

                    return d1 - d2;

                })

                positions.map(p => {

                })

                const rewards: IReward[] = []

                // if (prize && prize?.Balance > 0) {
                    positions.forEach((position, index) => {
                        if(index < GlobalState.ratePerRankInChallenge.length) {
                            rewards.push({
                                amount: GlobalState.ratePerRankInChallenge[index] * lastBalance?.Balance,
                                currency: "USDT",
                                user: position.User,
                                claimed: false,
                                description: `Weekly BTC Challenge #${index + 1}`,
                            })
                        }
                        
                    })
    
                    if(rewards.length > 0) await insertRewards(rewards);



            })



        }

        //===================================================
    
        //===================================================

        if (!GlobalState.nextChallengeRound) {

            const { nextStartTime, nextEndTime } = nextRoundTime();
            const nextChallengeRound = new BTCChallengePool({
                StartTime: nextStartTime,
                EndTime: nextEndTime,
                StartPrice: 0,
                EndPrice: 0,
                Prize: 0,
            });

            GlobalState.nextChallengeRound = await nextChallengeRound.save();
        }

        scheduleJob({  second: 0, minute: 0, hour: 0, dayOfWeek: 0,tz: "Etc/UTC" }, async () => {
        // scheduleJob({  second: 0, minute: 0, tz: "Etc/UTC" }, async () => {
        // scheduleJob("* * * * *", async () => {
            const price = GlobalState.gameRound.currentBtcPrice;

            if(GlobalState.currentChallengeRound) {
                GlobalState.currentChallengeRound.EndPrice = price.value;
                GlobalState.currentChallengeRound.NextId = GlobalState.nextChallengeRound?._id;
                

                GlobalState.lastExpredChallengeRound = await GlobalState.currentChallengeRound.save();

                // =========== Closed ==============
                console.log("Expired: ", GlobalState.lastExpredChallengeRound);
            }

            GlobalState.currentChallengeRound = GlobalState.nextChallengeRound;

            if(GlobalState.currentChallengeRound) {
                GlobalState.currentChallengeRound.StartPrice = price.value;

                GlobalState.currentChallengeRound = await GlobalState.currentChallengeRound.save();

                console.log("Live: ", GlobalState.currentChallengeRound);
            }

            const {  nextStartTime, nextEndTime } = nextRoundTime();

                const nextChallengeRound = new BTCChallengePool({
                    StartTime: nextStartTime,
                    EndTime: nextEndTime,
                    StartPrice: 0,
                    EndPrice: 0,
                    Prize: 0,
                    PrevId: GlobalState.currentChallengeRound?._id
                });

            GlobalState.nextChallengeRound = await nextChallengeRound.save();
            if (GlobalState.currentChallengeRound) {
                GlobalState.currentChallengeRound.NextId = GlobalState.nextChallengeRound._id;
                GlobalState.currentChallengeRound = await GlobalState.currentChallengeRound.save();
            }

            console.log("Next: ", GlobalState.nextChallengeRound);

            // Distributes rewards to winners
            if (GlobalState.lastExpredChallengeRound) {
                Balance.findOneAndUpdate(
                    { User: GlobalState.weeklyChallengeUser._id }, // Query condition to find the balance document for the user
                    { $set: { Balance: 0 } }, // Reduce the balance by the specified amount
                ).then(async(lastBalance) => {
                    const positions: IFutureBTCChallenge[] = await FutureBTCChallenge.find({BTCChallengePool: GlobalState.lastExpredChallengeRound?._id}).exec();
                    positions.sort((p1, p2) => {
                        let d1 = 0, d2 = 0;
                        if (GlobalState.lastExpredChallengeRound) {
                            d1 = Math.abs(p1.Position - GlobalState.lastExpredChallengeRound.EndPrice);
                            d2 = Math.abs(p2.Position - GlobalState.lastExpredChallengeRound.EndPrice);
                        }

                        return d1 - d2;

                    })


                })



            }

            console.log("==================================================");

        })
    } catch (error) {
        Log.error(`Challenge :: ${error}`);
    }
})();