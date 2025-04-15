import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'emptyLabel',
})
export class EmptyLabelPipe implements PipeTransform {

    EMPTY_VALUE = 'Sin información';

    transform(value: any): string {

        if (value === null || value === undefined) {
            return this.EMPTY_VALUE;
        }

        if(value instanceof String && value.trim() === '') {
            return this.EMPTY_VALUE;
        }

        return value;
    }
}
