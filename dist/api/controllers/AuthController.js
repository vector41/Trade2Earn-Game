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
const utils_1 = __importDefault(require("../../utils/utils"));
const Locals_1 = __importDefault(require("../../providers/Locals"));
const NonceService_1 = require("../services/NonceService");
const UserService_1 = require("../services/UserService");
const Log_1 = __importDefault(require("../middlewares/Log"));
class AuthController {
    static signIn(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const userInfo = req.body.userInfo;
            const address = String(userInfo.address).toLowerCase();
            try {
                const { data, success, error } = yield (0, NonceService_1.getNonce)(address);
                if (!success)
                    return res.status(500).send({ result: false, error });
                const verifiedSignature = utils_1.default.verifySignature(userInfo.signature, (_a = data === null || data === void 0 ? void 0 : data.nonce) !== null && _a !== void 0 ? _a : '', address);
                if (!verifiedSignature)
                    return res.status(401).send({
                        result: false,
                        error: 'Signature Verification Failed!',
                    });
                if (userInfo.typeOfLogin !== 'web3') {
                    const { idToken, appPubKey } = userInfo;
                    const verified = yield utils_1.default.verifyWeb3AuthJwt(idToken, appPubKey);
                    if (!verified)
                        return res.status(401).send({
                            result: false,
                            error: 'Web3Auth Verification Failed!',
                        });
                }
                const { success: registrationSuccess, error: registrationError, user, } = yield (0, UserService_1.registerUser)({
                    Address: address,
                    Email: userInfo === null || userInfo === void 0 ? void 0 : userInfo.email,
                    Avatar: userInfo === null || userInfo === void 0 ? void 0 : userInfo.profileImage,
                    CountryCode: userInfo.countryCode,
                    WalletProvider: userInfo.typeOfLogin,
                    ReferralLink: userInfo.referralLink || Locals_1.default.config().rootAffiliate,
                    WhiteLabel: userInfo === null || userInfo === void 0 ? void 0 : userInfo.whiteLabel,
                });
                if (registrationSuccess) {
                    const accessToken = utils_1.default.generateJwtAuthToken({
                        userId: user === null || user === void 0 ? void 0 : user.UserId,
                    });
                    return res.status(200).send({ result: true, accessToken, user });
                }
                else {
                    return res
                        .status(500)
                        .send({ result: false, error: registrationError });
                }
            }
            catch (error) {
                Log_1.default.error(`UserController :: Error signing in ${error}`);
                return res
                    .status(500)
                    .send({ result: false, error: 'Internal Server Error' });
            }
        });
    }
    static verify(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const address = String((_a = req.body) === null || _a === void 0 ? void 0 : _a.address).toLowerCase();
            const nonce = utils_1.default.generateNonce();
            try {
                yield (0, NonceService_1.addNonce)(address, nonce);
                return res.send({ nonce: nonce });
            }
            catch (error) {
                Log_1.default.error(`UserController :: Error verifying address: ${error}`);
                return res
                    .status(500)
                    .send({ result: false, error: 'Internal Server Error' });
            }
        });
    }
}
exports.default = AuthController;
