import {Injectable} from '@angular/core';
import {CreateBrandAccessRequestInput} from '../models/graph-ql.model';
import {BackendService} from './backend.service';

@Injectable({
	providedIn: 'root'
})
export class BrandAccessService {
	constructor(private readonly backendService: BackendService) {}

	async createBrandAccessRequest(accessRequest: CreateBrandAccessRequestInput) {
		const payload = JSON.stringify(accessRequest);
		return await this.backendService.post('', payload);
	}
}
