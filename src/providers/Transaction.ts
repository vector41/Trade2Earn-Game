/**
 * Represents transaction-related functionalities such as listening for trades, analyzing transactions, and saving statistics.
 * Author: Isom D. <isom19901122@gmail.com>
 */

import { Alchemy, Network } from 'alchemy-sdk'
import { BytesLike, Result, ethers } from 'ethers'
import Locals from './Locals'
import utils from '../utils/utils'
import { ITransaction } from '../models/Transaction'
import { ITradingStatistics } from '../models/TradingStatistics'
import { IAffiliateDistribution } from '../models/Affiliate'
import { GlobalState } from './GlobalState'
import { Dashboard } from './Dashboard'
import { addBatchTransactions } from '../api/services/TransactionService'
import { getBatchUsers } from '../api/services/UserService'
import { updateBatchTradingStatistics } from '../api/services/TradingStatisticsService'
import { updateBatchAffiliate } from '../api/services/AffiliateService'
import { IUser } from '../models/User'
import mongoose, { ObjectId } from 'mongoose'
import AdminService from '../api/services/AdminService'
import {
    BalanceUpdate,
    batchUpdateBalance,
} from '../api/services/BalanceService'
import { IBalance } from '../models/Balance'
import { MessageType } from './Publisher'

interface ISetting {
    apiKey: string
    network: Network
}

interface IAffiliateStats {
    User: ObjectId
    Distribution: number[]
    InvitedPath?: string[]
}

export default class Transaction {
    public fee: number = Locals.config().fee
    public tier1Fee: number = Locals.config().tier1
    public tier2Fee: number = Locals.config().tier2
    public tier3Fee: number = Locals.config().tier3

    public static createInstance(): Transaction {
        return new Transaction()
    }

    public poolId30_15: string = Locals.config().poolId30_15

    public settings: ISetting = {
        apiKey: Locals.config().alchemyApiKey,
        network: Network.MATIC_MAINNET,
    }

    public alchemy = new Alchemy(this.settings)

    public filter: any = {
        address: Locals.config().smartContractAddress,
        topics: [
            ethers.id(
                'TradePlaced(bytes,address,uint256,string,uint256,bytes,address,string,string,int64,string)'
            ),
        ],
    }

    public decode(data: BytesLike): Result {
        return ethers.AbiCoder.defaultAbiCoder().decode(
            [
                'bytes',
                'address',
                'uint256',
                'string',
                'uint256',
                'string',
                'string',
                'int64',
                'string',
            ],
            data
        )
    }

    public transactions: ITransaction[] = []

    public getNewTotal(direction: boolean, poolId: string): number {
        return this.getFilteredTransactionsByPoolId(poolId)
            .filter((t) => t.Direction === direction)
            .reduce((accumulator, currentValue) => {
                return accumulator + currentValue.TradeSize
            }, 0)
    }

    public listen(
        User: IUser,
        PoolId: string,
        Direction: boolean,
        TradeSize: number,
        IsBot?: boolean
    ): ITransaction {
        const txn: ITransaction = {
            TradeSize,
            Direction,
            PoolId,
            NewTotal: this.getNewTotal(Direction, PoolId) + TradeSize,
            Avatar: User.Avatar,
            CountryCode: User.CountryCode,
            RoundId: GlobalState.gameRound.roundId,
            User: User._id,
            IsBot,
        }

        GlobalState.allTimeWinsPaid += txn.TradeSize

        this.transactions.push(txn)

        GlobalState.gameRound.publisher.broadcast(JSON.stringify(txn))

        return txn
    }

    public removeAllListeners(): void {
        this.alchemy.ws.removeAllListeners()
    }

    public setWin(startPrice: number, endPrice: number, poolId: string): void {
        const transactionsFiltedByPoolId =
            this.getFilteredTransactionsByPoolId(poolId)

        if (startPrice === endPrice) {
            this.clear(poolId)
            return
        }

        for (let i = 0; i < transactionsFiltedByPoolId.length; i++) {
            if (
                (transactionsFiltedByPoolId[i].Direction &&
                    endPrice > startPrice) ||
                (!transactionsFiltedByPoolId[i].Direction &&
                    endPrice < startPrice)
            )
                transactionsFiltedByPoolId[i].Result = true
            else transactionsFiltedByPoolId[i].Result = false
        }
    }

    public clear(poolId: string): void {
        this.transactions = this.transactions.filter(
            (txn) => txn.PoolId !== poolId
        )
    }

