import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-pagination',
  imports: [RouterLink],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {

  pages = input<number>(0);
  currentPage = input<number>(1);

  // activePage = signal(this.currentPage());
  activePage = linkedSignal(this.currentPage); // lo mismo que el anterior, pero evita doble sincronizacion

  getPagesList = computed(() => {
    return Array.from({ length: this.pages()}, (_, i) => i+1); // Array de paginas: creo un array a partir del lenght, despúes el (_, i) es para obtener los valores de la página (indices)
  });

}
