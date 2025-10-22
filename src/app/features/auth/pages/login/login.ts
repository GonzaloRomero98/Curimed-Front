import { Component, OnInit } from "@angular/core";
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { Router,ActivatedRoute } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { LoginService } from "../../../../core/services/login.service";
import { MatSnackBar } from "@angular/material/snack-bar";



interface loginForm{
    correo: FormControl<string>;
    contrasena: FormControl<string>;
    remember: FormControl<boolean>;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    standalone: true,
    styleUrl: './login.css',
    imports: [MatButtonModule, 
        MatCardModule, 
        MatFormFieldModule, 
        MatInputModule, 
        MatIconModule, 
        MatCheckboxModule, 
        MatProgressBarModule, 
        CommonModule,
        ReactiveFormsModule,
    ],
})

export class Login {
    loading = false;
    showPass=false;

    form:FormGroup;

    constructor(
        private router: Router,
        private route : ActivatedRoute,
        private formBuilder:FormBuilder,
        private loginService: LoginService,
        private snackBar: MatSnackBar,
    ){
        this.form = this.formBuilder.group({
            correo:['',[Validators.required,Validators.email]],
            contrasena: ['',[Validators.required]],
            remember:true,
        })
    }


    onSubmit():void{
        if(this.form.invalid)return;
        const {correo,contrasena,remember} = this.form.getRawValue();
        this.loading = true;
        this.loginService.login({correo, contrasena}).subscribe({
            next:(res)=>{
                const rol = this.loginService.setSesion(res.access_token, res.datosUsuario);
                const redirect = this.route.snapshot.queryParamMap.get('redirect');
                const destino =
                    redirect ||
                    (rol === 'ADMIN' ? '/admin'
                    : rol === 'MEDICO' ? '/medico'
                    : '/');

                
                if(remember){
                    localStorage.setItem('correo',correo);
                }else{
                    localStorage.removeItem('correo');
                }
                this.snackBar.open('!Bienvendio!', 'OK',{duration:2000});

                this.router.navigateByUrl(destino);
            },
            error:(err)=>{
                const msg = err?.error?.message || 'Credenciales Invalidas'
                this.loading =false;
                this.snackBar.open(msg, 'cerrar',{duration:3000});
            },
            complete:()=>(this.loading = false)
        })

    }

    
    getRol():string | null{
        const token = localStorage.getItem('')
        return null;
    }

    menu(){
        this.router.navigate(['/']);
    }
}