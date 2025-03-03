export function msToHours(ms: number) {
  const sec = ms / 1000;
  const min = sec / 60;
  return min / 60;
}

export function primHoursToStrhours(input: number) {
  const hours = Math.floor(input);
  const minutes = Math.round((input - hours) * 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

export function ObjTimeToPrimHours(input: { h: number; m: number }) {
  return input.h + input.m / 60;
}
