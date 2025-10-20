import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from "@angular/material/card";
import { ReservaCitaservive } from "../../../core/services/reserva.service";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { MatIconModule } from "@angular/material/icon";

export interface Medico{
  rut_medico: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
}
export interface Paciente{
  rut: string;
  nombres: string;
  apellidos: string;
  celular: string;
  direccion: string;
  comuna_id: number;
}
export interface Servicio{
  servicio_id: number;
  nombre: string;
  duracion: number; 
}
export interface Slot{
  inicio:Date;
  fin:Date;
  disponible?: boolean;
}

@Component({
  selector: 'app-reservas',
  templateUrl: '/reservaPaciente.html',
  styleUrl: '/reservaPaciente.css',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatIconModule
  ]
})
export class ReservasPacienteComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ReservaCitaservive);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  form: FormGroup = this.fb.group({
    // Dato Usuario
    rut: [{value:'',disabled:true}] ,
    nombres: [{ value:'', disabled: true }],
    apellidos: [{ value:'', disabled: true }],
    celular: [{ value:'', disabled: true }],
    correo: [{ value: '', disabled: true }],

    // Datos Reserva
    medico_id: [null, Validators.required],
    servicio_id: [null as number | null, Validators.required],
    fecha: [null, Validators.required],
    start_at: [{ value: null, disabled: true },Validators.required],
  });
  readonly minDate: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  
  medicos: Medico[] = [];
  servicios: Servicio[] = [];
  fechaHabil = (fecha: Date | null) => !!fecha && fecha.getDay() !== 0; // domingo no
  cargarPaciente = false;
  cargarMedicos = false;

  slots: Slot[]=[];
  loadingSlots = false;
  errorSlot:string | null = null;

   

  ngOnInit(): void {
    this.cargarMedicosYServicios();
    const usuario = this.usuariodataStorage()
    this.form.patchValue({
        rut: usuario.rut_paciente,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        celular:usuario.celular
    });
  }

  private isBrowser():boolean{
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
  
  private usuariodataStorage(){
    if(!this.isBrowser()){
      return null;
    }
    const nombre_usuario = localStorage.getItem('usuario');

    return nombre_usuario ? JSON.parse(nombre_usuario) : null;
  }


  private pad2(n: number) { return String(n).padStart(2, '0'); }
  private onlyDateISO(d: Date) {
    return `${d.getFullYear()}-${this.pad2(d.getMonth()+1)}-${this.pad2(d.getDate())}`;
  }
  
  private async cargarMedicosYServicios(): Promise<void> {
    this.cargarMedicos = true;
    try {
      const [medicos, servicios] = await Promise.all([
        firstValueFrom(this.api.obtenerMedicos()),
        firstValueFrom(this.api.obtenerServicios()),
      ]);
      this.medicos = medicos;
      this.servicios = servicios;
    } catch (e) {
      this.snackBar.open('Error al cargar los datos, intente nuevamente', 'Cerrar', { duration: 2000 });
    } finally {
      this.cargarMedicos = false;
    }
  }

  private toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private hourFromISO(iso: string):string{
    return iso.substring(11,16);
  }
  private isHHMM(x: any): x is string {
    return typeof x === 'string' && /^\d{2}:\d{2}$/.test(x);
  }

  private combine(fecha: Date, hhmm: string): Date {
    const [hh, mm] = hhmm.split(':').map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return new Date(''); // Invalid Date
      return new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        hh, mm, 0, 0
    );
  }


  async buscarSlots() {
  const medico_id = this.form.get('medico_id')?.value;
  const servicio_id = this.form.get('servicio_id')?.value;
  const fecha: Date | null = this.form.get('fecha')?.value;

  if (!medico_id || !servicio_id || !fecha) {
    this.slots = [];
    this.form.get('start_at')?.reset();
    this.form.get('start_at')?.disable();
    return;
  }

  this.loadingSlots = true;
  this.errorSlot = null;
  this.slots = [];
  this.form.get('start_at')?.reset();
  this.form.get('start_at')?.disable();

  try {
    const dia = this.toISODate(fecha);
    const resp = await firstValueFrom(
      this.api.obtenerSlots({ rut_medico: medico_id, fecha_cita: dia })
    );

    const raw = Array.isArray(resp) ? resp : [];

    const parsed: Slot[] = raw.map((s: any) => {
      let start: Date;
      let end: Date;

      if (typeof s.inicio === 'string' && s.inicio.includes('T')) {
        start = new Date(s.inicio);
      } else if (this.isHHMM(s.inicio)) {
        start = this.combine(fecha, s.inicio);
      } else {
        start = new Date('');
      }

      if (typeof s.fin === 'string' && s.fin.includes('T')) {
        end = new Date(s.fin);
      } else if (this.isHHMM(s.fin)) {
        end = this.combine(fecha, s.fin);
      } else {
        end = new Date('');
      }

      return {
        inicio: start,
        fin: end,
        disponible: !s.desabilitado,
      };
    })
    // filtra cualquier slot inválido para que el DatePipe no reviente
    .filter(s => s.inicio instanceof Date && !isNaN(s.inicio.getTime())
              && s.fin    instanceof Date && !isNaN(s.fin.getTime()));

    this.slots = parsed;

    const hayDisponible = this.slots.some(s => s.disponible);
    if (hayDisponible) {
      this.form.get('start_at')?.enable();
    } else {
      this.form.get('start_at')?.disable();
    }
  } catch (e) {
    console.error(e);
    this.errorSlot = 'Error al cargar los horarios, intente nuevamente';
    this.form.get('start_at')?.disable();
  } finally {
    this.loadingSlots = false;
  }
}
  async confirmarCita() {
    if(this.form.invalid){
      this.snackBar.open('Debe completar todos los campos requeridos','Cerrar',{duration:2000});
      return;
    }

    const rut_paciente = this.form.get('rut')?.value?.trim();
    const rut_medico = this.form.get('medico_id')?.value;
    const servicio_id = this.form.get('servicio_id')?.value;
    const fecha = this.form.get('fecha')?.value;
    const inicioSeleccionado = this.form.get('start_at')?.value;
    if(!rut_paciente){
      this.snackBar.open('Debe ingresar un RUT válido','Cerrar',{duration:2000});
      return;
    }
    if(!inicioSeleccionado || isNaN(inicioSeleccionado.getTime())){
      this.snackBar.open('Debe seleccionar un horario válido','Cerrar',{duration:2000});
      return; 
    }

    if(!fecha){
      this.snackBar.open('Debe seleccionar una fecha válida','Cerrar',{duration:2000});
      return;
    }

    const fecha_cita = this.onlyDateISO(fecha);
    const hora = inicioSeleccionado.getHours();
    const hora_inicio = `${this.pad2(hora)}:00`;

    const payload = {
      rut_medico,
      rut_paciente,
      servicio_id,
      fecha_cita,
      hora_inicio
    };

    try{
      await firstValueFrom(this.api.crearCita(payload));
      this.snackBar.open('Cita reservada con exito', 'Cerrar',{duration:2000})

    }catch(e){
      this.snackBar.open('No se pudo hacer la reserva', 'Cerrar', { duration: 2800 });
    }

  }
}