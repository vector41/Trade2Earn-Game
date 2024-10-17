import { ethers } from 'ethers'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import Locals from '../providers/Locals'
import jwt, { JwtPayload } from 'jsonwebtoken'
import crypto from 'crypto'

export default class Utils {
    public static generateNonce(): string {
        return ethers.hexlify(ethers.randomBytes(32))
    }

    public static verifySignature(
        signature: string,
        nonce: string,
        signer: string
    ): Boolean {
        const nonceBytes = ethers.toUtf8Bytes(nonce)
        // const nonceHash = ethers.keccak256(nonceBytes);

        const recoveredAddress = ethers.verifyMessage(nonceBytes, signature)

        return recoveredAddress.toLowerCase() === signer.toLowerCase()
    }

    public static verifyCCPWebhook(
        bodyText: string,
        signature: string | string[],
        appId: string,
        appSecret: string,
        timestamp: string | string[]
    ): boolean {
        const signText = appId + timestamp + bodyText
        const serverSign = crypto
            .createHmac('sha256', appSecret)
            .update(signText)
            .digest('hex')

        return signature === serverSign
    }

    public static async verifyWeb3AuthJwt(
        idToken: string | undefined,
        appPubKey: string
    ): Promise<Boolean> {
        if (!idToken) return false

        try {
            const jwks = createRemoteJWKSet(
                new URL(Locals.config().web3AuthJwksUrl)
            )
            const { payload } = await jwtVerify(idToken, jwks, {
                algorithms: ['ES256'],
            })

            const walletPublicKey = (
                (payload as any)?.wallets?.[0]?.public_key || ''
            ).toLowerCase()
            return walletPublicKey === appPubKey.toLowerCase()
        } catch (error) {
            console.error(error)
            return false
        }
    }

    public static generateJwtAuthToken(data: object): string {
        return jwt.sign(data, Locals.config().secretKey, {
            expiresIn: '8700h',
        })
    }

    public static generateRefreshAccessToken(address: string): string {
        return jwt.sign({ address }, Locals.config().secretKey)
    }

    public static decodeJwtAuthToken(token: string): JwtPayload | string {
        return jwt.verify(token, Locals.config().secretKey)
    }

    public static getRandomInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    public static getTimestamp(): number {
        return Math.floor(Date.now() / 1000)
    }

    public static generateNonDuplicatedRandom(min: number, max: number, count: number): number[] {
        if (count > (max - min + 1)) {
            throw new Error('Count cannot be greater than the range of numbers');
        }
    
        const result: number[] = [];
        const generated = new Set<number>();
    
        while (result.length < count) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!generated.has(randomNumber)) {
                result.push(randomNumber);
                generated.add(randomNumber);
            }
        }
    
        return result;
    }

    // Function to generate a random Japanese-style name
    public static generateJapaneseName(): string {
        // Define arrays of common Japanese syllables for names
        const firstSyllables = [
            'A',
            'I',
            'U',
            'E',
            'O',
            'Ka',
            'Ki',
            'Ku',
            'Ke',
            'Ko',
            'Sa',
            'Shi',
            'Su',
            'Se',
            'So',
            'Ta',
            'Chi',
            'Ts',
            'Te',
            'To',
            'Na',
            'Ni',
            'Nu',
            'Ne',
            'No',
            'Ha',
            'Hi',
            'Fu',
            'He',
            'Ho',
            'Ma',
            'Mi',
            'Mu',
            'Me',
            'Mo',
            'Ya',
            'Yu',
            'Yo',
            'Ra',
            'Ri',
            'Ru',
            'Re',
            'Ro',
            'Wa',
            'Wi',
            'Wo',
            'N',
        ]
        const secondSyllables = [
            'a',
            'i',
            'u',
            'e',
            'o',
            'ka',
            'ki',
            'ku',
            'ke',
            'ko',
            'sa',
            'shi',
            'su',
            'se',
            'so',
            'ta',
            'chi',
            'ts',
            'te',
            'to',
            'na',
            'ni',
            'nu',
            'ne',
            'no',
            'ha',
            'hi',
            'fu',
            'he',
            'ho',
            'ma',
            'mi',
            'mu',
            'me',
            'mo',
            'ya',
            'yu',
            'yo',
            'ra',
            'ri',
            'ru',
            're',
            'ro',
            'wa',
            'wi',
            'wo',
            'n',
        ]

        const firstIndex = Math.floor(Math.random() * firstSyllables.length)
        const secondIndex = Math.floor(Math.random() * secondSyllables.length)
        const firstName = firstSyllables[firstIndex]
        const lastName = secondSyllables[secondIndex]
        return firstName + lastName + Utils.getRandomInteger(0, 10000)
    }

    public static getShortenEmail(email: string): string {
        const parts = email.split('@')
        const username = parts[0]
        const domain = parts[1]

        // Keep the first three characters of the username
        const shortenedUsername = username.substring(0, 3)

        // Keep the last three characters of the username
        const lastThreeChars = username.slice(-3)

        // Concatenate the shortened username with the last three characters and the domain
        return shortenedUsername + '...' + lastThreeChars
    }

    public static shortenAddress(address: string) {
        const prefix = address.substring(0, 4) // Extract the first four characters
        const suffix = address.slice(-3) // Extract the last three characters
        return `${prefix}...${suffix}` // Concatenate with ellipsis in between
    }

    public static generateReferralId = (): string => {
        const randomString = Math.random().toString(36).substring(2, 10) // Generate random alphanumeric string
        const timestamp = Date.now().toString(36) // Convert current timestamp to base36
        return (randomString + timestamp).toUpperCase() // Concatenate random string with timestamp
    }

    public static removeDuplicates<T>(items: T[], attribute: string): T[] {
        const uniqueItems: { [key: string]: T } = {}

        items.forEach((transaction) => {
            const attrValue = (transaction as any)[attribute] // Type assertion
            if (!uniqueItems[attrValue]) {
                uniqueItems[attrValue] = transaction
            }
        })

        return Object.values(uniqueItems)
    }

    public static hexlify(data: string): string {
        return ethers.hexlify(ethers.toUtf8Bytes(data))
    }

    public static delay(milliseconds: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve()
            }, milliseconds)
        })
    }

    public static generateOrderId(): string {
        let orderId = ''

        // Generate 30 random digits
        for (let i = 0; i < 20; i++) {
            orderId += Math.floor(Math.random() * 10) // Generate a random digit (0-9)
        }

        return orderId + new Date().getTime().toString()
    }
}
