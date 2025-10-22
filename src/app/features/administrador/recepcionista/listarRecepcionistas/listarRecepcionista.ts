import { Component } from "@angular/core";
import { BuscarRecepcionistaService } from "../../../../core/services/buscarRecepcionista.service";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

interface recepcionistaData{
    rut_recepcionista:string,
    nombres:string,
    apellidos:string,
    celular:string,
    fecha_nacimiento:string,
    direccion:string
}



@Component({
    selector:'app-listar-recepcionista',
    standalone:true,
    imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
    templateUrl:'./listarRecepcionista.html',
    styleUrls:['./listarRecepcionista.css']
})
export class ListaRecepcionistas{
    displayedColumns: string[] = [
            'rut', 'nombres', 'apellidos', 'celular', 'fecha_nacimiento', 'direccion', 'acciones'
        ];
        dataSource: recepcionistaData[]= [];
        constructor(private recpecionistaService:BuscarRecepcionistaService){}
        ngOnInit(): void {
            this.recpecionistaService.getDoctores().subscribe({
            next: data => this.dataSource = data ?? [],
            error: err => console.error('Error cargando médicos', err)
            });
        }
        editar(row: any) { console.log('Editar', row); }
}