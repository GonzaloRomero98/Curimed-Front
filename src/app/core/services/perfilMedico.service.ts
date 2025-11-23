import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

export interface Comuna{
    comuna_id:number,
    nombre:string
}

export interface Especialidad{
    especialidad_id:number,
    nombre:string
}

export interface Citas{
    cita_id: string,
    paciente_id: string,
    medico_id:string,
    servicio_id:string,
    fecha_cita: string,
    inicio_cita: string,
    fin_cita: string,
    estado:string,
}

@Injectable({providedIn:'root'})
export class PerfilMedicoService{
    constructor(private httpClient: HttpClient){}

    getComunasById(comuna_id:number){
        return this.httpClient.get<Comuna[]>(`${environment.API_URL}/comuna/id/${comuna_id}`);
    }

    getEspecialidadById(especialidad_id:number){
        return this.httpClient.get<Especialidad>(`${environment.API_URL}/especialidad/${especialidad_id}`);
    }

    getCitasByRutMedico(rut_medico:string){
        return this.httpClient.get<Citas[]>(`${environment.API_URL}/cita/medico/${rut_medico}`);
    }
}