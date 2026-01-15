import { Product } from '@/products/interfaces/product.interface';
import { Component, input, inject, OnInit, signal, computed } from '@angular/core';
import { ProductCarousel } from "@/store-front/components/product-carousel/product-carousel";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@/utils/form-utils';
import { FormErrorLabel } from "@/shared/components/form-error-label/form-error-label";
import { ProductsService } from '@/products/services/products.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'product-details',
  imports: [ProductCarousel, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit{

  product = input.required<Product>();

  fb = inject(FormBuilder);
  productsService = inject(ProductsService);
  router = inject(Router);

  wasSaved = signal(false);
  imageFileList: FileList|undefined = undefined; // Objeto que me va a servir para subir los archivos
  tempImages = signal<string[]>([]);
  totalImages = computed(() => {
    const currentProductImages = [...this.product().images, ...this.tempImages()]; // Junto las imagenes temporales con las cargadas en el carrusel de imagenes
    return currentProductImages;
  })

  productForm = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [['']],
    images: [[]],
    gender: ['men', [Validators.required, Validators.pattern(/men|women|kid|unisex/)]], // Este pattern es para que solo admita los string men,women,etc
    tags: [''],
  })

  sizes = ['XS','S','M','L','XL','XXL'];

  ngOnInit(): void {
    this.setFormValue(this.product());
  }

  setFormValue(formLike: Partial<Product>){ // Para llenar los campos con la info correspondiente. El partial es porque los types no son iguales
    this.productForm.reset(this.product() as any); // sí uso: this.productForm.reset(this.product() as any), le estoy diciendo que haga lo que pueda para asociar la info entre estos 2 types algo diferentes
    // this.productForm.patchValue(formLike as any);
    this.productForm.patchValue({ tags: formLike.tags?.join(', ')});
  }

  onSizeClicked(size: string){
    const currentSizes = this.productForm.value.sizes ?? [];

    if (currentSizes.includes(size)) {
      currentSizes.splice(currentSizes.indexOf(size), 1);
    } else {
      currentSizes.push(size);
    }

    this.productForm.patchValue({
      sizes: currentSizes
    })
  }

  async onSubmit(){
    const isValid = this.productForm.valid; // true si el formulario es valido y false si no lo es
    this.productForm.markAllAsTouched();

    if (!isValid) return;
    const formValue = this.productForm.value;

    const productLike: Partial<Product> =  {
      ... (formValue as any),
      tags: formValue.tags?.toLowerCase()
        .split(',').map( tag => tag.trim() ?? []),
    };

    if (this.product().id === 'new') {
      // Crear Producto
      const product = await firstValueFrom( // firstValueFrom recibe un observable y regresa una promesa (async). También hace la subscripción de forma auto.
        this.productsService.createProduct(productLike, this.imageFileList)
      );
      console.log('Producto Creado');
      this.router.navigate(['/admin/products', product.id]);

    } else {
      // Actualizar Producto
      await firstValueFrom(
        this.productsService.updateProduct(this.product().id, productLike, this.imageFileList)
      )
      // console.log(productLike);
      console.log('Producto actualizado');
    }

    this.wasSaved.set(true);
    setTimeout(() => {
      this.wasSaved.set(false);
    }, 3000)

  }

  onFilesChanged(event: Event){
    const files = (event.target as HTMLInputElement).files; // evento para almacenar los archivos (imágenes) seleccionados en una lista de archivos
    this.tempImages.set([]);
    this.imageFileList = files ?? undefined; // Objeto que me va a servir para subir los archivos

    const imageUrls = Array.from(files ?? []).map(
      file => URL.createObjectURL(file) // Genera unos URL que puedo usar en mi navegador web
    )
    // console.log(imageUrls);

    this.tempImages.set(imageUrls);

  }

}
