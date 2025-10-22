import { Component } from "@angular/core";
import { BuscarPacienteService } from "../../../../core/services/buscarPaciente.service";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from "@angular/common";

interface pacienteData{
    usuario_id:string,
    rut_paciente:string,
    nombres:string,
    apellidos:string,
    celular:string,
    fecha_nacimiento:string,
    direccion:string,
    comuna_id:number
}

@Component({
    selector:'app-listar-pacientes',
    standalone:true,
    imports:[
        CommonModule, 
        MatCardModule, 
        MatTableModule, 
        MatButtonModule, 
        MatIconModule,],
    templateUrl:'./listaPaciente.html',
    styleUrls:['./listaPaciente.css']
})
export class ListaPacienteComponent{
    columnas: string[] =[
        'rut',
        'nombres',
        'apellidos',
        'celular',
        'fecha_nacimiento',
        'direccion',
        'comuna',
        'acciones'
    ];

    dataPaciente :pacienteData[]=[];

    constructor(
        private pacienteService:BuscarPacienteService
    ){}

    ngOnInit():void{
        this.pacienteService.getPacientes().subscribe({
            next: data => this.dataPaciente = data ?? [],
            error: err => console.error('Error al cargar pacientes',err)
        });
    }
    editar(row:any){
        console.log('educar',row)
    }
}