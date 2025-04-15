export function mapResponseException(response: any): Map<string, string> {
    try {
        const result = new Map<string, string>(
            Object.entries(response || {}).map(([key, value]) => [key, String(value)])
        );
        return result;
    } catch {
        return new Map<string, string>();
    }
}
