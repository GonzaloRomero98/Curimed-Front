import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { HomeComponent } from './features/home/home';
import { Administrador } from './features/administrador/administrador';
import { roleGuard } from './guards/role-guard';
import { ListaMedicos } from './features/administrador/medicos/listaMedicos/listaMedicos';
import { AgregarMedicoComponent } from './features/administrador/medicos/agregarMedico/agregarMedico';
import { AgregarPacienteComponent } from './features/administrador/paciente/agregarPaciente/agregarPaciente';
import { ListaPacienteComponent } from './features/administrador/paciente/listarPacientes/listaPacinete';
import { ReservasComponent } from './features/reservas/recepcionista/reservas';
import { ReservasPacienteComponent } from './features/reservas/paciente/reservaPaciente';
import { Registro } from './features/auth/pages/registro/registro';
import { AgregarRecepcionistaComponent } from './features/administrador/recepcionista/agregarRecepcionista/agregarRecepcionista';
import { ListaRecepcionistas } from './features/administrador/recepcionista/listarRecepcionistas/listarRecepcionista';

export const routes: Routes = [
    {path:'', component: HomeComponent},
    {path: 'login', component: Login},
    {path:'registro', component: Registro},
    {
        path:'admin', 
        component: Administrador, 
        canActivate:[roleGuard],
        data:{roles:['ADMIN']},
        children:[
            {path:'medicos',component: ListaMedicos},
            {path:'medicos/agregar', component:AgregarMedicoComponent},
            {path:'pacientes',component: ListaPacienteComponent},
            {path:'pacientes/agregar', component:AgregarPacienteComponent},
            {path:'recepcionista', component:ListaRecepcionistas},
            {path:'recepcionista/agregar', component:AgregarRecepcionistaComponent}
        ]
    },
    {
        path:'reservaHora',
        component: ReservasPacienteComponent,
        canActivate:[roleGuard],
        data:{roles:['PACIENTE']}
    },
    {
        path:'reservaHoraRecep',
        component:ReservasComponent,
        canActivate:[roleGuard],
        data:{roles:['RECEPCIONISTA']}
    },

        
];
