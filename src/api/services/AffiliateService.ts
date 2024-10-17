import Affiliate, {
    IAffiliate,
    IAffiliateDistribution,
} from '../../models/Affiliate'
import utils from '../../utils/utils'
import { getUserItem } from './UserService'
import Log from '../middlewares/Log'
import { IReturnData } from '../../interfaces/IReturnData'
import mongoose, { ObjectId } from 'mongoose'

export const getAffiliate = async (
    referralId: string
): Promise<IReturnData<IAffiliate>> => {
    try {
        const affiliate = await Affiliate.findOne({ ReferralId: referralId })

        if (affiliate) {
            return { success: true, data: affiliate }
        } else {
            return { success: true, data: null }
        }
    } catch (error: any) {
        Log.error(`AffiliateService :: Error fetching affiliate: ${error}`)
        return { success: false, error: error.message }
    }
}

export const getReferralIds = async (
    User: ObjectId
): Promise<IReturnData<IAffiliate>> => {
    try {
        const referralIds = await Affiliate.find({ User })

        if (referralIds) {
            return { success: true, data: referralIds }
        } else {
            return { success: false, error: 'Referral Link Not Exists!' }
        }
    } catch (error: any) {
        Log.error(`AffiliateService :: Error fetching affiliate: ${error}`)
        return { success: false, error: error.message }
    }
}

export const addReferralLink = async (
    User: ObjectId,
    affiliateType: string,
    name: string,
    referralId: string = utils.generateReferralId()
): Promise<IReturnData<IAffiliate>> => {
    try {
        const newAffiliate = new Affiliate({
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
        })
        const savedAffiliate = await newAffiliate.save()
        return { success: true, data: savedAffiliate }
    } catch (error) {
        Log.error(`AffiliateService :: Error adding referral link: ${error}`)
        return { success: false, error }
    }
}

export const getInvitedPath = async (
    referralId: string
): Promise<IReturnData<string[]>> => {
    try {
        const { success: affiliateSuccess, data: affiliateData } =
            await getAffiliate(referralId)

        if (affiliateSuccess && affiliateData) {
            const userId = affiliateData.User

            const { success: userSuccess, data: userData } =
                await getUserItem(userId)

            if (userSuccess && userData) {
                return { success: true, data: userData.InvitedPath.split('#') }
            } else {
                return {
                    success: false,
                    error: 'AffiliateService :: Server Error!',
                }
            }
        } else {
            return {
                success: false,
                error: 'AffiliateService :: This referral link does not exist!',
            }
        }
    } catch (error: any) {
        Log.error(`AffiliateService :: Error getting invited path: ${error}`)
        return { success: false, error: error }
    }
}

export const updateBatchAffiliate = async (
    affiliateReward: IAffiliateDistribution[],
    session?: mongoose.mongo.ClientSession
) => {
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
    }))

    try {
        // Execute bulk write operation
        await Affiliate.bulkWrite(bulkUpdateOperations, { session })
    } catch (error) {
        // if(session) {
        //     await session.abortTransaction()
        //     session.endSession()
        // }
        Log.error(
            `AffiliateService :: Error performing bulk write operation: ${error}`
        )

        throw error
    }
}
