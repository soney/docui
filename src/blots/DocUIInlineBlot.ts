import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Quill from 'quill';
import {StateDoc} from '../../types/docTypes';
import {SDBClient, SDBDoc} from 'sdb-ts';

const Inline = Quill.import('blots/inline');

export class DocUIInlineBlot extends Inline {
    private static client:SDBClient = new SDBClient(new WebSocket(`ws://${window.location.host}`));
    private doc:SDBDoc<StateDoc>;
    public static blotName:string = 'docui-inline';
    public static tagName:string = 'span';

    constructor(domNode:Node, value?:any) {
        super(domNode, value);
        this.doc = DocUIInlineBlot.client.get<StateDoc>('example', 'state');
        this.doc.subscribe(this.onRemoteChange);
        console.log(this.doc);
    };

    private onRemoteChange = (ops:any[], source:any):void => {
        const data = this.doc.getData();
        const domNode:Node = this['domNode'];
        domNode.textContent = data.state.x || 'hello';
        console.log(data.state);
    };

    public static create(info:any):Node {
        const node:Element = super.create(null) as Element;
        return node;
    };

    public static formats(domNode:Element):string|boolean {
        return domNode.getAttribute('href') || true;
    };
}; 