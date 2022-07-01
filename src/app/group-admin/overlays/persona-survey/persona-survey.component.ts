import {Component, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {UserModel} from '@sharedModule/models/user.model';
import {UserService} from '@sharedModule/services/user.service';
import {BaseComponent} from '@sharedModule/components/base.component';
import {DateTime} from '@sharedModule/models/date-time';

@Component({
	selector: 'app-persona-survey',
	templateUrl: './persona-survey.component.html',
	styleUrls: ['./persona-survey.component.scss']
})
export class PersonaSurveyComponent extends BaseComponent implements OnInit, OnDestroy {
	user: UserModel;
	isPersonaFilled = false;
	@Output() closePersonaSurvey = new EventEmitter<boolean>();
	isSubmitClicked = false;

	personaQuestions = [
		{'What drives you to run your Facebook Group?': ''},
		{'Do you have a fixed source of income?': ''},
		{'Are you open to running paid campaigns on your Group?': ''}
	];

	constructor(private userService: UserService, private injector: Injector) {
		super(injector);
	}

	async ngOnInit() {
		super._ngOnInit();
		this.user = await this.userService.getUser();
	}

	ngOnDestroy(): void {
		super._ngOnDestroy();
	}

	personaAnswer(event, questionNumber) {
		this.personaQuestions[questionNumber][`${Object.keys(this.personaQuestions[questionNumber])}`] = event.value;
		this.checkForEnableSubmitButton();
	}

	async submitPersona(element) {
		await this.recordButtonClick(element);
		try {
			const personaAnswer = this.personaQuestions.map(persona => Object.values(persona));
			this.isSubmitClicked = true;
			this.user['personaSurvey'] = await JSON.stringify({
				questions: this.personaQuestions,
				timestamp: new DateTime().toISOString()
			});

			this.logger.setUserProperty(this.user.id, {
				drive_for_fb_group: personaAnswer[0][0],
				fixed_income_source: personaAnswer[1][0],
				open_to_paid_campaign: personaAnswer[2][0]
			});

			await this.userService.setUserPersonaDetail(this.user);
			this.closePersonaSurvey.emit(false);
		} catch (e) {
			this.isSubmitClicked = false;
			this.alert.error('Persona survey not updated successfully', 'Please try again after some time', 5000, true);
			this.closePersonaSurvey.emit(false);
		}
	}

	async checkForEnableSubmitButton() {
		let isAllValueFilled = true;
		await this.personaQuestions.map(personaQue => {
			if (!Object.values(personaQue)[0]) {
				isAllValueFilled = false;
			}
		});

		if (isAllValueFilled) {
			this.isPersonaFilled = true;
		}
	}

	async closePersona(element) {
		await this.recordButtonClick(element);
		await this.closePersonaSurvey.emit(false);
	}
}
