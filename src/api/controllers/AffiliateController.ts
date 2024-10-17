import { Request, Response } from 'express'
import { AffiliateType } from '../../models/Affiliate'
import { IRequest } from '../../interfaces/vendors'
import { addReferralLink, getReferralIds } from '../services/AffiliateService'
import Log from '../middlewares/Log'

class AffiliateController {
    public static async createReferralLink(
        req: Request,
        res: Response
    ): Promise<Response> {
        const { user, name } = req.body

        try {
            const { data, success, error } = await addReferralLink(
                user._id,
                AffiliateType.FRIEND_METHOD,
                name
            )

            if (success) {
                return res.status(200).send({ result: true, affiliate: data })
            } else {
                return res.status(500).send({ result: false, error })
            }
        } catch (error) {
            Log.error(
                `AffiliateController :: Error creating referral link: ${error}`
            )
            return res
                .status(500)
                .send({ result: false, error: 'Internal Server Error' })
        }
    }

    public static async getReferralLinks(
        req: Request,
        res: Response
    ): Promise<void> {
        const { user, name } = req.body

        try {
            const { data, success, error } = await getReferralIds(user._id)

            if (success) {
                res.send({ result: true, affiliates: data })
            } else {
                res.status(500).send({ result: false, error })
            }
        } catch (error) {
            Log.error(`AffiliateController :: getReferralLinks: ${error}`)
            res.status(500).send({
                result: false,
                error: 'Internal Server Error',
            })
        }
    }
}

export default AffiliateController
