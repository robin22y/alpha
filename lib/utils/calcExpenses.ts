export function convertPercentsToAmounts(percs: any, income: number) {
  return {
    rentBills: (percs.rentBills / 100) * income,
    food: (percs.food / 100) * income,
    transport: (percs.transport / 100) * income,
    kidsHome: (percs.kidsHome / 100) * income,
    other: (percs.other / 100) * income,
  };
}

export function calculateBuffer(income: number) {
  return income * 0.10; // 10% auto
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
  const buffer = calculateBuffer(income);
  return income - (essentials + buffer + debtMinimums);
}