    public getFilteredTransactionsByPoolId(poolId: string): ITransaction[] {
        return this.transactions.filter((txn) => txn.PoolId === poolId)
    }

    public async save(poolId: string, roundId: string): Promise<void> {
        // this.transactions = utils.removeDuplicates<ITransaction>(
        //     this.transactions,
        //     'TxnHash'
        // )

        await addBatchTransactions(
            this.getFilteredTransactionsByPoolId(poolId).filter(
                (tx) => !tx.IsBot
            )
        )
        await this.analyzeTransactionAndSave(poolId)

        this.clear(poolId)
    }

    public getTotalPool(direction: boolean, poolId: string): number {
        const FilteredTransactionsByPoolId =
            this.getFilteredTransactionsByPoolId(poolId)

        const upTotalPoolSize = FilteredTransactionsByPoolId.filter(
            (tx) => tx.Direction === direction
        ).reduce((sum, tx) => sum + tx.TradeSize, 0)

        const maxNewTotal = FilteredTransactionsByPoolId.filter(
            (tx) => tx.Direction === direction
        ).reduce((maxNewTotal, tx) => Math.max(maxNewTotal, tx.NewTotal), 0)

        return Math.max(upTotalPoolSize, maxNewTotal)
    }

    public getTotalPoolWithoutBot(direction: boolean, poolId: string): number {
        const NotBotTxns = this.getFilteredTransactionsByPoolId(poolId).filter(
            (txn) => !txn.IsBot
        )

        const totalPoolSize = NotBotTxns.filter(
            (tx) => tx.Direction === direction
        ).reduce((sum, tx) => sum + tx.TradeSize, 0)

        return totalPoolSize
    }

    public getNetProfitAndFee(
        transaction: ITransaction,
        upPoolSize: number,
        downPoolSize: number,
        upPoolSizeNoBot: number,
        downPoolSizeNoBot: number
    ): { netProfit: number; commission: number } {
        const tradeSize = transaction.TradeSize

        if (!transaction.Result) {
            return { netProfit: -tradeSize, commission: 0 }
        }

        let profit =
            (transaction.Direction
                ? tradeSize / upPoolSize
                : tradeSize / downPoolSize) *
            (transaction.Direction ? downPoolSize : upPoolSize)

        let profitNoBot =
            (transaction.Direction
                ? tradeSize / upPoolSizeNoBot
                : tradeSize / downPoolSizeNoBot) *
            (transaction.Direction ? downPoolSizeNoBot : upPoolSizeNoBot)
        const netProfit = profit * (1 - this.fee)
        const commission = profitNoBot * this.fee

        return { netProfit, commission }
    }

