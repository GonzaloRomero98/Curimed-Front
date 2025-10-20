import { Component, computed, HostListener, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink,NavigationEnd } from '@angular/router';
//import { HomeComponent } from './features/home/home';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Administrador } from './features/administrador/administrador';
import { jwtDecode } from 'jwt-decode';
import { ReservasComponent } from './features/reservas/recepcionista/reservas';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatCardModule } from '@angular/material/card';


export interface JwtPayload{
    sub:string,
    correo:string,
    rol:string
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    Administrador,
    ReservasComponent,
    MatCardModule, 
    MatButtonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})


export class App {

  usuarioGuardado = signal<any | null>(this.usuarioLocalStorage());

  nombreCorto = computed(()=>{
    const usuario = this.usuarioGuardado();

    if(!usuario){
      return ''
    }

    const nombres = (usuario.nombres || '').toString().trim();
    const apellidos = (usuario.apellidos || '').toString().trim();

    const nombre1 = nombres.split(' ')[0] || '';
    const apellido1 = apellidos.split(' ')[0] || '';
    return `${nombre1} ${apellido1}`.trim();
  });

  protected readonly title = signal('Curimed');
  constructor(private router: Router){
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncUsuario());
  }

  private usuarioLocalStorage(){
    if(!this.isBrowser()){
      return null;
    }
    const nombre_usuario = localStorage.getItem('usuario');

    return nombre_usuario ? JSON.parse(nombre_usuario) : null;
  }

  private isBrowser():boolean{
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private syncUsuario() {
    this.usuarioGuardado.set(this.usuarioLocalStorage());
  }

  @HostListener('window:storage')
  onStorageChange() {
    this.syncUsuario();
  }

  login(){
    this.router.navigate(['/login']);
  }

  logout(){
    if(!this.isBrowser()){
      return null;
    }
    localStorage.removeItem('tokenusuario');
    localStorage.removeItem('usuario');
    this.usuarioGuardado.set(null);
    this.router.navigate(['/']);
    return;
  }

  obtenerRol(): string | null {
    if (!this.isBrowser()){
      return null;
    } 
    const rolToken = localStorage.getItem('tokenusuario');
    if(!rolToken){
      return null;
    }
    try{
      const payload = jwtDecode<JwtPayload>(rolToken);
      return payload.rol ?? null;
    }catch{
      return null;
    }

  }

  irPerfil(){
    
  }
}
