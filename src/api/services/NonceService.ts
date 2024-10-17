import Log from '../middlewares/Log'
import NonceModel, { INonce } from '../../models/Nonce'
import { IReturnData } from '../../interfaces/IReturnData'

export const addNonce = async (
    address: string,
    nonce: string
): Promise<IReturnData<any>> => {
    try {
        const existingItem = await NonceModel.findOne({ address })

        if (existingItem) {
            // Address exists, update the nonce field
            existingItem.nonce = nonce
            await existingItem.save()
        } else {
            // Address does not exist, add a new item
            await NonceModel.create({ address, nonce })
        }

        return { success: true }
    } catch (error) {
        Log.error(`NonceService :: Error adding nonce: ${error}`)
        return { success: false }
    }
}

export const getNonce = async (
    address: string
): Promise<IReturnData<INonce>> => {
    try {
        const item = await NonceModel.findOne({ address }).select('nonce')

        if (item) {
            return { success: true, data: item }
        } else {
            return { success: false, error: 'Not exist' }
        }
    } catch (error) {
        Log.error(`NonceService :: Error getting nonce: ${error}`)
        return { success: false }
    }
}
