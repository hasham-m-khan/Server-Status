import { Component, OnInit } from '@angular/core';
import { ServersService } from '../services/servers.service';
import { ServerMessage, Protocol, JA_Gametype, JO_Gametype, Filters } from '../models/ServerResponse';

@Component({
	selector: 'app-server-status',
	templateUrl: './server-status.component.html',
	styleUrls: ['./server-status.component.sass']
})
export class ServerStatusComponent implements OnInit {

	serverResponses: ServerMessage[] = [];
	protocol = Protocol;
	jagametype = JA_Gametype;
	jogametype = JO_Gametype;
	filters = Filters;
	order: boolean = true;
	isDesc: boolean = true;


	constructor(private serverService: ServersService) {
	}
	
	ngOnInit(): void {
		this.serverService.getServerResponses()
		.subscribe(data => this.serverResponses = data);
	}

	sortData(sortKey: string, isNumber: boolean) {
		if (isNumber) {
			console.log(this.order);
			let newArr = [];
			if (this.order) {
				newArr = this.serverResponses.sort((a, b): number => 
					(+a[sortKey] as number) - (+b[sortKey] as number));
			} else {
				newArr = this.serverResponses.sort((a, b): number => 
				(+b[sortKey] as number) - (+a[sortKey] as number));
			}
			this.serverResponses = newArr;
			this.order = !this.order;
			console.log(this.order);
		} else {
			this.isDesc = !this.isDesc;
			let direction = this.isDesc ? 1 : -1;
			this.serverResponses.sort((a, b) => {
				if (a[sortKey] < b[sortKey]) {
					return -1 * direction;
				} else if (a[sortKey] > b[sortKey]) {
					return 1 * direction;
				} else {
					return 0;
				}
			});
		}
		
	}

}
