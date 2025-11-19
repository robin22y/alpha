export function getDefaultExpenses(monthlyIncome: number) {
  // Return percentages (0-100) that sum to 100
  return {
    rentBills: 35,
    food: 20,
    transport: 10,
    kidsHome: 15,
    other: 20, // Adjusted to sum to 100
  };
}

export function percentagesToAmounts(percentages: {
  rentBills: number;
  food: number;
  transport: number;
  kidsHome: number;
  other: number;
}, monthlyIncome: number) {
  return {
    rentBills: Math.round((monthlyIncome * percentages.rentBills) / 100),
    food: Math.round((monthlyIncome * percentages.food) / 100),
    transport: Math.round((monthlyIncome * percentages.transport) / 100),
    kidsHome: Math.round((monthlyIncome * percentages.kidsHome) / 100),
    other: Math.round((monthlyIncome * percentages.other) / 100),
  };
}

