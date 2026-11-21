export const moneyPattern = (cents: number): RegExp =>
  new RegExp(`^\\$\\s*${(cents / 100).toFixed(2).replace('.', '\\.')}\\s*$`);
