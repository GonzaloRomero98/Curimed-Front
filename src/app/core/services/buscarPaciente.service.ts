import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";

export interface UsuarioCreateRes {
  id: string;          // UUID
  correo: string;
  rol: 'ADMIN' | 'MEDICO' | 'PACIENTE' | 'RECEPCIONISTA' | 'DOCTOR';
  creacion?: string;
  editado?: string;
}

interface pacienteRes{
    usuario_id:string,
    rut_paciente:string,
    nombres:string,
    apellidos:string,
    celular:string,
    fecha_nacimiento:string,
    direccion:string,
    comuna_id:number
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


export interface Comuna{
    comuna_id:number,
    nombre:string
}

export interface PacineteCreate{
    usuario_id:string,
    rut_paciente:string,
    nombres:string,
    apellidos:string,
    celular:string,
    direccion:string,
    fecha_nacimiento:string,
    comuna_id:number
}

@Injectable({providedIn:'root'})
export class BuscarPacienteService{
    constructor(private httpClient: HttpClient){}

    crearUsuario(body:UsuarioReq){
        return this.httpClient.post<UsuarioCreateRes>(`${environment.API_URL}/usuario`,body)
    }

    crearPaciente(body:PacineteCreate){
        return this.httpClient.post<PacineteCreate[]>(`${environment.API_URL}/paciente`,body)
    }
    
    getComunas(){
        return this.httpClient.get<Comuna[]>(`${environment.API_URL}/comuna`)
    }

    getPacientes():Observable<pacienteRes[]>{
            return this.httpClient.get<pacienteRes[]>(`${environment.API_URL}/paciente/all`)
        }

    eliminarUsuario(id:string){
        return this.httpClient.delete(`${environment.API_URL}/usuario/eliminar/${id}`)
    }


    
}