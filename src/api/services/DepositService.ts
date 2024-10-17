import mongoose from 'mongoose';
import { OrderStatus, Record } from '../../providers/CoinManager/Interfaces/ICoinManager';
import utils from '../../utils/utils';
import RecordModel, { IRecord } from '../../models/Record';
import Log from '../middlewares/Log';
import { singleUpdateBalance } from './BalanceService';
import { IBalance } from '../../models/Balance';
import { GlobalState } from '../../providers/GlobalState';
import Config from '../../providers/CoinManager/Config';
import Utils from '../../utils/utils';

export enum RecordType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

export async function depositRecord(deposit: Record): Promise<{
    success: boolean;
    error?: any;
    data?: { savedRecord?: IRecord; updatedBalance?: IBalance };
}> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check if a record with the same recordId exists
        const existingRecord = await RecordModel.findOne({
            recordId: deposit.recordId,
        }).session(session);

        if (existingRecord) {
            if (deposit.status === existingRecord.status) {
                await session.abortTransaction();
                return { success: true };
            }

            existingRecord.status = deposit.status;

            if (deposit.status === OrderStatus.SUCCESS) {
                const orderId = Utils.generateOrderId();

                const userTransferAmount = (
                    Number(deposit.amount) *
                    (1 - 0.031 / 100)
                ).toString();

                try {
                    await GlobalState.coinManager.userTransfer(
                        deposit.userId,
                        Config.CCPaymentApiId,
                        Config.USDT,
                        orderId,
                        userTransferAmount,
                        'DepositToAdmin',
                    );
                    existingRecord.accepted = true;
                } catch (error) {
                    existingRecord.accepted = false;

                    Log.error(`DepositService :: DepositToAdmin: ${error}`);
                }

                // Save the updated record to the database
                const savedRecord = await existingRecord.save({ session });

                const { data: updatedBalance } = await singleUpdateBalance(
                    savedRecord.userId,
                    savedRecord.amount,
                    session
                );

                // Commit the transaction
                await session.commitTransaction();

                // Return the updated record
                return { success: true, data: { savedRecord, updatedBalance } };
            }

            const savedRecord = await existingRecord.save({ session });

            // Commit the transaction
            await session.commitTransaction();

            return { success: true, data: { savedRecord } };
        } else {
            // If no record with the same recordId exists, create a new one
            const newRecord = new RecordModel({
                recordId: deposit.recordId,
                userId: new mongoose.Types.ObjectId(deposit.userId),
                coinId: deposit.coinId,
                status: deposit.status,
                chain: deposit.chain,
                amount: Number(deposit.amount),
                txId: deposit.txId,
                toAddress: deposit.toAddress,
                fromAddress: deposit.fromAddress,
                type: RecordType.DEPOSIT,
                accepted: false,
            });

            if (deposit.status === OrderStatus.SUCCESS) {
                const orderId = Utils.generateOrderId();
                const userTransferAmount = (
                    Number(deposit.amount) *
                    (1 - 0.031 / 100)
                ).toString();

                try {
                    await GlobalState.coinManager.userTransfer(
                        deposit.userId,
                        Config.CCPaymentApiId,
                        Config.USDT,
                        orderId,
                        userTransferAmount,
                        'DepositToAdmin',
                    );
                    newRecord.accepted = true;
                } catch (error) {
                    newRecord.accepted = false;

                    Log.error(`DepositService :: DepositToAdmin: ${error}`);
                }

                const savedRecord = await newRecord.save({ session });
                const { data: updatedBalance } = await singleUpdateBalance(
                    savedRecord.userId,
                    savedRecord.amount,
                    session
                );

                // Commit the transaction
                await session.commitTransaction();

                return { success: true, data: { savedRecord, updatedBalance } };
            }

            const savedRecord = await newRecord.save({ session });

            // Commit the transaction
            await session.commitTransaction();

            return { success: true, data: { savedRecord } };
        }
    } catch (error) {
        // Abort the transaction if an error occurs
        await session.abortTransaction();
        Log.error(`DepositService :: depositRecord: ${error}`);
        return { success: false, error };
    } finally {
        // End the session
        session.endSession();
    }
}
