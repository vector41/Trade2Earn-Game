/**
 * Defines Custom method types over Express's Request
 *
 * @author Faiz A. Farooqui <faiz@geeekyants.com>
 */

import { Request } from 'express'
import { IUser } from '../../models/User'

export interface IRequest extends Request {
    user: IUser
    address: string
}
