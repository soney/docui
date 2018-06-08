import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Quill from 'quill';
import {StateDoc} from '../../types/docTypes';
import {SDBClient, SDBDoc} from 'sdb-ts';

const Inline = Quill.import('blots/inline');

const codestr = `
"use strict";
exports.__esModule = true;
var WidgetDisplay = /** @class */ (function () {
    function WidgetDisplay(displayBackend) {
        this.displayBackend = displayBackend;
    }
    ;
    WidgetDisplay.prototype.render = function () {
        var abc = this.displayBackend.getState('abc');
        var greeting = 'hello';
        return React.createElement("div", null,
            greeting,
            " ",
            abc);
    };
    ;
    return WidgetDisplay;
}());
exports["default"] = WidgetDisplay;
; `;

export class DocUIInlineBlot extends Inline {
    private static client:SDBClient = new SDBClient(new WebSocket(`ws://${window.location.host}`));
    private doc:SDBDoc<StateDoc>;
    public static blotName:string = 'docui-inline';
    public static tagName:string = 'span';

    constructor(domNode:Node, value?:any) {
        super(domNode, value);
        this.doc = DocUIInlineBlot.client.get<StateDoc>('example', 'state');
        this.doc.subscribe(this.onRemoteChange);
        // console.log(this.doc);
        const x = eval(codestr);
        console.log(x);
    };

    private onRemoteChange = (type:string, ops:any[], source:any, data:StateDoc):void => {
        const domNode:Node = this['domNode'];
        domNode.textContent = data.state.abc || 'hello';
        // console.log(data.state);
    };

    public static create(info:any):Node {
        const node:Element = super.create(null) as Element;
        return node;
    };

    public static formats(domNode:Element):string|boolean {
        return domNode.getAttribute('href') || true;
    };
}; 