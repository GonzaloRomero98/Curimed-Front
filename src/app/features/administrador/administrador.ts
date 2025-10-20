import { Component } from "@angular/core";
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgIf } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';


@Component({
    selector: 'app-administrador',
    imports:[MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatExpansionModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './administrador.html',
    styleUrl: './administrador.css',
    standalone: true,
})

export class Administrador{
    constructor(private router: Router){}

    onLogout(event?:MouseEvent){
        event?.preventDefault();
        localStorage.removeItem('tokenusuario');
        localStorage.removeItem('usuario');
        this.router.navigate(['/'])
    }
  
}