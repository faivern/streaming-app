export type Paged<T> = {
    page: number;
    total_pages: number;
    total_results: number;
    results: T[];
};

export type ErrorResponse = {
    message?: string;
};

export type LoadingResponse = {
    message?: string;
};