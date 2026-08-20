import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPercent'
})
export class FormatPercentPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 2): string {
    if (value == null || typeof value !== 'number' || isNaN(value)) return '–';
    return `${Number(value).toFixed(decimals)} %`;
  }
}
