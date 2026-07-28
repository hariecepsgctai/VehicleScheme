// EMI calculation utilities for VehicleScheme
// Implements the custom flat-interest + one-off-on-interest model described.

export function computeOnRoadCost({showroomRate, marginPercent, processingFeePercent, gstPercent, docCharges, accessories, insurance}){
  const marginMoney = (marginPercent/100) * showroomRate;
  const netShowroomCost = showroomRate - marginMoney;
  const processingFee = (processingFeePercent/100) * netShowroomCost;
  const gst = (gstPercent/100) * processingFee;
  const totalOnRoad = netShowroomCost + processingFee + gst + docCharges + accessories + insurance;
  return {
    marginMoney,
    netShowroomCost,
    processingFee,
    gst,
    totalOnRoad
  };
}

// tenureMonths -> default interest and one-off mapping
const tenureDefaults = {
  12: {interest: 11.0, oneOff: 1.0},
  18: {interest: 11.5, oneOff: 1.5},
  24: {interest: 12.0, oneOff: 2.0},
  36: {interest: 13.0, oneOff: 2.5}
};

export function calculateEMI({loanAmount, tenureMonths, interestPercent, oneOffPercent}){
  // choose defaults if explicit rates not provided
  const defaults = tenureDefaults[tenureMonths] || {interest: interestPercent || 12.0, oneOff: oneOffPercent || 2.0};
  const interest = (interestPercent != null) ? interestPercent : defaults.interest;
  const oneOff = (oneOffPercent != null) ? oneOffPercent : defaults.oneOff;

  const principalMonthly = loanAmount / tenureMonths;
  const interestAmount = principalMonthly * (interest/100);
  const charges = interestAmount * (1 + (oneOff/100));
  const emi = principalMonthly + charges;

  return {
    tenureMonths,
    principalMonthly,
    interest,
    oneOff,
    interestAmount,
    charges,
    emi,
    totalPayable: emi * tenureMonths
  };
}
