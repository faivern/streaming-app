// TODO Pagination, Result<T>, etc.
// Pagination wrapper, used by multiple endpoints
export type Paged<T> = {
    page: number;
    total_pages: number;
    total_results: number;
    results: T[];
};