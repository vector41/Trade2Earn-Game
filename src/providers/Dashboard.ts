import * as fs from 'fs'
import * as path from 'path'
import { GlobalState } from './GlobalState'
import utils from '../utils/utils'
import { IFullStatistics, IRoundResult } from '../interfaces/IFullStatistics'
import Log from '../api/middlewares/Log'

export class Dashboard {
    public static gameStateDirectory: string = 'gameState'

    public static roundResults: Map<string, IRoundResult[]> = new Map()

    public static getLatestFullStatistics(poolId: string): IFullStatistics {
        const roundResults = this.roundResults.get(poolId) ?? []

        return {
            AllTimeWinsPaid: GlobalState.allTimeWinsPaid,
            LivePlayersFor24H: GlobalState.livePlayersFor24H,
            WinRatioFor24H: GlobalState.winRatioFor24H,
            WinsPaidFor24H: GlobalState.winsPaidFor24H,
            RoundResult: roundResults.slice(-10),
            BtcPrices: GlobalState.btcPrices,
            ContestPrize: GlobalState.contestPrize,
            Traders:
                GlobalState.txnManager.getFilteredTransactionsByPoolId(poolId),
            Top100Winners: GlobalState.top100WinnersForToday
        }
    }

    public static saveWinsPaid(): void {
        const timestamp = utils.getTimestamp()
        const filename = `${timestamp}.json`
        const filePath = path.join(this.gameStateDirectory, filename)

        if (!fs.existsSync(this.gameStateDirectory)) {
            fs.mkdirSync(this.gameStateDirectory)
        }

        const data = JSON.stringify({
            allTimeWinsPaid: GlobalState.allTimeWinsPaid,
        })

        fs.writeFileSync(filePath, data, 'utf-8')

        // Remove excess files
        this.removeExcessFiles()
    }

    public static removeExcessFiles(): void {
        const files = fs.readdirSync(this.gameStateDirectory)
        const sortedFiles = files.sort((a, b) => {
            return (
                fs
                    .statSync(path.join(this.gameStateDirectory, b))
                    .mtime.getTime() -
                fs
                    .statSync(path.join(this.gameStateDirectory, a))
                    .mtime.getTime()
            )
        })

        for (let i = 10; i < sortedFiles.length; i++) {
            const filePath = path.join(this.gameStateDirectory, sortedFiles[i])
            fs.unlinkSync(filePath)
        }
    }

    public static getLatestAllTimeWinsPaidFile(): string {
        const files = fs.readdirSync(this.gameStateDirectory)
        const sortedFiles = files.sort((a, b) => {
            return (
                fs
                    .statSync(path.join(this.gameStateDirectory, b))
                    .mtime.getTime() -
                fs
                    .statSync(path.join(this.gameStateDirectory, a))
                    .mtime.getTime()
            )
        })

        return path.join(this.gameStateDirectory, sortedFiles[0])
    }

    public static loadAllTimeWinsPaidFile(): void {
        try {
            const latestFile = this.getLatestAllTimeWinsPaidFile()
            const data = fs.readFileSync(latestFile, 'utf-8')

            GlobalState.allTimeWinsPaid = JSON.parse(data).allTimeWinsPaid
        } catch (error) {
            Log.error(`Dashboard :: loadAllTimeWinsPaidFile${error}`)
        }
    }

    public static addRoundResult(
        startPrice: number,
        endPrice: number,
        roundId: string,
        poolId: string
    ) {
        let poolRoundResults = this.roundResults.get(poolId)
        if (!poolRoundResults) {
            poolRoundResults = []
            this.roundResults.set(poolId, poolRoundResults)
        }

        poolRoundResults.push({ startPrice, endPrice, roundId })

        if (poolRoundResults.length > 20) {
            poolRoundResults = poolRoundResults.slice(-20)
            this.roundResults.set(poolId, poolRoundResults)
        }
    }
}
