import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Quill from 'quill';
import {StateDoc} from '../../types/docTypes';
import {SDBClient, SDBDoc} from 'sdb-ts';
import {QuillDoc, FormatDoc, DocUIFormat} from '../../types/docTypes';
import {has} from 'lodash';
import { format } from "url";

const Inline = Quill.import('blots/inline');

interface DocUIInlineBlotReactComponentProps {
    formatsDoc:SDBDoc<FormatDoc>,
    formatId:string,
    blotId:string
};
interface DocUIInlineBlotReactComponentState {[key:string]:any};

export class DocUIInlineBlotReactComponent extends React.Component<DocUIInlineBlotReactComponentProps, DocUIInlineBlotReactComponentState> {
    private doc:SDBDoc<StateDoc>;
    private WidgetDisplayClass:any;
    private widgetDisplayInstance:any;
    constructor(props:DocUIInlineBlotReactComponentProps, state:DocUIInlineBlotReactComponentState) {
        super(props, state);
        this.props.formatsDoc.subscribe(this.onFormatsDocChange);
    };

    private onFormatsDocChange = (type:string, ops, source, data:FormatDoc):void => {
        console.log(data);
        console.log(type);
        console.log(ops);
        // const exports = {};
        // eval(`((exports) => {${codestr}})(exports)`);
        // this.WidgetDisplayClass = exports['default'];
        // this.widgetDisplayInstance = new this.WidgetDisplayClass(this);
    };

    public getState(key:string):any {
        if(has(this.state, key)) {
            return this.state[key];
        } else {
            return null;
        }
    };

    private onStateChange = (type:string, ops, source, data:StateDoc):void => {
        this.setState(data.state);
    };

    public render():React.ReactNode {
        // return this.widgetDisplayInstance.render();
        return <span style={{color:'red'}}>...</span>
    };
};

export class DocUIInlineBlot extends Inline {
    // private static client:SDBClient = new SDBClient(new WebSocket(`ws://${window.location.host}`));
    private static formatsDoc:SDBDoc<FormatDoc>;
    //  = DocUIInlineBlot.client.get<FormatDoc>('docui', 'formats');
    public static blotName:string = 'docui-inline';
    public static tagName:string = 'span';

    private blotContent:HTMLSpanElement;
    private formatId:string;
    private blotId:string;
    protected domNode:HTMLSpanElement;

    constructor(domNode:HTMLSpanElement, value?:{formatId:string, blotId:string}) {
        super(domNode, value);
        this.formatId = value.formatId;
        this.blotId = value.blotId;
        this.attachBlotWidget();
    };

    public static setFormatsDoc(doc:SDBDoc<FormatDoc>):void {
        DocUIInlineBlot.formatsDoc = doc;
    };

    private async attachBlotWidget():Promise<void> {
        this.domNode.setAttribute('docui-format-id', `${this.formatId}`);
        this.domNode.setAttribute('docui-blot-id', `${this.blotId}`);

        this.blotContent = document.createElement('span');
        this.blotContent.setAttribute('contenteditable', 'false');
        this.blotContent.textContent = '...';

        this.domNode.appendChild(this.blotContent);

        debugger;

        DocUIInlineBlot.formatsDoc.submitObjectInsertOp(['formats', this.formatId, 'blots', this.blotId], {
            blotId: this.blotId,
            state: {}
        });

        ReactDOM.render(<DocUIInlineBlotReactComponent formatsDoc={DocUIInlineBlot.formatsDoc} formatId={this.formatId} blotId={this.blotId} />, this.blotContent);
    };

    public static create(info:any):Node {
        return super.create(null);
    };

    public static formats(domNode:HTMLSpanElement):{formatId:string, blotId:string} {
        const formatId = domNode.getAttribute('docui-format-id');
        const blotId = domNode.getAttribute('docui-blot-id');
        return {formatId, blotId};
    };
}; 