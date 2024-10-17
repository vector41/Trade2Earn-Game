/**
 * Enables the CORS
 *
 * @author Isom D. <isom19901122@gmail.com>
 */

import cors from 'cors'
import { Application } from 'express'

import Log from './Log'
import Locals from '../../providers/Locals'

class CORS {
    public mount(_express: Application): Application {
        Log.info("Booting the 'CORS' middleware...")

        const apiPrefix = Locals.config().apiPrefix

        const corsOptions = {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            optionsSuccessStatus: 204,
        }

        _express.use(`/${apiPrefix}`, cors(corsOptions))

        return _express
    }
}

export default new CORS()
