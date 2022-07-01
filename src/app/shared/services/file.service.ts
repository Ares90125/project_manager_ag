import {Injectable} from '@angular/core';
import Storage from '@aws-amplify/storage';
import {LoggerService} from '@sharedModule/services/logger.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {DateTime} from '@sharedModule/models/date-time';

@Injectable()
export class FileService {
	constructor(private logger: LoggerService, private http: HttpClient) {}
	interval;
	compressedUrl;
	async uploadToS3ToCompress(file, randomUid) {
		let path;
		const currentTimestamp = new DateTime().valueOf();
		path = `imageCompressionSource/${randomUid}_${currentTimestamp}.${file.name.split('.').pop()}`;
		await Storage.put(`${path}`, file, {contentType: `${file.type}`});
		const s3BucketBaseURLForCompressedImages = environment.s3BucketBaseURLForCompressedImages;
		this.compressedUrl = `${s3BucketBaseURLForCompressedImages}${randomUid}_${currentTimestamp}.${file.name
			.split('.')
			.pop()}`;
	}

	async getImage(url) {
		return new Promise<any>(resolve => {
			let countdownForFailure = 30;
			this.interval = setInterval(async () => {
				const requestForCompressedImage = new XMLHttpRequest();
				requestForCompressedImage.open('HEAD', url, false);
				requestForCompressedImage.setRequestHeader('Content-Type', 'image/jpeg');
				requestForCompressedImage.send();
				if (requestForCompressedImage.status === 200) {
					clearInterval(this.interval);
					resolve(url);
				} else {
					countdownForFailure--;
					if (countdownForFailure < 0) {
						clearInterval(this.interval);
						resolve(null);
					}
				}
			}, 1000);
		});
	}

	async downloadBlob(blob, filename) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename || 'download';
		const clickHandler = () => {
			setTimeout(() => {
				URL.revokeObjectURL(url);
				a.removeEventListener('click', clickHandler);
			}, 150);
		};
		a.addEventListener('click', clickHandler, false);
		a.click();
		return a;
	}

	uploadCoverImageToS3(file,type,groupName, includeExtension = false) {
		let path;
		let extension = '';
		if(type==='image') {
			if(file.name) {
				const exten = file.name.split('.');
				extension = exten.length > 1 ? '.' + exten[1] : '.png';
			} else if(includeExtension) {
					extension = '.png';
				}
			path = `CBR/${groupName}${extension}`;
		}
		
		return Storage.put(`${path}`, file, {
			contentType: `${file.type}`
		}).then((data: any) => {
			this.logger.debug('File data stored in s3', {data: data}, 'FileService', 'uploadToS3');
			return Storage.get(data.key)
				.then(result => {
					this.logger.debug('Get stored file data from s3', {data: result}, 'FileService', 'uploadToS3');
					return result.toString().split('?')[0];
				})
				.catch(() => {
					const error = new Error('Error while fetching stored file data from s3');
					this.logger.error(
						error,
						'Error while fetching stored file data from s3',
						{fileKey: data.key},
						'FileService',
						'uploadToS3'
					);
				});
		});
		
	}
		

	uploadToS3(file, type, randomUid, includeExtension = false) {
		let path;
		let extension = '';
		if (type === 'image') {
			if (file.name) {
				const exten = file.name.split('.');
				extension = exten.length > 1 ? '.' + exten[1] : '.png';
			} else if (includeExtension) {
				extension = '.png';
			}
			path = `pics/${randomUid}_${new DateTime().valueOf()}${extension}`;
		} else if (type === 'excel') {
			path = `insightsExcels/${randomUid}_${new DateTime().valueOf()}.xlsx`;
		} else if (type === 'video') {
			if (file.name) {
				const exten = file.name.split('.');
				extension = exten.length > 1 ? '.' + exten[1] : '.mp4';
			} else if (includeExtension) {
				extension = '.mp4';
			}
			path = `video/${randomUid}_${new DateTime().valueOf()}${extension}`;
		} else {
			path = `other/${randomUid}_${new DateTime().valueOf()}`;
		}

		return Storage.put(`${path}`, file, {
			contentType: `${file.type}`
		}).then((data: any) => {
			this.logger.debug('File data stored in s3', {data: data}, 'FileService', 'uploadToS3');
			return Storage.get(data.key)
				.then(result => {
					this.logger.debug('Get stored file data from s3', {data: result}, 'FileService', 'uploadToS3');
					return result.toString().split('?')[0];
				})
				.catch(() => {
					const error = new Error('Error while fetching stored file data from s3');
					this.logger.error(
						error,
						'Error while fetching stored file data from s3',
						{fileKey: data.key},
						'FileService',
						'uploadToS3'
					);
				});
		});
	}

	uploadCampaignReportToS3(file, type, randomUid, key) {
		let path;
		let fileType = 'text/plain';
		if (type === 'campaign' && !key) {
			path = `campaign/${randomUid}_${new DateTime().valueOf()}`;
		} else if (type === 'campaign') {
			path = key;
		}
		return Storage.put(`${path}`, file, {
			contentType: `${fileType}`
		}).then((data: any) => {
			this.logger.debug('File data stored in s3', {data: data}, 'FileService', 'uploadCampaignReportToS3');
			return data.key;
		});
	}

	uploadCBRToS3(file, type, randomUid, key) {
		let path;
		let fileType = 'text/plain';
		if (type === 'CommunityBuildingReport' && !key) {
			path = `CommunityBuildingReport/${randomUid}_${new DateTime().valueOf()}`;
		} else if (type === 'campaign') {
			path = key;
		}
		return Storage.put(`${path}`, file, {
			contentType: `${fileType}`
		}).then((data: any) => {
			this.logger.debug('File data stored in s3', {data: data}, 'FileService', 'uploadCampaignReportToS3');
			return data.key;
		});
	}

	getDataFromS3(key) {
		return Storage.get(key, {level: 'public', download: true}).then((data: any) => {
			this.logger.debug('Get stored file data from s3', {data: data}, 'FileService', 'getDataFromS3');
			return data.Body;
		});
	}
}
