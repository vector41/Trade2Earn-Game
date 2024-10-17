import IBtcPrice from './IBtcPrice'

export enum RoundPosition {
    NONE = 0,
    LOCKING = 1,
    LOCKED = 2,
    DISTRIBUTING = 3,
    DISTRIBUTED = 4,
}

export default interface IRoundStatus {
    currentLocalFrameIndex: number
    currentBtcPrice: IBtcPrice
    startFrameIndex: number
    startPrice: number
    endPrice: number
    currentPosition: RoundPosition
    previousPosition: RoundPosition
    txnHash?: string
}
