import { useQuery } from "@tanstack/react-query";
import { getPersonDetails } from "../../api/person.api";
import type { Person } from "../../types/tmdb";

export function usePerson(personId?: number) {
    return useQuery<Person>({
        queryKey: ["person", personId],
        queryFn: () => getPersonDetails(personId!),
        enabled: Boolean(personId),
        staleTime: 5 * 60 * 1000,
    });
}