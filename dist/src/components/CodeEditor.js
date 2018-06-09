"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const sdb_ts_1 = require("sdb-ts");
const CodeMirror = require("codemirror");
const classNames = require("classnames");
require('codemirror/lib/codemirror.css');
;
;
class CodeEditor extends React.Component {
    constructor(props, state) {
        super(props, state);
        this.client = new sdb_ts_1.SDBClient(new WebSocket(`ws://${window.location.host}`));
        this.suppressChange = false;
        this.ops = [];
        this.beforeLocalChange = (editor, change) => __awaiter(this, void 0, void 0, function* () {
            if (this.suppressChange) {
                return;
            }
            const ops = this.getOps(change);
            this.ops.push(...ops);
        });
        this.afterLocalChanges = (editor, changes) => __awaiter(this, void 0, void 0, function* () {
            if (this.suppressChange) {
                return;
            }
            if (this.ops.length > 0) {
                const ops = this.ops;
                this.ops = [];
                yield this.doc.submitOp(ops);
                this.assertValue();
            }
        });
        this.onRemoteChange = (type, ops, source) => {
            if (source) {
                return;
            }
            this.suppressChange = true;
            if (ops) {
                ops.forEach((part) => {
                    if (!(part.p && CodeEditor.arrEq(part.p.slice(0, this.props.docPath.length), this.props.docPath) && (part.si || part.sd))) {
                        console.log('ShareDBCodeMirror: ignoring op because of path or type:', part);
                        return;
                    }
                    const op = part.o;
                    const doc = this.codeMirror.getDoc();
                    const { si, sd } = part;
                    const index = part.p[part.p.length - 1];
                    const from = doc.posFromIndex(index);
                    if (sd) {
                        const to = doc.posFromIndex(index + sd.length);
                        doc.replaceRange('', from, to);
                    }
                    else if (si) {
                        doc.replaceRange(si, from);
                    }
                });
            }
            else {
                this.codeMirror.getDoc().setValue(this.getSDBCode());
            }
            this.suppressChange = false;
        };
        // const [n, d] = this.props.doc;
        // this.doc = this.client.get<CodeDoc>(n, d);
        this.state = {
            isFocused: false
        };
        this.doc.subscribe(this.onRemoteChange);
    }
    ;
    componentDidMount() {
        this.codeMirror = CodeMirror.fromTextArea(this.textareaNode, this.props.options);
        this.codeMirror.setValue(this.props.value);
        this.codeMirror.on('beforeChange', this.beforeLocalChange);
        this.codeMirror.on('changes', this.afterLocalChanges);
    }
    ;
    getOps(change) {
        const doc = this.codeMirror.getDoc();
        const { from, to } = change;
        const p = this.props.docPath.concat(doc.indexFromPos(from));
        const ops = [];
        if (!CodeEditor.positionEq(from, to)) { // delete
            ops.push({ p, sd: doc.getRange(from, to) });
        }
        if (change.text[0] !== '' || change.text.length > 0) { // insert
            ops.push({ p, si: change.text.join(this.codeMirror.lineSeparator()) });
        }
        return ops;
    }
    ;
    static positionEq(a, b) {
        return a.ch === b.ch && a.line === b.line;
    }
    ;
    static arrEq(a, b) {
        if (a.length === b.length) {
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    getSDBCode() {
        const docData = this.doc.getData();
        let docValue = docData;
        for (let i = 0; i < this.props.docPath.length; i++) {
            const k = this.props.docPath[i];
            docValue = docValue[k];
        }
        return docValue;
    }
    ;
    assertValue() {
        const docValue = this.getSDBCode();
        const editorValue = this.codeMirror.getValue();
        if (docValue !== editorValue) {
            console.error('ShareDBCodeMirror: value in CodeMirror does not match expected value:', '\n\nExpected value:\n', docValue, '\n\nEditor value:\n', editorValue);
            this.suppressChange = true;
            this.codeMirror.setValue(docValue);
            this.suppressChange = false;
        }
    }
    ;
    render() {
        const editorClassName = classNames('CodeMirror', this.state.isFocused ? 'ReactCodeMirror--focused' : null, this.props.className);
        return React.createElement("div", { className: editorClassName },
            React.createElement("textarea", { ref: (ref) => this.textareaNode = ref, name: this.props.name, defaultValue: this.props.value, autoComplete: "off", autoFocus: this.props.autoFocus }));
    }
    ;
}
CodeEditor.defaultProps = {
    name: '',
    value: '',
    className: '',
    autoFocus: false,
    docPath: [],
    options: {},
    doc: null
    // doc: ['example', 'code']
};
exports.CodeEditor = CodeEditor;
;
//# sourceMappingURL=CodeEditor.js.map