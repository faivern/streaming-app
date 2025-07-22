export function getDirector(crew: any[]) {
  return crew.find((person) => person.job === "Director");
}

export function getMainCast(cast: any[], count = 3) {
  return [...cast]
    .sort((a, b) => a.order - b.order)
    .slice(0, count);
}
