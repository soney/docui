import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Quill from 'quill';
import {StateDoc} from '../../types/docTypes';
import {SDBClient, SDBDoc} from 'sdb-ts';
import {QuillDoc, FormatDoc, DocUIFormat} from '../../types/docTypes';
import { has, forEach, isEqual } from 'lodash';
import { format } from "url";

const Inline = Quill.import('blots/inline');

interface DocUIInlineBlotReactComponentProps {
    formatsDoc:SDBDoc<FormatDoc>,
    formatId:string,
    blotId:string
};
interface DocUIInlineBlotReactComponentState {[key:string]:any};

export class DocUIInlineBlotReactComponent extends React.Component<DocUIInlineBlotReactComponentProps, DocUIInlineBlotReactComponentState> {
    private WidgetDisplayClass:any;
    private widgetDisplayInstance:any;
    constructor(props:DocUIInlineBlotReactComponentProps, state:DocUIInlineBlotReactComponentState) {
        super(props, state);
        this.props.formatsDoc.subscribe(this.onFormatsDocChange);
    };

    private onFormatsDocChange = (type:string, ops, source, data:FormatDoc):void => {
        if(type == null) {
            this.updateWidgetDisplayClass();
        } else if(type === 'op') {
            forEach(ops, (op) => {
                const {p} = op;
                if(isEqual(p.slice(0, 4), ["formats", this.props.formatId, "displayCode", "jsCode"])) {
                    this.updateWidgetDisplayClass();
                } else if(p.length === 6 && isEqual(p.slice(0, 5), ['formats', this.props.formatId, 'blots', this.props.blotId, 'state'])) {
                    const formats = this.props.formatsDoc.getData();
                    const blot = formats.formats[this.props.formatId].blots[this.props.blotId];
                    const {state} = blot;
                    this.setState(state);
                }
            });
        }
    };
    private updateWidgetDisplayClass():void {
        const format = this.props.formatsDoc.getData().formats[this.props.formatId];
        const {jsCode} = format.displayCode;
        if(jsCode) {
            const exports = {};
            eval(`((exports) => {${jsCode}})(exports)`);
            this.WidgetDisplayClass = exports['default'];
            this.updateWidgetDisplayInstance();
        } else {
            this.WidgetDisplayClass = null;
        }
    };

    private updateWidgetDisplayInstance():void {
        if(this.widgetDisplayInstance) {
            if(this.widgetDisplayInstance.destroy) {
                this.widgetDisplayInstance.destroy();
            }
        }

        if(this.WidgetDisplayClass) {
            this.widgetDisplayInstance = new this.WidgetDisplayClass(this);
            this.forceUpdate();
        }
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
        if(this.widgetDisplayInstance) {
            return this.widgetDisplayInstance.render();
        } else {
            return <span style={{color:'red'}}>...</span>
        }
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

        const {formats} = DocUIInlineBlot.formatsDoc.getData();
        const {blots} = formats[this.formatId];

        if(!has(blots, this.blotId)) {
            DocUIInlineBlot.formatsDoc.submitObjectInsertOp(['formats', this.formatId, 'blots', this.blotId], {
                blotId: this.blotId,
                state: {}
            });
        }

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