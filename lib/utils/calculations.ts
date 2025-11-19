export function calculateUnexpectedBuffer(monthlyIncome: number) {
  return monthlyIncome * 0.10; // 10% automatic buffer
}

export function calculateLeftover({
  income,
  essentials,
  debtMinimums,
}: {
  income: number;
  essentials: number;
  debtMinimums: number;
}) {
  const buffer = calculateUnexpectedBuffer(income);
  return income - (essentials + buffer + debtMinimums);
}

