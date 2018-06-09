import * as React from "react";
import {SDBClient, SDBDoc} from 'sdb-ts';
import * as CodeMirror from 'codemirror';
import * as classNames from 'classnames';
import {FormatDoc, CodeDoc} from '../../types/docTypes';

require('codemirror/lib/codemirror.css');

interface CodeEditorProps {
    name?: string,
    value?: string,
    autoFocus?: boolean,
    className?: string,
    mode?: string,
    options?: any,
    docPath:Array<string|number>,
    doc:SDBDoc<any>
    // doc: [string, string]
};
interface CodeEditorState {
    isFocused: boolean
};

export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
    private textareaNode:HTMLTextAreaElement;
    private client:SDBClient = new SDBClient(new WebSocket(`ws://${window.location.host}`));
    private doc:SDBDoc<any>;
    private codeMirror:CodeMirror.Editor;
    private suppressChange:boolean = false;
    private ops:({p:(number|string)[],si?:string, sd?:string})[] = [];
    private static defaultProps:CodeEditorProps = {
        name: '',
        value: '',
        className: '',
        autoFocus: false,
        docPath: [],
        options: {},
        doc:null
        // doc: ['example', 'code']
    };
    constructor(props:CodeEditorProps, state:CodeEditorState) {
        super(props, state);
        // const [n, d] = this.props.doc;
        // this.doc = this.client.get<CodeDoc>(n, d);
        this.state = {
            isFocused: false
        };
        this.props.doc.subscribe(this.onRemoteChange);
    };
    public componentDidMount():void {
        this.codeMirror = CodeMirror.fromTextArea(this.textareaNode, this.props.options);
        this.codeMirror.setValue(this.props.value);
        this.codeMirror.on('beforeChange', this.beforeLocalChange);
        this.codeMirror.on('changes', this.afterLocalChanges);
    };
    private beforeLocalChange = async (editor:CodeMirror.Editor, change:CodeMirror.EditorChange):Promise<void> => {
        if(this.suppressChange) { return; }
        const ops = this.getOps(change);
        this.ops.push(...ops);
    };
    private getOps(change:CodeMirror.EditorChange):{p:(string|number)[], si?:string, sd?:string}[] {
        const doc:CodeMirror.Doc = this.codeMirror.getDoc();
        const {from, to} = change;
        const p:(string|number)[] = this.props.docPath.concat(doc.indexFromPos(from));
        const ops:{p:(string|number)[], si?:string, sd?:string}[] = [];

        if(!CodeEditor.positionEq(from, to)) { // delete
            ops.push({p, sd:doc.getRange(from, to)})
        }

        if(change.text[0] !== '' || change.text.length > 0) { // insert
            ops.push({p, si:change.text.join((this.codeMirror as any).lineSeparator())});
        }
        return ops;
    };
    private static positionEq(a:CodeMirror.Position, b:CodeMirror.Position):boolean {
        return a.ch===b.ch && a.line===b.line;
    };
    private afterLocalChanges = async (editor:CodeMirror.Editor, changes:CodeMirror.EditorChange[]):Promise<void> => {
        if(this.suppressChange) { return ; }
        if(this.ops.length > 0) {
            const ops = this.ops;
            this.ops = [];
            await this.props.doc.submitOp(ops);
            this.assertValue();
        }
    };
    private static arrEq(a:any[], b:any[]):boolean {
        if(a.length === b.length) {
            for(let i = 0; i<a.length; i++) {
                if(a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
    private onRemoteChange = (type:string, ops:any[], source:boolean):void => {
        if(source) { return; }
        this.suppressChange = true;
        if(ops) {
            ops.forEach((part) => {
                if (!(part.p && CodeEditor.arrEq(part.p.slice(0, this.props.docPath.length), this.props.docPath) && (part.si||part.sd))) {
                    console.log('ShareDBCodeMirror: ignoring op because of path or type:', part);
                    return;
                }

                const op = part.o;
                const doc = this.codeMirror.getDoc();
                const {si, sd} = part;

                const index = part.p[part.p.length-1];
                const from = doc.posFromIndex(index);

                if(sd) {
                    const to = doc.posFromIndex(index+sd.length);
                    doc.replaceRange('', from, to);
                } else if(si) {
                    doc.replaceRange(si, from);
                }
            });
        } else {
            this.codeMirror.getDoc().setValue(this.getSDBCode());
        }
        this.suppressChange = false;
    };
    private getSDBCode():string {
        const docData = this.props.doc.getData();
        let docValue = docData;
        for(let i:number = 0; i<this.props.docPath.length; i++) {
            const k = this.props.docPath[i];
            docValue = docValue[k];
        }
        return docValue;
    };
    private assertValue():void {
        const docValue = this.getSDBCode();

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