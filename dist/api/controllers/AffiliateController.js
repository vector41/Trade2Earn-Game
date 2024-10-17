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
const Affiliate_1 = require("../../models/Affiliate");
const AffiliateService_1 = require("../services/AffiliateService");
const Log_1 = __importDefault(require("../middlewares/Log"));
class AffiliateController {
    static createReferralLink(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user, name } = req.body;
            try {
                const { data, success, error } = yield (0, AffiliateService_1.addReferralLink)(user._id, Affiliate_1.AffiliateType.FRIEND_METHOD, name);
                if (success) {
                    return res.status(200).send({ result: true, affiliate: data });
                }
                else {
                    return res.status(500).send({ result: false, error });
                }
            }
            catch (error) {
                Log_1.default.error(`AffiliateController :: Error creating referral link: ${error}`);
                return res
                    .status(500)
                    .send({ result: false, error: 'Internal Server Error' });
            }
        });
    }
    static getReferralLinks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user, name } = req.body;
            try {
                const { data, success, error } = yield (0, AffiliateService_1.getReferralIds)(user._id);
                if (success) {
                    res.send({ result: true, affiliates: data });
                }
                else {
                    res.status(500).send({ result: false, error });
                }
            }
            catch (error) {
                Log_1.default.error(`AffiliateController :: getReferralLinks: ${error}`);
                res.status(500).send({
                    result: false,
                    error: 'Internal Server Error',
                });
            }
        });
    }
}
exports.default = AffiliateController;
