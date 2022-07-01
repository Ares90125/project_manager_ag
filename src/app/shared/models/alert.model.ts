import {AlertTypeEnum} from 'src/app/shared/enums/alert-type.enum';

export class AlertModel {
	type: AlertTypeEnum;
	title: string;
	message: string;
	autoHide: number;
	keepAfterRouteChange: boolean;
}
