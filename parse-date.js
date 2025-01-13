export default function parseDate(dateString) {
    // Example format: "08-01-2025--14-30"
    const regex = /^(\d{2})-(\d{2})-(\d{4})--(\d{2})-(\d{2})$/;
    let match = dateString.match(regex);

    if (!match) {
        throw new Error('Invalid date format');
    }

    // Extract components from the matched groups
    const [_, day, month, year, hour, minute] = match;

    // Note: JavaScript months are 0-indexed (January is 0, February is 1, ...)
    return new Date(year, month - 1, day, hour, minute);
}