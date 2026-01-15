import { AfterViewInit, Component, effect, ElementRef, input, OnChanges, SimpleChanges, viewChild } from '@angular/core';

import Swiper from 'swiper';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ProductImagePipe } from '@/products/pipes/product-image.pipe';


@Component({
  selector: 'product-carousel',
  imports: [ProductImagePipe],
  templateUrl: './product-carousel.html',
  styles:`
    .swiper {
      width: 100%;
      height: 500px;
    }
  `
})
export class ProductCarousel implements AfterViewInit {

  images = input.required<string[]>();

  swiperDiv = viewChild.required<ElementRef>('swiperDiv'); // Propiedades del carrusel
  swipper: Swiper | undefined = undefined;

  constructor() { // Tuve que usar el constructor y un effect por un error entre onChanges y signal. Ese problema también me rompia el carrusel de imagenes

    // Usar effect en lugar de OnChanges para mejor reactividad

    effect(() => {
      const currentImages = this.images();
      if (!this.swipper && currentImages.length === 0) return;

      queueMicrotask(() => {
        this.swipper?.destroy(true, true);

        const paginationEl = this.swiperDiv().nativeElement?.querySelector('.swiper-pagination');
        // console.log(paginationEl);
        // console.log('lcdtm')
        paginationEl.innerHTML = '';

        setTimeout(() => { // esta espera es para asegurarme de que el DOM se arma correctamente
          this.swipperInit();
        }, 100)
      })
    });
  }


  ngAfterViewInit(): void {
    this.swipperInit();
  }


  swipperInit(){
    const element = this.swiperDiv().nativeElement;
    if(!element) return;

    const swiper = new Swiper(element, {
      // Optional parameters
      direction: 'horizontal',
      loop: true,

      modules:[
      Navigation, Pagination
      ],

      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
      },

      // Navigation arrows
      navigation: {
      nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // And if we need scrollbar
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });
  }
}
