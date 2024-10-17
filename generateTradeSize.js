const fs = require('fs')

function generateArrays(
    currentArray,
    currentSum,
    targetSum,
    allowedValues,
    results
) {
    if (currentSum === targetSum) {
        results.push([...currentArray])
        return
    }

    if (currentSum > targetSum) {
        return
    }

    for (const value of allowedValues) {
        const newSum = currentSum + value
        if (newSum <= targetSum) {
            currentArray.push(value)
            generateArrays(
                currentArray,
                newSum,
                targetSum,
                allowedValues,
                results
            )
            currentArray.pop()
        }
    }
}

function generateAllArrays() {
    const allowedValues = [5, 10, 15, 25, 50, 75, 100]
    const targetSums = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
    const results = {}

    for (const targetSum of targetSums) {
        results[targetSum] = []
        generateArrays([], 0, targetSum, allowedValues, results[targetSum])
    }

    return results
}

const allArrays = generateAllArrays()
const jsonOutput = JSON.stringify(allArrays, null, 2)

fs.writeFile('arrays.json', jsonOutput, (err) => {
    if (err) {
        console.error('Error writing JSON file:', err)
    } else {
        console.log('JSON file saved successfully!')
    }
})
