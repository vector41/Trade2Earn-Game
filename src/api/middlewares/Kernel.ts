import { Application } from 'express'
import CORS from './CORS'
import Http from './Middleware'

class Kernel {
    public static init(_express: Application): Application {
        _express = CORS.mount(_express)
        _express = Http.mount(_express)

        return _express
    }
}

export default Kernel
