import React from 'react';
import Picker from 'emoji-picker-react';
import {Dropdown} from 'react-bootstrap';
import '../unicode-editor.css';

interface props {
	insertText: Function;
}

const EmojiComponent = ({insertText}: props) => {
	const onEmojiClick = (event: any, emojiObject: any) => {
		event.preventDefault();
		insertText(emojiObject.emoji);
	};

	const css = `
        .unicode-dropdown-menu {
            top: -260px;
            transform: none !important;
            inset: -260px auto auto 0px !important;
            max-height: 340px;
            overflow-y: auto;
        }
        #
    `;

	return (
		<>
			<style>{css}</style>
			<Dropdown>
				<Dropdown.Toggle
					variant="outline-warning"
					id="emoji-dropdown"
					onMouseDown={e => {
						e.stopPropagation();
						e.preventDefault();
					}}>
					😀
				</Dropdown.Toggle>

				<Dropdown.Menu className="unicode-dropdown-menu">
					<Picker onEmojiClick={onEmojiClick} disableAutoFocus native />
				</Dropdown.Menu>
			</Dropdown>
		</>
	);
};

export default EmojiComponent;
