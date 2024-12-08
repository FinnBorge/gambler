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

function calculateCeilingValue() {
    const floor = parseFloat(document.getElementById('pc-floor').value);
    const average = parseFloat(document.getElementById('pc-average').value);
    const totalPackages = parseInt(document.getElementById('total-packages').value);
    const ceilingCount = parseInt(document.getElementById('ceiling-package-count').value);
    const providedCeiling = parseFloat(document.getElementById('pc-ceiling').value);

    if (isNaN(floor) || isNaN(average) || isNaN(totalPackages) || isNaN(ceilingCount)) {
        alert('Please enter all required values');
        return;
    }

    if (floor >= average) {
        alert('Floor value must be less than average value');
        return;
    }

    if (ceilingCount >= totalPackages) {
        alert('Number of ceiling packages must be less than total packages');
        return;
    }

    if (!isNaN(providedCeiling)) {
        if (providedCeiling <= average) {
            alert('Ceiling value must be greater than average value');
            return;
        }
        // Use the provided ceiling value
        document.querySelectorAll('.ceiling-value').forEach(input => {
            input.value = providedCeiling.toFixed(2);
        });
        return;
    }

    // Let x be the number of floor packages (totalPackages - ceilingCount)
    // Let c be the ceiling value we're solving for
    // Then: (floor * x + c * ceilingCount) / totalPackages = average
    // Solving for c:
    // floor * x + c * ceilingCount = average * totalPackages
    // c * ceilingCount = average * totalPackages - floor * x
    // c = (average * totalPackages - floor * (totalPackages - ceilingCount)) / ceilingCount

    const floorCount = totalPackages - ceilingCount;
    const ceilingValue = (average * totalPackages - floor * floorCount) / ceilingCount;

    // Update all ceiling value inputs
    document.querySelectorAll('.ceiling-value').forEach(input => {
        input.value = ceilingValue.toFixed(2);
    });
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

    // Combine packages with same value
    const combinedPackages = {};
    ceilingPackages.forEach(pkg => {
        const key = pkg.value.toFixed(2);
        if (!combinedPackages[key]) {
            combinedPackages[key] = { value: pkg.value, count: 0 };
        }
        combinedPackages[key].count += pkg.count;
    });

    // Calculate probabilities
    const probabilities = Object.values(combinedPackages).map(pkg => ({
        value: pkg.value,
        count: pkg.count,
        probability: pkg.count / totalPackages * 100
    }));

    const floorProbability = floorCount / totalPackages * 100;
    const probAboveAverage = probabilities.reduce((sum, pkg) => 
        pkg.value > average ? sum + pkg.probability : sum, 0);

    // Calculate attempts needed for different success rates
    const attemptsFor50 = Math.ceil(Math.log(0.5) / Math.log(1 - (probAboveAverage/100)));
    const attemptsFor75 = Math.ceil(Math.log(0.25) / Math.log(1 - (probAboveAverage/100)));
    const attemptsFor90 = Math.ceil(Math.log(0.1) / Math.log(1 - (probAboveAverage/100)));
    const attemptsFor99 = Math.ceil(Math.log(0.01) / Math.log(1 - (probAboveAverage/100)));
    
    // Calculate total cost assuming each package costs the average value
    const costFor50 = attemptsFor50 * average;
    const costFor75 = attemptsFor75 * average;
    const costFor90 = attemptsFor90 * average;
    const costFor99 = attemptsFor99 * average;

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
                `<li>Packages worth $${pkg.value.toFixed(2)} (${pkg.count} packages): ${pkg.probability.toFixed(2)}%</li>`
            ).join('')}
        </ul>
        <h3>Investment Required for Different Success Rates:</h3>
        <div class="probability-results">
            <p><span class="chance">50% chance</span> requires <strong>${attemptsFor50} packages</strong> at $${average.toFixed(2)} each<br>
            Total investment: <span class="cost">$${costFor50.toFixed(2)}</span></p>
            
            <p><span class="chance">75% chance</span> requires <strong>${attemptsFor75} packages</strong> at $${average.toFixed(2)} each<br>
            Total investment: <span class="cost">$${costFor75.toFixed(2)}</span></p>
            
            <p><span class="chance">90% chance</span> requires <strong>${attemptsFor90} packages</strong> at $${average.toFixed(2)} each<br>
            Total investment: <span class="cost">$${costFor90.toFixed(2)}</span></p>
            
            <p><span class="chance">99% chance</span> requires <strong>${attemptsFor99} packages</strong> at $${average.toFixed(2)} each<br>
            Total investment: <span class="cost">$${costFor99.toFixed(2)}</span></p>
        </div>
    `;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function calculateSuccessAttempts() {
    const successChance = parseFloat(document.getElementById('success-chance').value);
    
    if (isNaN(successChance) || successChance <= 0 || successChance > 100) {
        alert('Please enter a valid success chance between 0 and 100');
        return;
    }

    const probability = successChance / 100;
    
    // Calculate attempts needed for 90% and 99% overall success chance
    // Using formula: 1 - (1-p)^n >= target
    // Solving for n: n >= log(1-target)/log(1-p)
    const attemptsFor50 = Math.ceil(Math.log(0.5) / Math.log(1 - probability));
    const attemptsFor75 = Math.ceil(Math.log(0.25) / Math.log(1 - probability));
    const attemptsFor90 = Math.ceil(Math.log(0.1) / Math.log(1 - probability));
    const attemptsFor99 = Math.ceil(Math.log(0.01) / Math.log(1 - probability));

    const resultDiv = document.getElementById('succeed-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <h2>Results:</h2>
        <p>With a ${successChance}% chance of success per attempt:</p>
        <h3>Investment Required for Different Success Rates:</h3>
        <div class="probability-results">
            <p><span class="chance">50% chance</span> requires <strong>${attemptsFor50}</strong> attempts</p>
            
            <p><span class="chance">75% chance</span> requires <strong>${attemptsFor75}</strong> attempts</p>
            
            <p><span class="chance">90% chance</span> requires <strong>${attemptsFor90}</strong> attempts</p>
            
            <p><span class="chance">99% chance</span> requires <strong>${attemptsFor99}</strong> attempts</p>
        </div>
    `;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    // Calculate attempts needed for different success rates
    const attemptsFor50 = Math.ceil(Math.log(0.5) / Math.log(1 - probAboveAverage));
    const attemptsFor75 = Math.ceil(Math.log(0.25) / Math.log(1 - probAboveAverage));
    const attemptsFor90 = Math.ceil(Math.log(0.1) / Math.log(1 - probAboveAverage));
    const attemptsFor99 = Math.ceil(Math.log(0.01) / Math.log(1 - probAboveAverage));
    
    // Calculate total cost assuming each package costs the average value
    const costFor50 = attemptsFor50 * average;
    const costFor75 = attemptsFor75 * average;
    const costFor90 = attemptsFor90 * average;
    const costFor99 = attemptsFor99 * average;

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
        <h3>Investment Required for Different Success Rates:</h3>
        <div class="probability-results">
            <p><span class="chance">50% chance</span> requires <strong>${attemptsFor50} packages</strong> at $${average.toFixed(2)} each<br>
            Total investment: <span class="cost">$${costFor50.toFixed(2)}</span></p>
            
            <p><span class="chance">75% chance</span> requires <strong>${attemptsFor75} packages</strong> at $${average.toFixed(2)} each<br>
            Total investment: <span class="cost">$${costFor75.toFixed(2)}</span></p>
            
            <p><span class="chance">90% chance</span> requires <strong>${attemptsFor90} packages</strong> at $${average.toFixed(2)} each<br>
            Total investment: <span class="cost">$${costFor90.toFixed(2)}</span></p>
            
            <p><span class="chance">99% chance</span> requires <strong>${attemptsFor99} packages</strong> at $${average.toFixed(2)} each<br>
            Total investment: <span class="cost">$${costFor99.toFixed(2)}</span></p>
        </div>
    `;
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
