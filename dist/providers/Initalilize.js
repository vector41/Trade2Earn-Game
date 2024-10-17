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
exports.initialize = void 0;
const AffiliateService_1 = require("../api/services/AffiliateService");
const Affiliate_1 = require("../models/Affiliate");
const Balance_1 = __importDefault(require("../models/Balance"));
const TradingStatistics_1 = __importDefault(require("../models/TradingStatistics"));
const User_1 = __importDefault(require("../models/User"));
const utils_1 = __importDefault(require("../utils/utils"));
const GlobalState_1 = require("./GlobalState");
const Locals_1 = __importDefault(require("./Locals"));
const initialize = () => __awaiter(void 0, void 0, void 0, function* () {
    const adminExists = yield User_1.default.findOne({ Role: 'admin' }).exec();
    const dailyContest = yield User_1.default.findOne({
        Role: 'daily_contest',
    }).exec();
    const rootAffiliate = Locals_1.default.config().rootAffiliate;
    if (!dailyContest) {
        const weeklyChallengeUser = new User_1.default({
            Address: '0x000003',
            Email: '',
            Avatar: `${Locals_1.default.config().ipfsBaseUrl}/${utils_1.default.getRandomInteger(1, 12)}.png`,
            InvitedPath: `${rootAffiliate}#${rootAffiliate}#${rootAffiliate}`,
            CountryCode: 'CH',
            WhiteLabel: 'trade2earn',
            Enabled: true,
            WalletProvider: 'web3',
            CreatedAt: new Date(),
            Role: 'daily_contest',
        });
        yield weeklyChallengeUser.save();
        const dailyContestBalance = new Balance_1.default({
            User: weeklyChallengeUser._id,
            Balance: 0,
            Coin: 0,
        });
        yield dailyContestBalance.save();
        GlobalState_1.GlobalState.weeklyChallengeUser = weeklyChallengeUser;
    }
    else {
        GlobalState_1.GlobalState.weeklyChallengeUser = dailyContest;
    }
    // If admin doesn't exist, create a new admin user
    if (!adminExists) {
        const adminUser = new User_1.default({
            Address: Locals_1.default.config().rootAffiliateWalletAddress.toLowerCase(),
            Email: '',
            Avatar: `${Locals_1.default.config().ipfsBaseUrl}/${utils_1.default.getRandomInteger(1, 12)}.png`,
            InvitedPath: `${rootAffiliate}#${rootAffiliate}#${rootAffiliate}`,
            CountryCode: 'CH',
            WhiteLabel: 'trade2earn',
            Enabled: true,
            WalletProvider: 'web3',
            CreatedAt: new Date(),
            Role: 'admin',
        });
        yield adminUser.save();
        const adminBalance = new Balance_1.default({
            User: adminUser._id,
            Balance: 0,
        });
        yield adminBalance.save();
        // creates TradingStatistics
        const newTradingStatistics = new TradingStatistics_1.default({
            User: adminUser._id, // Replace 'userId' with the actual user ID
        });
        yield newTradingStatistics.save();
        const { success, data: affiliate } = yield (0, AffiliateService_1.getAffiliate)(Locals_1.default.config().rootAffiliate);
        if (success && affiliate == null) {
            yield (0, AffiliateService_1.addReferralLink)(adminUser._id, Affiliate_1.AffiliateType.PARTNERSHIP, Locals_1.default.config().rootAffiliate, Locals_1.default.config().rootAffiliate);
        }
    }
    else {
        GlobalState_1.GlobalState.admin = adminExists;
    }
});
exports.initialize = initialize;
