import { useQuery } from "@tanstack/react-query";
import { getPersonDetails } from "../../api/person.api";
import type { Person } from "../../types/tmdb";

export function usePerson(id?: number) {
    return useQuery<Person>({
        queryKey: ["person", id],
        queryFn: () => getPersonDetails(id!),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    });
}