    private async analyzeTransactionAndSave(poolId: string) {
        Dashboard.saveWinsPaid()

        const filteredTransactionsByPoolId =
            this.getFilteredTransactionsByPoolId(poolId)

        const NotbotTransactions = filteredTransactionsByPoolId.filter(
            (tx) => !tx.IsBot
        )

        if (NotbotTransactions.length === 0) return

        const tradingStatistics: ITradingStatistics[] = []
        const affiliateStatistics: IAffiliateStats[] = []

        const upPoolSize = this.getTotalPool(true, poolId)
        const downPoolSize = this.getTotalPool(false, poolId)

        const upPoolSizeNoBot = this.getTotalPoolWithoutBot(true, poolId)
        const downPoolSizeNoBot = this.getTotalPoolWithoutBot(false, poolId)

        // Create a Map to store address indices
        const addressIndices = new Map()
        const userIds: ObjectId[] = []

        let totalFee = 0

        NotbotTransactions.forEach((transaction) => {
            const { netProfit, commission } = this.getNetProfitAndFee(
                transaction,
                upPoolSize,
                downPoolSize,
                upPoolSizeNoBot,
                downPoolSizeNoBot
            )
            const statistics = {
                NetProfit: netProfit,
                NumberOfTrades: 1,
                NumberOfWins: transaction.Result ? 1 : 0,
                TradingVolume: transaction.TradeSize,
            }

            tradingStatistics.push({
                User: transaction.User,
                ThisMonth: statistics,
                ThisWeek: statistics,
                Today: statistics,
                AllTime: statistics,
            })

            if (!transaction.Result) return

            const userId = transaction.User

            if (addressIndices.has(userId)) {
                // Address already exists, update distribution
                const index = addressIndices.get(userId)
                affiliateStatistics[index].Distribution[0] +=
                    commission * this.tier1Fee
                affiliateStatistics[index].Distribution[1] +=
                    commission * this.tier2Fee
                affiliateStatistics[index].Distribution[2] +=
                    commission * this.tier3Fee
            } else {
                // Address doesn't exist, push new item
                addressIndices.set(userId, affiliateStatistics.length)
                affiliateStatistics.push({
                    User: userId,
                    Distribution: [
                        commission * this.tier1Fee,
                        commission * this.tier2Fee,
                        commission * this.tier3Fee,
                    ],
                })

                userIds.push(userId)
            }

            totalFee += commission
        })

        const { success, data: users, error } = await getBatchUsers(userIds)

        if (success && users) {
            // Iterate over affiliateStatistics
            affiliateStatistics.forEach((affiliate) => {
                // Find the corresponding user by Address
                const user = users.find(
                    (u) => String(u._id) === String(affiliate.User)
                )
                if (user) {
                    // Update InvitedPath with affiliate statistics
                    affiliate.InvitedPath = user.InvitedPath.split('#')
                }
            })
        }

        // Create a Map to store referralId indices
        const referralIdIndices = new Map()
        const affiliateReward: IAffiliateDistribution[] = []

        affiliateStatistics.forEach((aff) => {
            if (!aff.InvitedPath) return

            for (var i = 0; i < aff.InvitedPath.length; i++) {
                if (referralIdIndices.has(aff.InvitedPath[i])) {
                    const index = referralIdIndices.get(aff.InvitedPath[i])
                    // Assert the property name
                    ;(affiliateReward[index] as any)[`Tier${i + 1}Paid`] +=
                        aff.Distribution[i]
                    ;(affiliateReward[index] as any)[`Tier${i + 1}Unclaimed`] +=
                        aff.Distribution[i]
                } else {
                    referralIdIndices.set(
                        aff.InvitedPath[i],
                        affiliateReward.length
                    )

                    const newAffReward: IAffiliateDistribution = {
                        ReferralId: aff.InvitedPath[i],
                        Tier1Paid: 0,
                        Tier1Unclaimed: 0,
                        Tier2Paid: 0,
                        Tier2Unclaimed: 0,
                        Tier3Paid: 0,
                        Tier3Unclaimed: 0,
                    }

                    // Assert the property name
                    ;(newAffReward as any)[`Tier${i + 1}Paid`] +=
                        aff.Distribution[i]
                    ;(newAffReward as any)[`Tier${i + 1}Unclaimed`] +=
                        aff.Distribution[i]

                    affiliateReward.push(newAffReward)
                }
            }
        })

        const balanceUpdates: BalanceUpdate[] = NotbotTransactions.filter(
            (ftxn) => ftxn.Result
        ).map((ftxn) => {
            const { netProfit } = this.getNetProfitAndFee(
                ftxn,
                upPoolSize,
                downPoolSize,
                upPoolSizeNoBot,
                downPoolSizeNoBot
            )
            return {
                Amount: ftxn.TradeSize + netProfit,
                User: ftxn.User,
            }
        })

        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            await updateBatchTradingStatistics(tradingStatistics, session)
            await updateBatchAffiliate(affiliateReward, session)

            if (totalFee > 0) {
                const weeklyChallengeShare = Locals.config().weeklyChallengeShare

                const revenue =
                    1 -
                    (weeklyChallengeShare +
                        this.tier1Fee +
                        this.tier2Fee +
                        this.tier3Fee)

                const distrFee: BalanceUpdate[] = [
                    {
                        Amount: totalFee * weeklyChallengeShare,
                        User: GlobalState.weeklyChallengeUser?._id,
                    },
                    {
                        Amount: totalFee * revenue,
                        User: GlobalState.admin?._id,
                    },
                ]

                await batchUpdateBalance(distrFee, session)

            }

            const { success, data: updatedBalances } = await batchUpdateBalance(
                balanceUpdates,
                session
            )

            if (success && balanceUpdates.length > 0) {
                updatedBalances.forEach((ub: IBalance) => {
                    const clientWS =
                        GlobalState.gameRound.publisher.playerConnections.get(
                            String(ub.User)
                        )
                    const message = {
                        messageType: MessageType.BALANCE,
                        data: {
                            balance: ub.Balance,
                        },
                    }

                    clientWS?.send(JSON.stringify(message))
                })
            }

            await session.commitTransaction()
            await session.endSession()
        } catch (error) {
            console.error('An error occurred:', error)
            // Handle the error as needed, such as rolling back the transaction
            await session.abortTransaction()
            session.endSession()
        }
    }
}
