import { ProductsService } from '@/products/services/products.service';
import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ProductCard } from "@/store-front/components/product-card/product-card";
import { GenderPipe } from '@/products/pipes/gender.pipe';
import { Pagination } from "@/shared/components/pagination/pagination";
import { PaginationService } from '@/shared/components/pagination/pagination.service';

@Component({
  selector: 'app-gender-page',
  imports: [GenderPipe, ProductCard, Pagination],
  templateUrl: './gender-page.html',
})
export class GenderPage {

  activatedRoute = inject(ActivatedRoute);
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

  gender = toSignal( // Señal tomada del parametro de la ruta (url)
    this.activatedRoute.params.pipe(
      map(({gender}) => gender)
    )
  );
  productsResource = rxResource({
    params: () => ({page: this.paginationService.currentPage() - 1, gender: this.gender()}), // cuando el gender cambie se vuelve a lanzar el resource
    stream: ({params}) => {
      return this.productsService.getProducts({offset: params.page * 9, gender: params.gender});
    }
  })
}
