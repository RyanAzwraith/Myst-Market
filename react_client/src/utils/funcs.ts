
function mapRecord<K extends string|number|symbol,T, U>(
    record: Record<K, T>,
    mapper: (value: T, key: K) => U,
): Record<K, U> {
    return Object.fromEntries( Object.entries(record)
        .map(([key, value]) => 
            [key, mapper(value as T, key as K)] as [K, U]
    )
    ) as Record<K, U>;
}

function mapToList<K extends string|number|symbol, T, U>(
    record: Record<K, T>,
    mapper: (value: T, key: K) => U,
): U[] {
    return Object.entries(record)
        .map(([key, value]) => mapper(value as T, key as K));
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


function capitalizeString(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export {
    mapRecord, 
    mapToList,
    recordToList,
    listToRecord,
    swapRecord,
    capitalizeString
}