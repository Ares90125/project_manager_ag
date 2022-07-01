import {
	Component,
	ElementRef,
	EventEmitter,
	Injector,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {FileService} from '@sharedModule/services/file.service';

export interface IUpdatedPhaseIdeaValues {
	content: string;
	supportingText?: string;
	visibleToBrand: Boolean;
}

@Component({
	selector: 'app-phase-idea',
	templateUrl: './phase-idea.component.html',
	styleUrls: ['./phase-idea.component.scss']
})
export class PhaseIdeaComponent extends BaseComponent implements OnInit, OnChanges {
	@Input()
	content: string;
	@Input()
	supportingText: string;

	@Input()
	isBrandLoggedIn = true;
	@Input()
	visibleToBrand = false;

	@Output()
	updatedValue = new EventEmitter<IUpdatedPhaseIdeaValues>();

	@ViewChild('phaseIdeaFile') phaseIdeaQuillFileRef: ElementRef;

	editingSupportingText = false;
	editingContent = false;

	form: FormGroup;
	contentPopupControl: FormControl;

	baseQuillConfig = {
		toolbar: {
			container: ['bold', 'italic', 'link', 'image', 'video', {list: 'ordered'}, {list: 'bullet'}]
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
		this.createForm(this.content, this.supportingText, this.visibleToBrand);
	}

	ngOnChanges(change: SimpleChanges) {
		if (this.isBrandLoggedIn || change?.isBrandLoggedIn?.currentValue) {
			return;
		}
		if (change.content && change.content.currentValue !== change.content.previousValue) {
			this.updateForm(change.content.currentValue, this.supportingText, this.visibleToBrand);
		}

		if (change.supportingText && change.supportingText.currentValue !== change.supportingText.previousValue) {
			this.updateForm(this.content, change.supportingText.currentValue, this.visibleToBrand);
		}

		if (change.visibleToBrand && change.visibleToBrand.currentValue !== change.visibleToBrand.previousValue) {
			this.updateForm(this.content, this.supportingText, change.visibleToBrand.currentValue);
		}
	}

	PhaseIdeaImageUpload(image: any) {
		const element = this.phaseIdeaQuillFileRef.nativeElement as HTMLInputElement;
		element.value = null;
		element.accept = '.jpeg,.png,.webp';

		element.click();
	}

	onPhaseIdeaEditorCreation(editorInstance: any) {
		this.phaseIdeaQuillRef = editorInstance;
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

	createForm(initialData: string, supportingText: string, visibleToBrand: boolean) {
		this.form = this.formBuilder.group({
			content: [initialData],
			supportingText: [supportingText || ''],
			visibleToBrand: [visibleToBrand]
		});
		this.contentPopupControl = this.formBuilder.control(initialData);
		this.form.controls['visibleToBrand'].valueChanges.subscribe(newValue => {
			setTimeout(() => this.emitUpdatedDataToParent());
		});
	}

	updateForm(initialData: string, supportingText: string, visibleToBrand: boolean) {
		if (!this.form) {
			return this.createForm(initialData, supportingText, visibleToBrand);
		}
		this.form.controls['content'].setValue(initialData);
		this.form.controls['supportingText'].setValue(supportingText);
		this.form.controls['visibleToBrand'].setValue(visibleToBrand);
	}

	onSubmittingSuportingText() {
		this.editingSupportingText = false;
		this.supportingText = this.form.value.supportingText;
		this.emitUpdatedDataToParent();
	}

	saveUpdatedDetails() {
		this.form.controls['content'].setValue(this.contentPopupControl.value);
		this.emitUpdatedDataToParent();
	}

	emitUpdatedDataToParent() {
		this.updatedValue.emit(this.form.value);
	}

	cancelContentEdit() {
		this.contentPopupControl.setValue(this.form.controls['content'].value);
	}

	resetForm() {
		this.form.reset({content: this.content, supportingText: this.supportingText || ''});
		this.editingSupportingText = false;
	}

	private async processFilesForUrls(file: any) {
		return await Promise.all([this.fileService.uploadToS3(file, 'image', this.randomUuid())]);
	}
}
