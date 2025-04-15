import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'bytesToKb',
})
export class BytesToKbPipe implements PipeTransform {
    transform(bytes: number): string {
        const kilobytes = bytes / 1024;
        return kilobytes.toFixed(0);
    }
}
