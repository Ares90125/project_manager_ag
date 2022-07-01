import * as React from 'react';
import {useRef, useState} from 'react';
import UnicodeEditor, {EditorState} from 'react-unicode-editor';

import FormatButtons from './components/FormatButtons';
import EmojiComponent from './components/EmojiComponent';
import './unicode-editor.css';

const ReactUnicodeEditor = ({value, onChange, disabled = false}) => {
	// const [editorValue, setEditorValue] = useState<EditorState>([value]);
	const editorRef = useRef<UnicodeEditor>(null);

	const handleEmojiClick = (text: string) => {
		if (editorRef.current) editorRef.current.addText(text);
	};

	const handleFormatClick = (format: string) => {
		if (editorRef.current) editorRef.current.format(format);
	};

	const handleEditorChange = (newState: EditorState) => {
		// setEditorValue(newState);
		onChange(newState);
	};

	const editorStyles: React.CSSProperties = {
		height: 256,
		borderRadius: 8,
		backgroundColor: 'white',
		borderColor: '#d6d6dc',
		outlineColor: '#d6d6dc',
		opacity: disabled ? '90%' : undefined,
		marginBottom: 2,
		overflowY: 'auto'
	};

	const css = `
    .unicode-editor-actions {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
    }
  `;

	return (
		<>
			<style>{css}</style>
			<UnicodeEditor
				onChange={handleEditorChange}
				// startValue={editorValue}
				startValue={[value]}
				disableContextMenu={false}
				ref={editorRef}
				style={editorStyles}
				disabled={disabled}
				debounce={false}
				// debounceInterval={0}
				className="unicode-editor"
			/>

			<div className="unicode-editor-actions">
				<FormatButtons onFormatClick={handleFormatClick} />
				<EmojiComponent insertText={handleEmojiClick} />
			</div>
		</>
	);
};

export default ReactUnicodeEditor;
