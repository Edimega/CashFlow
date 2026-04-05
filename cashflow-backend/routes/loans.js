const express = require('express');
const router = express.Router();

// @route   POST api/loans/calculate
// @desc    A generic loan calculator for all users
// @access  Public (or Private depending on choice, making Public for general use)
router.post('/calculate', (req, res) => {
	const { principal, interestRate, periods, periodType } = req.body;

	// Calculate basic loan amortization
	// r = interest rate per period
	let r = (interestRate / 100);
	switch (periodType) {
		case 'Monthly': r = r / 12; break;
		case 'Quarterly': r = r / 4; break;
		case 'Semi-Annual': r = r / 2; break;
		case 'Annual': r = r / 1; break;
	}

	// Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
	const numerator = principal * r * Math.pow(1 + r, periods);
	const denominator = Math.pow(1 + r, periods) - 1;
	const emi = denominator === 0 ? principal / periods : numerator / denominator;

	const totalAmountPaid = emi * periods;
	const totalInterest = totalAmountPaid - principal;

	res.json({
		installmentAmount: emi.toFixed(2),
		totalInterest: totalInterest.toFixed(2),
		totalAmountPaid: totalAmountPaid.toFixed(2),
		numberOfInstallments: periods,
		periodType: periodType
	});
});

module.exports = router;
