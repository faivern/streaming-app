export function truncateText(text?: string): string {
    if (text && text.length > 35) {
        return text.substring(0, 32) + "...";
    }
    return text ?? "";
}