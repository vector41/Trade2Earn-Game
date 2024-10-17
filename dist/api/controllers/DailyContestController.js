"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GlobalState_1 = require("../../providers/GlobalState");
class DailyContestController {
    static getHighRollers(req, res) {
        var _a;
        const { user } = req.body;
        try {
            const now = new Date();
            const end = new Date(now);
            end.setUTCHours(0, 0, 0, 0);
            end.setDate(end.getDate() + 1); // Move to the next day
            // Calculate the initial time left until the end of the contest
            const timeLeft = end.getTime() - now.getTime();
            const position = user
                ? GlobalState_1.GlobalState.highRollers.filter(x => x.Turnover >= 500).findIndex((hr) => String(hr.UserId) === String(user._id))
                : -1;
            const tradingVolume = user ? (((_a = GlobalState_1.GlobalState.highRollers.find(hr => String(hr.UserId) === String(user._id))) === null || _a === void 0 ? void 0 : _a.Turnover) || 0) : 0;
            res.status(200).json({
                highRollers: GlobalState_1.GlobalState.highRollers.filter(x => x.Turnover >= 500),
                position,
                timeLeft,
                rewards: GlobalState_1.GlobalState.coinPerRank,
                tradingVolume,
            });
        }
        catch (error) {
            console.error('Error fetching high rollers:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    static getWinRatioPlayers(req, res) {
        const { user } = req.body;
        try {
            const now = new Date();
            const end = new Date(now);
            end.setUTCHours(0, 0, 0, 0);
            end.setDate(end.getDate() + 1); // Move to the next day
            // Calculate the initial time left until the end of the contest
            const timeLeft = end.getTime() - now.getTime();
            const position = user
                ? GlobalState_1.GlobalState.topWinRatioPlayers.filter(x => x.NumberOfTrades >= 50).findIndex((tr) => String(tr.UserId) === String(user._id))
                : -1;
            const detail = user ? GlobalState_1.GlobalState.topWinRatioPlayers.find(tr => String(tr.UserId) === String(user._id)) : null;
            res.status(200).json({
                winRatioPlayers: GlobalState_1.GlobalState.topWinRatioPlayers.filter(x => x.NumberOfTrades >= 50),
                position,
                timeLeft,
                rewards: GlobalState_1.GlobalState.coinPerRank,
                detail,
            });
        }
        catch (error) {
            console.error('Error fetching high rollers:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.default = DailyContestController;
