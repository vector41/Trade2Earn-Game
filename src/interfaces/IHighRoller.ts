import mongoose from 'mongoose'

export interface IHightRoller {
    UserId: mongoose.ObjectId
    Username: string
    CountryCode: string
    Avatar: string
    Turnover: number
    NumberOfTrades: number
}
