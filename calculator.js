function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`.tab-btn[onclick="showTab('${tabName}')"]`).classList.add('active');
}

function generateCeilingPackages() {
    const container = document.getElementById('ceiling-packages');
    const count = parseInt(document.getElementById('ceiling-package-count').value);
    
    if (isNaN(count) || count < 1) {
        alert('Please enter a valid number of ceiling packages (minimum 1)');
        return;
    }

    // Clear existing packages
    container.innerHTML = '';
    
    // Generate new package inputs
    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'form-group ceiling-package';
        div.innerHTML = `
            <label>Ceiling Package #${i}:</label>
            <input type="number" class="ceiling-value" required min="0" step="0.01" placeholder="Value ($)">
            <input type="number" class="ceiling-count" required min="1" step="1" placeholder="Count" value="1">
        `;
        container.appendChild(div);
    }
}

function calculatePackageCountProbability() {
    const floor = parseFloat(document.getElementById('pc-floor').value);
    const average = parseFloat(document.getElementById('pc-average').value);
    
    // Collect ceiling packages data
    const ceilingPackages = [];
    document.querySelectorAll('.ceiling-package').forEach(package => {
        const value = parseFloat(package.querySelector('.ceiling-value').value);
        const count = parseInt(package.querySelector('.ceiling-count').value);
        if (!isNaN(value) && !isNaN(count)) {
            ceilingPackages.push({ value, count });
        }
    });

    // Validate inputs
    if (ceilingPackages.length === 0) {
        alert('Please add at least one ceiling package');
        return;
    }

    const totalCeilingCount = ceilingPackages.reduce((sum, pkg) => sum + pkg.count, 0);
    const totalCeilingValue = ceilingPackages.reduce((sum, pkg) => sum + (pkg.value * pkg.count), 0);
    
    // Calculate floor package count needed to get closest to target average
    // Using formula: (floor * floorCount + totalCeilingValue) / (floorCount + totalCeilingCount) ≈ average
    // Solving for floorCount: floorCount = (average * totalCeilingCount - totalCeilingValue) / (floor - average)
    let floorCount = Math.round((average * totalCeilingCount - totalCeilingValue) / (floor - average));
    
    // Ensure at least 1 floor package
    floorCount = Math.max(1, floorCount);
    
    const totalPackages = totalCeilingCount + floorCount;
    const calculatedAverage = (floor * floorCount + totalCeilingValue) / totalPackages;

    // Calculate probabilities
    const probabilities = ceilingPackages.map(pkg => ({
        value: pkg.value,
        probability: pkg.count / totalPackages * 100
    }));

    const floorProbability = floorCount / totalPackages * 100;
    const probAboveAverage = probabilities.reduce((sum, pkg) => 
        pkg.value > average ? sum + pkg.probability : sum, 0);

    // Display result
    const resultDiv = document.getElementById('pc-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <h2>Results:</h2>
        <p>Target average: $${average.toFixed(2)}</p>
        <p>Achieved average: $${calculatedAverage.toFixed(2)}</p>
        <p>Number of floor packages: ${floorCount}</p>
        <p>The probability of getting a package worth more than the achieved average is: <strong>${probAboveAverage.toFixed(2)}%</strong></p>
        <p>Distribution of packages:</p>
        <ul>
            <li>Packages worth $${floor.toFixed(2)} (${floorCount} packages): ${floorProbability.toFixed(2)}%</li>
            ${probabilities.map(pkg => 
                `<li>Packages worth $${pkg.value.toFixed(2)}: ${pkg.probability.toFixed(2)}%</li>`
            ).join('')}
        </ul>
    `;
}

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
