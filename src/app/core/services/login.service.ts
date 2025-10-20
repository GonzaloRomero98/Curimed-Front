import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { jwtDecode } from 'jwt-decode';


export interface DataLoginUsuario{
    correo :string,
    contrasena: string
}

export interface AuthResponse{
    access_token: string,
    datosUsuario:any
}

interface JwtPayload{
    sub:string,
    correo:string,
    rol:string
}

@Injectable({
    providedIn: 'root'
})

export class LoginService{
    constructor( private http:HttpClient){}

    login(dataLoginUsuario:DataLoginUsuario):Observable<AuthResponse>{
        return this.http.post<AuthResponse>(`${environment.API_URL}/auth/login`,dataLoginUsuario)
    }

    setSesion(token:string, datosUsuario:any){
        localStorage.setItem('tokenusuario',token);
        localStorage.setItem('usuario',JSON.stringify(datosUsuario));
        const rolToken = localStorage.getItem('tokenusuario');
        if(rolToken){
            const payload = jwtDecode<JwtPayload>(rolToken);
            return payload.rol;
        }
        return;
    }
}