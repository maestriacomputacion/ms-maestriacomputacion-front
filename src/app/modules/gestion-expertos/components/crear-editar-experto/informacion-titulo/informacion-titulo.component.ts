import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-informacion-titulo',
  templateUrl: './informacion-titulo.component.html',
  styleUrls: ['./informacion-titulo.component.scss']
})
export class InformacionTituloComponent implements OnInit {

  @Output() formReady = new EventEmitter<FormGroup>();

  tituloForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) {}

  ngOnInit():void {
    this.initForm();
  }

  initForm():void{
    this.tituloForm=this.fb.group({
      tituloexper: ['',Validators.required],
      "id":[''],
      "universidadtitexp":['', Validators.required],  
    });
    this.formReady.emit(this.tituloForm);
  }


  getFormControl(formControlName: string): FormControl {
    return this.tituloForm.get(formControlName) as FormControl;
  }

}
