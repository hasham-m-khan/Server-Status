import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServerStatusComponent } from './server-status/server-status.component';

const routes: Routes = [
  {path: 'server-status', component: ServerStatusComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
