import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { BuscarDoctoresService, Comuna, Especialidad, MedicoReq } from "../../../../core/services/buscarDoctores.service";
import { firstValueFrom } from "rxjs";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";


function contrasenaigual(validarContrasena:AbstractControl):ValidationErrors | null{
    const contrasena1 = validarContrasena.get('contrasena1')?.value;
    const contrasena2 = validarContrasena.get('contrasena2')?.value;
    return contrasena1 === contrasena2 ? null : {mismatch:true}
}

function validarRut(ctrl: AbstractControl): ValidationErrors | null {
  const val = (ctrl.value ?? '').toString().toUpperCase().replace(/[.\-]/g, '');
  if (!val) return null;
  if (!/^\d{7,8}[0-9K]$/.test(val)) return { rut: 'Formato inválido' };

  const cuerpo = val.slice(0, -1), dv = val.slice(-1);
  let suma = 0, multip = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multip;
    multip = multip === 7 ? 2 : multip + 1;
  }
  const resto = 11 - (suma % 11);
  const dvCalc = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvCalc ? null : { rut: 'DV inválido' };
}




@Component({
    selector:'app-agregarMedico',
    imports:[
        CommonModule, 
        ReactiveFormsModule,
        MatFormFieldModule, 
        MatInputModule, 
        MatSelectModule,
        MatButtonModule, 
        MatDatepickerModule, 
        MatNativeDateModule,
        MatSnackBarModule
    ],
    templateUrl:'./agregarMedico.html',
    styleUrls:['./agregarMedico.css'],
    standalone:true,
})

export class AgregarMedicoComponent implements OnInit{
    private fb = inject(FormBuilder);
    //Guardamos la url de la api
    private api = inject(BuscarDoctoresService);
    private snack = inject(MatSnackBar);
    
    constructor(
        private router: Router
    ){}


    private humanizeError(err: any, step: 'usuario'|'medico'): string {
        const origen = step === 'usuario' ? 'del usuario' : 'del médico';

        if (err instanceof HttpErrorResponse) {
            const status = err.status;
            const body = err.error;
            // Mensajes del ValidationPipe de Nest suelen venir en body.message (array o string)
            const valida = Array.isArray(body?.message) ? body.message.join(' • ') : (body?.message ?? '');
            if (status === 0)   return `No hay conexión con el servidor (${origen}).`;
            if (status === 400) return `Datos ${origen} inválidos: ${valida || 'revísalos e inténtalo de nuevo'}`;
            if (status === 404) return `Recurso no encontrado (${origen}).`;
            if (status === 409) return `Conflicto ${origen}: ${body?.message || 'ya existe un registro con esos datos'}`;
            if (status >= 500)  return `Error interno (${status}). Intenta más tarde.`;
            return body?.message || `Error ${status} (${origen}).`;
        }
        return err?.message || `Error inesperado (${origen}).`;
    }

    loading = signal(false);
    //Guardar las comunas de la db
    comunas = signal<Comuna[]>([]);
    //Guardar las especialidddes
    especialidades = signal<Especialidad[]>([]);

    //Validamos las entradas del form
    form = this.fb.group({
        correo:['',[Validators.required, Validators.email]],
        contrasena:this.fb.group({
            contrasena1:['',[Validators.required, Validators.minLength(8)]],
            contrasena2:['',[Validators.required, Validators.minLength(8)]],
        },{Validators:contrasenaigual}),
        rut_medico: ['', [Validators.required, validarRut]],
        nombres: ['', Validators.required],
        apellidos: ['', Validators.required],
        celular: ['', Validators.required],            
        fecha_nacimiento: ['', Validators.required],  
        direccion: ['', Validators.required],
        especialidad_id: [null as unknown as number, Validators.required],
        comuna_id: [null as unknown as number, Validators.required]
    });
    
    //Cargamos las opciones de los dropdown del formularo
    ngOnInit(){
        this.cargarOpciones()
    }

    //Obtenemos las opciones listas de comuna y especialidad
    async cargarOpciones(){
        const comuna = await firstValueFrom(this.api.getComunas());
        const especialidad = await firstValueFrom(this.api.getEspecialidades());
        this.comunas.set(comuna);
        this.especialidades.set(especialidad);
    }
    //Revisamos si todas los campos estan llenos
    async submit(){
        if (this.form.invalid) {   
            this.form.markAllAsTouched();
            this.snack.open('Revisa los campos marcados','Ok',{duration: 2500});
            return;
        }
        this.loading.set(true)
        let paso: 'usuario' | 'medico' = 'usuario';
        let usuario_id: string | null = null;
        try{
            //Crear usuario
            const correo = this.form.value.correo!;
            const contrasena = this.form.get('contrasena.contrasena1')?.value as string;
            const  userRes = await firstValueFrom(this.api.crearUsuario({
                correo,contrasena,rol:"DOCTOR"
            }));
            usuario_id = (userRes.id)
            if(!usuario_id){
                throw new Error('la api no devolvio la id')
            }
            //Crear Medico
            paso = 'medico'
            const payload: MedicoReq = {
                usuario_id,
                rut_medico: this.form.value.rut_medico!.toUpperCase(),
                nombres: this.form.value.nombres!,
                apellidos: this.form.value.apellidos!,
                celular: this.form.value.celular!,
                fecha_nacimiento: new Date(this.form.value.fecha_nacimiento as string).toISOString().slice(0,10),
                direccion: this.form.value.direccion!,
                especialidad_id: this.form.value.especialidad_id!,
                comuna_id: this.form.value.comuna_id!
            };
            await firstValueFrom(this.api.crearMedico(payload));
            this.snack.open('✅ Médico creado correctamente', 'OK', { duration: 3000 });
            this.form.reset();
            this.router.navigate(['/admin'])
        } catch (e:any){
            const msg = this.humanizeError(e,paso)
            //this.snack.open(`❌ ${e?.message || 'Error al crear médico'}`, 'OK', { duration: 4000 });
            this.snack.open(`❌ ${msg}`, 'OK', { duration: 5000 });
            if (paso === 'medico' && usuario_id) {
                try { await firstValueFrom(this.api.eliminarUsuario(usuario_id)); } catch {}
            }
        } finally {
            this.loading.set(false);
        }
    }

     
}