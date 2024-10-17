import Locals from '../../providers/Locals'
import utils from '../../utils/utils'
import User, { IUser, IUserViewModel, UserViewModel } from '../../models/User'
import { getInvitedPath } from './AffiliateService'
import Log from '../middlewares/Log'
import { ObjectId } from 'mongoose'
import Balance from '../../models/Balance'
import TradingStatistics from '../../models/TradingStatistics'
import Utils from '../../utils/utils'

const rootAffiliate = Locals.config().rootAffiliate

export const registerUser = async (
    userViewModel: UserViewModel
): Promise<{ success: boolean; error?: any; user?: IUserViewModel }> => {
    try {
        const existingUser = await User.findOne({
            Address: userViewModel.Address.toLowerCase(),
        }).select('Username UserId Avatar CountryCode WhiteLabel')

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
            }
        }

        const {
            success,
            data: invitedPath,
            error,
        } = await getInvitedPath(userViewModel.ReferralLink)

        // creates new user
        const newUser = new User({
            Address: userViewModel.Address.toLowerCase(),
            Email: userViewModel.Email || '',
            Avatar:
                userViewModel.Avatar ||
                `${Locals.config().ipfsBaseUrl}/${utils.getRandomInteger(1, 12)}.png`,
            InvitedPath:
                success && invitedPath
                    ? `${userViewModel.ReferralLink}#${invitedPath[0]}#${invitedPath[1]}`
                    : `${rootAffiliate}#${rootAffiliate}#${rootAffiliate}`,
            CountryCode: userViewModel.CountryCode,
            WhiteLabel: userViewModel.WhiteLabel || 'trade2earn',
            Enabled: true,
            WalletProvider: userViewModel.WalletProvider,
            CreatedAt: new Date(),
            Username: Utils.generateJapaneseName(),
        })

        await newUser.save()

        // Creates Balance
        const balance = new Balance({
            User: newUser._id,
            Balance: 1000,
            Coin: 1000000
        })

        await balance.save()

        // creates TradingStatistics
        const newTradingStatistics = new TradingStatistics({
            User: newUser._id, // Replace 'userId' with the actual user ID
        })

        await newTradingStatistics.save()

        return {
            success: true,
            user: {
                Username: newUser.Username,
                UserId: newUser._id,
                Avatar: newUser.Avatar || '',
                CountryCode: newUser.CountryCode,
                WhiteLabel: newUser.WhiteLabel,
            },
        }
    } catch (error) {
        Log.error(`UserService :: Error registering user: ${error}`)
        return { success: false, error }
    }
}

export const getUserItem = async (
    userId: ObjectId
): Promise<{ success: boolean; data?: IUser; error?: string }> => {
    try {
        const user = await User.findById(userId)

        if (user) {
            return { success: true, data: user }
        } else {
            return { success: false, error: "The user doesn't exist!" }
        }
    } catch (error: any) {
        Log.error(`UserService :: Error fetching user: ${error}`)
        return { success: false, error }
    }
}

export const getBatchUsers = async (
    userIds: ObjectId[]
): Promise<{ success: boolean; error?: string; data?: IUser[] }> => {
    try {
        const users: IUser[] = await User.find({
            _id: { $in: userIds },
        }).exec()
        return { success: true, data: users }
    } catch (error: any) {
        Log.error(`UserService :: Error fetching users: ${error}`)
        return { success: false, error }
    }
}
