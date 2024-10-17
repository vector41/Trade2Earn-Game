import { GlobalState } from './GlobalState'
import { IFullStatistics } from '../interfaces/IFullStatistics'
import { Dashboard } from './Dashboard'
import { getFullStatistics } from '../api/services/TransactionService'
import Locals from './Locals'
import { getHighRollersForToday, getTop100WinnersForAllTime, getTop100WinnersForThisMonth, getTop100WinnersForThisWeek, getTop100WinnersForToday, getTopWinRatioPlayers } from '../api/services/TradingStatisticsService'
import Balance from '../models/Balance'

export class EventSchedule {
    public async fullStatistics() {
        const { success, data, error } = await getFullStatistics()

        if (success && data) {
            GlobalState.livePlayersFor24H = (
                data as IFullStatistics
            ).LivePlayersFor24H
            GlobalState.winRatioFor24H = (
                data as IFullStatistics
            ).WinRatioFor24H
            GlobalState.winsPaidFor24H = (
                data as IFullStatistics
            ).WinsPaidFor24H
        }

        // console.log("Jackpot Address: ", this.jackpotAddress);
        GlobalState.contestPrize =
            (await Balance.findOne({User: GlobalState.weeklyChallengeUser._id}))?.Balance || 0;

        GlobalState.highRollers = await getHighRollersForToday();

        GlobalState.top100WinnersForToday = await getTop100WinnersForToday();
        GlobalState.topWinRatioPlayers = await getTopWinRatioPlayers();
        // GlobalState.top100WinnersForThisWeek = await getTop100WinnersForThisWeek();
        // GlobalState.top100WinnersForThisMonth = await getTop100WinnersForThisMonth();
        // GlobalState.top100WinnersForAllTime = await getTop100WinnersForAllTime();

    }

    public runFullStatisticsSchedule() {
        this.fullStatistics()
        setInterval(this.fullStatistics, 1 * 60 * 1000)
    }

    // start schedule
    public start() {
        this.runFullStatisticsSchedule()
    }

    // create instance
    static createInstance(): EventSchedule {
        return new EventSchedule()
    }
}
