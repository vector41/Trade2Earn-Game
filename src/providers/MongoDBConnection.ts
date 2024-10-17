import mongoose from 'mongoose'
import { GlobalState } from './GlobalState'
import Log from '../api/middlewares/Log'

class MongoDBConnection {
    private uri: string

    constructor(uri: string) {
        this.uri = uri
    }

    public async connectToMongoDB(): Promise<void> {
        try {
            await mongoose.connect(this.uri)
            Log.info('MongoDBConnection :: Connected to MongoDB')
        } catch (error) {
            Log.error(
                `MongoDBConnection :: Error connecting to MongoDB:${error}`
            )
            GlobalState.stop = false
        }
    }

    static createInstance(uri: string): MongoDBConnection {
        return new MongoDBConnection(uri)
    }
}

export default MongoDBConnection
