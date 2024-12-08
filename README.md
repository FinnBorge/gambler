# Package Value Probability Calculator

This web-based calculator helps users understand the probability distribution of mystery package gambling games. In these games, players can purchase packages containing unknown amounts of money, where the operator discloses three key values:

- Floor Value: The minimum amount a package can contain
- Ceiling Value: The maximum amount a package can contain
- Average Value: The statistical average value across all packages

## Purpose

The calculator provides two main functionalities:

1. **Simple Calculator**: Calculates the probability of receiving an above-average package when only floor, ceiling, and average values are known.

2. **Package Count Calculator**: A more advanced calculator that helps understand probability distributions when specific numbers of packages at different values are involved.

## How It Works

The calculator uses a simplified mathematical model to estimate probabilities. It assumes:
- A discrete distribution of package values
- Packages can only contain the floor value, ceiling value, or (in some cases) the average value
- The distribution must satisfy the given average value

## Usage

1. Open `index.html` in a web browser
2. Choose between Simple Calculator or Package Count Calculator
3. Enter the known values (floor, ceiling, average)
4. Click "Calculate Probability" to see the results

## Disclaimer

This calculator is for educational purposes only. Gambling involves risk, and past probabilities do not guarantee future results. Always gamble responsibly and within your means.

## Technical Details

Built using:
- HTML5
- CSS3
- Vanilla JavaScript
- Mobile-responsive design
