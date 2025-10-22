import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";


export interface UsuarioCreateRes {
  id: string;
  correo: string;
  rol: 'ADMIN' | 'MEDICO' | 'PACIENTE' | 'RECEPCIONISTA' | 'DOCTOR';
  creacion?: string;
  editado?: string;
}

export interface Comuna{
    comuna_id:number,
    nombre:string
}

interface UsuarioReq{
    correo:string,
    contrasena:string,
    rol:'MEDICO'|'ADMIN'|'PACIENTE'|'RECEPCIONISTA'|'DOCTOR'
}

export interface RecepcionistaCreate{
    usuario_id:string,
    rut_recepcionista:string,
    nombres:string,
    apellidos:string,
    celular:string,
    direccion:string,
    fecha_nacimiento:string,
    comuna_id:number
}

interface recepcionistaResponsive{
    usuario_id:string,
    rut_recepcionista:string,
    nombres:string,
    apellidos:string,
    celular:string,
    fecha_nacimiento:string,
    direccion:string
}

@Injectable({providedIn:'root'})
export class BuscarRecepcionistaService{
    constructor(private httpClient: HttpClient){}

    crearUsuario(body:UsuarioReq){
        return this.httpClient.post<UsuarioCreateRes>(`${environment.API_URL}/usuario`,body);
    }

    crearRecepcionista(body:RecepcionistaCreate){
        return this.httpClient.post<RecepcionistaCreate[]>(`${environment.API_URL}/recepcionista`,body)
    }

    getComunas(){
        return this.httpClient.get<Comuna[]>(`${environment.API_URL}/comuna`)
    }

    getDoctores():Observable<recepcionistaResponsive[]>{
            return this.httpClient.get<recepcionistaResponsive[]>(`${environment.API_URL}/recepcionista/all`)
        }
}