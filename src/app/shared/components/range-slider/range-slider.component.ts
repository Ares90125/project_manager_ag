import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
	selector: 'app-range-slider',
	templateUrl: './range-slider.component.html',
	styleUrls: ['./range-slider.component.scss']
})
export class RangeSliderComponent implements OnInit {
	@Input() minValueFromInput;
	@Input() maxValueFromInput;
	@Input() maxLimit;
	@Input() minLimit;
	@Input() type;
	@Input() id;
	@Output() rangeValue = new EventEmitter();
	lowerVal;
	upperVal;
	lowerSlider;
	upperSlider;
	constructor() {}
	ngOnInit() {}

	upperSliderChange() {
		const previousUpper = this.upperVal;
		this.lowerSlider = document.querySelector('#lower' + this.id) as HTMLInputElement;
		this.upperSlider = document.querySelector('#upper' + this.id) as HTMLInputElement;
		this.lowerVal = parseInt(this.lowerSlider.value);
		this.upperVal = parseInt(this.upperSlider.value);

		if (this.upperVal < this.lowerVal) {
			this.upperSlider.value = String(previousUpper);
			this.upperVal = String(previousUpper);
		}

		this.rangeValue.emit({min: this.lowerVal, max: this.upperVal});
	}

	lowerSliderChange() {
		const previouslower = this.lowerVal;
		this.lowerSlider = document.querySelector('#lower' + this.id) as HTMLInputElement;
		this.upperSlider = document.querySelector('#upper' + this.id) as HTMLInputElement;
		this.lowerVal = parseInt(this.lowerSlider.value);
		this.upperVal = parseInt(this.upperSlider.value);

		if (this.lowerVal > this.upperVal) {
			this.lowerSlider.value = previouslower;
			this.lowerVal = previouslower;
		}
		this.rangeValue.emit({min: this.lowerVal, max: this.upperVal});
	}
}
