/**
 * Define the error & exception handlers
 * Author: Isom D. <isom19901122@gmail.com>
 */

import { Application, NextFunction, Request, Response } from 'express'
import Locals from '../providers/Locals'
import Log from '../api/middlewares/Log'

// Class responsible for handling errors and exceptions
class ExceptionHandler {
    /**
     * Handles all the not found routes
     */
    public static notFoundHandler(_express: Application): any {
        const apiPrefix = Locals.config().apiPrefix

        _express.use('*', (req, res) => {
            const ip =
                req.headers['x-forwarded-for'] || req.connection.remoteAddress

            Log.error(`Path '${req.originalUrl}' not found [IP: '${ip}']!`)

            if (req.xhr || req.originalUrl.includes(`/${apiPrefix}/`)) {
                return res.json({ error: 'Page Not Found' })
            } else {
                res.status(404)
                return res.render('pages/error', {
                    title: 'Page Not Found',
                    error: [],
                })
            }
        })

        return _express
    }

    /**
     * Handles your api/web routes errors/exception
     */
    public static clientErrorHandler(
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ): any {
        Log.error(err.stack ? err.stack : '')

        if (req.xhr) {
            return res.status(500).send({ error: 'Something went wrong!' })
        } else {
            return next(err)
        }
    }

    /**
     * Show under maintenance page in case of errors
     */
    public static errorHandler(
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ): any {
        Log.error(err.stack ? err.stack : '')
        res.status(500)

        const apiPrefix = Locals.config().apiPrefix
        if (req.originalUrl.includes(`/${apiPrefix}/`)) {
            if (err.name && err.name === 'UnauthorizedError') {
                const innerMessage = err.message ? err.message : undefined
                return res.json({ error: ['Invalid Token!', innerMessage] })
            }

            return res.json({ error: err })
        }

        return res.render('pages/error', {
            error: err.stack,
            title: 'Under Maintenance',
        })
    }

    /**
     * Register your error / exception monitoring tools right here ie. before "next(err)"!
     */
    public static logErrors(
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ): any {
        Log.error(err.stack ? err.stack : '')

        return next(err)
    }
}

// Export the ExceptionHandler class
export default ExceptionHandler
