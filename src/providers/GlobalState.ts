import IBtcPrice from '../interfaces/IBtcPrice'
import { IHightRoller } from '../interfaces/IHighRoller'
import { ITop100Winner } from '../interfaces/ITop100Winner'
import { ITopWinRatioPlayer } from '../interfaces/ITopWinRatio'
import { IBTCChallengePool, IBTCChallengePoolModel } from '../models/BTCChallengePool'
import { IUser } from '../models/User'
import { Bot } from './Bot'
import CoinManager from './CoinManager/CoinManager'
import GameRound from './GameRound'
import Transaction from './Transaction'

export class GlobalState {

    public static coinPerRank = [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100]
    public static ratePerRankInChallenge = [0.5, 0.25, 0.125, 0.083, 0.042]


    public static btcPrices: Array<IBtcPrice> = []
    public static stop: boolean = false
    public static stopBot: boolean = false
    public static winRatioFor24H: number = 0
    public static allTimeWinsPaid: number = 0
    public static livePlayersFor24H: number = 0
    public static winsPaidFor24H: number = 0
    public static contestPrize: number = 0

    public static txnManager: Transaction = Transaction.createInstance()

    public static coinManager = new CoinManager()
    public static gameRound: GameRound

    public static admin: IUser | null

    // public static jackpotMonthlyUser: IUser | null

    // public static jackpotWeeklyUser: IUser | null

    public static weeklyChallengeUser: IUser

    public static highRollers: IHightRoller[] = []
    public static topWinRatioPlayers: ITopWinRatioPlayer[] = []

    public static top100WinnersForToday: ITop100Winner[] = [];
    public static top100WinnersForThisWeek: ITop100Winner[] = [];
    public static top100WinnersForThisMonth: ITop100Winner[] = [];
    public static top100WinnersForAllTime: ITop100Winner[] = [];

    public static botPlayers: Bot = new Bot()

    public static currentChallengeRound: IBTCChallengePoolModel | null = null;
    public static nextChallengeRound: IBTCChallengePoolModel | null = null;
    public static lastExpredChallengeRound: IBTCChallengePoolModel | null = null;
}
