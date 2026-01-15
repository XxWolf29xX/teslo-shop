import { ProductsResponse } from './../../../products/interfaces/product.interface';
import { ProductsService } from './../../../products/services/products.service';
import { Component, inject } from '@angular/core';
import { ProductCard } from '../../components/product-card/product-card';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Pagination } from "@/shared/components/pagination/pagination";
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { PaginationService } from '@/shared/components/pagination/pagination.service';

@Component({
  selector: 'app-home-page',
  imports: [ProductCard, Pagination],
  templateUrl: './home-page.html',
})
export class HomePage {

  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

  // activatedRoue = inject(ActivatedRoute); --> se movio a pagination.service

  // currentPage = toSignal(
  //   this.activatedRoue.queryParamMap.pipe(
  //     map( (params) => (params.get('page') ? +params.get('page')! : 1)),
  //     map( page => isNaN(page)? 1 : page)
  //   ),
  //   {
  //     initialValue: 1,
  //   }
  // )

  productsResource = rxResource({
    params: () => ({page: this.paginationService.currentPage() - 1}),
    stream: ({params}) => {
      return this.productsService.getProducts({
        offset: params.page * 9,
      });
    }
  })

}
