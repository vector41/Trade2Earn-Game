import mongoose from 'mongoose'
import Balance from '../../models/Balance'
import { GlobalState } from '../../providers/GlobalState'
import Log from '../middlewares/Log'
import { singleUpdateBalance } from './BalanceService'

export default class AdminService {
    public static feeTo(
        fee: number,
        userId: mongoose.Types.ObjectId,
        session: mongoose.mongo.ClientSession
    ) {
        try {
            singleUpdateBalance(userId, fee, session)
        } catch (error) {
            // Handle errors
            Log.error(
                `AdminService :: feeTo => Error increasing balance: ${error}`
            )

            throw error
        }
    }
}
