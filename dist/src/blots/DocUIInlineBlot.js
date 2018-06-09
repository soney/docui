"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const Quill = require("quill");
const sdb_ts_1 = require("sdb-ts");
const lodash_1 = require("lodash");
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
        return React.createElement("span", null,
            greeting,
            " ",
            abc);
    };
    ;
    return WidgetDisplay;
}());
exports["default"] = WidgetDisplay;
; `;
;
;
class DocUIInlineBlotReactComponent extends React.Component {
    constructor(props, state) {
        super(props, state);
        this.onStateChange = (type, ops, source, data) => {
            this.setState(data.state);
        };
        this.props.stateDoc.subscribe(this.onStateChange);
        const exports = {};
        eval(`((exports) => {${codestr}})(exports)`);
        this.WidgetDisplayClass = exports['default'];
        this.widgetDisplayInstance = new this.WidgetDisplayClass(this);
    }
    ;
    getState(key) {
        if (lodash_1.has(this.state, key)) {
            return this.state[key];
        }
        else {
            return null;
        }
    }
    ;
    render() {
        return this.widgetDisplayInstance.render();
    }
    ;
}
exports.DocUIInlineBlotReactComponent = DocUIInlineBlotReactComponent;
;
class DocUIInlineBlot extends Inline {
    constructor(domNode, value) {
        super(domNode, value);
        const content = document.createElement('span');
        content.textContent = '...';
        domNode.appendChild(content);
        ReactDOM.render(React.createElement(DocUIInlineBlotReactComponent, { stateDoc: DocUIInlineBlot.client.get('example', 'state') }), content);
    }
    ;
    static create(info) {
        const node = super.create(null);
        return node;
    }
    ;
    static formats(domNode) {
        return true;
    }
    ;
}
DocUIInlineBlot.client = new sdb_ts_1.SDBClient(new WebSocket(`ws://${window.location.host}`));
DocUIInlineBlot.blotName = 'docui-inline';
DocUIInlineBlot.tagName = 'span';
exports.DocUIInlineBlot = DocUIInlineBlot;
;
//# sourceMappingURL=DocUIInlineBlot.js.map