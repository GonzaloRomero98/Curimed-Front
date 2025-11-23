import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

export interface Comuna{
    comuna_id:number,
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
export class PerfilPacienteService{
    constructor( private httpClient: HttpClient){}

    getComunasById(comuna_id:number){
        return this.httpClient.get<Comuna[]>(`${environment.API_URL}/comuna/id/${comuna_id}`);
    }

    getCitasByRutPaciente(rut_paciente:string){
        return this.httpClient.get<Citas[]>(`${environment.API_URL}/cita/paciente/${rut_paciente}`)
    }
}