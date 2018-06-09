import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Quill from 'quill';
import {StateDoc} from '../../types/docTypes';
import {SDBClient, SDBDoc} from 'sdb-ts';
import {has} from 'lodash';

const Inline = Quill.import('blots/inline');

interface DocUIInlineBlotReactComponentProps {
    stateDoc:SDBDoc<StateDoc>
};
interface DocUIInlineBlotReactComponentState {[key:string]:any};

export class DocUIInlineBlotReactComponent extends React.Component<DocUIInlineBlotReactComponentProps, DocUIInlineBlotReactComponentState> {
    private doc:SDBDoc<StateDoc>;
    private WidgetDisplayClass:any;
    private widgetDisplayInstance:any;
    constructor(props:DocUIInlineBlotReactComponentProps, state:DocUIInlineBlotReactComponentState) {
        super(props, state);
        this.props.stateDoc.subscribe(this.onStateChange);

        const exports = {};
        // eval(`((exports) => {${codestr}})(exports)`);
        this.WidgetDisplayClass = exports['default'];
        this.widgetDisplayInstance = new this.WidgetDisplayClass(this);
    };

    public getState(key:string):any {
        if(has(this.state, key)) {
            return this.state[key];
        } else {
            return null;
        }
    };

    private onStateChange = (type:string, ops:any[], source:any, data:StateDoc):void => {
        this.setState(data.state);
    };

    public render():React.ReactNode {
        return this.widgetDisplayInstance.render();
    };
};

export class DocUIInlineBlot extends Inline {
    private static client:SDBClient = new SDBClient(new WebSocket(`ws://${window.location.host}`));
    public static blotName:string = 'docui-inline';
    public static tagName:string = 'span';

    constructor(domNode:Node, value?:any) {
        super(domNode, value);
        const content = document.createElement('span');
        content.textContent = '...';
        domNode.appendChild(content);
        ReactDOM.render(<DocUIInlineBlotReactComponent stateDoc={DocUIInlineBlot.client.get<StateDoc>('example', 'state')} />, content);
    };

    public static create(info:any):Node {
        const node:Element = super.create(null) as Element;
        console.log(info);
        return node;
    };

    public static formats(domNode:Element):string|boolean {
        return true;
    };
}; 