import {Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {BaseComponent} from '@sharedModule/components/base.component';
import {AdminDraftFieldTypeEnum} from '@sharedModule/enums/admin-draft-field-enum';
import {AdminBioService} from '@sharedModule/services/admin-bio.service';
import {debounceTime, takeUntil} from 'rxjs/operators';

@Component({
	selector: 'app-bio-key-achievements',
	templateUrl: './bio-key-achievements.component.html',
	styleUrls: ['./bio-key-achievements.component.scss']
})
export class BioKeyAchievementsComponent extends BaseComponent implements OnInit, OnDestroy {
	@Input() adminBio: any;

	keyAchievementForm: FormGroup;
	achievements: FormArray;
	keyAchievement: any;
	hideAddAchievementBtn = false;
	showError = false;
	interval;
	showSampleKeyAchievement = false;

	constructor(injector: Injector, private readonly formBuilder: FormBuilder, private adminBioService: AdminBioService) {
		super(injector);
	}

	ngOnInit() {
		super._ngOnInit();
		this.buildForm();

		if (this.adminBio?.keyAchievements && this.adminBio?.keyAchievements.length > 0) {
			this.patchForm();
		}
	}

	buildForm() {
		this.keyAchievementForm = this.formBuilder.group({
			achievements: this.formBuilder.array([])
		});

		this.keyAchievementForm
			.get('achievements')
			.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(1000))
			.subscribe(data => {
				this.keyAchievement = data;
				this.keyAchievement.forEach((item, index) => {
					this.keyAchievement[index] = this.keyAchievement[index].trim();
				});
				const finalKeyAchievementData = this.keyAchievement.filter(keyAchiev => keyAchiev);
				if (finalKeyAchievementData.length === 0) {
					this.adminBioService.updatePublishButtonStatus(true);
					this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.KeyAchievements, []);
					return;
				}
				if (!this.keyAchievementForm.dirty) {
					return;
				}
				this.adminBioService.updatePublishButtonStatus(true);

				this.adminBioService.setandUpdateDraftAdminBio(
					AdminDraftFieldTypeEnum.KeyAchievements,
					finalKeyAchievementData
				);
			});
	}

	showSampleKeyAchievementPopup() {
		this.disableScrolling();
		this.showSampleKeyAchievement = true;
	}

	hideSampleKeyAchievementPopup() {
		this.enableScrolling();
		this.showSampleKeyAchievement = false;
	}

	patchForm() {
		this.achievements = this.keyAchievementForm.get('achievements') as FormArray;
		if (!this.keyAchievementForm.dirty) {
			this.adminBio.keyAchievements.map(achive => {
				this.achievements.push(this.formBuilder.control(achive, [Validators.required, Validators.maxLength(120)]));
			});
		}
	}

	createAchievement(): FormControl {
		return this.formBuilder.control('', [Validators.required, Validators.maxLength(120)]);
	}

	addAchievement() {
		this.hideAddAchievementBtn = false;
		this.achievements = this.keyAchievementForm.get('achievements') as FormArray;
		this.achievements.push(this.createAchievement());
		if (this.achievements.length === 5) {
			this.hideAddAchievementBtn = true;
		}

		if (this.keyAchievement && this.achievements.length >= 2) {
			for (let i = 0; i < this.achievements.length; i++) {
				if (this.keyAchievement[i + 1] === '' && this.keyAchievement[i] === '') {
					this.showError = true;
				}
				this.adminBioService.updatePublishButtonStatus(true);
			}
		}
	}

	removeAchievement(index) {
		this.achievements.removeAt(index);
		this.keyAchievement.splice(index, 1);
		if (this.achievements.length < 5) {
			this.hideAddAchievementBtn = false;
		}
		this.adminBioService.setandUpdateDraftAdminBio(AdminDraftFieldTypeEnum.KeyAchievements, this.keyAchievement);
		this.adminBioService.updatePublishButtonStatus(true);
	}

	ngOnDestroy() {
		super._ngOnDestroy();
	}
}
