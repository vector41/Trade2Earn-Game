import WebSocket, { Server as WSServer } from 'ws'

import Locals from './Locals'
import { Server as HttpServer } from 'http'
import Log from '../api/middlewares/Log'
import AuthJwtToken from '../api/middlewares/Auth'
import { IUser } from '../models/User'
import Balance, { IBalance } from '../models/Balance'
import { GlobalState } from './GlobalState'
import { RoundPosition } from '../interfaces/IRoundStatus'
import { ITransaction } from '../models/Transaction'
import Config from '../Config'
import { isBooleanObject } from 'util/types'

export enum MessageType {
    BTC_PRICE = 0,
    SUBMITTED_TRADER = 1,
    ERROR = 2,
    BALANCE = 3,
    DEPOSIT = 4,
    PONG = 5,
    WITHDRAW = 6,
    NORMAL_ALERT = 7,
    SUBMIT_ORDER = 8
}

class Publisher {
    public wss: WSServer

    public playerConnections: Map<string, WebSocket> = new Map<
        string,
        WebSocket
    >()

    constructor(private httpServer: HttpServer) {
        this.wss = new WebSocket.Server({ server: httpServer })

        this.playerConnections = new Map()

        this.wss.on('connection', (ws: WebSocket) => {
            Log.info('Publisher :: Client was Connected!')

            this.onMessageFromClient(ws)
            this.onCloseFromClient(ws)
        })
    }

    static createInstance(httpServer: HttpServer): Publisher {
        return new Publisher(httpServer)
    }

    private onCloseFromClient(ws: WebSocket): void {
        // Event listener for closing the connection
        ws.on('close', () => {
            // Find and remove the WebSocket connection from the playerConnections map
            for (const [key, value] of this.playerConnections.entries()) {
                if (value === ws) {
                    this.playerConnections.delete(key)
                    Log.warn(`WebSocket disconnected for player ID ${key}`)
                    break
                }
            }
            Log.error('Publisher :: Client disconnected')
        })
    }

    public submitTradeOrder(
        user: IUser,
        poolId: string,
        direction: boolean,
        tradeSize: number,
        isBot?: boolean,
        ws?: WebSocket,
        updatedBalance?: IBalance
    ): void {
        const txn: ITransaction = GlobalState.txnManager.listen(
            user,
            poolId,
            direction,
            tradeSize,
            isBot
        )

        if (!isBot && updatedBalance && ws)
            ws.send(
                JSON.stringify({
                    messageType: MessageType.BALANCE,
                    data: {
                        balance: updatedBalance.Balance,
                        coin: updatedBalance.Coin
                    },
                })
            )

        this.broadcast(
            JSON.stringify({
                messageType: MessageType.SUBMITTED_TRADER,
                data: {
                    UserId: txn.User,
                    TradeSize: txn.TradeSize,
                    Direction: txn.Direction,
                    PoolId: txn.PoolId,
                    NewTotal: txn.NewTotal,
                    CountryCode: txn.CountryCode,
                    Avatar: txn.Avatar,
                },
            })
        )
    }

    public onMessageFromClient(ws: WebSocket) {
        // Event listener for closing the connection
        ws.on('message', async (message) => {
            const data = JSON.parse(message.toString())

            {
                try {
                    const { jwtToken, msg } = data

                    if (jwtToken && msg && msg === 'ping') {
                        const user: IUser =
                            await AuthJwtToken.jwtToken2User(jwtToken)
                        this.playerConnections.set(String(user._id), ws)
                        ws.send(
                            JSON.stringify({
                                messageType: MessageType.PONG,
                            })
                        )

                        return
                    }
                } catch (error) {
                    console.error(
                        'Error processing message from client:',
                        error
                    )
                }
            }

            try {
                if (GlobalState.stop) {
                    ws.send(
                        JSON.stringify({
                            messageType: MessageType.ERROR,
                            data: 'Maintenance is in progress.',
                        })
                    )
                    return
                }
                const { jwtToken, direction, tradeSize, poolId, messageType } = data

                if (messageType === MessageType.SUBMIT_ORDER && jwtToken && tradeSize && poolId) {
                    const user: IUser = await AuthJwtToken.jwtToken2User(jwtToken)

                    this.playerConnections.set(String(user._id), ws)

                    const balance: IBalance | null = await Balance.findOne({
                        User: user._id,
                    }).exec()

                    if ((balance && balance.Balance < tradeSize) || !balance) {
                        ws.send(
                            JSON.stringify({
                                messageType: MessageType.ERROR,
                                data: 'Insufficient balance',
                            })
                        )
                        return;
                    }

                    if (tradeSize > Config.maxTradeSize) {
                        ws.send(
                            JSON.stringify({
                                messageType: MessageType.ERROR,
                                data: 'Maximum trade size exceeded',
                            })
                        )
                        return;
                    }

                    if (tradeSize < Config.minTradeSize) {
                        ws.send(
                            JSON.stringify({
                                messageType: MessageType.ERROR,
                                data: 'Minimum transaction size exceeded',
                            })
                        )
                        return;
                    }

                    if (GlobalState.gameRound.currentPosition === RoundPosition.LOCKING || GlobalState.gameRound.currentPosition === RoundPosition.DISTRIBUTING) {
                        ws.send(
                            JSON.stringify({
                                messageType: MessageType.ERROR,
                                data: 'Wait next round',
                            })
                        )

                        return;
                    }

                    // Find the balance document for the user
                    Balance.findOneAndUpdate(
                        { User: user._id, Balance: { $gte: tradeSize } }, // Query condition to find the balance document for the user
                        { $inc: { Balance: -tradeSize, Coin: tradeSize / 5 } }, // Reduce the balance by the specified amount
                        { new: true } // Return the updated document
                    )
                        .then((updatedBalance: IBalance | null) => {
                            if (updatedBalance) {
                                this.submitTradeOrder(
                                    user,
                                    poolId,
                                    direction,
                                    tradeSize,
                                    false,
                                    ws,
                                    updatedBalance
                                )
                            } else {
                                console.log(
                                    'Balance document not found for the user:',
                                    user._id
                                )
                            }
                        })
                        .catch((error) => {
                            console.error('Error reducing balance:', error)
                        })
                }


            } catch (error) {
                console.error('Error processing message from client:', error)
            }
        })
    }

    public broadcast(message: string): void {
        // Broadcast the message to all connected clients

        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        })
    }
}

export default Publisher
