import {Injectable} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {CSVRecord} from '@csAdminModule/models/whatsapp-csv-record.model';

@Injectable()
export class WhatsAppCSVParserService {
	constructor(private readonly formBuilder: FormBuilder) {}

	normalizeValueFromCSV(value: string): string {
		return value.trim().replace(/(^"|"$)/g, '');
	}

	getHeaderArray(csvRecordsArr: string[]): string[] {
		const headers = csvRecordsArr[0].split(',');

		return headers;
	}

	getDataRecordsArrayFromCSVFile(csvRecordsArray: string[], headerLength: number): CSVRecord[] {
		const csvArr = [];

		for (let i = 1; i < csvRecordsArray.length; i++) {
			const currentRecord = csvRecordsArray[i].split(',');

			if (currentRecord.length === headerLength) {
				const csvRecord: CSVRecord = new CSVRecord();
				const [userId, hsmTemplate, customerId, ...values] = currentRecord;

				csvRecord.userId = this.normalizeValueFromCSV(userId);
				csvRecord.hsmTemplate = this.normalizeValueFromCSV(hsmTemplate);
				csvRecord.customerId = this.normalizeValueFromCSV(customerId);
				csvRecord.values = values.map(value =>
					this.formBuilder.control(this.normalizeValueFromCSV(value), [Validators.required])
				);
				csvArr.push(csvRecord);
			}
		}

		return csvArr;
	}
}
