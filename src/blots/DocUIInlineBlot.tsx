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
interface DocUIInlineBlotReactComponentState {[key:string]:any, textContent:string};

export class DocUIInlineBlotReactComponent extends React.Component<DocUIInlineBlotReactComponentProps, DocUIInlineBlotReactComponentState> {
    private WidgetDisplayClass:any;
    private widgetDisplayInstance:any;
    constructor(props:DocUIInlineBlotReactComponentProps, state:DocUIInlineBlotReactComponentState) {
        super(props, state);
        this.props.formatsDoc.subscribe(this.onFormatsDocChange);
    };

    private formatPath():Array<string|number> {
        return ['formats', this.props.formatId];
    };
    private blotPath():Array<string|number> {
        return this.formatPath().concat('blots', this.props.blotId);
    };
    private setBlotError(e:string):void {
        const errorPath = this.blotPath().concat('error');
        const { formatsDoc } = this.props;

        formatsDoc.submitObjectReplaceOp(errorPath, e);
    };

    public onTextContentChange(value:string):void {
        const textContentPath = this.blotPath().concat('textContent');
        const { formatsDoc } = this.props;
        formatsDoc.submitObjectReplaceOp(textContentPath, value);
    };


    private onFormatsDocChange = (type:string, ops, source, data:FormatDoc):void => {
        if(type == null) {
            this.updateWidgetDisplayClass();
        } else if(type === 'op') {
            const { formatsDoc } = this.props;
            const jsCodePath = this.formatPath().concat("displayCode", "jsCode");
            const statePath = this.blotPath().concat('state');

            forEach(ops, (op) => {
                const {p} = op;
                if(isEqual(p.slice(0, 4), jsCodePath)) {
                    this.updateWidgetDisplayClass();
                } else if(p.length === 6 && isEqual(p.slice(0, 5), statePath)) {
                    const state = formatsDoc.traverse(statePath);
                    this.setState(state);
                }
            });
        }
    };
    private updateWidgetDisplayClass():void {
        const { formatsDoc } = this.props;
        const displayCodePath = this.formatPath().concat("displayCode");

        const jsCode = formatsDoc.traverse(displayCodePath.concat("jsCode"));
        if(jsCode) {
            try {
                const exports = {};
                eval(`((exports) => {${jsCode}})(exports)`);
                this.WidgetDisplayClass = exports['default'];
            } catch(e) {
                formatsDoc.submitObjectReplaceOp(displayCodePath.concat('error'), `${e}`);
            }

            this.updateWidgetDisplayInstance();
        } else {
            this.WidgetDisplayClass = null;
        }
    };

    private updateWidgetDisplayInstance():void {
        if(this.widgetDisplayInstance) {
            if(this.widgetDisplayInstance.destroy) {
                try {
                    this.widgetDisplayInstance.destroy();
                } catch(e) {
                    this.setBlotError(`${e}`);
                }
            }
        }

        if(this.WidgetDisplayClass) {
            try {
                this.widgetDisplayInstance = new this.WidgetDisplayClass(this);
            } catch(e) {
                this.setBlotError(`${e}`);
            }
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
            try {
                const result = this.widgetDisplayInstance.render();
                if(!result) {
                    throw new Error('Nothing returned from render');
                }
                return result;
            } catch(e) {
                this.setBlotError(`${e}`);
                return <span style={{color:'red'}}>(error)</span>
            }
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
    private textContent:string;
    private blotReactComponent:DocUIInlineBlotReactComponent;
    protected domNode:HTMLSpanElement;

    constructor(domNode:HTMLSpanElement, value?:{formatId:string, blotId:string}) {
        super(domNode, value);
        this.formatId = value.formatId;
        this.blotId = value.blotId;
        domNode.setAttribute('style', 'color: orange');
        this.attachBlotWidget();
        this.updateTextContent();
        setInterval(() => {
            this.updateTextContent();
        }, 200);
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

        ReactDOM.render(<DocUIInlineBlotReactComponent formatsDoc={DocUIInlineBlot.formatsDoc} formatId={this.formatId} blotId={this.blotId} />, this.blotContent, () => {
            console.log(arguments);
            // this.blotReactComponent = thi
        });
    };

    public getTextContent():string {
        this.updateTextContent();
        return this.textContent;
    };

    private updateTextContent():void {
        const oldTextContent = this.textContent;
        const newTextContent = this.getLeafContents();

        if(oldTextContent !== newTextContent) {
            if(this.blotReactComponent) {
                this.blotReactComponent.onTextContentChange(newTextContent);
            }
        }

        this.textContent = newTextContent;
    };

    private getLeafContents():string {
        const children:Quill.LinkedList = this['children'];
        let child:Quill.Blot = children.head;
        let value:string = '';
        while(child) {
            if(child.value) {
                value += child.value();
            }
            child = child.next;
        }
        return value;
    };

    public static create(info:any):Node {
        return super.create();
    };

    public static formats(domNode:HTMLSpanElement):{formatId:string, blotId:string} {
        const formatId = domNode.getAttribute('docui-format-id');
        const blotId = domNode.getAttribute('docui-blot-id');
        return {formatId, blotId};
    };
}; 