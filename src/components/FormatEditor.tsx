import * as React from "react";
import {SDBClient, SDBDoc} from 'sdb-ts';
import * as CodeMirror from 'codemirror';
import * as classNames from 'classnames';
import {CodeDoc, DocUIFormat, FormatDoc} from '../../types/docTypes';
import { CodeEditor } from "./CodeEditor";

require('codemirror/lib/codemirror.css');

interface FormatEditorProps {
    format: DocUIFormat,
    id: number,
    formatsDoc:SDBDoc<FormatDoc>
};

interface FormatEditorState {
    name:string,
    bCode: string,
    dCode: string
};

export class FormatEditor extends React.Component<FormatEditorProps, FormatEditorState> {
    constructor(props:FormatEditorProps, state:FormatEditorState) {
        super(props, state);
        this.state = {
            name: this.props.format.name,
            bCode: this.props.format.backendCode.code,
            dCode: this.props.format.displayCode.code
        };
    };
    public render() {
        return <div>
            <h1>Edit {this.props.format.name} {this.props.id</h1>
            <CodeEditor doc={this.props.formatsDoc} docPath={['formats', this.props.id, 'backendCode', 'code']} options={{mode:'text/typescript-jsx'}} />
            <CodeEditor doc={this.props.formatsDoc} docPath={['formats', this.props.id, 'backendCode', 'code']} options={{mode:'text/typescript-jsx'}} />
        </div>
    };
}