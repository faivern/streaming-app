export function getDirector(crew: any[]) {
  return crew.find((person) => person.job === "Director");
}

export function getMainCast(cast: any[], count = 3) {
  return [...cast]
    .sort((a, b) => a.order - b.order)
    .slice(0, count);
}

export function getCreatorsString(
  createdBy?: { name: string }[]
): string {
  if (!createdBy || createdBy.length === 0) return "";
  return createdBy.map((c) => c.name).join(", ");
}
