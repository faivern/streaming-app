export function knownForDepartment(known_for_department?: string, gender?: number): string {
    switch (known_for_department) {
        case "Acting":
            return gender === 1 ? "Actress" : "Actor";
        case "Directing":
            return "Director";
        case "Writing":
            return "Writer";
        default:
            return "Crew";
    }
}