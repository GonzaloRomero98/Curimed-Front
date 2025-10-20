import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { map, Observable } from "rxjs";
import e from "express";

interface doctorResponsive{
    usuario_id:string,
    rut_medico:string,
    nombres:string,
    apellidos:string,
    celular:string,
    fecha_nacimiento:string,
    direccion:string
}

export interface Comuna{
    comuna_id:number,
    nombre:string
}

export interface Especialidad{
    especialidad_id:number,
    nombre:string,
    activo?:boolean
}

interface UsuarioReq{
    correo:string,
    contrasena:string,
    rol:'MEDICO'|'ADMIN'|'PACIENTE'|'RECEPCIONISTA'|'DOCTOR'
}
export interface UsuarioCreateRes {
  id: string;
  correo: string;
  rol: 'ADMIN' | 'MEDICO' | 'PACIENTE' | 'RECEPCIONISTA' | 'DOCTOR';
  creacion?: string;
  editado?: string;
}

export interface MedicoReq{
    usuario_id:string,
    rut_medico:string,
    nombres:string,
    apellidos:string,
    celular:string,
    fecha_nacimiento:string,
    direccion:string,
    especialidad_id:number;
    comuna_id:number
}

@Injectable({providedIn: 'root'})
export class BuscarDoctoresService{

    constructor(private httpClient: HttpClient){}

    crearUsuario(body:UsuarioReq){
        return this.httpClient.post<UsuarioCreateRes>(`${environment.API_URL}/usuario`,body)
    }
    
    crearMedico(body:MedicoReq){
        return this.httpClient.post<MedicoReq[]>(`${environment.API_URL}/medico`,body)
    }

    getDoctores():Observable<doctorResponsive[]>{
        return this.httpClient.get<doctorResponsive[]>(`${environment.API_URL}/medico/all`)
    }

    getComunas(){
        return this.httpClient.get<Comuna[]>(`${environment.API_URL}/comuna`)
    }

    getEspecialidades(){
        return this.httpClient.get<Especialidad[]>(`${environment.API_URL}/especialidad`)
    }

    getComunasByName(nombre:string){
        return this.httpClient.get<Comuna>(`${environment.API_URL}/comuna/${nombre}`)
    }

    eliminarUsuario(id:string){
        return this.httpClient.delete(`${environment.API_URL}/usuario/eliminar/${id}`)
    }


}