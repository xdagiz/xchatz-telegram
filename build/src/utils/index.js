export function escapeMarkdownV2(text) {
    // First escape backslash to avoid double escaping other characters
    text = text.replace(/\\/g, "\\\\");
    // Escape all MarkdownV2 reserved characters
    const pattern = /[_*\[\]\(\)~`>#\+\-=\|\{\}\.!]/g;
    return text.replace(pattern, (m) => `\\${m}`);
}
