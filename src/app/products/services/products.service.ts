import { HttpClient } from '@angular/common/http';
import { inject, Injectable, ResourceRef } from '@angular/core';
import { Gender, Product, ProductsResponse } from '../interfaces/product.interface';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { User } from '@/auth/interfaces/user.interface';

const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User
};


@Injectable({providedIn: 'root'})
export class ProductsService {
  private http = inject(HttpClient);

  private productsCache = new Map<string,ProductsResponse>();
  private productCacheIdSlug = new Map<string,Product>();

  getProducts(options: Options): Observable<ProductsResponse>{

    const {limit = 9, offset = 0, gender = ''} = options;

    const key = `${limit}-${offset}-${gender}`; // 9-0-'' --> la idea es crear un Id
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }


    return this.http.get<ProductsResponse>(`${baseUrl}/products`, {
      params: {
        limit: limit,
        offset: offset,
        gender: gender,
      },
    })
    .pipe(
      tap((resp) => console.log(resp)),
      tap((resp) => this.productsCache.set(key, resp)), // caché
    );
  }

  getProductByIdSlug(idSlug: string): Observable<Product>{


    const key = `${idSlug}`; // --> la idea es crear un Id
    if (this.productCacheIdSlug.has(key)) {
      return of(this.productCacheIdSlug.get(key)!);
    }
    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`).pipe(
      // tap((resp) => console.log(resp)),
      tap((resp) => this.productCacheIdSlug.set(key, resp)),
    );
  }

  getProductById(id: string): Observable<Product>{

    if ( id === 'new') {
      return of(emptyProduct);
    }

    const key = `${id}`; // --> la idea es crear un Id
    if (this.productCacheIdSlug.has(key)) {
      return of(this.productCacheIdSlug.get(key)!);
    }
    return this.http.get<Product>(`${baseUrl}/products/${id}`).pipe(
      // tap((resp) => console.log(resp)),
      tap((resp) => this.productCacheIdSlug.set(key, resp)),
    );
  }

  updateProduct(id: string, productLike: Partial<Product>, imageFileList?: FileList): Observable<Product> {

    const currentImages = productLike.images ?? [];

    return this.uploadImages(imageFileList)
      .pipe(
        map(imageNames => ({
          ...productLike,
          images: [...currentImages, ...imageNames]
        })),
        switchMap( // Me srive para tomar el resultado de un observable y generar otro basado en ese resultado
          (updatedProduct) =>
            this.http.patch<Product>(`${baseUrl}/products/${id}`, updatedProduct) // Por recomendación se manda el id por separado. Nota: el 2do argumento es el cuerpo del producto como lo quiero actualizar
        ),
        tap((product) => this.updateProductCache(product)) // llamo al metodo para actualizar la caché
      )


    // return this.http.patch<Product>(`${baseUrl}/products/${id}`, productLike).pipe( // Por recomendación se manda el id por separado. Nota: el 2do argumento es el cuerpo del producto como lo quiero actualizar
    //   tap((product) => this.updateProductCache(product)) // llamo al metodo para actualizar la caché
    // )
  }

  createProduct(productLike: Partial<Product>, imageFileList?: FileList): Observable<Product>{

    return this.uploadImages(imageFileList)
      .pipe(
        map(imageNames => ({
          ...productLike,
          images: [...imageNames],
        })),
        switchMap( (newProduct) =>
          this.http.post<Product>(`${baseUrl}/products/`, newProduct)
        ),
        tap((product) => this.updateProductCache(product))
      )

    // return this.http.post<Product>(`${baseUrl}/products/`, productLike).pipe(
    //   tap((product) => this.updateProductCache(product))
    // )
  }

  updateProductCache(product: Product){
    const productId = product.id;

    this.productCacheIdSlug.set(productId, product); // Actualizo la caché del producto individual

    this.productsCache.forEach( productResponse => { // Actualizo el producto dentro de la caché general
      productResponse.products = productResponse.products.map((currentProduct) => {
        return currentProduct.id === productId? product : currentProduct;
      });
    })
    console.log('Caché actualizado');
  }

  uploadImages(images?: FileList): Observable<string[]>{
    if (!images)  return of([]);

    const uploadObservables = Array.from(images).map(imageFile => this.uploadImageIndiv(imageFile));

    return forkJoin(uploadObservables).pipe( // Le mando el array de observable al forkJoin y espera a que todos emitan de manera exitosa un valor, pero si 1 falla, lanza toda la exception
      tap((imageName) => console.log({imageName})) // Está de más, solo es para verlo en consola
    );
  }

  uploadImageIndiv(image: File): Observable<string>{
    const formData = new FormData();
    formData.append('file', image) // Creo la pieza necesaria para la petición http de post de archivos

    return this.http.post<{fileName: string}>(`${baseUrl}/files/product`, formData).pipe(
      map( resp => resp.fileName)
    )
  }
}
