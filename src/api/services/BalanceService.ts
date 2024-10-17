import mongoose, { ObjectId } from 'mongoose'
import Balance, { IBalance } from '../../models/Balance'
import Log from '../middlewares/Log'
import User, { IUser } from '../../models/User'
import { IReturnData } from '../../interfaces/IReturnData'

export interface BalanceUpdate {
    User: ObjectId
    Amount: number
}

export const batchUpdateBalance = async (
    balanceUpdates: BalanceUpdate[],
    session?: mongoose.mongo.ClientSession
): Promise<IReturnData<IBalance[]>> => {
    try {
        const bulkOps = balanceUpdates.map((update) => ({
            updateOne: {
                filter: { User: update.User },
                update: { $inc: { Balance: update.Amount } },
            },
        }))

        await Balance.bulkWrite(bulkOps, { session })

        const userIds = balanceUpdates.map((b) => b.User)

        const updatedBalances: IBalance[] = session
            ? await Balance.find({
                  User: { $in: userIds },
              })
                  .session(session)
                  .exec()
            : await Balance.find({
                  User: { $in: userIds },
              }).exec()

        return { success: true, data: updatedBalances }
    } catch (error) {
        // if(session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }

        Log.error(
            `BalanceService :: BalanceUpdate => Error during bulk write operation: ${error}`
        )

        // return { success: false, error }
        throw error
        // Handle the error as needed
    }
}

export const singleUpdateBalance = async (
    User: mongoose.Types.ObjectId,
    Amount: number,
    session?: mongoose.mongo.ClientSession
): Promise<IReturnData<IBalance>> => {
    try {
        // Find the balance document for the user and update it
        const updatedBalance = await Balance.findOneAndUpdate(
            { User },
            { $inc: { Balance: Amount } },
            { new: true, session }
        )

        // Handle the updated balance if needed
        // For example, you can return it or perform additional actions
        return { success: true, data: updatedBalance }
    } catch (error) {
        // if (session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }
        // Handle errors
        Log.error(
            `BalanceService :: singleUpdateBalance => Error increasing balance: ${error}`
        )
        // return { success: false, error }
        throw error
    }
}

export const singleUpdateCoin = async (
    User: mongoose.Types.ObjectId,
    Amount: number,
    session?: mongoose.mongo.ClientSession
): Promise<IReturnData<IBalance>> => {
    try {
        // Find the balance document for the user and update it
        const updatedBalance = await Balance.findOneAndUpdate(
            { User },
            { $inc: { Coin: Amount } },
            { new: true, session }
        )

        // Handle the updated balance if needed
        // For example, you can return it or perform additional actions
        return { success: true, data: updatedBalance }
    } catch (error) {
        // if (session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }
        // Handle errors
        Log.error(
            `BalanceService :: singleUpdateBalance => Error increasing balance: ${error}`
        )
        // return { success: false, error }
        throw error
    }
}
