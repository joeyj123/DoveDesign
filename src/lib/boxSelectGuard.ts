/** Suppresses member click immediately after a box-select drag completes. */
let suppressMemberClick = false;

export function armBoxSelectClickSuppress() {
  suppressMemberClick = true;
}

export function consumeBoxSelectClickSuppress(): boolean {
  if (!suppressMemberClick) return false;
  suppressMemberClick = false;
  return true;
}
