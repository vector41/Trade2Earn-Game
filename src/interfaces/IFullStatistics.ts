import { ITransaction } from '../models/Transaction'
import IBtcPrice from './IBtcPrice'
import { ITop100Winner } from './ITop100Winner'

export interface IRoundResult {
    roundId: string
    startPrice: number
    endPrice: number
}
export interface IFullStatistics {
    AllTimeWinsPaid: number
    WinRatioFor24H: number
    LivePlayersFor24H: number
    WinsPaidFor24H: number
    RoundResult: IRoundResult[]
    BtcPrices: IBtcPrice[]
    ContestPrize: number
    Traders: ITransaction[]
    Top100Winners: ITop100Winner[]
}
