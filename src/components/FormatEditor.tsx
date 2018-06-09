import * as React from "react";
import {SDBClient, SDBDoc} from 'sdb-ts';
import * as CodeMirror from 'codemirror';
import * as classNames from 'classnames';
import {CodeDoc, DocUIFormat, FormatDoc} from '../../types/docTypes';
import { CodeEditor } from "./CodeEditor";

import 'codemirror/lib/codemirror.css';

interface FormatEditorProps {
    format: DocUIFormat,
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
        return <div className="row">
            {/* <h1>Edit {this.props.format.name} {this.props.id}</h1> */}
            <div className="col">
                <h2>Backend</h2>
                <CodeEditor doc={this.props.formatsDoc} docPath={['formats', this.props.format.id, 'backendCode', 'code']} options={{mode:'text/typescript-jsx'}} />
            </div>
            <div className="col">
                <h2>Display</h2>
                <CodeEditor doc={this.props.formatsDoc} docPath={['formats', this.props.format.id, 'displayCode', 'code']} options={{mode:'text/typescript-jsx'}} />
            </div>
        </div>
    };
}