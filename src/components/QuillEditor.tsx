import * as Quill from 'quill';
import * as React from "react";
import * as classNames from 'classnames';
import {SDBClient, SDBDoc} from 'sdb-ts';
import {QuillDoc, FormatDoc, DocUIFormat} from '../../types/docTypes';
import * as richText from 'rich-text';
import {DocUIInlineBlot} from '../blots/DocUIInlineBlot';
import {merge, size, map} from 'lodash';
import {FormatEditor} from './FormatEditor';

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
    isFocused: boolean,
    formats:{[formatId:string]: DocUIFormat},
    editingFormat:DocUIFormat
};

export class QuillEditor extends React.Component<QuillEditorProps, QuillEditorState> {
    private client:SDBClient = new SDBClient(new WebSocket(`ws://${window.location.host}`));
    private doc:SDBDoc<QuillDoc> = this.client.get<QuillDoc>('docs', 'example');
    private formatsDoc:SDBDoc<FormatDoc> = this.client.get<FormatDoc>('docui', 'formats');
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
            isFocused: false,
            formats: {},
            editingFormat: null
        };
        this.doc.subscribe(this.onRemoteChange);
        this.formatsDoc.subscribe(this.onFormatsChange);
        DocUIInlineBlot.setFormatsDoc(this.formatsDoc);
    };

    private onFormatsChange = (type:string, ops:any[], source:any):void => {
        const {formats} = this.formatsDoc.getData();
        this.setState({formats});
    };

    private onRemoteChange = (type:string, ops:any[], source:any):void => {
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
        this.quill = new Quill(this.editorNode, merge({}, this.props.options, {
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

    private createFormat():void {
        const {formats} = this.formatsDoc.getData();
        const formatsSize = size(formats);
        const formatId = `F-${formatsSize}`;
        this.formatsDoc.submitObjectInsertOp(['formats', formatId], {
            formatId,
            name: `F${formatsSize}`,
            backendCode: {
                code:
`import {InlineBlotBackend, InlineBlotInterface} from './InlineBlot';

export default class WidgetBackend implements InlineBlotInterface {
    private abc:number = 0;
    public constructor(private backend:InlineBlotBackend) {
    };

    public onAdded():void {
        this.interval = setInterval(() => {
            this.abc++;
            // console.log(this.abc);
            this.backend.setState({
                abc: this.abc
            });
        }, 2000);
    };

    public onRemoved():void {
        clearInterval(this.interval);
    };

    public onTextContentChanged():void {

    };
};
`
            },
            displayCode: {
                code: 
`export default class WidgetDisplay {
    public constructor(private displayBackend) {

    };
    public render():React.ReactNode {
        const abc = this.displayBackend.getState('abc');
        const greeting = 'hello';
        return <div>{greeting} {abc}</div>;
    };
};
`
            },
            blots: {}
        });
    };
    private editFormat(format:DocUIFormat):void {
        const editingFormat = this.state.editingFormat;
        if(editingFormat === format) {
            this.setState({editingFormat: null});
        } else {
            this.setState({editingFormat: format});
        }
    };

    private applyFormat(format:DocUIFormat):void {
        const range = this.quill.getSelection();
        if(range) {
            const {formatId} = format;
            const blotId = size(format.blots);
            this.quill.formatText(range.index, range.length, {'docui-inline': { formatId, blotId }}, Quill.sources.USER);
        }
    };

    public render():React.ReactNode {
        // const editorClassName = classNames(this.props.className);
        const formatsElements:React.ReactNode[] = map(this.state.formats, (f:DocUIFormat) =>
            <button onClick={(e)=>this.applyFormat(f)} onContextMenu={(e)=>{e.preventDefault(); this.editFormat(f)}} key={f.name}>{f.name}</button>
        );
        let editingFormatElement = null;
        if(this.state.editingFormat) {
            editingFormatElement = <FormatEditor formatsDoc={this.formatsDoc} format={this.state.editingFormat} />;
        }
        return <div className="container">
            <div className="row" ref={(ref:HTMLDivElement) => this.toolbarNode = ref } id="toolbar">
                <select className="ql-size">
                    <option value="small"></option>
                    <option selected></option>
                    <option value="large"></option>
                    <option value="huge"></option>
                </select>
                <button className="ql-bold"></button>
                <button className="ql-script" value="sub"></button>
                <button className="ql-script" value="super"></button>

                {formatsElements}

                <button className="" onClick={(e)=>this.createFormat()}>Create</button>
            </div>
            {editingFormatElement}
            <div className="row" ref={(ref:HTMLDivElement) => this.editorNode = ref } />
        </div>
    };
};
