import Https from 'https'
import Crypto from 'crypto'
import Config from './Config'
import {
    ApiResponse,
    Coin,
    Record,
    UserBalance,
} from './Interfaces/ICoinManager'

export default class CoinManager {
    private async makeRequest(path: string, args: string): Promise<any> {
        const timestamp = Math.floor(Date.now() / 1000)
        let signText = Config.CCPaymentApiId + timestamp
        if (args) {
            signText += args
        }

        const sign = Crypto.createHmac('sha256', Config.CCPaymentAppSecret)
            .update(signText)
            .digest('hex')

        const options: Https.RequestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                AppId: Config.CCPaymentApiId,
                Sign: sign,
                Timestamp: timestamp.toString(),
            },
        }

        const req = Https.request(path, options)

        req.write(args)
        req.end()

        return new Promise<Coin[]>((resolve, reject) => {
            req.on('response', (res) => {
                let respData = ''

                res.on('data', (chunk) => {
                    respData += chunk
                })

                res.on('end', () => {
                    const responseData: ApiResponse = JSON.parse(respData)
                    if (responseData.code === 10000) {
                        resolve(responseData.data)
                    } else {
                        reject(new Error(responseData.msg))
                    }
                })
            })

            req.on('error', (err) => {
                reject(err)
            })
        })
    }

    async getCoinList(): Promise<{ coins: Coin[] }> {
        const args = ''
        return this.makeRequest(Config.GetCoinListPath, args)
    }

    async getCoinItem(coinId: number): Promise<{ coin: Coin }> {
        const args = JSON.stringify({ coinId: coinId })
        return this.makeRequest(Config.GetCoinItemPath, args)
    }

    async getOrCreateUserDepositAddress(
        userId: string,
        chain: string
    ): Promise<{ address: string }> {
        const args = JSON.stringify({ userId, chain })
        return this.makeRequest(Config.GetOrCreateUserDepositAddress, args)
    }

    async getUserDepositRecordList(
        userId: string
    ): Promise<{ records: Record[] }> {
        const args = JSON.stringify({ userId })
        return this.makeRequest(Config.GetUserDepositRecordList, args)
    }

    async getUserDepositRecord(recordId: string): Promise<{ record: Record }> {
        const args = JSON.stringify({ recordId })
        return this.makeRequest(Config.GetUserDepositRecord, args)
    }

    async getUserWithdrawRecord(recordId: string): Promise<{ record: Record }> {
        const args = JSON.stringify({ recordId })
        return this.makeRequest(Config.GetUserWithdrawRecord, args)
    }

    async getUserCoinAsset(
        userId: string,
        coinId: number
    ): Promise<UserBalance> {
        const args = JSON.stringify({ coinId, userId })
        return this.makeRequest(Config.GetUserCoinAsset, args)
    }

    async userTransfer(
        fromUserId: string,
        toUserId: string,
        coinId: number,
        orderId: string,
        amount: string,
        remark: string
    ): Promise<{ recordId: string }> {
        const args = JSON.stringify({
            coinId,
            fromUserId,
            toUserId,
            orderId,
            amount,
            remark,
        })

        return this.makeRequest(Config.UserTransfer, args)
    }

    async applyUserWithdrawToNetwork(
        coinId: number,
        address: string,
        orderId: string,
        userId: string,
        chain: string,
        amount: string
    ): Promise<{ recordId: string }> {
        const args = JSON.stringify({
            coinId,
            address,
            orderId,
            userId,
            chain,
            amount,
        })

        return this.makeRequest(Config.ApplyUserWithdrawToNetwork, args)
    }

    async getWithdrawFee(coinId: number, chain: string): Promise<{ fee: any }> {
        const args = JSON.stringify({
            coinId,
            chain,
        })

        return this.makeRequest(Config.GetWithdrawFee, args)
    }
}
