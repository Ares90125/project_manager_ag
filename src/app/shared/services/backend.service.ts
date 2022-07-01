import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {SecuredStorageProviderService} from './secured-storage-provider.service';

@Injectable({providedIn: 'root'})
export class BackendService {
	logApiUrl: string;
	wordCloudUrl: string;
	screenshotUrl: string;
	apiUrl: string;
	restApiUrl: string;

	constructor(private readonly httpClient: HttpClient, private securedStorageProvider: SecuredStorageProviderService) {
		this.wordCloudUrl = environment.wordCloudAPIUrl;
		this.logApiUrl = environment.logApiUrl;
		this.screenshotUrl = environment.postScreenshotUrl;
		this.apiUrl = environment.apiUrl;
		this.restApiUrl = environment.restApiUrl;
	}

	async restGet(url: string, token: string = null): Promise<any> {
		let headers = new HttpHeaders();
		if (!token) {
			const idToken = this.securedStorageProvider.getCookie('CognitoIdToken');
			if (idToken !== null && idToken !== undefined) {
				headers = headers.append('Authorization', idToken);
			}
		} else {
			headers = headers.append('Authorization', token);
		}
		return this.httpClient.get(this.restApiUrl + url, {headers: headers, responseType: 'json'}).toPromise();
	}

	async restPut(url: string, body: any, token: string = null): Promise<any> {
		let headers = new HttpHeaders();
		if (!token) {
			const idToken = this.securedStorageProvider.getCookie('CognitoIdToken');
			if (idToken !== null && idToken !== undefined) {
				headers = headers.append('Authorization', idToken);
			}
		} else {
			headers = headers.append('Authorization', token);
		}
		return this.httpClient.put(this.restApiUrl + url, body, {headers: headers, responseType: 'json'}).toPromise();
	}

	async restPost(url: string, body: any, token = null): Promise<any> {
		let headers = new HttpHeaders();
		if (!token) {
			const idToken = this.securedStorageProvider.getCookie('CognitoIdToken');
			if (idToken !== null && idToken !== undefined) {
				headers = headers.append('Authorization', idToken);
			}
		} else {
			headers = headers.append('Authorization', token);
		}
		return this.httpClient.post(this.restApiUrl + url, body, {headers, responseType: 'json'}).toPromise();
	}

	async restPatch(url: string, body: any, token = null): Promise<any> {
		let headers = new HttpHeaders();
		if (!token) {
			const idToken = this.securedStorageProvider.getCookie('CognitoIdToken');
			if (idToken !== null && idToken !== undefined) {
				headers = headers.append('Authorization', idToken);
			}
		} else {
			headers = headers.append('Authorization', token);
		}
		return this.httpClient.patch(this.restApiUrl + url, body, {headers, responseType: 'json'}).toPromise();
	}

	async get(url: string): Promise<any> {
		return this.httpClient.get(this.apiUrl + url, {responseType: 'json'}).toPromise();
	}

	async delete(url: string): Promise<any> {
		return this.httpClient.delete(this.apiUrl + url, {responseType: 'json'}).toPromise();
	}

	async post(url: string, body: any, token = null): Promise<any> {
		let headers = new HttpHeaders();
		if (!token) {
			const idToken = this.securedStorageProvider.getCookie('CognitoIdToken');
			headers = headers.append('Authorization', idToken);
		} else {
			headers = headers.append('Authorization', token);
		}
		return this.httpClient.post(this.apiUrl + url, body, {responseType: 'json'}).toPromise();
	}

	async postWordCloudData(url: string, body: any): Promise<any> {
		return this.httpClient.post(this.wordCloudUrl + url, body, {responseType: 'text'}).toPromise();
	}

	async postLogsToAPI(body: any): Promise<any> {
		return this.httpClient.post(this.logApiUrl, body, {responseType: 'json'}).toPromise();
	}

	async postScreenshotUrl(url: string, body: any, token = null): Promise<any> {
		let headers = new HttpHeaders();
		if (!token) {
			const idToken = this.securedStorageProvider.getCookie('CognitoIdToken');
			headers = headers.append('Authorization', idToken);
		} else {
			headers = headers.append('Authorization', token);
		}
		return this.httpClient.post(this.screenshotUrl + url, body, {headers: headers, responseType: 'json'}).toPromise();
	}

	async httpGet(url: string): Promise<any> {
		return this.httpClient.get(url, {responseType: 'json'}).toPromise();
	}

	async httpGetBlob(url: string): Promise<any> {
		return this.httpClient.get(url, {responseType: 'blob'}).toPromise();
	}
}

