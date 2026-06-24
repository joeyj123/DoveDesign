/** Returns board feet for a member (all dims in actual inches). */
export function calcBoardFeet(thickness: number, width: number, length: number): number {
  return (thickness * width * length) / 144;
}

/** Returns lumber cost for a single member. */
export function calcMemberCost(
  thickness: number,
  width: number,
  length: number,
  costPerBoardFoot: number
): number {
  return calcBoardFeet(thickness, width, length) * costPerBoardFoot;
}
