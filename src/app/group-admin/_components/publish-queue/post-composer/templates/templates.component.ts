import {Component, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {BaseComponent} from '@sharedModule/components/base.component';
import {TemplatesModel} from '@groupAdminModule/models/templates.model';
import templates from './templates-data.json';

@Component({
	selector: 'app-templates',
	templateUrl: './templates.component.html',
	styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent extends BaseComponent implements OnInit, OnDestroy {
	showTemplates = true;
	selectedTemplate: TemplatesModel;
	templates: TemplatesModel[];
	@Output() templateUpdate = new EventEmitter<any>();
	@Output() templateModalShow = new EventEmitter<any>();
	constructor(injector: Injector) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.templates = templates;
		this.showTemplates = true;
	}

	triggerPostUpdate() {
		let previewImage = [];
		if (this.selectedTemplate.images) {
			this.selectedTemplate.images.forEach(image => {
				previewImage.push({src: image, type: 'image'});
			});
		}
		if (this.selectedTemplate.videos) {
			this.selectedTemplate.videos.forEach(video => {
				previewImage.push({src: video, type: 'image'});
			});
		}
		this.templateUpdate.emit({
			postMessage: this.selectedTemplate.text,
			previewImage: previewImage,
			imageFiles: this.selectedTemplate.images,
			videoFiles: this.selectedTemplate.videos
		});
		this.templateModalShow.emit(false);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
