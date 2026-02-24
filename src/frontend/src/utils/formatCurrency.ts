/**
 * Formats a price in paise to rupees with proper decimal handling
 * @param priceInPaise - Price in paise (smallest currency unit)
 * @returns Formatted price string with rupee symbol (e.g., "₹20" or "₹20.50")
 */
export function formatCurrency(priceInPaise: bigint): string {
  const priceInRupees = Number(priceInPaise) / 100;
  
  // Check if the price has decimal places
  if (priceInRupees % 1 === 0) {
    // Whole number - no decimals
    return `₹${priceInRupees}`;
  } else {
    // Has decimals - show up to 2 decimal places
    return `₹${priceInRupees.toFixed(2)}`;
  }
}
