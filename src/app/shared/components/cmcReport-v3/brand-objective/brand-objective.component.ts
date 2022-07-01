import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FileService} from '@sharedModule/services/file.service';

@Component({
	selector: 'app-brand-objective',
	templateUrl: './brand-objective.component.html',
	styleUrls: ['./brand-objective.component.scss']
})
export class BrandObjectiveComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input()
	content: string;
	@Input()
	supportingText: string;

	@Input()
	isBrandLoggedIn = true;

	@Output()
	updatedValue = new EventEmitter<string>();

	@ViewChild('brandObjectiveFile') phaseIdeaQuillFileRef: ElementRef;

	editingSupportingText = false;
	editingContent = false;

	form: FormControl;
	contentPopupControl: FormControl;

	baseQuillConfig = {
		toolbar: {
			container: [['bold'], ['italic'], [{list: 'ordered'}], [{list: 'bullet'}], ['link', 'image', 'video']]
		}
	};

	phaseIdeaQuillConfig = {
		toolbar: {
			...this.baseQuillConfig.toolbar,
			handlers: {
				image: image => {
					this.PhaseIdeaImageUpload(image);
				}
			}
		}
	};
	phaseIdeaQuillRef: any;
	isPhaseIdeaImageLoading = false;
	isFormFirstTimeSubmitted = false;

	constructor(injector: Injector, private readonly fileService: FileService, private formBuilder: FormBuilder) {
		super(injector);
	}

	ngOnInit(): void {
		if (this.isBrandLoggedIn) {
			return;
		}
		this.createForm(this.content);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}

	PhaseIdeaImageUpload(image: any) {
		const element = this.phaseIdeaQuillFileRef.nativeElement as HTMLInputElement;
		element.value = null;
		element.setAttribute('accept', 'image/*');
		element.click();

		// element.onchange = async (event: Event) => {
		// 	const file = element.files[0];
		// 	console.log(event);
		// 	if (!file.type.includes('image')) {
		// 		element.value = null;
		// 		console.log('file not accepted');
		// 		event.stopPropagation();
		// 		event.preventDefault();
		// 		event.stopImmediatePropagation();
		// 	}
		// 	console.log(file);
		// };
	}

	createForm(intialContent: string) {
		this.form = this.formBuilder.control(`${intialContent}`);
		this.contentPopupControl = this.formBuilder.control(intialContent);
	}

	saveUpdatedDetails() {
		this.form.setValue(this.contentPopupControl.value);
		this.updatedValue.emit(this.form.value);
	}

	cancelContentEdit() {
		this.contentPopupControl.setValue(this.form.value);
	}

	async onSelectingImageInPhaseIdea(ev: any) {
		this.isPhaseIdeaImageLoading = true;
		const img = await this.processQuillImage((<HTMLInputElement>ev.target).files[0]);
		const range = this.phaseIdeaQuillRef.getSelection();
		this.phaseIdeaQuillRef.clipboard.dangerouslyPasteHTML(range.index, img);
		this.contentPopupControl.setValue(this.phaseIdeaQuillRef.root.innerHTML);
		this.isPhaseIdeaImageLoading = false;
	}

	async processQuillImage(file: File) {
		const processedFileURLs = file ? await Promise.all([this.processFilesForUrls(file)]) : null;
		const s3ImageUrl = processedFileURLs[0][0];
		const image = await this.fileService.getImage(s3ImageUrl);
		return '<img class="img-within" src="' + image + '"></img>';
	}

	onPhaseIdeaEditorCreation(editorInstance: any) {
		this.phaseIdeaQuillRef = editorInstance;
	}

	private async processFilesForUrls(file: any) {
		return await Promise.all([this.fileService.uploadToS3(file, 'image', this.randomUuid())]);
	}
}
