import { addReferralLink, getAffiliate } from "../api/services/AffiliateService"
import { AffiliateType } from "../models/Affiliate"
import Balance from "../models/Balance"
import TradingStatistics from "../models/TradingStatistics"
import User from "../models/User"
import utils from "../utils/utils"
import { GlobalState } from "./GlobalState"
import Locals from "./Locals"

export const initialize = async () => {
    const adminExists = await User.findOne({ Role: 'admin' }).exec()
    const dailyContest = await User.findOne({
        Role: 'daily_contest',
    }).exec()

    const rootAffiliate = Locals.config().rootAffiliate

    if (!dailyContest) {
        const weeklyChallengeUser = new User({
            Address: '0x000003',
            Email: '',
            Avatar: `${Locals.config().ipfsBaseUrl}/${utils.getRandomInteger(1, 12)}.png`,
            InvitedPath: `${rootAffiliate}#${rootAffiliate}#${rootAffiliate}`,
            CountryCode: 'CH',
            WhiteLabel: 'trade2earn',
            Enabled: true,
            WalletProvider: 'web3',
            CreatedAt: new Date(),
            Role: 'daily_contest',
        })

        await weeklyChallengeUser.save()

        const dailyContestBalance = new Balance({
            User: weeklyChallengeUser._id,
            Balance: 0,
            Coin: 0,
        })

        await dailyContestBalance.save()

        GlobalState.weeklyChallengeUser = weeklyChallengeUser
    } else {
        GlobalState.weeklyChallengeUser = dailyContest
    }

    // If admin doesn't exist, create a new admin user
    if (!adminExists) {
        const adminUser = new User({
            Address:
                Locals.config().rootAffiliateWalletAddress.toLowerCase(),
            Email: '',
            Avatar: `${Locals.config().ipfsBaseUrl}/${utils.getRandomInteger(1, 12)}.png`,
            InvitedPath: `${rootAffiliate}#${rootAffiliate}#${rootAffiliate}`,
            CountryCode: 'CH',
            WhiteLabel: 'trade2earn',
            Enabled: true,
            WalletProvider: 'web3',
            CreatedAt: new Date(),
            Role: 'admin',
        })

        await adminUser.save()

        const adminBalance = new Balance({
            User: adminUser._id,
            Balance: 0,
        })

        await adminBalance.save()

        // creates TradingStatistics
        const newTradingStatistics = new TradingStatistics({
            User: adminUser._id, // Replace 'userId' with the actual user ID
        })

        await newTradingStatistics.save()

        const { success, data: affiliate } = await getAffiliate(
            Locals.config().rootAffiliate
        )

        if (success && affiliate == null) {
            await addReferralLink(
                adminUser._id,
                AffiliateType.PARTNERSHIP,
                Locals.config().rootAffiliate,
                Locals.config().rootAffiliate
            )
        }
    } else {
        GlobalState.admin = adminExists
    }
}