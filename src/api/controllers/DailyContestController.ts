import { Request, Response } from 'express'
import { GlobalState } from '../../providers/GlobalState'
import Utils from '../../utils/utils'
import { ITopWinRatioPlayer } from '../../interfaces/ITopWinRatio';

class DailyContestController {
    public static getHighRollers(req: Request, res: Response): void {
        const { user } = req.body
        try {

            const now = new Date();
            const end = new Date(now);
            end.setUTCHours(0, 0, 0, 0);
            end.setDate(end.getDate() + 1); // Move to the next day

            // Calculate the initial time left until the end of the contest
            const timeLeft = end.getTime() - now.getTime();

            const position = user
                ? GlobalState.highRollers.filter(x => x.Turnover >= 500).findIndex(
                    (hr) => String(hr.UserId) === String(user._id)
                )
                : -1

            const tradingVolume = user ? (GlobalState.highRollers.find(hr => String(hr.UserId) === String(user._id))?.Turnover || 0) : 0

            res.status(200).json({
                highRollers: GlobalState.highRollers.filter(x => x.Turnover >= 500),
                position,
                timeLeft,
                rewards: GlobalState.coinPerRank,
                tradingVolume,

            })
        } catch (error) {
            console.error('Error fetching high rollers:', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

    public static getWinRatioPlayers(req: Request, res: Response): void {
        const { user } = req.body
        try {

            const now = new Date();
            const end = new Date(now);
            end.setUTCHours(0, 0, 0, 0);
            end.setDate(end.getDate() + 1); // Move to the next day

            // Calculate the initial time left until the end of the contest
            const timeLeft = end.getTime() - now.getTime();

            const position = user
                ? GlobalState.topWinRatioPlayers.filter(x => x.NumberOfTrades >= 50).findIndex(
                    (tr) => String(tr.UserId) === String(user._id)
                )
                : -1

            const detail: ITopWinRatioPlayer | null | undefined = user ? GlobalState.topWinRatioPlayers.find(tr => String(tr.UserId) === String(user._id)) : null ;

            res.status(200).json({
                winRatioPlayers: GlobalState.topWinRatioPlayers.filter(x => x.NumberOfTrades >= 50),
                position,
                timeLeft,
                rewards: GlobalState.coinPerRank,
                detail,

            })
        } catch (error) {
            console.error('Error fetching high rollers:', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}

export default DailyContestController
