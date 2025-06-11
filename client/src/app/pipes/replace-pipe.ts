import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'replace' })
export class ReplacePipe implements PipeTransform {
  transform(value: string, strToReplace: string, replacementStr: string): string {
    return value.replace(new RegExp(strToReplace, 'g'), replacementStr);
  }
}