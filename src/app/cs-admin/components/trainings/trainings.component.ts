import {Component, Injector, OnInit} from '@angular/core';
import axios from 'axios';
import {environment} from '../../../../environments/environment';
import {BaseComponent} from '../../../shared/components/base.component';
import {UserService} from '../../../shared/services/user.service';

@Component({
	selector: 'app-trainings',
	templateUrl: './trainings.component.html',
	styleUrls: ['./trainings.component.scss']
})
export class TrainingsComponent extends BaseComponent implements OnInit {
	private trainingsData: UserTraining[];
	canBeSubmitted: boolean;

	constructor(injector: Injector, private readonly userService: UserService) {
		super(injector);
	}

	ngOnInit(): void {
		super._ngOnInit();
		super.setPageTitle('Trainings', 'Trainings');
		this.trainingsData = [];
		this.canBeSubmitted = false;
	}

	uploadFile(e): void {
		if (e.target[0].files.length !== 1) {
			this.alert.error('Error', 'You can upload only 1 file.');
			return;
		}

		const file = e.target[0].files[0];

		if (file.type !== 'text/csv') {
			this.alert.error('Error', 'You can upload only CSV file.');
			return;
		}

		const reader = new FileReader();
		reader.readAsText(file);
		reader.onload = () => {
			const csvData = reader.result;
			const csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

			this.trainingsData = this.getUserTrainings(csvRecordsArray);
			if (this.trainingsData.length > 0) {
				this.canBeSubmitted = true;
			}
		};
	}

	private getUserTrainings(data: string[]): UserTraining[] {
		const result: UserTraining[] = [];
		for (let i = 1; i < data.length; i++) {
			const current = data[i].split(',');
			result.push({
				userId: current[0],
				cmcTrained:
					current[1].toLowerCase() == 'yes' || current[1].toLowerCase() == 'y' || current[1].toLowerCase() == 'true',
				performanceTrained:
					current[2].toLowerCase() == 'yes' || current[2].toLowerCase() == 'y' || current[2].toLowerCase() == 'true'
			});
		}
		return result;
	}

	async onSubmit(): Promise<void> {
		if (!this.canBeSubmitted) {
			return;
		}

		const data = JSON.stringify(this.trainingsData);
		const token = await this.userService.getCurrentSessionJWTToken();
		const result = await axios({
			method: 'post',
			data,
			url: `${environment.restApiUrl}/cmc/updateTrainings`,
			headers: {
				Authorization: token
			}
		}).then(response => response.data);

		this.alert.success('trainings', 'updated');
	}
}

interface UserTraining {
	userId: string;
	cmcTrained: boolean;
	performanceTrained: boolean;
}
