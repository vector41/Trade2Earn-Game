import Express from './Express'
import GameRound from './GameRound'
import Publisher from './Publisher'
import Subscriber from './Subscriber'
import Locals from './Locals'
import MongoDBConnection from './MongoDBConnection'
import { AffiliateType } from '../models/Affiliate'
import { EventSchedule } from './EventSchedule'
import { Dashboard } from './Dashboard'
import { addReferralLink, getAffiliate } from '../api/services/AffiliateService'
import Log from '../api/middlewares/Log'
import { GlobalState } from './GlobalState'
import User from '../models/User'
import utils from '../utils/utils'
import Balance from '../models/Balance'
import TradingStatistics, { ITradingStatistics, ITradingStatisticsModel } from '../models/TradingStatistics'
import { initialize } from './Initalilize'
import { getTop100WinnersForThisMonth } from '../api/services/TradingStatisticsService'

class App {
    // Loads your Server
    public async loadServer(): Promise<void> {
        Log.info('Server:: Initialzing...')
        Express.init()

        // Create an instance of MongoDBConnection with the MongoDB URI
        const mongoConnection = MongoDBConnection.createInstance(
            Locals.config().mongodbURI
        )

        // Connect to MongoDB
        await mongoConnection.connectToMongoDB()

        console.log("Connected to mongodb successfully!")

        // Initialize
        await initialize();

        // Start Schedule Events
        EventSchedule.createInstance().start()
        Dashboard.loadAllTimeWinsPaidFile()


        require("./Challenges");

        require("./DailyEvent");

        const publisher: Publisher = Publisher.createInstance(Express.server)
        const subscriber: Subscriber = Subscriber.createInstance(
            Locals.config().binanceWss
        )
        GlobalState.gameRound = GameRound.createInstance(publisher, subscriber)
        GlobalState.gameRound.start()
    }
}

export default new App()
