import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BuscarDoctoresService } from '../../../../core/services/buscarDoctores.service'; 


interface doctorData{
    rut_medico:string,
    nombres:string,
    apellidos:string,
    celular:string,
    fecha_nacimiento:string,
    direccion:string
}

@Component({
  selector: 'app-lista-medicos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './listaMedicos.html',
  styleUrls: ['./listaMedicos.css'],
})
export class ListaMedicos{

    displayedColumns: string[] = [
        'rut', 'nombres', 'apellidos', 'celular', 'fecha_nacimiento', 'direccion', 'acciones'
    ];
    dataSource: doctorData[]= [];
    constructor(private medicosService:BuscarDoctoresService){}
    ngOnInit(): void {
        this.medicosService.getDoctores().subscribe({
        next: data => this.dataSource = data ?? [],
        error: err => console.error('Error cargando médicos', err)
        });
    }
    editar(row: any) { console.log('Editar', row); }
}