import { Router, Response, Request } from 'express'
import AuthJwtToken from '../middlewares/Auth'
import GameRound from '../../providers/GameRound'
import { IRequest } from '../../interfaces/vendors'
import AuthController from '../controllers/AuthController'
import AffiliateController from '../controllers/AffiliateController'
import UserController from '../controllers/UserController'
import { GlobalState } from '../../providers/GlobalState'
import { Dashboard } from '../../providers/Dashboard'
import CoinManager from '../../providers/CoinManager/CoinManager'
import CoinController from '../controllers/CoinController'
import { depositValidation } from '../middlewares/Validation'
import BalanceController from '../controllers/BalanceController'
import { IUser } from '../../models/User'
import Utils from '../../utils/utils'
import DailyContestController from '../controllers/DailyContestController'
import { ITop100Winner } from '../../interfaces/ITop100Winner'
import RewardsController from '../controllers/RewardsController'
import { getTop100WinnersForAllTime, getTop100WinnersForThisMonth, getTop100WinnersForThisWeek } from '../services/TradingStatisticsService'
import { FutureBTCChallengeController } from '../controllers/FutureBTCChallengeController'

export default new (class ApiRoutes {
    public router: Router

    constructor() {
        this.router = Router()
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.get('/', (req, res, next) => {
            res.send({
                result: true,
                fullStatistics: Dashboard.getLatestFullStatistics('30:15'),
            })
        })

        this.router.get('/full-statistics', (req, res, next) => {
            res.send({
                AllTimeWinsPaid: GlobalState.allTimeWinsPaid,
                LivePlayersFor24H: GlobalState.livePlayersFor24H,
                WinRatioFor24H: GlobalState.winRatioFor24H,
                WinsPaidFor24H: GlobalState.winsPaidFor24H,
                ContestPrize: GlobalState.contestPrize,
            })
        })

        this.router.post('/verify', AuthController.verify)
        this.router.post('/signin', AuthController.signIn)
        this.router.get(
            '/balance',
            AuthJwtToken.authorization,
            BalanceController.getBalance
        )

        this.router.post(
            '/depositAndWithdrawFee',
            AuthJwtToken.authorization,
            CoinController.getDepositAddressAndWithdrawFee
        )
        this.router.get('/networks', CoinController.getNetworks)

        this.router.get(
            '/auth-highrollers',
            AuthJwtToken.authorization,
            DailyContestController.getHighRollers
        )
        this.router.get('/highrollers', DailyContestController.getHighRollers)
        
        this.router.get('/winratio', DailyContestController.getWinRatioPlayers)
        this.router.get(
            '/auth-winratio',
            AuthJwtToken.authorization,
            DailyContestController.getWinRatioPlayers
        )

        this.router.get('/notifications', AuthJwtToken.authorization, RewardsController.notifications)

        this.router.post('/webhook', CoinController.webHook)
        this.router.post('/top100winners', async (req: Request, res: Response) => {
            
            try {
                const { duration } = req.body;

                if (!duration) {
                    throw new Error("Duration is missing.");
                }

                let Top100Winners: ITop100Winner[]; // Adjust the type as per your actual data structure

                switch (duration) {
                    case "AllTime":
                        Top100Winners = await getTop100WinnersForAllTime();
                        break;
                    case "Today":
                        Top100Winners = GlobalState.top100WinnersForToday;
                        break;
                    case "ThisWeek":
                        Top100Winners = await getTop100WinnersForThisWeek();
                        break;
                    case "ThisMonth":
                        Top100Winners = await getTop100WinnersForThisMonth();
                        break;
                    default:
                        throw new Error("Invalid option.");
                }

                res.status(200).json({Top100Winners});
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
        });
        this.router.post(
            '/stop-bot',
            AuthJwtToken.authorization,
            AuthJwtToken.isAdmin,
            (req, res) => {
                const { stopBot } = req.body
                GlobalState.stopBot = stopBot

                res.send({ result: true })
            }
        )

        this.router.post(
            '/stop',
            AuthJwtToken.authorization,
            AuthJwtToken.isAdmin,
            (req, res) => {
                const { stop } = req.body
                GlobalState.stop = stop

                res.send({ result: true })
            }
        )

        this.router.post(
            '/claim-rewards',
            AuthJwtToken.authorization,
            RewardsController.claim
        )

        this.router.post('/submit-future-position', AuthJwtToken.authorization, FutureBTCChallengeController.futureBTCChallenge)
        this.router.get('/future-btc-challenges', FutureBTCChallengeController.getPositions)

        this.router.post(
            '/withdraw',
            AuthJwtToken.authorization,
            CoinController.withdraw
        )

        this.router.post(
            '/withdraw-fee',
            CoinController.getNetworkFeeAndMinWithdraw
        )

        this.router.get(
            '/protected',
            AuthJwtToken.authorization,
            (req, res) => {
                res.send({
                    result: true,
                    data: req.body,
                })
            }
        )

        this.router.get(
            '/user-play-history',
            AuthJwtToken.authorization,
            UserController.getUserGameHistory
        )

        this.router.post(
            '/create-referral-link',
            AuthJwtToken.authorization,
            AffiliateController.createReferralLink
        )

        this.router.get(
            '/referral-links',
            AuthJwtToken.authorization,
            AffiliateController.getReferralLinks
        )

        // this.router.post('/submit-first-challenge', Au)
    }
})()
