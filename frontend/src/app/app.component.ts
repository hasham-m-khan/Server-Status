import { Component } from '@angular/core';
import { ServersService } from './services/servers.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.sass']
})
export class AppComponent {
	
	isActive = false;
	constructor (private serverService: ServersService) {

	}

	toggleActive () {
		(this.isActive) ? this.isActive = false : this.isActive = true;
	}
}
