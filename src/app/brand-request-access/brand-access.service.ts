import {Injectable} from '@angular/core';
import {CreateBrandAccessRequestInput} from '@sharedModule/models/graph-ql.model';
import {BackendService} from '@sharedModule/services/backend.service';

@Injectable()
export class BrandAccessService {
	constructor(private readonly backendService: BackendService) {}

	async createBrandAccessRequest(accessRequest: CreateBrandAccessRequestInput) {
		const payload = JSON.stringify(accessRequest);
		return await this.backendService.post('', payload);
	}
}
