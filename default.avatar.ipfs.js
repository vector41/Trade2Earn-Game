const Moralis = require('moralis').default
const fs = require('fs')
async function uploadToIpfs() {
    await Moralis.start({
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjE2NzA3NzQwLWI4OWMtNDNiYi1iMGZiLTkzYzc5NGZhZDM2OSIsIm9yZ0lkIjoiMzcxOTQ2IiwidXNlcklkIjoiMzgyMjUyIiwidHlwZUlkIjoiYTIyNmViOGUtMWJmYS00ODlmLWE0MDItOTYxM2FlZmVhNDdlIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDUwNzUxNDMsImV4cCI6NDg2MDgzNTE0M30.05MFAoMVUMNNga8sVNpqqHxI0btw76mStLFN05rNyNo',
    })
    const uploadArray = [
        {
            path: 'boy-0.jpg',
            content: fs.readFileSync('./avatar/avatar.zip', {
                encoding: 'base64',
            }),
        },
        // {
        //     path: 'boy-1.jpg',
        //     content: fs.readFileSync('./avatar/boy-1.jpg', {
        //         encoding: 'base64',
        //     }),
        // },
        // {
        //     path: 'boy-2.jpg',
        //     content: fs.readFileSync('./avatar/boy-2.jpg', {
        //         encoding: 'base64',
        //     }),
        // },
        
    ]
    const response = await Moralis.EvmApi.ipfs.uploadFolder({
        abi: uploadArray,
    }, )
    console.log(response.result)
}
uploadToIpfs()
