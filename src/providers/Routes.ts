import { Application } from 'express'
import Locals from './Locals'
import ApiRoutes from '../api/routes/ApiRoutes'
import Log from '../api/middlewares/Log'

class Routes {
    public mountApi(_express: Application): Application {
        const apiPrefix = Locals.config().apiPrefix
        Log.info('Route :: Mounting API Routes...')

        return _express.use(`/${apiPrefix}`, ApiRoutes.router)
    }
}

export default new Routes()
