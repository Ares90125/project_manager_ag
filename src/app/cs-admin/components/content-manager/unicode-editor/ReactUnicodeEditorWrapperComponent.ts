import {
	AfterViewInit,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges
} from '@angular/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ReactUnicodeEditor from './ReactUnicodeEditor';
import './unicode-editor.css';

@Component({
	selector: 'app-my-component',
	template: '<div [id]="rootId" class="unicode-editor-block"></div>',
	styleUrls: ['./unicode-editor.css']
})
export class ReactUnicodeEditorWrapperComponent implements OnChanges, AfterViewInit, OnDestroy {
	@Input() value;
	@Input() disabled: boolean;
	@Output() handleChange = new EventEmitter<any>();

	title = 'angularreactapp';
	public rootId = `unicode-editor-wrapper-id-${this.uuid()}`;

	uuid() {
		return Math.floor(Math.random() * 1000000);
	}

	ngOnChanges(changes: SimpleChanges) {
		this.render();
	}

	ngAfterViewInit() {
		this.render();
	}

	ngOnDestroy() {
		ReactDOM.unmountComponentAtNode(document.getElementById(this.rootId));
	}

	private render() {
		let props = {
			value: this.value,
			disabled: this.disabled,
			onChange: value => this.handleChange.emit(value)
		};

		ReactDOM.render(React.createElement(ReactUnicodeEditor, props), document.getElementById(this.rootId));
	}
}
