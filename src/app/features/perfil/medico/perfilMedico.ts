import { Component, inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PerfilMedicoService } from "../../../core/services/perfilMedico.service";
import { firstValueFrom } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import { MatButtonToggle, MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { Router } from "@angular/router";

export interface Cita{
    cita_id: string;
    paciente_id: string;
    medico_id:string;
    servicio_id:string;
    fecha_cita: string;
    inicio_cita: string;
    fin_cita: string;
    estado:string;
}

export interface Especialidad{
    especialidad_id:number,
    nombre:string
}

export interface Servicio{
    nombre:string;
}

export type EstadoCita = 'PENDIENTE' | 'CANCELADA' | 'REALIZADA';
export type FiltroCitas = 'todas' | 'pendiente' | 'realizada' | 'cancelada' | 'proximas';

@Component({
    selector:'app-perfil-medico',
    templateUrl: './perfilMedico.html',
    styleUrls: ['./perfilMedico.css'],
    standalone: true,
    imports:[
        CommonModule,
        MatCardModule,
        MatListModule,
        MatButtonModule,
        MatDividerModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonToggle,
        MatPaginatorModule,
        MatButtonToggleModule
    ],
})

export class PerfilMedico implements OnInit {
    private readonly api = inject(PerfilMedicoService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly router = inject(Router);

    cargarEspecialida = false;
    cargarCitas = false;

    cita: Cita[] = [];
    especialidad :string = '';
    servicio: Servicio[] = []
    nombreCompleto: string = '';
    filtro:FiltroCitas = 'todas';
    pageIndex = 0;
    pageSize = 5;

    private readonly fechaActual: string = new Date().toISOString().slice(0,10);
    
    get filtroCitas(): Cita[] {
        const f = this.filtro;
        return this.cita.filter(c=>{
            const estado = (c.estado || "");
            const fecha = (""+c.fecha_cita).slice(0,10);
            const esProxima = estado === 'PENDIENTE' && (fecha >= this.fechaActual);
            switch(this.filtro){
                case 'todas': return true;
                case 'proximas': return esProxima;
                case 'pendiente': return estado === 'PENDIENTE';
                case 'realizada': return estado === 'REALIZADA';
                case 'cancelada': return estado === 'CANCELADA';
            }
        });
    }

    get pageCitas():Cita[]{
        const inicio  = this.pageIndex * this.pageSize;
        return this.filtroCitas.slice(inicio, inicio + this.pageSize);
    }

    onChangeFiltro(f:FiltroCitas){
        this.filtro = f;
        this.pageIndex = 0;
    }

    onPage(e:PageEvent){
        this.pageIndex = e.pageIndex;
        this.pageSize = e.pageSize;
    }

    get totalCitas(): number { return this.cita.length; }
    get pendientes(): number { return this.cita.filter(c => c.estado === 'PENDIENTE').length; }
    get realizadas(): number { return this.cita.filter(c => c.estado === 'REALIZADA').length; }

    trackByCita = (_: number, c: Cita) => c.cita_id;

    ngOnInit(): void {
        const usuario = this.usuarioLocalStorage();
        console.log(usuario);
        this.cargarDatos(usuario.rut_medico, usuario.especialidad_id);
        if(usuario){
            this.nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;
            
        }
    }
    private async cargarDatos(rut_medico:string, especialidad_id :number):Promise<void>{
        this.cargarEspecialida = true;
        try{
            const [citas, especialidad] = await Promise.all([
                firstValueFrom(this.api.getCitasByRutMedico(rut_medico)),
                firstValueFrom(this.api.getEspecialidadById(especialidad_id))
            ]);
            this.cita = citas;
            this.especialidad = especialidad.nombre;
         }catch(e){ 
            this.snackBar.open('Error al cargar los datos, intente nuevamente', 'Cerrar', { duration: 2000 });
        } finally {
            this.cargarEspecialida = false;
        }
    }
    private isBrowser():boolean{
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

    private usuarioLocalStorage(){
        if(!this.isBrowser()){
            return null;
        }
        const nombre_usuario = localStorage.getItem('usuario');
        return nombre_usuario ? JSON.parse(nombre_usuario) : null;
    }

    inicio_cita(cita:Cita){
        this.router.navigate(['/videoLlamada',cita.cita_id]);
    }
}