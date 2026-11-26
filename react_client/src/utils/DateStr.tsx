
export type { DateStr }
export { today, dateToString }

type DateStr = string

function today(): DateStr {
    return dateToString(new Date());
}

function dateToString(date: Date): string {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}