import { SelectItem } from "primeng/api";

export function enumToSelectItems(enumParam: {}): SelectItem[] {
    return Object.keys(enumParam).map((key) => ({
        value: key,
        label: enumParam[key],
    }));
}

export function getRandomNumber() {
    const min = 0;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
