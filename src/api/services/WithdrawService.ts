import mongoose from 'mongoose'
import {
    OrderStatus,
    Record,
} from '../../providers/CoinManager/Interfaces/ICoinManager'
import utils from '../../utils/utils'
import RecordModel, { IRecord } from '../../models/Record'
import Log from '../middlewares/Log'
import { singleUpdateBalance } from './BalanceService'
import { IBalance } from '../../models/Balance'
import { GlobalState } from '../../providers/GlobalState'
import Config from '../../providers/CoinManager/Config'
import Utils from '../../utils/utils'
import { MessageType } from '../../providers/Publisher'

export enum RecordType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

export async function withdrawRecord(
    withdraw: Record
): Promise<{ success: boolean; error?: any; data?: IRecord }> {
    try {
        // Check if a record with the same recordId exists
        const existingRecord = await RecordModel.findOne({
            recordId: withdraw.recordId,
        })

        if (existingRecord) {
            if (existingRecord.status === withdraw.status) {
                return { success: true }
            }

            // If a record with the same recordId exists, update it
            existingRecord.status = withdraw.status
            existingRecord.txId = withdraw.txId

            // Save the updated record to the database
            const savedRecord = await existingRecord.save()

            return { success: true, data: savedRecord }
        } else {
            // If no record with the same recordId exists, create a new one
            const newRecord = new RecordModel({
                recordId: withdraw.recordId,
                userId: new mongoose.Types.ObjectId(withdraw.userId),
                coinId: withdraw.coinId,
                status: withdraw.status,
                chain: withdraw.chain,
                amount: Number(withdraw.amount),
                txId: withdraw.txId,
                toAddress: withdraw.toAddress,
                fromAddress: withdraw.fromAddress,
                type: RecordType.WITHDRAW,
                accepted: true,
            })

            // Save the new record to the database
            const savedRecord = await newRecord.save()

            // Return the newly created record
            return { success: true, data: savedRecord }
        }
    } catch (error) {
        Log.error(`WithdrawService :: withdrawRecord: ${error}`)
        return { success: false, error }
    }
}
