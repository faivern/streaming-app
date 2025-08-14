export function calcAge(birthday?: string, deathday?: string): string {
  if (!birthday) return "N/A";

  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) return "N/A";

  const referenceDate = deathday ? new Date(deathday) : new Date();
  if (isNaN(referenceDate.getTime())) return "N/A";

  let age = referenceDate.getFullYear() - birthDate.getFullYear();

  const hasHadBirthdayThisYear =
    referenceDate.getMonth() > birthDate.getMonth() ||
    (referenceDate.getMonth() === birthDate.getMonth() &&
      referenceDate.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age.toString();
}