import { HttpClient, HttpParams } from "@angular/common/http";
import {Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";

export interface Medico{
    rut_medico:string;
    nombres:string;
    apellidos:string;
    especialidad_id:number;
    especialidad:string,
}

export interface Servicio{
    servicio_id:number;
    nombre:string;
    duracion:number;
}

export interface Especialidad{
    id:number;
    nombre:string;
}

export interface Paciente{
    rut:string;
    nombres:string;
    apellidos:string;
    celular:string;
    direccion:string;
    comuna_id:number;
}

export interface SlotDto{
    inicio:string;
    fin:string;
    disponible?:boolean;
}

export interface Cita{
    rut_medico:string;
    rut_paciente:string;
    servicio_id:number;
    fecha_cita:string;
    hora_inicio:string;
}

@Injectable({providedIn: 'root'})
export class ReservaCitaservive{
    constructor(
        private httpClient: HttpClient
    ){}

    obtenerMedicos(){
        return this.httpClient.get<Medico[]>(`${environment.API_URL}/medico/all`);
    }

    obtenerServicios(){
        const servicios = this.httpClient.get<Servicio[]>(`${environment.API_URL}/servicio/all`);
        return servicios;
    }

    buscarPaciente(rut:string){
        return this.httpClient.get<Paciente[]>(`${environment.API_URL}/paciente/rut/${rut}`);
    }

    obtenerSlots(params:{rut_medico:string, fecha_cita:string}): Observable<SlotDto[]>{
        let httpParams = new HttpParams().set('rut_medico',params.rut_medico).set('fecha_cita',params.fecha_cita)
         return this.httpClient.get<SlotDto[]>(`${environment.API_URL}/cita/slots`, { params: httpParams });
    }

    crearCita(cita:Cita){
        return this.httpClient.post(`${environment.API_URL}/cita`,cita)
    }

}