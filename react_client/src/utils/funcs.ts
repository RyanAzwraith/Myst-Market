
function mapRecord<K extends string|number|symbol, T, U>(
    record: Record<K, T>,
    mapper: (value: T, key: K) => U,
): Record<K, U> {
    return Object.fromEntries( Object.entries(record)
        .map(([key, value]) => 
            [key, mapper(value as T, key as K)] as [K, U]
    )
    ) as Record<K, U>;
}

function mapRecordtoList<K extends string|number|symbol, T, U>(
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

function recordValues<T>(record: Record<any, T>): T[] {
    return Object.values(record) as T[];
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

function labelizeString(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, char => char.toUpperCase());
}

function labelizeRecord<T extends Record<string, string>>(
  record: T,
): { [K in keyof T]: string } {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      labelizeString(value),
    ]),
  ) as { [K in keyof T]: string };
}

export {
    mapRecord, 
    mapRecordtoList,
    recordToList,
    listToRecord,
    recordValues,
    swapRecord,
    capitalizeString,
    labelizeString,
    labelizeRecord
}