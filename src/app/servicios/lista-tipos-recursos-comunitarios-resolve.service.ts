import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {ITipoRecursoComunitario} from '../interfaces/i-tipo-recurso-comunitario';
import {CargaTipoRecursoComunitarioService} from '../services/recursos/carga-tipo-recurso-comunitario.service';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ListaTiposRecursosComunitariosResolveService implements Resolve<ITipoRecursoComunitario> {

  constructor(private cargaTiposRecursosComunitarios: CargaTipoRecursoComunitarioService, private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ITipoRecursoComunitario> {
    return this.cargaTiposRecursosComunitarios.getTiposRecursosComunitarios().pipe(
      catchError(error => {
        this.router.navigate(['/inicio']);
        return of(null);
      })
    );
  }
}
