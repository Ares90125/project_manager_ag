import {Component, OnInit, Injector} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FormBuilder, FormArray, FormGroup, Validators, FormControl} from '@angular/forms';
import {WhatsAppCampaignsService} from 'src/app/cs-admin/services/whatsApp-campaigns.service';
import {WhatsAppCSVParserService} from '@csAdminModule/services/whatsapp-csv-parser';

@Component({
	selector: 'app-whats-app-campaigns',
	templateUrl: './whatsApp-campaigns.component.html',
	styleUrls: ['./whatsApp-campaigns.component.scss']
})
export class WhatsAppComponent extends BaseComponent implements OnInit {
	private defaultNumberOfForms = 3;
	private defaultNumberOfValues = 1;
	private maxFileSize = 3e6;
	createCampaignsForm: FormGroup;
	showError = false;
	creationInProgress = false;

	constructor(
		injector: Injector,
		private readonly formBuilder: FormBuilder,
		private readonly whatsAppService: WhatsAppCampaignsService,
		private readonly whatsAppCSVParser: WhatsAppCSVParserService
	) {
		super(injector);
	}

	async ngOnInit(): Promise<void> {
		super._ngOnInit();
		super.setPageTitle('WhatsApp campaigns', 'WhatsApp campaigns');
		this.buildForm();
	}

	get data(): FormArray {
		return this.createCampaignsForm.get('data') as FormArray;
	}

	buildForm() {
		this.createCampaignsForm = this.formBuilder.group({
			data: this.formBuilder.array(Array.from({length: this.defaultNumberOfForms}, () => this.newCampaign()))
		});
	}

	newCampaign(userId = '', hsmTemplate = '', customerId = '', valuesArr: FormControl[] = []): FormGroup {
		if (valuesArr.length === 0) {
			valuesArr = Array.from({length: this.defaultNumberOfValues}, () =>
				this.formBuilder.control('', [Validators.required])
			);
		}

		return this.formBuilder.group({
			userId: [userId, [Validators.required]],
			hsmTemplate: [hsmTemplate, [Validators.required, Validators.pattern(/^\d+$/)]],
			customerId: [customerId, [Validators.required, Validators.pattern(/^\d+$/)]],
			valuesArr: this.formBuilder.array(valuesArr)
		});
	}

	addCampaign(): void {
		this.data.push(this.newCampaign());
	}

	removeCampaign(index: number): void {
		this.data.removeAt(+index);
	}

	getValues(index: number): FormArray {
		return this.createCampaignsForm.get('data').get(String(index)).get('valuesArr') as FormArray;
	}

	addValue(index: number): void {
		this.getValues(index).push(this.formBuilder.control('', [Validators.required]));
	}

	removeValue(campaignIndex: number, valueIndex: number): void {
		this.getValues(campaignIndex).removeAt(valueIndex);
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

		if (file.size > this.maxFileSize) {
			this.alert.error('Error', 'Maximum size is 3 mb.');
			return;
		}

		const reader = new FileReader();
		reader.readAsText(file);
		reader.onload = () => {
			const csvData = reader.result;
			const csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
			const headersRow = this.whatsAppCSVParser.getHeaderArray(csvRecordsArray);
			const records = this.whatsAppCSVParser.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);

			this.createCampaignsForm = this.formBuilder.group({
				data: this.formBuilder.array(
					records.map(record => {
						return this.newCampaign(record.userId, record.hsmTemplate, record.customerId, record.values);
					})
				)
			});
		};
	}

	async onSubmit(): Promise<void> {
		if (!this.createCampaignsForm.valid) {
			this.showError = true;
			return;
		}
		this.showError = false;

		try {
			const formData = JSON.stringify(this.createCampaignsForm.getRawValue());
			this.creationInProgress = true;
			await this.whatsAppService.createCampaigns(formData);
			this.creationInProgress = false;
			this.alert.success('Campaigns created successfully', 'Success', 10000);
		} catch (e) {
			this.creationInProgress = false;
			this.alert.error('Campaign creation unsuccessful', e && e.errors[0].message);
		}
	}
}
