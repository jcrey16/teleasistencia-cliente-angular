import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {IAgenda} from "../../../interfaces/i-agenda";
import {Agenda} from "../../../clases/agenda";
import {CargaAgendaService} from "../../../servicios/carga-agenda.service";
import {ITipoAgenda} from "../../../interfaces/i-tipo-agenda";
import {IPersona} from "../../../interfaces/i-persona";
import {IPaciente} from "../../../interfaces/i-paciente";
import Swal from "sweetalert2";
import {environment} from "../../../../environments/environment";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {CargaTipoAgendaService} from "../../../servicios/carga-tipo-agenda.service";

@Component({
  selector: 'app-nuevo-agenda',
  templateUrl: './nuevo-agenda.component.html',
  styleUrls: ['./nuevo-agenda.component.scss']
})
export class NuevoAgendaComponent implements OnInit {

  public agenda: IAgenda;
  public tipos_agenda: ITipoAgenda[];
  public personas_contacto: IPersona[];
  public pacientes: IPaciente[];
  public nuevaAgenda: FormGroup;
  public importanciaArray = ['Alta', 'Baja'];
  submitted = false;
  mostrarNuevoTipo = false;
  mostrarEditarTipo = false;

  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private cargaAgendas: CargaAgendaService,
    private cargaTiposAgendas: CargaTipoAgendaService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  // Carga de los datos para poder rellenar el formulario de creación.
  ngOnInit(): void {
    this.tipos_agenda = this.route.snapshot.data['tipos_agenda'];
    this.personas_contacto = this.route.snapshot.data['personas'];
    this.titleService.setTitle('Nuevo agenda');
    this.agenda = new Agenda();
    this.pacientes = this.route.snapshot.data['pacientes'];
    this.crearForm();
  }

  public crearForm() {
    this.nuevaAgenda = this.formBuilder.group({
      paciente: ['',[
        Validators.required
      ]],
      n_expediente: ['', [
        Validators.required
      ]],
      tipo_agenda: ['', [
        Validators.required
      ]],
      fecha_prevista: ['', [
        Validators.required
      ]],
      observaciones: ['', [
        Validators.required,
        Validators.minLength(10)
      ]]
    })
  }

  get form() {
    return this.nuevaAgenda.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.nuevaAgenda.invalid) {
      return;
    }

    this.nuevoAgenda();
  }

  // Método para marcar como 'selected' el option que coincide con el valor de la agenda seleccionada.
  optionSelected(i: number): void {
    document.getElementsByClassName('tipo_agenda_option')[i].setAttribute('selected', '');
  }

  // Método que realiza la petición al servidor de creación de una agenda.
  nuevoAgenda() {
    /*this.agenda = {
      'id_paciente': this.nuevaAgenda.get('paciente').value,
      'id'
    }*/
    this.cargaAgendas.nuevoAgenda(this.agenda).subscribe(
      e => {
        this.alertExito();
        this.router.navigate(['/agenda']);
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
  mostrarCrear() {
    this.mostrarNuevoTipo = !this.mostrarNuevoTipo;
  }
  mostrarNuevo(mostrar: boolean) {
    this.mostrarNuevoTipo = mostrar;
  }

  cambiarTipo(tipo: ITipoAgenda) {
    this.mostrarNuevoTipo = false;
    this.cargaTiposAgendas.getTiposAgenda().subscribe(
      tipos_agenda => {
        this.tipos_agenda = tipos_agenda;
        this.nuevaAgenda.get('tipo_agenda').setValue(tipo.id);
        this.alertExito();
      },
      error => {
        this.alertError()
      }
    )
  }

  mostrarModificar() {
    this.mostrarEditarTipo = !this.mostrarEditarTipo;
  }
  mostrarMod(mostrar: boolean) {
    this.mostrarEditarTipo = mostrar;
  }
  eliminarTipo() {
    this.cargaTiposAgendas.borrarTipoAgenda(this.nuevaAgenda.get('tipo_agenda').value).subscribe(
      () => {},
      error => {
        this.alertError();
      },
      () => this.cargaTiposAgendas.getTiposAgenda().subscribe(
        tipos_agenda => {
          this.tipos_agenda = tipos_agenda;
          this.nuevaAgenda.get('tipo_agenda').setValue('');
          this.alertExito();
        },
        error => {
          this.alertError();
        }
      )
    )
  }
}
