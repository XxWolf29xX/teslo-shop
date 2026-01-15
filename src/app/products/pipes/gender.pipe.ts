import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {

  transform(value: string,): string {
    switch(value.toLowerCase()){
      case 'men': return 'Hombres';
      case 'women': return 'Mujeres';
      case 'kid': return 'Niños/as';
      default: return 'Otros';
    }
  }

}
