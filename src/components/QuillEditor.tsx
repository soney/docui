import * as Quill from 'quill';
import * as React from "react";
import * as classNames from 'classnames';
import {SDBClient, SDBDoc} from 'sdb-ts';
import {QuillDoc} from '../../types/docTypes';
import * as richText from 'rich-text';
import {DocUIInlineBlot} from '../blots/docuiblot';
import * as _ from 'lodash';

SDBClient.registerType(richText.type);
Quill.register(DocUIInlineBlot);

// let Block = Quill.import('blots/block');
// Block.allowedChildren.push(DocUIBlot);

require('quill/dist/quill.core.css');
require('quill/dist/quill.snow.css');

interface QuillEditorProps {
    name?: string,
    value?: string,
    autoFocus?: boolean,
    className?: string,
    mode?: string,
    options?: any,
    key?:Array<string|number>
};
interface QuillEditorState {
    isFocused: boolean
};

export class QuillEditor extends React.Component<QuillEditorProps, QuillEditorState> {
    private client:SDBClient = new SDBClient(new WebSocket(`ws://${window.location.host}`));
    private doc:SDBDoc<QuillDoc> = this.client.get<QuillDoc>('example', 'quill');
    private codeMirror:CodeMirror.Editor;
    private suppressChange:boolean = false;
    private editorNode:HTMLDivElement;
    private toolbarNode:HTMLDivElement;
    private buttonNode:HTMLButtonElement;
    private quill:Quill;
    private static defaultProps:QuillEditorProps = {
        name: '',
        value: '',
        className: '',
        autoFocus: false,
        key: [],

        options: {
            placeholder: 'write something...',
            theme: 'snow',
            modules: {
                // toolbar: (():HTMLElement => this.toolbarNode
            }
        }
    };
    constructor(props:QuillEditorProps, state:QuillEditorState) {
        super(props, state);
        this.state = {
            isFocused: false
        };
        this.doc.subscribe(this.onRemoteChange);
    };

    private onRemoteChange = (ops:any[], source:any):void => {
        if(this.quill) {
            if (source === this.quill) { return; }
            if(ops) {
                this.quill.updateContents(ops);
            } else {
                this.quill.setContents(this.doc.getData());
            }
        }
    };

    public componentDidMount():void {
        this.quill = new Quill(this.editorNode, _.merge({}, this.props.options, {
            modules: {
                toolbar: this.toolbarNode
            }
        }));
        this.quill.on('text-change', (delta, oldDelta, source) => {
            if (source !== 'user') { return; }
            this.doc.submitOp(delta, this.quill);
        });
        const data = this.doc.getData();
        if(data) {
            this.quill.setContents(data);
        }
    };

    private onButtonClick = ():void => {
        const range = this.quill.getSelection();
        if(range) {
            this.quill.formatText(range.index, range.length, {'docui-inline': 'http://umich.edu/'}, Quill.sources.USER);
        }
    };

    public render():React.ReactNode {
        const editorClassName = classNames(this.props.className);
        return <div>
            <div ref={(ref:HTMLDivElement) => this.toolbarNode = ref } id="toolbar">
                <select className="ql-size">
                    <option value="small"></option>
                    <option selected></option>
                    <option value="large"></option>
                    <option value="huge"></option>
                </select>
                <button className="ql-bold"></button>
                <button className="ql-script" value="sub"></button>
                <button className="ql-script" value="super"></button>
                <button className="" onClick={(e)=>this.onButtonClick()} ref={(ref:HTMLButtonElement)=>this.buttonNode = ref}>x</button>
            </div>
            <div ref={(ref:HTMLDivElement) => this.editorNode = ref } className={editorClassName} />
        </div>
    };
};
