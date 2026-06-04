export function formatUnits(value: number) {
  return value.toFixed(2)
}

export function formatPercent(value: number) {
  return value.toFixed(2)
}

export function formatSignedUnits(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}u`
}
