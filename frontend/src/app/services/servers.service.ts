import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ServerMessage } from '../models/ServerResponse';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ServersService {

	URL: string = 'http://localhost:3000/api';
	constructor(private http: HttpClient) { }

	getServerResponses (): Observable<ServerMessage[]> {
		return this.http.get<ServerMessage[]>(`${this.URL}/serverlist/getstatus`);
	}

}
