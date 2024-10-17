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
exports.getBatchUsers = exports.getUserItem = exports.registerUser = void 0;
const Locals_1 = __importDefault(require("../../providers/Locals"));
const utils_1 = __importDefault(require("../../utils/utils"));
const User_1 = __importDefault(require("../../models/User"));
const AffiliateService_1 = require("./AffiliateService");
const Log_1 = __importDefault(require("../middlewares/Log"));
const Balance_1 = __importDefault(require("../../models/Balance"));
const TradingStatistics_1 = __importDefault(require("../../models/TradingStatistics"));
const utils_2 = __importDefault(require("../../utils/utils"));
const rootAffiliate = Locals_1.default.config().rootAffiliate;
const registerUser = (userViewModel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield User_1.default.findOne({
            Address: userViewModel.Address.toLowerCase(),
        }).select('Username UserId Avatar CountryCode WhiteLabel');
        if (existingUser) {
            return {
                success: true,
                user: {
                    Username: existingUser.Username,
                    UserId: existingUser._id,
                    Avatar: existingUser.Avatar || '',
                    CountryCode: existingUser.CountryCode,
                    WhiteLabel: existingUser.WhiteLabel,
                },
            };
        }
        const { success, data: invitedPath, error, } = yield (0, AffiliateService_1.getInvitedPath)(userViewModel.ReferralLink);
        // creates new user
        const newUser = new User_1.default({
            Address: userViewModel.Address.toLowerCase(),
            Email: userViewModel.Email || '',
            Avatar: userViewModel.Avatar ||
                `${Locals_1.default.config().ipfsBaseUrl}/${utils_1.default.getRandomInteger(1, 12)}.png`,
            InvitedPath: success && invitedPath
                ? `${userViewModel.ReferralLink}#${invitedPath[0]}#${invitedPath[1]}`
                : `${rootAffiliate}#${rootAffiliate}#${rootAffiliate}`,
            CountryCode: userViewModel.CountryCode,
            WhiteLabel: userViewModel.WhiteLabel || 'trade2earn',
            Enabled: true,
            WalletProvider: userViewModel.WalletProvider,
            CreatedAt: new Date(),
            Username: utils_2.default.generateJapaneseName(),
        });
        yield newUser.save();
        // Creates Balance
        const balance = new Balance_1.default({
            User: newUser._id,
            Balance: 1000,
            Coin: 1000000
        });
        yield balance.save();
        // creates TradingStatistics
        const newTradingStatistics = new TradingStatistics_1.default({
            User: newUser._id, // Replace 'userId' with the actual user ID
        });
        yield newTradingStatistics.save();
        return {
            success: true,
            user: {
                Username: newUser.Username,
                UserId: newUser._id,
                Avatar: newUser.Avatar || '',
                CountryCode: newUser.CountryCode,
                WhiteLabel: newUser.WhiteLabel,
            },
        };
    }
    catch (error) {
        Log_1.default.error(`UserService :: Error registering user: ${error}`);
        return { success: false, error };
    }
});
exports.registerUser = registerUser;
const getUserItem = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(userId);
        if (user) {
            return { success: true, data: user };
        }
        else {
            return { success: false, error: "The user doesn't exist!" };
        }
    }
    catch (error) {
        Log_1.default.error(`UserService :: Error fetching user: ${error}`);
        return { success: false, error };
    }
});
exports.getUserItem = getUserItem;
const getBatchUsers = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find({
            _id: { $in: userIds },
        }).exec();
        return { success: true, data: users };
    }
    catch (error) {
        Log_1.default.error(`UserService :: Error fetching users: ${error}`);
        return { success: false, error };
    }
});
exports.getBatchUsers = getBatchUsers;
