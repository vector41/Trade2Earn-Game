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
const https_1 = __importDefault(require("https"));
const crypto_1 = __importDefault(require("crypto"));
const Config_1 = __importDefault(require("./Config"));
class CoinManager {
    makeRequest(path, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = Math.floor(Date.now() / 1000);
            let signText = Config_1.default.CCPaymentApiId + timestamp;
            if (args) {
                signText += args;
            }
            const sign = crypto_1.default.createHmac('sha256', Config_1.default.CCPaymentAppSecret)
                .update(signText)
                .digest('hex');
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    AppId: Config_1.default.CCPaymentApiId,
                    Sign: sign,
                    Timestamp: timestamp.toString(),
                },
            };
            const req = https_1.default.request(path, options);
            req.write(args);
            req.end();
            return new Promise((resolve, reject) => {
                req.on('response', (res) => {
                    let respData = '';
                    res.on('data', (chunk) => {
                        respData += chunk;
                    });
                    res.on('end', () => {
                        const responseData = JSON.parse(respData);
                        if (responseData.code === 10000) {
                            resolve(responseData.data);
                        }
                        else {
                            reject(new Error(responseData.msg));
                        }
                    });
                });
                req.on('error', (err) => {
                    reject(err);
                });
            });
        });
    }
    getCoinList() {
        return __awaiter(this, void 0, void 0, function* () {
            const args = '';
            return this.makeRequest(Config_1.default.GetCoinListPath, args);
        });
    }
    getCoinItem(coinId) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = JSON.stringify({ coinId: coinId });
            return this.makeRequest(Config_1.default.GetCoinItemPath, args);
        });
    }
    getOrCreateUserDepositAddress(userId, chain) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = JSON.stringify({ userId, chain });
            return this.makeRequest(Config_1.default.GetOrCreateUserDepositAddress, args);
        });
    }
    getUserDepositRecordList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = JSON.stringify({ userId });
            return this.makeRequest(Config_1.default.GetUserDepositRecordList, args);
        });
    }
    getUserDepositRecord(recordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = JSON.stringify({ recordId });
            return this.makeRequest(Config_1.default.GetUserDepositRecord, args);
        });
    }
    getUserWithdrawRecord(recordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = JSON.stringify({ recordId });
            return this.makeRequest(Config_1.default.GetUserWithdrawRecord, args);
        });
    }
    getUserCoinAsset(userId, coinId) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = JSON.stringify({ coinId, userId });
            return this.makeRequest(Config_1.default.GetUserCoinAsset, args);
        });
    }
    userTransfer(fromUserId, toUserId, coinId, orderId, amount, remark) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = JSON.stringify({
                coinId,
                fromUserId,
                toUserId,
                orderId,
                amount,
                remark,
            });
            return this.makeRequest(Config_1.default.UserTransfer, args);
        });
    }
    applyUserWithdrawToNetwork(coinId, address, orderId, userId, chain, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = JSON.stringify({
                coinId,
                address,
                orderId,
                userId,
                chain,
                amount,
            });
            return this.makeRequest(Config_1.default.ApplyUserWithdrawToNetwork, args);
        });
    }
    getWithdrawFee(coinId, chain) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = JSON.stringify({
                coinId,
                chain,
            });
            return this.makeRequest(Config_1.default.GetWithdrawFee, args);
        });
    }
}
exports.default = CoinManager;
