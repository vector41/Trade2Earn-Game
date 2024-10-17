import WebSocket from 'ws'
import Log from '../api/middlewares/Log'

class Subscriber {
    public ws: WebSocket | null = null
    public lastData: string = ''

    constructor(private wssUrl: string) {
        this.reconnect()
    }

    static createInstance(wssUrl: string): Subscriber {
        return new Subscriber(wssUrl)
    }

    public reconnect(): void {
        this.connect()
        setTimeout(() => this.reconnect(), 1000 * 60 * 15)
    }

    public connect(): void {
        this.ws = new WebSocket(this.wssUrl)

        // Event: WebSocket connection is established
        this.ws.on('open', () => {
            Log.info('Subscriber :: WebSocket Client connection established')
        })

        this.ws.onclose = (event) => {
            // Abnormal closure, attempt to reconnect
            setTimeout(() => this.connect(), 2000) // Adjust delay as needed
        }

        // Event: Received a message from the server
        this.ws.on('message', (data: WebSocket.Data) => {
            this.lastData = data.toString()
        })

        this.ws.onerror = (error) => {
            // Handle errors
            Log.error(`Subscriber :: WebSocket Error: ${error.message}`)
        }
    }
}

export default Subscriber
