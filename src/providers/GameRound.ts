import {
    BalanceUpdate,
    batchUpdateBalance,
} from '../api/services/BalanceService'
import IBtcPrice from '../interfaces/IBtcPrice'
import IRoundStatus, { RoundPosition } from '../interfaces/IRoundStatus'
import { IBalance } from '../models/Balance'
import Utils from '../utils/utils'
import { Dashboard } from './Dashboard'
import { GlobalState } from './GlobalState'
import Locals from './Locals'
import Publisher, { MessageType } from './Publisher'
import Subscriber from './Subscriber'
import { v4 as uuidv4 } from 'uuid'

export default class GameRound {
    public maxSlice: number = Locals.config().maxSlice
    public betDuration: number = Locals.config().betDuration
    public tradeDuration: number = Locals.config().tradeDuration
    public cycle: number = Locals.config().localCycle
    public batchSize: number = Locals.config().batchSize

    public tradeStartIndex: number = 0
    public endFrameIndex: number = 0
    public endPrice: number = 0

    public currentLocalFrameIndex: number = 0
    public startFrameIndex: number = 0
    public startPrice: number = 0
    public currentPosition: RoundPosition = RoundPosition.NONE
    public previousPosition: RoundPosition = RoundPosition.NONE
    public currentBtcPrice: IBtcPrice = { localTimeIndex: 0, value: 0 }

    public roundId: string = uuidv4()

    public poolId = Locals.config().poolId30_15

    constructor(
        public publisher: Publisher,
        public subscriber: Subscriber
    ) {}

    static createInstance(
        publisher: Publisher,
        subscriber: Subscriber
    ): GameRound {
        return new GameRound(publisher, subscriber)
    }

    public initRound(): void {
        this.startFrameIndex = this.endFrameIndex
        this.tradeStartIndex = this.startFrameIndex + this.betDuration
        this.endFrameIndex =
            this.startFrameIndex + this.betDuration + this.tradeDuration

        this.roundId = uuidv4()

        GlobalState.botPlayers.generate(
            this.startFrameIndex,
            this.tradeStartIndex
        )
    }

    public reset(): void {
        this.startPrice = 0
        this.endPrice = 0
    }

    public start(): void {
        this.initRound()
        this.lifeCycle()
    }

    private async lifeCycle(): Promise<void> {
        setTimeout(async (): Promise<void> => {
            const lastPrice: number =
                this.subscriber.lastData === ''
                    ? 0
                    : Number(
                          Number(
                              JSON.parse(this.subscriber.lastData)?.p
                          ).toFixed(3)
                      )

            if (lastPrice > 0) {
                if (
                    this.endFrameIndex === this.currentLocalFrameIndex &&
                    !GlobalState.stop
                ) {

                    this.endPrice = lastPrice
                    this.previousPosition = this.currentPosition
                    this.currentPosition = RoundPosition.DISTRIBUTING

                    const txns =
                        GlobalState.txnManager.getFilteredTransactionsByPoolId(
                            this.poolId
                        )

                    if (txns.length > 0) {
                        if (
                            this.startPrice === this.endPrice ||
                            !(
                                txns.filter((txn) => txn.Direction === true)
                                    .length > 0 &&
                                txns.filter((txn) => txn.Direction === false)
                                    .length > 0
                            )
                        ) {
                            const balanceUpdates: BalanceUpdate[] = txns
                                .filter((txn) => !txn.IsBot)
                                .map((ftxn) => {
                                    return {
                                        Amount: ftxn.TradeSize,
                                        User: ftxn.User,
                                    }
                                })

                            batchUpdateBalance(balanceUpdates).then(
                                ({ data: updatedBalances, success, error }) => {
                                    if (success) {
                                        ;(
                                            updatedBalances as IBalance[]
                                        ).forEach((ub: IBalance) => {
                                            const clientWS =
                                                GlobalState.gameRound.publisher.playerConnections.get(
                                                    String(ub.User)
                                                )
                                            const message = {
                                                messageType:
                                                    MessageType.BALANCE,
                                                data: {
                                                    balance: ub.Balance,
                                                },
                                            }

                                            clientWS?.send(
                                                JSON.stringify(message)
                                            )
                                        })
                                    }
                                }
                            )
                            GlobalState.txnManager.clear(this.poolId)
                        } else {
                            GlobalState.txnManager.setWin(
                                this.startPrice,
                                this.endPrice,
                                this.poolId
                            )

                            GlobalState.txnManager.save(
                                this.poolId,
                                this.roundId
                            )
                        }
                    }

                    this.initRound()

                    Utils.delay(2500).then(async (): Promise<void> => {
                        this.previousPosition = this.currentPosition
                        this.currentPosition = RoundPosition.DISTRIBUTED

                        Dashboard.addRoundResult(
                            this.startPrice,
                            this.endPrice,
                            this.roundId,
                            this.poolId
                        )
                        this.reset()
                    })
                }

                if (
                    this.tradeStartIndex === this.currentLocalFrameIndex &&
                    !GlobalState.stop
                ) {
                    this.startPrice = lastPrice

                    this.previousPosition = this.currentPosition
                    this.currentPosition = RoundPosition.LOCKING
                }

                if (this.currentLocalFrameIndex < this.tradeStartIndex) {
                    GlobalState.botPlayers.trade(this.currentLocalFrameIndex)
                }

                this.currentBtcPrice = {
                    localTimeIndex: this.currentLocalFrameIndex,
                    value: lastPrice,
                }

                GlobalState.btcPrices.push(this.currentBtcPrice)
                GlobalState.btcPrices = GlobalState.btcPrices.slice(
                    -this.maxSlice
                )

                const roundStatus: IRoundStatus = {
                    currentLocalFrameIndex: this.currentLocalFrameIndex,
                    currentBtcPrice: this.currentBtcPrice,
                    startFrameIndex: this.startFrameIndex,
                    startPrice: this.startPrice,
                    endPrice: this.endPrice,
                    currentPosition: this.currentPosition,
                    previousPosition: this.previousPosition,
                }

                this.currentLocalFrameIndex++

                this.publisher.broadcast(
                    JSON.stringify({
                        messageType: MessageType.BTC_PRICE,
                        data: roundStatus,
                    })
                )

                if (this.currentPosition === RoundPosition.DISTRIBUTED)
                    this.currentPosition = RoundPosition.NONE
            }

            this.lifeCycle()
        }, this.cycle)
    }
}
