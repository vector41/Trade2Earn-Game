/**
 * Define App Locals & Configs
 *
 * @author Isom D. <isom19901122@gmail.com>
 */

import { Application } from 'express'
import * as path from 'path'
import * as dotenv from 'dotenv'

class Locals {
    /**
     * Makes env configs available for your app
     * throughout the app's runtime
     */

    public static config(): any {
        dotenv.config({ path: path.join(__dirname, '../../.env') })

        const port: string = process.env.PORT || '5000'
        const ablySubscribeApiKey: string =
            process.env.ABLY_SUBSCRIPT_API_KEY ||
            'mLIhEA.b4w99w:XvjEGp-VYBP6UqxChbD279yLSy46yI41EVUzu8cBetg'
        const ablyPublishApiKey: string =
            process.env.ABLY_PUBLISH_API_KEY ||
            'mLIhEA.4R8SQg:_xByiy72-8-KDvZa9tXEcnVmQ1ScuPnPIXFj-HQ01I8'
        const ablyChannelName: string =
            process.env.ABLY_CHANNEL_NAME || 'trade2earn'
        const ablySubscribeName: string =
            process.env.ABLY_SUBSCRIBE_NAME || 'message'
        const binanceWss: string =
            process.env.BINANCE_WSS ||
            'wss://stream.binance.com:9443/ws/btcusdt@trade'
        const dxFeed: string =
            process.env.DXFEED ||
            'wss://integration-updates-streamer.blitzbinary.com/sub?id=tickers_update_66'
        const apiPrefix = process.env.API_PREFIX || 'api'
        const devMode =
            (process.env.DEV_MODE === 'false' ? false : true) || false
        const stopGame: boolean =
            (process.env.STOP_GAME === 'false' ? false : true) || false
        const betDurationInMs: number =
            Number(process.env.BET_DURATION) || 30000 // millisecond
        const tradeDurationInMs: number =
            Number(process.env.TRADE_DURATION) || 15000 // millisecond
        const localCycle: number = Number(process.env.LOCAL_CYCLE) || 250
        const betDuration: number = betDurationInMs / localCycle
        const tradeDuration: number = tradeDurationInMs / localCycle
        const maxSlice: number = Math.round((betDuration + tradeDuration) * 2.5)
        const web3AuthJwksUrl =
            process.env.WEB3AUTH_JWKS_URL || 'https://api-auth.web3auth.io/jwks'
        const secretKey = process.env.SECRET_KEY || 'your-secret-key'
        const ipfsBaseUrl =
            process.env.IPFS_BASE_URL ||
            'https://ipfs.moralis.io:2053/ipfs/QmbqyMNucEGNukyoXtHFF4akcjJbV4BvjoFys4UBkX2f5c'
        const rootAffiliate = process.env.ROOT_AFFILIATE || 'trade2earn'
        const poolId30_15 = process.env.POOL_ID_30_15 || '30:15'
        const poolId30_30 = process.env.POOL_ID_30_30 || '30:30'
        const batchSize = Number(process.env.BATCH_SIZE) || 200

        const alchemyApiKey =
            process.env.ALCHEMY_API_KEY || '166425EPq43flSwkZ7NKoEmJbjp_2zac'
        const smartContractAddress =
            (devMode
                ? process.env.TEST_SMART_CONTRACT_ADDRESS
                : process.env.MAIN_SMART_CONTRACT) ||
            '0x019adF394da05Ba9670030181F5182c1c212352f'

        const jackpotAddress =
            process.env.JACKPOT_ADDRESS ||
            '0x0D9ccD7746f5b633c135c2508E6bCCa74E289468'
        const fee = Number(process.env.FEE) || 0.1
        const tier1 = Number(process.env.TIER1) || 0.15
        const tier2 = Number(process.env.TIER2) || 0.07
        const tier3 = Number(process.env.TIER3) || 0.03
        const weeklyChallengeShare =
            Number(process.env.WEEKLY_CHALLENGE_SHARE) || 0.35

        const mongodbURI =
            process.env.MONGODB_URI || 'mongodb://localhost:27017/trade2earn'

        const maxFeePerGas = process.env.MAX_FEE_PER_GAS || 10
        const maxPriorityFeePerGas = process.env.MAX_PRIORITY_FEE_PER_GAS || 10
        const gasLimit = Number(process.env.GAS_LIMIT) || 20000000
        const gameController =
            process.env.GAME_CONTROLLER_PRIVATE_KEY ||
            'da748a4531c71e38a70260d8b13b455c660f026d22c5e0ad8286035f5b2a1cde'
        const rootAffiliateWalletAddress =
            process.env.ROOT_AFFILIATE_WALLET_ADDRESS ||
            '0xb2eD9982F918895a630CAca2d1F92D0046BEF016'

        return {
            maxFeePerGas,
            rootAffiliateWalletAddress,
            maxPriorityFeePerGas,
            gasLimit,
            gameController,
            fee,
            tier1,
            tier2,
            tier3,
            weeklyChallengeShare,
            port,
            ablyPublishApiKey,
            ablySubscribeApiKey,
            ablyChannelName,
            ablySubscribeName,
            binanceWss,
            apiPrefix,
            stopGame,
            betDuration,
            tradeDuration,
            maxSlice,
            localCycle,
            dxFeed,
            web3AuthJwksUrl,
            secretKey,
            ipfsBaseUrl,
            rootAffiliate,
            poolId30_15,
            poolId30_30,
            alchemyApiKey,
            smartContractAddress,
            mongodbURI,
            batchSize,
            jackpotAddress,
        }
    }

    /**
     * Injects your config to the app's locals
     */
    public static init(_express: Application): Application {
        _express.locals.app = this.config()
        return _express
    }
}

export default Locals
