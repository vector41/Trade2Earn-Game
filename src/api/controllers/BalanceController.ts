import { NextFunction, Request, Response } from 'express'
import Balance from '../../models/Balance'
import Log from '../middlewares/Log'

export default class BalanceController {
    public static async getBalance(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { user } = req.body

            // Find the balance document for the specified user ID
            const balance = await Balance.findOne({ User: user._id }).exec()

            if (!balance) {
                return res
                    .status(404)
                    .json({ message: 'Balance not found for the user' })
            }

            res.status(200).send({ result: true, balance: balance.Balance, coin: balance.Coin })
        } catch (error) {
            Log.error(`BalanceContgroller:: getBalance() : Error retrieving user balance: ${error}`)
            res.status(500).json({ message: 'Internal server error' })
        }
    }
}
