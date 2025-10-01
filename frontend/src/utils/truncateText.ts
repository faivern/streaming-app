export function truncateText(text?: string): string {
    if (text && text.length > 38) {
        return text.substring(0, 35) + "...";
    }
    return text ?? "";
}