import {Component, ComponentFactoryResolver, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IRecursoComunitario} from "../../../interfaces/i-recurso-comunitario";
import {ITipoRecursoComunitario} from "../../../interfaces/i-tipo-recurso-comunitario";
import {ITerminal} from "../../../interfaces/i-terminal";
import {IRelacionTerminalRecursoComunitarios} from "../../../interfaces/i-relacion-terminal-recurso-comunitarios";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {IPaciente} from "../../../interfaces/i-paciente";
import {CargaPersonaService} from "../../../servicios/carga-persona.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {
  CargaRelacionTerminalRecursosComunitariosService
} from "../../../servicios/relacion-terminal-recurso-comunitario/carga-relacion-terminal-recursos-comunitarios.service";
import {CargaTerminalesService} from "../../../servicios/terminal/carga-terminales.service";
import {CargaTipoRecursoComunitarioService} from "../../../services/recursos/carga-tipo-recurso-comunitario.service";
import {CargaDireccionService} from "../../../servicios/carga-direccion.service";
import {CargaRecursoComunitarioService} from "../../../services/recursos/carga-recurso-comunitario.service";
import {CargaPacienteService} from "../../../servicios/carga-paciente.service";
import {RelacionTerminalRecursoComunitarios} from "../../../clases/relacion-terminal-recurso-comunitarios";
import Swal from "sweetalert2";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-editar-datos-sanitario',
  templateUrl: './editar-datos-sanitario.component.html',
  styleUrls: ['./editar-datos-sanitario.component.scss']
})
export class EditarDatosSanitarioComponent implements OnInit {

  edit: boolean = false;
  @Output() public plegar = new EventEmitter;
  @Output() public desplegar = new EventEmitter;
  @Input() public blockEditar;

  public plegado: boolean = false;

  mostrar: boolean = false;
  id: number = 0;
  public recurso_comunitario: IRecursoComunitario |any;
  public tipos_recursos_comunitarios: ITipoRecursoComunitario[] | any;
  public relaciones_terminales: ITerminal[] | any;
  public relacion_terminal_recurso : IRelacionTerminalRecursoComunitarios | any;
  public formularioDatos: FormGroup | any;
  public recurso: IRecursoComunitario | any ;
  public recursoBorrad: IRelacionTerminalRecursoComunitarios | any;
  public recursosMostrados: IRecursoComunitario[];
  public arrayRelaciones: IRelacionTerminalRecursoComunitarios [] = [];
  public pacientes: IPaciente[] | any;
  public mostrarTabla = false;
  public idPaciente: number;
  public recursoMostrar: IRecursoComunitario | any;
  public pacienteEditar: IPaciente|any;


  constructor( private crearPaciente: CargaPacienteService
               ,private cargaPersonas: CargaPersonaService,
               private componentFactoryResolver: ComponentFactoryResolver,
               private route: ActivatedRoute,
               private titleService: Title,
               private router: Router,
               private cargaRelacionTerminalRecursosComunitarios: CargaRelacionTerminalRecursosComunitariosService,
               private cargaRelacionTerminal: CargaTerminalesService,
               private cargaTiposRecursos: CargaTipoRecursoComunitarioService,
               private formBuilder: FormBuilder,
               private cargaDireccion: CargaDireccionService,
               private cargaRecurso: CargaRecursoComunitarioService,
               private paciente: CargaPacienteService) { }

  //Carga todas las peticiones GET para así mostrarlas en la página. Junto con la creación de una nueva terminal.
  ngOnInit(): void {
    this.relacion_terminal_recurso = new RelacionTerminalRecursoComunitarios();
    this.cargaRelacionTerminal.getTerminales().subscribe(
      terminal => {
        this.relaciones_terminales = terminal;
      },
      error => console.log(error),
    );


    this.cargaRecurso.getDatosSanitario(1).subscribe(
      recursos =>{
        this.recursosMostrados = recursos;
      },
      error => console.log(error),
    )
    this.paciente.getPacientes().subscribe(
      pacientes => {
        this.pacientes = pacientes;
      }
    )

    this.crearPaciente.getPaciente(this.crearPaciente.idPacienteEditar).subscribe(
      paciente =>{
        this.pacienteEditar = paciente;
        this.formularioDatos.patchValue({
          nuss: this.pacienteEditar.numero_seguridad_social
        })

      }, error => console.log(error),
      () => {
        this.cargaRelacionTerminalRecursosComunitarios.getRelacionesTerminalesRecursosComunitarios().subscribe(
          relacion =>{
            if (relacion != null){
              for (const relac of relacion) {
                if (relac.id_terminal.id == this.pacienteEditar.id_terminal.id){
                  this.arrayRelaciones.push(relac);
                }else{
                }
              }
              this.ordenarPorTiempo();
            }else{

            }

          }
        )
      }

    )

    this.crearFormulario();
  }


//Función que determina si se pulsa o no en el selector de Recursos. Si no se pulsa aparece con cierta opacidad.
  desactivado() {
    return (this.formularioDatos.value.recurso == '') || (this.formularioDatos.value.recurso == null);

  }


