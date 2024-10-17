export interface IRoundResults {
    roundResults: Map<
        string,
        {
            txnHash: string
            startPrice: number
            endPrice: number
        }[]
    >
}
