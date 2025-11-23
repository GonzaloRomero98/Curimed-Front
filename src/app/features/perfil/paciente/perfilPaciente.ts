import { Component, inject, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { PerfilPacienteService } from "../../../core/services/perfilPaciente.service";
import { FiltroCitas } from "../medico/perfilMedico";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { firstValueFrom } from "rxjs";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggle, MatButtonToggleModule } from "@angular/material/button-toggle";

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

@Component({
    selector: "app-perfil-paciente",
    templateUrl: "./perfilPaciente.html",
    styleUrls: ["./perfilPaciente.css"],
    standalone: true,
    imports: [
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
export class perfilPaciente implements OnInit {
    private api = inject(PerfilPacienteService);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    cargarCitas  =false;

    cita:Cita[] = [];
    nombreCompleto:string = "";
    filtro:FiltroCitas  ='todas';
    pageIndex = 0;
    pageSize  =5;

    private readonly fechaActual: string = new Date().toISOString().slice(0,10);

    get filtroCitas():Cita[]{
        const f = this.filtro;
        return this.cita.filter(c =>{
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
        const inicio = this.pageIndex * this.pageSize;
        return this.filtroCitas.slice(inicio, inicio + this.pageSize);
    }

    onChangeFiltro(f:FiltroCitas){
        this.filtro  =f;
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
        const usuario = this.usuarioLocalStorage()
        this.cargarDatos(usuario.rut_paciente)
    }


    private usuarioLocalStorage(){
        if(!this.isBrowser()){
            return null;
        }
        const nombre_usuario = localStorage.getItem('usuario');
        return nombre_usuario ? JSON.parse(nombre_usuario) : null;
    }

    private async cargarDatos(rut_paciente:string):Promise<void>{
        try{
            const [citas] = await Promise.all([
                firstValueFrom(this.api.getCitasByRutPaciente(rut_paciente)),
            ]);
            this.cita = citas;
         }catch(e){ 
            this.snackBar.open('Error al cargar los datos, intente nuevamente', 'Cerrar', { duration: 2000 });
        }
    }

    private isBrowser():boolean{
        return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    }

    inicio_cita(cita:Cita){
            this.router.navigate(['/videoLlamada',cita.cita_id]);
        }

}