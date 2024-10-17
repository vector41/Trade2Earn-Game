import { WebSocket } from 'ws'
import Locals from './Locals'

class BinanceWss {
    private binanceUrl
    private binanceWss: WebSocket
    public lastPrice: number

    constructor() {
        this.lastPrice = 0

        this.binanceUrl = Locals.config().binanceWss
        this.binanceWss = new WebSocket(this.binanceUrl)
    }

    public init(): void {
        this.binanceWss.on('message', (message: string) => {
            const data: any = JSON.parse(message)
            const lastPrice: number = parseFloat(data.p)
            this.lastPrice = lastPrice > 0 ? lastPrice : this.lastPrice
        })
    }
}

export default BinanceWss
