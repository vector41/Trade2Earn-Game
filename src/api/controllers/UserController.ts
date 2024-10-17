import { Request, Response } from 'express'
import { IRequest } from '../../interfaces/vendors'
import { getTransactionsByUser } from '../services/TransactionService'

class UserController {
    public static async getUserGameHistory(req: Request, res: Response) {
        try {
            const { user } = req.body
            const { success, data, error } = await getTransactionsByUser(
                user._id,
                10
            )

            if (success && data) {
                // If transactions are successfully retrieved, send them in the response
                return res.status(200).send({ success: true, data: data })
            } else if (!success && error) {
                // If there was an error while retrieving transactions, send an error response
                return res.status(500).send({ success: false, error: error })
            } else {
                // If no transactions found, send an empty array
                return res.status(200).send({ success: true, data: [] })
            }
        } catch (error) {
            // Handle any unexpected errors
            console.error('Error in getUserGameHistory:', error)
            return res
                .status(500)
                .send({ success: false, error: 'Internal server error' })
        }
    }
}

export default UserController
