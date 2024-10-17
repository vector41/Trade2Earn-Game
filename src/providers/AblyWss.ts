import Ably from 'ably'
import Locals from './Locals'
import Log from '../api/middlewares/Log'

class AblyWss {
    public ably: Ably.Types.RealtimePromise
    public ablyPublishApiKey: string
    public ablyChannelName: string

    constructor() {
        this.ablyPublishApiKey = Locals.config().ablyPublishApiKey
        this.ablyChannelName = Locals.config().ablyChannelName
        this.ably = new Ably.Realtime.Promise(this.ablyPublishApiKey)
    }

    public async init(): Promise<any> {
        await this.ably.connection.once('connected')
        Log.info('Ably :: Connected!')

        return this.ably.channels.get(this.ablyChannelName)
    }
}

export default new AblyWss()
