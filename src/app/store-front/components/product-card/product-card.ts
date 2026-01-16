import { Product } from '@/products/interfaces/product.interface';
import { ProductImagePipe } from '@/products/pipes/product-image.pipe';
import { SlicePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe],
  templateUrl: './product-card.html',
})
export class ProductCard {

  product = input.required<Product>();

  imageUrl = computed(() => { // retorno de imagenes
    return `${environment.baseUrl}/files/product/${this.product().images[0]}`
  })
}
