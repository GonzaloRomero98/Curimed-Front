import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { BuscarRecepcionistaService, Comuna, RecepcionistaCreate } from "../../../../core/services/buscarRecepcionista.service";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { CommonModule } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatButtonModule } from "@angular/material/button";


function contrasenaIgual(validarContrasena:AbstractControl):ValidationErrors | null{
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
    selector:'app-agregar-recepcionista',
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
    templateUrl:'./agregarRecepcionista.html',
    styleUrl:'./agregarRecepcionista.css',
    standalone:true,
})

export class AgregarRecepcionistaComponent{
    private fb = inject(FormBuilder);
    private api = inject(BuscarRecepcionistaService);
    private snack = inject(MatSnackBar);

    constructor(private router:Router){}

    private humanizarError(err:any , paso:'usuario'|'recepcionista'):string{
        const origen = paso === 'usuario'? 'del usuario': 'del recepcionista'

        if(err instanceof HttpErrorResponse){
            const status = err.status;
            const body = err.error;
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
    comunas = signal<Comuna[]>([]);

    form = this.fb.group({
        correo:['',[Validators.required, Validators.email]],
        contrasena: this.fb.group({
            contrasena1:['',[Validators.required, Validators.minLength(8)]],
            contrasena2:['',[Validators.required, Validators.minLength(8)]],
        },{Validators:contrasenaIgual}),
        rut_recepcionista:['',[Validators.required, validarRut]],
        nombres:['',Validators.required],
        apellidos:['',Validators.required],
        celular:['',Validators.required],
        fecha_nacimiento:['',Validators.required],
        direccion:['',Validators.required],
        comuna_id:[null as unknown as number, Validators.required]
    });

    ngOnInit():void{
        this.cargarOpciones();
    }

    async cargarOpciones(){
        const comuna = await firstValueFrom(this.api.getComunas());
        this.comunas.set(comuna)
    }

    async submit(){
        if(this.form.invalid){
            this.form.markAllAsTouched();
            this.snack.open('Revisar los campos marcados','OK',{duration:2500});
            return;
        }

        this.loading.set(true);
        let paso: 'usuario'| 'recepcionista'= 'usuario';
        let usuario_id: string | null = null;

        try{
            const correo = this.form.value.correo!;
            const contrasena = this.form.get('contrasena.contrasena1')?.value as string;
            const userRes = await firstValueFrom(this.api.crearUsuario({
                correo, contrasena,rol:'RECEPCIONISTA'
            }));

            usuario_id = (userRes.id);
            if(!usuario_id){
                throw new Error('La api no devolvio la ID');
            }

            paso = 'recepcionista';

            const payload:RecepcionistaCreate ={
                usuario_id,
                rut_recepcionista: this.form.value.rut_recepcionista!.toUpperCase(),
                nombres: this.form.value.nombres!,
                apellidos: this.form.value.apellidos!,
                celular: this.form.value.celular!,
                fecha_nacimiento: new Date(this.form.value.fecha_nacimiento as string).toISOString().slice(0,10),
                direccion: this.form.value.direccion!,
                comuna_id: this.form.value.comuna_id!
            };

            await firstValueFrom(this.api.crearRecepcionista(payload));
            this.snack.open('✅ Recepcionista creado correctamente', 'OK', { duration: 3000 });
            this.form.reset();
            this.router.navigate(['/admin']);


        }catch(e:any){
            const msg = this.humanizarError(e,paso);
            this.snack.open(`❌ ${msg}`, 'OK', { duration: 5000 });
            if(paso === 'recepcionista' && usuario_id){

            }
        }finally{
            this.loading.set(false);
        }
    }
}