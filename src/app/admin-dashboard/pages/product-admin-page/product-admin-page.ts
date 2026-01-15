import { ActivatedRoute, Router } from '@angular/router';
import { Component, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductsService } from '@/products/services/products.service';
import { ProductDetails } from './product-details/product-details';

@Component({
  selector: 'app-product-admin-page',
  imports: [ProductDetails],
  templateUrl: './product-admin-page.html',
})
export class ProductAdminPage {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  productsService = inject(ProductsService)

  productId = toSignal( // toSignal, para poder atrapar el cambio mientras se está en la misma pantalla
    this.activatedRoute.params.pipe(
      map((params) => params['id'])
    )
  );

  productResource = rxResource({
    params: () => ({id: this.productId()}),
    stream: ({params}) => {
      return this.productsService.getProductById(params.id);
    }
  });

  redirectEffect = effect(() => {
    if(this.productResource.error()){
      this.router.navigate(['/admin/products']); // Sí no se encuentra el producto me manda devuelta a la tabla de productos
    }
  })
}
