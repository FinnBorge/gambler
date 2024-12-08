function calculateProbability() {
    // Get input values
    const floor = parseFloat(document.getElementById('floor').value);
    const ceiling = parseFloat(document.getElementById('ceiling').value);
    const average = parseFloat(document.getElementById('average').value);

    // Validate inputs
    if (floor >= ceiling) {
        alert('Floor value must be less than ceiling value');
        return;
    }
    if (average <= floor || average >= ceiling) {
        alert('Average value must be between floor and ceiling values');
        return;
    }

    // Calculate probabilities
    // Let x be probability of floor value
    // Let y be probability of ceiling value
    // Then: 1 = x + y + z (where z is prob of average)
    // And: average = floor*x + ceiling*y + average*z
    
    // Solving these equations:
    // x + y + z = 1
    // floor*x + ceiling*y + average*z = average
    // z = 1 - x - y

    // Substituting z:
    // floor*x + ceiling*y + average*(1-x-y) = average
    // floor*x + ceiling*y + average - average*x - average*y = average
    // floor*x + ceiling*y - average*x - average*y = 0
    // x*(floor - average) + y*(ceiling - average) = 0
    // y = x*(average - floor)/(ceiling - average)

    const y = (average - floor)/(ceiling - average);
    const x = 1;
    
    // Normalize probabilities
    const total = x + y;
    const floorProb = x/total;
    const ceilingProb = y/total;
    const averageProb = 0;

    // Calculate probability of getting more than average
    const probAboveAverage = ceilingProb;
    const percentage = (probAboveAverage * 100).toFixed(2);

    // Display result
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <h2>Results:</h2>
        <p>The probability of getting a package worth more than the average value is: <strong>${percentage}%</strong></p>
        <p>Distribution of packages:</p>
        <ul>
            <li>Packages worth $${floor.toFixed(2)}: ${(floorProb * 100).toFixed(2)}%</li>
            <li>Packages worth $${average.toFixed(2)}: ${(averageProb * 100).toFixed(2)}%</li>
            <li>Packages worth $${ceiling.toFixed(2)}: ${(ceilingProb * 100).toFixed(2)}%</li>
        </ul>
    `;
}
