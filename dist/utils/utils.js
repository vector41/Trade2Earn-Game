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
const ethers_1 = require("ethers");
const jose_1 = require("jose");
const Locals_1 = __importDefault(require("../providers/Locals"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
class Utils {
    static generateNonce() {
        return ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(32));
    }
    static verifySignature(signature, nonce, signer) {
        const nonceBytes = ethers_1.ethers.toUtf8Bytes(nonce);
        // const nonceHash = ethers.keccak256(nonceBytes);
        const recoveredAddress = ethers_1.ethers.verifyMessage(nonceBytes, signature);
        return recoveredAddress.toLowerCase() === signer.toLowerCase();
    }
    static verifyCCPWebhook(bodyText, signature, appId, appSecret, timestamp) {
        const signText = appId + timestamp + bodyText;
        const serverSign = crypto_1.default
            .createHmac('sha256', appSecret)
            .update(signText)
            .digest('hex');
        return signature === serverSign;
    }
    static verifyWeb3AuthJwt(idToken, appPubKey) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!idToken)
                return false;
            try {
                const jwks = (0, jose_1.createRemoteJWKSet)(new URL(Locals_1.default.config().web3AuthJwksUrl));
                const { payload } = yield (0, jose_1.jwtVerify)(idToken, jwks, {
                    algorithms: ['ES256'],
                });
                const walletPublicKey = (((_b = (_a = payload === null || payload === void 0 ? void 0 : payload.wallets) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.public_key) || '').toLowerCase();
                return walletPublicKey === appPubKey.toLowerCase();
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
    }
    static generateJwtAuthToken(data) {
        return jsonwebtoken_1.default.sign(data, Locals_1.default.config().secretKey, {
            expiresIn: '8700h',
        });
    }
    static generateRefreshAccessToken(address) {
        return jsonwebtoken_1.default.sign({ address }, Locals_1.default.config().secretKey);
    }
    static decodeJwtAuthToken(token) {
        return jsonwebtoken_1.default.verify(token, Locals_1.default.config().secretKey);
    }
    static getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static getTimestamp() {
        return Math.floor(Date.now() / 1000);
    }
    static generateNonDuplicatedRandom(min, max, count) {
        if (count > (max - min + 1)) {
            throw new Error('Count cannot be greater than the range of numbers');
        }
        const result = [];
        const generated = new Set();
        while (result.length < count) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!generated.has(randomNumber)) {
                result.push(randomNumber);
                generated.add(randomNumber);
            }
        }
        return result;
    }
    // Function to generate a random Japanese-style name
    static generateJapaneseName() {
        // Define arrays of common Japanese syllables for names
        const firstSyllables = [
            'A',
            'I',
            'U',
            'E',
            'O',
            'Ka',
            'Ki',
            'Ku',
            'Ke',
            'Ko',
            'Sa',
            'Shi',
            'Su',
            'Se',
            'So',
            'Ta',
            'Chi',
            'Ts',
            'Te',
            'To',
            'Na',
            'Ni',
            'Nu',
            'Ne',
            'No',
            'Ha',
            'Hi',
            'Fu',
            'He',
            'Ho',
            'Ma',
            'Mi',
            'Mu',
            'Me',
            'Mo',
            'Ya',
            'Yu',
            'Yo',
            'Ra',
            'Ri',
            'Ru',
            'Re',
            'Ro',
            'Wa',
            'Wi',
            'Wo',
            'N',
        ];
        const secondSyllables = [
            'a',
            'i',
            'u',
            'e',
            'o',
            'ka',
            'ki',
            'ku',
            'ke',
            'ko',
            'sa',
            'shi',
            'su',
            'se',
            'so',
            'ta',
            'chi',
            'ts',
            'te',
            'to',
            'na',
            'ni',
            'nu',
            'ne',
            'no',
            'ha',
            'hi',
            'fu',
            'he',
            'ho',
            'ma',
            'mi',
            'mu',
            'me',
            'mo',
            'ya',
            'yu',
            'yo',
            'ra',
            'ri',
            'ru',
            're',
            'ro',
            'wa',
            'wi',
            'wo',
            'n',
        ];
        const firstIndex = Math.floor(Math.random() * firstSyllables.length);
        const secondIndex = Math.floor(Math.random() * secondSyllables.length);
        const firstName = firstSyllables[firstIndex];
        const lastName = secondSyllables[secondIndex];
        return firstName + lastName + Utils.getRandomInteger(0, 10000);
    }
    static getShortenEmail(email) {
        const parts = email.split('@');
        const username = parts[0];
        const domain = parts[1];
        // Keep the first three characters of the username
        const shortenedUsername = username.substring(0, 3);
        // Keep the last three characters of the username
        const lastThreeChars = username.slice(-3);
        // Concatenate the shortened username with the last three characters and the domain
        return shortenedUsername + '...' + lastThreeChars;
    }
    static shortenAddress(address) {
        const prefix = address.substring(0, 4); // Extract the first four characters
        const suffix = address.slice(-3); // Extract the last three characters
        return `${prefix}...${suffix}`; // Concatenate with ellipsis in between
    }
    static removeDuplicates(items, attribute) {
        const uniqueItems = {};
        items.forEach((transaction) => {
            const attrValue = transaction[attribute]; // Type assertion
            if (!uniqueItems[attrValue]) {
                uniqueItems[attrValue] = transaction;
            }
        });
        return Object.values(uniqueItems);
    }
    static hexlify(data) {
        return ethers_1.ethers.hexlify(ethers_1.ethers.toUtf8Bytes(data));
    }
    static delay(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, milliseconds);
        });
    }
    static generateOrderId() {
        let orderId = '';
        // Generate 30 random digits
        for (let i = 0; i < 20; i++) {
            orderId += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
        }
        return orderId + new Date().getTime().toString();
    }
}
Utils.generateReferralId = () => {
    const randomString = Math.random().toString(36).substring(2, 10); // Generate random alphanumeric string
    const timestamp = Date.now().toString(36); // Convert current timestamp to base36
    return (randomString + timestamp).toUpperCase(); // Concatenate random string with timestamp
};
exports.default = Utils;
