"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const User_1 = __importDefault(require("../models/User"));
const utils_1 = __importDefault(require("../utils/utils"));
const GlobalState_1 = require("./GlobalState");
const Locals_1 = __importDefault(require("./Locals"));
const rTradeSize_1 = __importDefault(require("./rTradeSize"));
const countryCodes = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albania' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'AD', name: 'Andorra' },
    { code: 'AO', name: 'Angola' },
    { code: 'AI', name: 'Anguilla' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AW', name: 'Aruba' },
    { code: 'AU', name: 'Australia' },
    { code: 'AT', name: 'Austria' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BB', name: 'Barbados' },
    { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' },
    { code: 'BZ', name: 'Belize' },
    { code: 'BJ', name: 'Benin' },
    { code: 'BM', name: 'Bermuda' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BR', name: 'Brazil' },
    { code: 'BN', name: 'Brunei' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'CA', name: 'Canada' },
    { code: 'CV', name: 'Cape Verde' },
    { code: 'KY', name: 'Cayman Islands' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'TD', name: 'Chad' },
    { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' },
    { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'Congo, Democratic Republic' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: "Cote d'Ivoire" },
    { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'EE', name: 'Estonia' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'GF', name: 'French Guiana' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' },
    { code: 'GE', name: 'Georgia' },
    { code: 'DE', name: 'Germany' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' },
    { code: 'GR', name: 'Greece' },
    { code: 'GL', name: 'Greenland' },
    { code: 'GD', name: 'Grenada' },
    { code: 'GP', name: 'Guadeloupe' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haiti' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HU', name: 'Hungary' },
    { code: 'IS', name: 'Iceland' },
    { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'IR', name: 'Iran' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
    { code: 'IT', name: 'Italy' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'JP', name: 'Japan' },
    { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'LA', name: 'Laos' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'LR', name: 'Liberia' },
    { code: 'LY', name: 'Libya' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MK', name: 'Macedonia' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malta' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'MQ', name: 'Martinique' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'YT', name: 'Mayotte' },
    { code: 'MX', name: 'Mexico' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'MD', name: 'Moldova' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'MS', name: 'Montserrat' },
    { code: 'MA', name: 'Morocco' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' },
    { code: 'NR', name: 'Nauru' },
    { code: 'NP', name: 'Nepal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'AN', name: 'Netherlands Antilles' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NU', name: 'Niue' },
    { code: 'NF', name: 'Norfolk Island' },
    { code: 'NO', name: 'Norway' },
    { code: 'OM', name: 'Oman' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PS', name: 'Palestinian Territories' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' },
];
class Bot {
    constructor() {
        this.botPlayers = [];
        this.maxTotalTradeSizes = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    }
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    generate(startFrameIndex, tradeStartIndex) {
        if (GlobalState_1.GlobalState.stopBot)
            return;
        this.botPlayers = [];
        const tTradeSizeForU = this.maxTotalTradeSizes[this.getRandomNumber(1, this.maxTotalTradeSizes.length - 2)];
        // Generate a random offset
        const offset = this.getRandomNumber(-1, 1) * 5;
        // Calculate tSizesForD with the offset
        const tTradeSizeForD = tTradeSizeForU + offset;
        const tradeSizesForU = rTradeSize_1.default[tTradeSizeForU];
        const tradeSizesForD = rTradeSize_1.default[tTradeSizeForD];
        const tradeSizeForU = tradeSizesForU[this.getRandomNumber(0, tradeSizesForU.length - 1)];
        const tradeSizeForD = tradeSizesForD[this.getRandomNumber(0, tradeSizesForD.length - 1)];
        const rTimes = utils_1.default.generateNonDuplicatedRandom(startFrameIndex + 10, tradeStartIndex - 10, tradeSizeForU.length + tradeSizeForD.length);
        for (let i = 0; i < tradeSizeForU.length; i++) {
            this.botPlayers.push({
                Avatar: `${Locals_1.default.config().ipfsBaseUrl}/${utils_1.default.getRandomInteger(1, 12)}.png`,
                TradeSize: tradeSizeForU[i],
                Direction: true,
                Time: rTimes[i],
                Used: false,
            });
        }
        for (let i = 0; i < tradeSizeForD.length; i++) {
            this.botPlayers.push({
                Avatar: `${Locals_1.default.config().ipfsBaseUrl}/${utils_1.default.getRandomInteger(1, 12)}.png`,
                TradeSize: tradeSizeForD[i],
                Direction: false,
                Time: rTimes[tradeSizeForU.length + i],
                Used: false,
            });
        }
    }
    trade(frameIndex) {
        if (GlobalState_1.GlobalState.stopBot)
            return;
        for (var i = 0; i < this.botPlayers.length; i++) {
            if (this.botPlayers[i].Time === frameIndex &&
                !this.botPlayers[i].Used) {
                this.botPlayers[i].Used = true;
                const botUser = new User_1.default({
                    Address: '',
                    Email: '',
                    Avatar: this.botPlayers[i].Avatar,
                    InvitedPath: '',
                    CountryCode: countryCodes[this.getRandomNumber(0, countryCodes.length - 1)].code,
                    WhiteLabel: 'trade2earn',
                    Enabled: true,
                    WalletProvider: 'web3',
                    CreatedAt: new Date(),
                    Role: 'bot',
                });
                GlobalState_1.GlobalState.gameRound.publisher.submitTradeOrder(botUser, '30:15', this.botPlayers[i].Direction, this.botPlayers[i].TradeSize, true);
            }
        }
    }
}
exports.Bot = Bot;
