import { NextFunction, Request, Response } from 'express'
import Config from '../../providers/CoinManager/Config'

export const depositValidation = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { chain } = req.body
    if (!chain) {
        return res.status(400).json({ error: 'Chain is required' })
    }

    next()
}
