import { Request, Response } from 'express'
import utils from '../../utils/utils'
import Locals from '../../providers/Locals'
import { addNonce, getNonce } from '../services/NonceService'
import { registerUser } from '../services/UserService'
import Log from '../middlewares/Log'
class AuthController {
    public static async signIn(req: Request, res: Response) {
        const userInfo = req.body.userInfo
        const address = String(userInfo.address).toLowerCase()

        try {
            const { data, success, error } = await getNonce(address)

            if (!success) return res.status(500).send({ result: false, error })

            const verifiedSignature = utils.verifySignature(
                userInfo.signature,
                data?.nonce ?? '',
                address
            )

            if (!verifiedSignature)
                return res.status(401).send({
                    result: false,
                    error: 'Signature Verification Failed!',
                })

            if (userInfo.typeOfLogin !== 'web3') {
                const { idToken, appPubKey } = userInfo
                const verified = await utils.verifyWeb3AuthJwt(
                    idToken,
                    appPubKey
                )

                if (!verified)
                    return res.status(401).send({
                        result: false,
                        error: 'Web3Auth Verification Failed!',
                    })
            }

            const {
                success: registrationSuccess,
                error: registrationError,
                user,
            } = await registerUser({
                Address: address,
                Email: userInfo?.email,
                Avatar: userInfo?.profileImage,
                CountryCode: userInfo.countryCode,
                WalletProvider: userInfo.typeOfLogin,
                ReferralLink:
                    userInfo.referralLink || Locals.config().rootAffiliate,
                WhiteLabel: userInfo?.whiteLabel,
            })

            if (registrationSuccess) {
                const accessToken = utils.generateJwtAuthToken({
                    userId: user?.UserId,
                })
                return res.status(200).send({ result: true, accessToken, user })
            } else {
                return res
                    .status(500)
                    .send({ result: false, error: registrationError })
            }
        } catch (error) {
            Log.error(`UserController :: Error signing in ${error}`)
            return res
                .status(500)
                .send({ result: false, error: 'Internal Server Error' })
        }
    }

    public static async verify(req: Request, res: Response): Promise<Response> {
        const address = String(req.body?.address).toLowerCase()
        const nonce = utils.generateNonce()

        try {
            await addNonce(address, nonce)
            return res.send({ nonce: nonce })
        } catch (error) {
            Log.error(`UserController :: Error verifying address: ${error}`)
            return res
                .status(500)
                .send({ result: false, error: 'Internal Server Error' })
        }
    }
}

export default AuthController
