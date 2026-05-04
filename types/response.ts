export type ResponseType<T> = {
    result: T;
    loading: boolean;
    error: string;
}