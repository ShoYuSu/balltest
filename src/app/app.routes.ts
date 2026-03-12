import { Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home';

export const routes: Routes = [

  { path: '', redirectTo: '/home', pathMatch: 'full' }, // หน้าแรกดึงไปที่ /home
  { path: 'home', component: HomeComponent },
  // { path: 'menu', component: MenuComponent },

  // Best Practice: ควรมีหน้า 404 เสมอกันคนพิมพ์ URL มั่ว+-
  // { path: '**', component: NotFoundComponent }

];
