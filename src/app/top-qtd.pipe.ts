import { Pipe } from '@angular/core';
import { PipeTransform } from '@angular/core/src/change_detection/pipe_transform';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {
  transform(array: Array<string>, target: string, sort: string = 'asc'): Array<string> {
    array.sort((a: any, b: any) => {
      if (sort === 'asc') {
        if (a[target] < b[target]) {
          return -1;
        } else if (a[target] > b[target]) {
          return 1;
        } else {
          return 0;
        }
      } else {
        if (a[target] > b[target]) {
          return -1;
        } else if (a[target] < b[target]) {
          return 1;
        } else {
          return 0;
        }
      }
    });
    return array;
  }
}
