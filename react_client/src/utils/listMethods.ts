
function mapRecord<T, U>(
    record: Record<string, T>,
    mapper: (value: T, key: string) => U,
): Record<string, U> {
    return Object.fromEntries( Object.entries(record)
        .map(([key, value]) => 
            [key, mapper(value, key)]
    )
    );
}

function recordToList<T extends object>(obj: T) {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}

function listToRecord(list: any[], func: (item: any) => any[]) {
    return Object.fromEntries(
        list.map(func)
    )
}

function swapRecord(
    record: Record<any, any>
) {
    return Object.fromEntries(
        Object.entries(record).map(([key, value]) => [value, key])
    )
}

export {
    mapRecord, 
    recordToList,
    listToRecord,
    swapRecord
}