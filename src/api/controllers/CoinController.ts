import { INext, IRequest, IResponse } from '../../interfaces/vendors'
import { Request, Response, NextFunction } from 'express'
import { GlobalState } from '../../providers/GlobalState'
import {
    Coin,
    OrderStatus,
    WebHookMessageType,
} from '../../providers/CoinManager/Interfaces/ICoinManager'
import Config from '../../providers/CoinManager/Config'
import { RecordType, depositRecord } from '../services/DepositService'
import { MessageType } from '../../providers/Publisher'
import Utils from '../../utils/utils'
import Balance, { IBalance } from '../../models/Balance'
import { ethers } from 'ethers'
import Record from '../../models/Record'
import mongoose from 'mongoose'
import { withdrawRecord } from '../services/WithdrawService'

class CoinController {
    public static async getDepositAddressAndWithdrawFee(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { user, chain } = req.body // Assuming userId and chain are present in request body

        if (chain) {
            try {

                const data =
                    await GlobalState.coinManager.getOrCreateUserDepositAddress(
                        user._id,
                        chain
                    )


                const { fee } = await GlobalState.coinManager.getWithdrawFee(
                    Config.USDT,
                    chain
                )

                return res.json({ result: true, address: data.address, chain, minWithdraw: Config.MinWithdraw, fee: Number(fee.amount) * 1.3 }) // Sending the address as response

            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error:', error.message)
                    return res.status(500).json({ error: error.message }) // Sending error message as response
                } else {
                    console.error('An unknown error occurred:', error)
                    return res.status(500).json({ error: 'An unknown error occurred' }) // Sending generic error message as response
                }
            }
        }

