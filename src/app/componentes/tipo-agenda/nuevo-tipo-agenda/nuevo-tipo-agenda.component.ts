import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {ITipoAgenda} from "../../../interfaces/i-tipo-agenda";
import {TipoAgenda} from "../../../clases/tipo-agenda";
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {CargaTipoAgendaService} from "../../../servicios/carga-tipo-agenda.service";
import Swal from "sweetalert2";
import {environment} from "../../../../environments/environment";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-nuevo-tipo-agenda',
  templateUrl: './nuevo-tipo-agenda.component.html',
  styleUrls: ['./nuevo-tipo-agenda.component.scss']
})
export class NuevoTipoAgendaComponent implements OnInit {
  public tipo_agenda: ITipoAgenda | any;
  public importanciaArray = ['Alta', 'Baja'];
  public nuevoTipo: FormGroup;
  public submitted = false;
  mostrar = false;
  @Output () tipoNuevo= new EventEmitter<ITipoAgenda>();
  @Output () mostrarNuevoTipo= new EventEmitter<boolean>();

  constructor(private titleService: Title, private route: ActivatedRoute, private cargaTiposAgenda: CargaTipoAgendaService, private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.titleService.setTitle('Nuevo tipo agenda');
    this.crearForm();
  }

  crearForm() {
    this.nuevoTipo = this.formBuilder.group({
      nombre: ['', [
        Validators.required,
        Validators.maxLength(64)
      ]],
      codigo: ['', [
        Validators.required,
        Validators.maxLength(64)
      ]],
      importancia: ['', [
        Validators.required
      ]]
    });
  }

  get form() {
    return this.nuevoTipo.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.nuevoTipo.invalid) {
      return;
    }

    this.crearTipo();
  }

  crearTipo() {
    this.tipo_agenda = {
      "nombre": this.nuevoTipo.get('nombre').value,
      "codigo": this.nuevoTipo.get('codigo').value,
      "importancia": this.nuevoTipo.get('importancia').value
    }
    this.nuevoTipoAgenda()
  }

  // Método que lanza una petición al servidor para crear un nuevo tipo de agenda.
  nuevoTipoAgenda() {
    this.cargaTiposAgenda.nuevoTipoAgenda(this.tipo_agenda).subscribe(
      e => {
        this.alertExito();
        this.tipoNuevo.emit(e);
        this.mostrarNuevoTipo.emit(this.mostrar);
      },
      error => {
        this.alertError();
      }
    );
  }

  //Toast para el Alert indicando que la operación fue exitosa
  alertExito() :void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      //El tiempo que permanece la alerta, se obtiene mediante una variable global en environment.ts
      timer: environment.timerToast,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: 'success',
      title: environment.fraseCrear,
    })
  }

  //Toast para el alert indicando que hubo algún error en la operación
  alertError() :void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: environment.timerToast,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: 'error',
      title: environment.fraseErrorCrear
    })
  }

  onReset() {
    this.submitted = false;
    this.nuevoTipo.reset();
    this.mostrarNuevoTipo.emit(this.mostrar);
  }
}
