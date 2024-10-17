import mongoose from "mongoose"

export interface ITopWinRatioPlayer {
    UserId: mongoose.ObjectId
    Username: string
    CountryCode: string
    Avatar?: string
    WinRatio: number
    NumberOfTrades: number
    NumberOfWins: number
}