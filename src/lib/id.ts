let counter = Date.now();

export function genId(): string {
  counter += 1;
  return `${Date.now().toString(36)}_${counter.toString(36)}`;
}
