"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const CodeEditor_1 = require("./CodeEditor");
require('codemirror/lib/codemirror.css');
;
;
class FormatEditor extends React.Component {
    constructor(props, state) {
        super(props, state);
        this.state = {
            name: this.props.format.name,
            bCode: this.props.format.backendCode.code,
            dCode: this.props.format.displayCode.code
        };
    }
    ;
    render() {
        return React.createElement("div", null,
            React.createElement("h1", null,
                "Edit ",
                this.props.format.name,
                " ",
                this.props.id),
            React.createElement(CodeEditor_1.CodeEditor, { doc: this.props.formatsDoc, docPath: ['formats', this.props.id, 'backendCode', 'code'], options: { mode: 'text/typescript-jsx' } }),
            React.createElement(CodeEditor_1.CodeEditor, { doc: this.props.formatsDoc, docPath: ['formats', this.props.id, 'backendCode', 'code'], options: { mode: 'text/typescript-jsx' } }));
    }
    ;
}
exports.FormatEditor = FormatEditor;
//# sourceMappingURL=FormatEditor.js.map