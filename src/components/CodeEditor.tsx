import * as React from "react";
import {SDBClient, SDBDoc} from 'sdb-ts';
import * as CodeMirror from 'codemirror';
import * as classNames from 'classnames';
import {CodeDoc} from '../../types/docTypes';

require('codemirror/lib/codemirror.css');

interface CodeEditorProps {
    name?: string,
    value?: string,
    autoFocus?: boolean,
    className?: string,
    mode?: string,
    options?: any,
    key?:Array<string|number>
};
interface CodeEditorState {
    isFocused: boolean
};

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
    private textareaNode:HTMLTextAreaElement;
    private client:SDBClient = new SDBClient(new WebSocket(`ws://${window.location.host}`));
    private doc:SDBDoc<CodeDoc> = this.client.get<CodeDoc>('example', 'counter');
    private codeMirror:CodeMirror.Editor;
    private suppressChange:boolean = false;
    private ops:({p:number,d:string}|{p:number,i:string})[] = [];
    private static defaultProps:CodeEditorProps = {
        name: '',
        value: '',
        className: '',
        autoFocus: false,
        key: ['code'],
        options: {}
    };
    constructor(props:CodeEditorProps, state:CodeEditorState) {
        super(props, state);
        this.state = {
            isFocused: false
        };
        this.doc.subscribe(this.onRemoteChange);
    };
    public componentDidMount():void {
        this.codeMirror = CodeMirror.fromTextArea(this.textareaNode, this.props.options);
        this.codeMirror.setValue(this.props.value);
        this.codeMirror.on('beforeChange', this.beforeLocalChange);
        this.codeMirror.on('changes', this.afterLocalChanges);
    };
    private beforeLocalChange = (editor:CodeMirror.Editor, change:CodeMirror.EditorChange):void => {
        if(this.suppressChange) { return ; }
        const {from, to} = change;

        const doc:CodeMirror.Doc = editor.getDoc();
        console.log(change);

        const index:number = doc.indexFromPos(from);
        if(!CodeEditor.positionEq(from, to)) { // delete
            this.ops.push({p:index, d:doc.getRange(from, to)})
        }
        if(change.text[0] !== '' && change.text.length > 0) { // insert
            this.ops.push({p: index, i: change.text.join('\n')});
        }
    };
    private static positionEq(a:CodeMirror.Position, b:CodeMirror.Position):boolean {
        return a.ch===b.ch && a.line===b.line;
    };
    private afterLocalChanges = async (editor:CodeMirror.Editor, changes:CodeMirror.EditorChange[]):Promise<void> => {
        if(this.suppressChange) { return ; }
        if(this.ops.length > 0) {
            const op = [{p:this.props.key, t:'text0', o:this.ops}];
            this.ops = [];
            await this.doc.submitOp(op);
        }
    };
    private onRemoteChange = (ops:any[], source:boolean):void => {
        if(source) { return; }
        this.suppressChange = true;
        console.log(ops);
        if(ops) {
            ops.forEach((part) => {
                if (!(part.p && part.p.length === 1 && part.p[0] === this.props.key && part.t === 'text0')) {
                    console.log('ShareDBCodeMirror: ignoring op because of path or type:', part);
                    return;
                }

                const op = part.o;
                const doc = this.codeMirror.getDoc();
                if (op.length === 2 && op[0].d && op[1].i && op[0].p === op[1].p) {
                    // replace operation
                    const from = doc.posFromIndex(op[0].p);
                    const to = doc.posFromIndex(op[0].p + op[0].d.length);
                    doc.replaceRange(op[1].i, from, to);
                } else {
                    op.forEach((part) => {
                        const from = doc.posFromIndex(part.p);
                        if (part.d) {
                            // delete operation
                            const to = doc.posFromIndex(part.p + part.d.length);
                            doc.replaceRange('', from, to);
                        } else if (part.i) {
                            // insert operation
                            doc.replaceRange(part.i, from);
                        }
                    });
                }
            });
        } else {
            this.codeMirror.getDoc().setValue(this.doc.getData().code);
        }
        this.suppressChange = false;
    };
    private assertValue():void {
        const docValue = this.doc.getData().code;
        const editorValue = this.codeMirror.getValue();
        if(docValue !== editorValue) {
            console.error('ShareDBCodeMirror: value in CodeMirror does not match expected value:', '\n\nExpected value:\n', docValue, '\n\nEditor value:\n', editorValue);
            this.suppressChange = true;
            this.codeMirror.setValue(docValue);
            this.suppressChange = false;
        }
    };
    public render():React.ReactNode {
        const editorClassName = classNames('CodeMirror', this.state.isFocused ? 'ReactCodeMirror--focused' : null, this.props.className);
        return <div className={editorClassName}>
            <textarea
                ref={(ref:HTMLTextAreaElement) => this.textareaNode = ref}
                name={this.props.name}
                defaultValue={this.props.value}
                autoComplete="off"
                autoFocus={this.props.autoFocus}
            />
        </div>
    };
};