import jwt, { TokenExpiredError } from 'jsonwebtoken'
import Locals from '../../providers/Locals'
import Log from './Log'
import { NextFunction, Request, Response } from 'express'
import User, { IUser } from '../../models/User'

export default class AuthJwtToken {
    public static async authorization(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        // Get the auth token from the request headers
        const token = req.headers.authorization

        // Check if token is present
        if (!token) {
            // Token is missing, send response asking for login
            return res
                .status(401)
                .json({ message: 'Unauthorized. Please log in.' })
        }

        try {
            // Convert JWT token to user object
            const user = await AuthJwtToken.jwtToken2User(token)

            // Attach the decoded user information to the request object
            req.body.user = user
            next()
        } catch (error) {
            if (error instanceof Error) {
                Log.error(`Auth :: verify jwt token: ${error.message}`)
                return res.status(500).json({ message: error.message })
            } else {
                return res
                    .status(500)
                    .json({ message: 'Internal server error' })
            }
        }
    }

    public static async isAdmin(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { user } = req.body
        if (user.Role === 'admin') next()
        else return res.status(401).json({ message: 'Admin role is required!' })
    }

    public static async jwtToken2User(token: string): Promise<IUser> {
        return new Promise((resolve, reject) => {
            // Verify the token
            jwt.verify(
                token.split(' ')[1],
                Locals.config().secretKey,
                async (err: any, decoded: any) => {
                    if (err) {
                        if (err instanceof TokenExpiredError) {
                            // Token has expired
                            return reject(new Error('Token has expired'))
                        }
                        // Invalid token
                        return reject(new Error('Invalid token'))
                    }

                    // Token is valid, but let's also check if it's expired
                    const { exp, userId } = decoded as {
                        exp: number
                        userId: string
                    }

                    const currentTime = Math.floor(Date.now() / 1000) // Get current time in seconds

                    if (currentTime > exp) {
                        // Token has expired, send response asking for login
                        return reject(
                            new Error('Token has expired. Please log in again.')
                        )
                    }

                    try {
                        // Fetch user data from the database using the userId stored in the token
                        const user = await User.findById(userId)

                        if (!user) {
                            return reject(new Error('User not found'))
                        }

                        resolve(user)
                    } catch (error) {
                        reject(error)
                    }
                }
            )
        })
    }
}
