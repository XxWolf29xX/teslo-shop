import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.baseUrl;

@Pipe({
  name: 'productImage',
})
export class ProductImagePipe implements PipeTransform {

  transform(value:null | string | string[]): string {

    // console.log("PIPE VALUE",value); // El error dee porque no aparecian en el carrusel las imagenes temp, era porque llegaban al pipe como un array, en lugar de individualmente

    if (value === null) {
      return './assets/images/no-image.jpg';
    }

    if (typeof value === 'string' && value.startsWith('blob:')) {
      return value;
    }

    if (typeof value === 'string') {
      return `${baseUrl}/files/product/${value}`;
    }
    const image = value.at(0);

    if (!image) {
      return './assets/images/no-image.jpg'
    }

    return `${baseUrl}/files/product/${image}`;
  }

}
