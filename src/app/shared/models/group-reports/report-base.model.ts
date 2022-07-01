import {ReportDataOutputModel} from './report-data.model';

export class ReportBase {
	reportData: ReportDataOutputModel;
	isEmpty = true;

	constructor(reportData: ReportDataOutputModel) {
		this.reportData = reportData;
	}
}
