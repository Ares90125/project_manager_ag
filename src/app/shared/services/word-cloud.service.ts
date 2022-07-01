import {Injectable} from '@angular/core';
import {BackendService} from './backend.service';
import {LoggerService} from './logger.service';

@Injectable({
	providedIn: 'root'
})
export class WordCloudService {
	constructor(private readonly backendService: BackendService, private readonly loggerService: LoggerService) {}

	public async getWordCloudData(data) {
		try {
			const response = await this.backendService.postWordCloudData('/wordcloud/generate', {frequencyTable: data});
			return 'data:image/png;base64,' + response;
		} catch (e) {
			const error = new Error(`${e.message} error in post call to word cloud api`);
			this.loggerService.error(error, 'Post call to word cloud api failed', {}, 'WordCloudService', 'getWordCloudData');
			return null;
		}
	}
}