  //Crea el formulario gracias a los formularios reactivos que uso.
  crearFormulario(){
    this.formularioDatos = this.formBuilder.group(

      {
        nuss: ['',[Validators.required,Validators.pattern("^\\d*\\.?\\d+$")]],
        recurso: ['',[Validators.required]],
        tiempo: ['', [Validators.required,Validators.pattern("^[0-9]+$")]]

      }
    )
  }


  //Metodo usado para poder seleccionar la ID de nuestro recurso y que realice un GET para al darle al boton de Eye, aparezca la tarjeta.
  seleccionarId(recursoId: any){

    if (recursoId != null){

      this.cargaRecurso.idRecursoVer = recursoId;
      this.cargaRecurso.getRecursoComunitario(this.cargaRecurso.idRecursoVer).subscribe(
        recurso => {
          this.recursoMostrar = recurso;

        }
      )
    }else{
      this.recursoMostrar = null;
    }

  }


  //Metodo que crea la relación Terminal-Recurso. Esta hace un GET de la ID del Recurso y lo guarda, creando luego la relacion y haciendo un POST con la nueva
  //relacion. Trae como resultado un POST de Relacion Terminal. Este metodo tiene un booleano que hace que se muestre una tabla con todos las relaciones
  crearRelacion(){
    this.cargaRecurso.getRecursoComunitario(this.formularioDatos.get('recurso').value).subscribe(
      recurso => {
        this.recurso = recurso;
      }, error => console.log(error),
      () =>{

        this.relacion_terminal_recurso = {
          'id_terminal': this.pacienteEditar.id_terminal.id,
          'id_recurso_comunitario': this.recurso.id,
          'tiempo_estimado': this.formularioDatos.get('tiempo').value
        }
        this.cargaRelacionTerminalRecursosComunitarios.nuevaRelacionRecurso(this.relacion_terminal_recurso).subscribe(
          relacion =>{
            this.alertExito();
            this.arrayRelaciones.push(relacion);
            this.ordenarPorTiempo();
          }
        )

      }
    )
    this.mostrarTabla = true;

  }

  //Ordena el array de recursos por tiempo de mayor a menor.
  ordenarPorTiempo(): void{
    this.arrayRelaciones.sort((a,b) => b.tiempo_estimado - a.tiempo_estimado);
  }


  //Mando la ID del Recurso en específico junto con la posición y elimino el recurso en cuestión
  //Me traigo primero la terminal para posteriormente borrarlo de mi array de arrayRelaciones y eliminar la relación.
  borrarRecurso(id: number, i: number) {
    this.cargaRelacionTerminalRecursosComunitarios.getRelacionTerminalRecursoComunitario(id).subscribe(
      terminal => {
        this.recursoBorrad = terminal
      },
      error => console.log(error),
      () =>{
        this.arrayRelaciones.splice(i,1);
        this.cargaRelacionTerminalRecursosComunitarios.eliminarRelacionRecurso(this.recursoBorrad).subscribe(
          () =>{
            this.alertBorrarRecurso();
          }
        )

      }
    )

  }



  //Tomo la ID del Paciente generado de Datos Personales para así modificar luego el numero de Seguridad Social del Paciente.
  //Trae como resultado un PATCH del NUSS
  actualizarNuss(){

    this.paciente.modificarNUSS(this.pacienteEditar.id, this.formularioDatos.get('nuss').value).subscribe(
      () =>{
        this.alertExito();
        this.plegar.emit(false);

      }
    )

  }

//Estos GET sirven para así poder tomar el valor de los mismos del formulario en cuestión
  get nombre(){
    return this.formularioDatos.get('nombre') as FormControl;
  }

  get nuss(){
    return this.formularioDatos.get('nuss') as FormControl;
  }

  get telefono(){
    return this.formularioDatos.get('telefono') as FormControl;

  }

  get localidad(){
    return this.formularioDatos.get('localidad') as FormControl;
  }

  get provincia(){
    return this.formularioDatos.get('provincia') as FormControl;
  }


  get direccion(){
    return this.formularioDatos.get('direccion') as FormControl;
  }

  get codigo_postal(){
    return this.formularioDatos.get('codigo_postal') as FormControl;
  }

  get tiempo(){
    return this.formularioDatos.get('tiempo') as FormControl;
  }

  contraer() {
    this.plegado = !this.plegado;
  }

  volver() {
    this.plegado = !this.plegado;
    this.desplegar.emit(true);
  }

//-------------------------------------------------------


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
      title: environment.fraseModificar,
    })
  }


  //Toast para el Alert indicando que la operación fue borrada de forma exitosa
  alertBorrarRecurso() :void {
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
      title: environment.fraseEliminarRecurso,
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

}




