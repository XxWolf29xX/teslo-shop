import { FormUtils } from '@/utils/form-utils';
import { Component, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'form-error-label',
  imports: [],
  templateUrl: './form-error-label.html',
  styleUrl: './form-error-label.css',
})
export class FormErrorLabel {

  control = input.required<AbstractControl>() // Al recibir un abstractControl, viene el objeto con todos sus errores

  get errorMessage() {
    const errors: ValidationErrors = this.control().errors || {};

    return this.control().touched && Object.keys(errors).length > 0
      ? FormUtils.getTextError(errors)
      : null;
  }
}
