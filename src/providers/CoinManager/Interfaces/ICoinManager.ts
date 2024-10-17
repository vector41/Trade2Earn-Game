export interface Network {
    chain: string
    chainFullName: string
    contract: string
    precision: number
    canDeposit: boolean
    canWithdraw: boolean
    minimumDepositAmount: string
    minimumWithdrawAmount: string
    maximumWithdrawAmount: string
    isSupportMemo: boolean
}

export interface Coin {
    coinId: number
    symbol: string
    logoUrl: string
    status: string
    networks: { [key: string]: Network }
}

export interface ApiResponse {
    code: number
    msg: string
    data: any
}

export interface Record {
    userId: string
    recordId: string
    orderId: string
    coinId: number
    chain: string
    contract: string
    coinSymbol: string
    txId: string
    fromAddress: string
    toAddress: string
    ToAddress?: string
    toMemo: string
    amount: string
    serviceFee: string
    status: string
    arrivedAt: number
}

export interface UserBalance {
    userId: string
    asset: {
        coinId: number
        coinSymbol: string
        available: string
    }
}

export enum WebHookMessageType {
    USER_DEPOSIT = 'UserDeposit',
    USER_WITHDRAWAL = 'UserWithdrawal',
}

export enum OrderStatus {
    SUCCESS = 'Success',
    PROCESSING = 'Processing',
    FAILED = 'Failed',
    WAITING_APPROVAL = 'WaitingApproval',
    SUBMITTED = 'Submitted',
}

export interface UserDeposit {
    recordId: string
    userId: string
    coinId: number
    coinSymbol: string
    amount: string
    status: string
}
