"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Auth_1 = __importDefault(require("../middlewares/Auth"));
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const AffiliateController_1 = __importDefault(require("../controllers/AffiliateController"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
const GlobalState_1 = require("../../providers/GlobalState");
const Dashboard_1 = require("../../providers/Dashboard");
const CoinController_1 = __importDefault(require("../controllers/CoinController"));
const BalanceController_1 = __importDefault(require("../controllers/BalanceController"));
const DailyContestController_1 = __importDefault(require("../controllers/DailyContestController"));
const RewardsController_1 = __importDefault(require("../controllers/RewardsController"));
const TradingStatisticsService_1 = require("../services/TradingStatisticsService");
const FutureBTCChallengeController_1 = require("../controllers/FutureBTCChallengeController");
exports.default = new (class ApiRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', (req, res, next) => {
            res.send({
                result: true,
                fullStatistics: Dashboard_1.Dashboard.getLatestFullStatistics('30:15'),
            });
        });
        this.router.get('/full-statistics', (req, res, next) => {
            res.send({
                AllTimeWinsPaid: GlobalState_1.GlobalState.allTimeWinsPaid,
                LivePlayersFor24H: GlobalState_1.GlobalState.livePlayersFor24H,
                WinRatioFor24H: GlobalState_1.GlobalState.winRatioFor24H,
                WinsPaidFor24H: GlobalState_1.GlobalState.winsPaidFor24H,
                ContestPrize: GlobalState_1.GlobalState.contestPrize,
            });
        });
        this.router.post('/verify', AuthController_1.default.verify);
        this.router.post('/signin', AuthController_1.default.signIn);
        this.router.get('/balance', Auth_1.default.authorization, BalanceController_1.default.getBalance);
        this.router.post('/depositAndWithdrawFee', Auth_1.default.authorization, CoinController_1.default.getDepositAddressAndWithdrawFee);
        this.router.get('/networks', CoinController_1.default.getNetworks);
        this.router.get('/auth-highrollers', Auth_1.default.authorization, DailyContestController_1.default.getHighRollers);
        this.router.get('/highrollers', DailyContestController_1.default.getHighRollers);
        this.router.get('/winratio', DailyContestController_1.default.getWinRatioPlayers);
        this.router.get('/auth-winratio', Auth_1.default.authorization, DailyContestController_1.default.getWinRatioPlayers);
        this.router.get('/notifications', Auth_1.default.authorization, RewardsController_1.default.notifications);
        this.router.post('/webhook', CoinController_1.default.webHook);
        this.router.post('/top100winners', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { duration } = req.body;
                if (!duration) {
                    throw new Error("Duration is missing.");
                }
                let Top100Winners; // Adjust the type as per your actual data structure
                switch (duration) {
                    case "AllTime":
                        Top100Winners = yield (0, TradingStatisticsService_1.getTop100WinnersForAllTime)();
                        break;
                    case "Today":
                        Top100Winners = GlobalState_1.GlobalState.top100WinnersForToday;
                        break;
                    case "ThisWeek":
                        Top100Winners = yield (0, TradingStatisticsService_1.getTop100WinnersForThisWeek)();
                        break;
                    case "ThisMonth":
                        Top100Winners = yield (0, TradingStatisticsService_1.getTop100WinnersForThisMonth)();
                        break;
                    default:
                        throw new Error("Invalid option.");
                }
                res.status(200).json({ Top100Winners });
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error:', error.message);
                    return res.status(500).json({ error: error.message }); // Sending error message as response
                }
                else {
                    console.error('An unknown error occurred:', error);
                    return res
                        .status(500)
                        .json({ error: 'An unknown error occurred' }); // Sending generic error message as response
                }
            }
        }));
        this.router.post('/stop-bot', Auth_1.default.authorization, Auth_1.default.isAdmin, (req, res) => {
            const { stopBot } = req.body;
            GlobalState_1.GlobalState.stopBot = stopBot;
            res.send({ result: true });
        });
        this.router.post('/stop', Auth_1.default.authorization, Auth_1.default.isAdmin, (req, res) => {
            const { stop } = req.body;
            GlobalState_1.GlobalState.stop = stop;
            res.send({ result: true });
        });
        this.router.post('/claim-rewards', Auth_1.default.authorization, RewardsController_1.default.claim);
        this.router.post('/submit-future-position', Auth_1.default.authorization, FutureBTCChallengeController_1.FutureBTCChallengeController.futureBTCChallenge);
        this.router.get('/future-btc-challenges', FutureBTCChallengeController_1.FutureBTCChallengeController.getPositions);
        this.router.post('/withdraw', Auth_1.default.authorization, CoinController_1.default.withdraw);
        this.router.post('/withdraw-fee', CoinController_1.default.getNetworkFeeAndMinWithdraw);
        this.router.get('/protected', Auth_1.default.authorization, (req, res) => {
            res.send({
                result: true,
                data: req.body,
            });
        });
        this.router.get('/user-play-history', Auth_1.default.authorization, UserController_1.default.getUserGameHistory);
        this.router.post('/create-referral-link', Auth_1.default.authorization, AffiliateController_1.default.createReferralLink);
        this.router.get('/referral-links', Auth_1.default.authorization, AffiliateController_1.default.getReferralLinks);
        // this.router.post('/submit-first-challenge', Au)
    }
})();