        return res.status(400).send('Chain is required!')

    }

    public static async getNetworks(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { coin } = await GlobalState.coinManager.getCoinItem(
                Config.USDT
            )
            const networks = Object.keys(coin.networks)
                .map((chain) => ({
                    ...coin.networks[chain],
                }))
                .filter((network) => network.canDeposit && network.canWithdraw)

            res.json({ result: true, networks }) // Sending the address as response
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error:', error.message)
                res.status(500).json({ error: error.message }) // Sending error message as response
            } else {
                console.error('An unknown error occurred:', error)
                res.status(500).json({ error: 'An unknown error occurred' }) // Sending generic error message as response
            }
        }
    }

    public static async getNetworkFeeAndMinWithdraw(
        req: Request,
        res: Response
    ) {
        const { chain } = req.body
        if (chain) {
            try {
                const { fee } = await GlobalState.coinManager.getWithdrawFee(
                    Config.USDT,
                    chain
                )

                return res.send({
                    minWithdraw: Config.MinWithdraw,
                    fee: Number(fee.amount),
                })
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error:', error.message)
                    return res.status(500).json({ error: error.message }) // Sending error message as response
                } else {
                    console.error('An unknown error occurred:', error)
                    return res
                        .status(500)
                        .json({ error: 'An unknown error occurred' }) // Sending generic error message as response
                }
            }
        }

        return res.status(400).send('Chain is required!')
    }

    public static async withdraw(req: Request, res: Response) {
        const { chain, amount, user, toAddress } = req.body

        if (chain && amount > 0) {
            const session = await mongoose.startSession()

            try {
                session.startTransaction()

                const { fee } = await GlobalState.coinManager.getWithdrawFee(
                    Config.USDT,
                    chain
                )

                const balance: IBalance | null = await Balance.findOne({
                    User: user._id,
                }).session(session);

                if (Number.parseFloat(fee.amount) + Config.MinWithdraw > amount) {
                    await session.abortTransaction()
                    await session.endSession()

                    return res
                        .status(400)
                        .send(
                            'Enter an amount greater than the minimum allowed.'
                        )
                }
                    
                if (balance && balance?.Balance < amount) {
                    await session.abortTransaction()
                    await session.endSession()

                    return res.status(400).send('Insufficient balance')
                }
                    
                if (balance) {
                    const updatedBalance = await Balance.findOneAndUpdate(
                        { User: user._id, Balance: { $gte: amount } }, // Query condition to find the balance document for the user
                        { $inc: { Balance: -amount } }, // Reduce the balance by the specified amount
                        { new: true, session } // Return the updated document
                    ).then(async (balance) => {
                        if (balance && balance?.Balance >= 0) {
                            await GlobalState.coinManager.applyUserWithdrawToNetwork(
                                Config.USDT,
                                toAddress,
                                `${Utils.generateOrderId()}-${String(user._id)}`,
                                Config.CCPaymentApiId,
                                chain,
                                String(amount)
                            )
                        }

                        return balance;
                    })

                    await session.commitTransaction()
                    await session.endSession()

                    return res.send({
                        result: true,
                        balance: updatedBalance?.Balance,
                    })
                }
            } catch (error) {
                await session.abortTransaction()
                session.endSession()

                if (error instanceof Error) {
                    console.error('Error:', error.message)
                    return res.status(500).json({ error: error.message }) // Sending error message as response
                } else {
                    console.error('An unknown error occurred:', error)
                    return res
                        .status(500)
                        .json({ error: 'An unknown error occurred' }) // Sending generic error message as response
                }
            }
        }

        return res.status(400).send('Bad request')
    }

    public static async webHook(req: Request, res: Response) {
        // return res.send('success');

        const { headers, body } = req;

        if (Object.keys(body).length === 0) {
            return res.send("success");
        }

        try {

            const timestamp = headers['timestamp'] || ''
            const signature = headers['sign'] || ''
            const bodyText = JSON.stringify(body)
            const { type, msg } = req.body

            if (
                timestamp &&
                signature &&
                Utils.verifyCCPWebhook(
                    bodyText,
                    signature,
                    Config.CCPaymentApiId,
                    Config.CCPaymentAppSecret,
                    timestamp
                ) &&
                type &&
                msg &&
                msg.coinId === Config.USDT
            ) {
                if (type === WebHookMessageType.USER_DEPOSIT) {
                    const { record } =
                        await GlobalState.coinManager.getUserDepositRecord(
                            msg.recordId
                        )

                    const { success, data, error } = await depositRecord(record)

                    if (success && data?.updatedBalance && data?.savedRecord) {
                        const ws =
                            GlobalState.gameRound.publisher.playerConnections.get(
                                msg.userId
                            )

                        ws?.send(
                            JSON.stringify({
                                messageType: MessageType.DEPOSIT,
                                data: {
                                    amount: data.savedRecord.amount,
                                    balance: data.updatedBalance.Balance,
                                },
                            })
                        )

                    }

                    // if (!success) {
                    //     return res.status(400).send('Invalid Record')
                    // }

                    return res.send('success')
                }

                // Handles User Withdraw Event

                if (type === WebHookMessageType.USER_WITHDRAWAL) {
                    const { record } =
                        await GlobalState.coinManager.getUserWithdrawRecord(
                            msg.recordId
                        )

                    record.userId = record.orderId.split('-')[1]
                    // record.fromAddress = '0x'
                    // record.toAddress = record.ToAddress || record.toAddress

                    const { success, data: savedRecord } =
                        await withdrawRecord(record)

                    if (
                        success &&
                        savedRecord?.status === OrderStatus.SUCCESS
                    ) {
                        // send withdraw message
                        const ws =
                            GlobalState.gameRound.publisher.playerConnections.get(
                                String(savedRecord.userId)
                            )
                        ws?.send(
                            JSON.stringify({
                                messageType: MessageType.NORMAL_ALERT,
                                data: `${savedRecord.amount} USDT withdraw successfully`,
                            })
                        )
                    }
                    return res.send('success')
                }
            } else {
                res.status(400).send('Invalid signature')
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error:', error.message)
                res.status(500).json({ error: error.message }) // Sending error message as response
            } else {
                console.error('An unknown error occurred:', error)
                res.status(500).json({ error: 'An unknown error occurred' }) // Sending generic error message as response
            }
        }
    }
}

export default CoinController
