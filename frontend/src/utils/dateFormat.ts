// re-construct the releaseDate string fetched from the API. Example: "2023-10-01" to "Oct 1, 2023"
export function dateFormat(dateString?: string): string {
  if (!dateString) return "No date";

  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
}