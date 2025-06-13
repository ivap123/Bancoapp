export const calculateNewBalance = (currentBalance, amount, type) => {
  if (type === 'deposit') {
    return currentBalance + amount;
  } else if (type === 'transfer') {
    return currentBalance - amount;
  } else {
    return currentBalance;
  }
};
