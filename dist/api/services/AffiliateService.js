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
exports.updateBatchAffiliate = exports.getInvitedPath = exports.addReferralLink = exports.getReferralIds = exports.getAffiliate = void 0;
const Affiliate_1 = __importDefault(require("../../models/Affiliate"));
const utils_1 = __importDefault(require("../../utils/utils"));
const UserService_1 = require("./UserService");
const Log_1 = __importDefault(require("../middlewares/Log"));
const getAffiliate = (referralId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const affiliate = yield Affiliate_1.default.findOne({ ReferralId: referralId });
        if (affiliate) {
            return { success: true, data: affiliate };
        }
        else {
            return { success: true, data: null };
        }
    }
    catch (error) {
        Log_1.default.error(`AffiliateService :: Error fetching affiliate: ${error}`);
        return { success: false, error: error.message };
    }
});
exports.getAffiliate = getAffiliate;
const getReferralIds = (User) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const referralIds = yield Affiliate_1.default.find({ User });
        if (referralIds) {
            return { success: true, data: referralIds };
        }
        else {
            return { success: false, error: 'Referral Link Not Exists!' };
        }
    }
    catch (error) {
        Log_1.default.error(`AffiliateService :: Error fetching affiliate: ${error}`);
        return { success: false, error: error.message };
    }
});
exports.getReferralIds = getReferralIds;
const addReferralLink = (User, affiliateType, name, referralId = utils_1.default.generateReferralId()) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newAffiliate = new Affiliate_1.default({
            AffiliateType: affiliateType,
            ReferralId: referralId,
            Name: name,
            Tier1Paid: 0,
            Tier2Paid: 0,
            Tier3Paid: 0,
            Tier1Unclaimed: 0,
            Tier2Unclaimed: 0,
            Tier3Unclaimed: 0,
            CreatedAt: new Date(),
            User,
        });
        const savedAffiliate = yield newAffiliate.save();
        return { success: true, data: savedAffiliate };
    }
    catch (error) {
        Log_1.default.error(`AffiliateService :: Error adding referral link: ${error}`);
        return { success: false, error };
    }
});
exports.addReferralLink = addReferralLink;
const getInvitedPath = (referralId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { success: affiliateSuccess, data: affiliateData } = yield (0, exports.getAffiliate)(referralId);
        if (affiliateSuccess && affiliateData) {
            const userId = affiliateData.User;
            const { success: userSuccess, data: userData } = yield (0, UserService_1.getUserItem)(userId);
            if (userSuccess && userData) {
                return { success: true, data: userData.InvitedPath.split('#') };
            }
            else {
                return {
                    success: false,
                    error: 'AffiliateService :: Server Error!',
                };
            }
        }
        else {
            return {
                success: false,
                error: 'AffiliateService :: This referral link does not exist!',
            };
        }
    }
    catch (error) {
        Log_1.default.error(`AffiliateService :: Error getting invited path: ${error}`);
        return { success: false, error: error };
    }
});
exports.getInvitedPath = getInvitedPath;
const updateBatchAffiliate = (affiliateReward, session) => __awaiter(void 0, void 0, void 0, function* () {
    // Construct an array of update operations
    const bulkUpdateOperations = affiliateReward.map((aff) => ({
        updateOne: {
            filter: { ReferralId: aff.ReferralId }, // Filter to match documents with the specified address
            update: {
                $inc: {
                    Tier1Paid: aff.Tier1Paid, // Increment Tier1Paid by 100
                    Tier2Paid: aff.Tier2Paid, // Increment Tier2Paid by 200
                    Tier3Paid: aff.Tier3Paid, // Increment Tier3Paid by 300
                    Tier1Unclaimed: aff.Tier1Unclaimed,
                    Tier2Unclaimed: aff.Tier2Unclaimed,
                    Tier3Unclaimed: aff.Tier3Unclaimed,
                },
            },
        },
    }));
    try {
        // Execute bulk write operation
        yield Affiliate_1.default.bulkWrite(bulkUpdateOperations, { session });
    }
    catch (error) {
        // if(session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }
        Log_1.default.error(`AffiliateService :: Error performing bulk write operation: ${error}`);
        throw error;
    }
});
exports.updateBatchAffiliate = updateBatchAffiliate;
