"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Quill = require("quill");
const React = require("react");
const classNames = require("classnames");
const sdb_ts_1 = require("sdb-ts");
const richText = require("rich-text");
const DocUIInlineBlot_1 = require("../blots/DocUIInlineBlot");
const lodash_1 = require("lodash");
const FormatEditor_1 = require("./FormatEditor");
sdb_ts_1.SDBClient.registerType(richText.type);
Quill.register(DocUIInlineBlot_1.DocUIInlineBlot);
// let Block = Quill.import('blots/block');
// Block.allowedChildren.push(DocUIBlot);
require('quill/dist/quill.core.css');
require('quill/dist/quill.snow.css');
;
;
class QuillEditor extends React.Component {
    constructor(props, state) {
        super(props, state);
        this.client = new sdb_ts_1.SDBClient(new WebSocket(`ws://${window.location.host}`));
        this.doc = this.client.get('docs', 'example');
        this.formatsDoc = this.client.get('docui', 'formats');
        this.suppressChange = false;
        this.onFormatsChange = (type, ops, source) => {
            const { formats } = this.formatsDoc.getData();
            this.setState({ formats });
        };
        this.onRemoteChange = (type, ops, source) => {
            if (this.quill) {
                if (source === this.quill) {
                    return;
                }
                if (ops) {
                    this.quill.updateContents(ops);
                }
                else {
                    this.quill.setContents(this.doc.getData());
                }
            }
        };
        this.onButtonClick = () => {
            const range = this.quill.getSelection();
            if (range) {
                this.quill.formatText(range.index, range.length, { 'docui-inline': { url: 'http://umich.edu/' } }, Quill.sources.USER);
            }
        };
        this.state = {
            isFocused: false,
            formats: [],
            editingFormat: null
        };
        this.doc.subscribe(this.onRemoteChange);
        this.formatsDoc.subscribe(this.onFormatsChange);
    }
    ;
    componentDidMount() {
        this.quill = new Quill(this.editorNode, lodash_1.merge({}, this.props.options, {
            modules: {
                toolbar: this.toolbarNode
            }
        }));
        this.quill.on('text-change', (delta, oldDelta, source) => {
            if (source !== 'user') {
                return;
            }
            this.doc.submitOp(delta, this.quill);
        });
        const data = this.doc.getData();
        if (data) {
            this.quill.setContents(data);
        }
    }
    ;
    createFormat() {
        this.formatsDoc.submitListPushOp(['formats'], {
            name: `F${this.formatsDoc.getData().formats.length}`,
            backendCode: {
                code: 'backend'
            },
            displayCode: {
                code: 'frontend'
            }
        });
    }
    ;
    editFormat(format) {
        const editingFormat = this.state.editingFormat;
        if (editingFormat === format) {
            this.setState({ editingFormat: null });
        }
        else {
            this.setState({ editingFormat: format });
        }
    }
    ;
    applyFormat(format) {
        console.log('apply', format);
    }
    ;
    render() {
        const editorClassName = classNames(this.props.className);
        const formatsElements = this.state.formats.map((f) => React.createElement("button", { onClick: (e) => this.applyFormat(f), onContextMenu: (e) => { e.preventDefault(); this.editFormat(f); }, key: f.name }, f.name));
        let editingFormatElement = null;
        if (this.state.editingFormat) {
            editingFormatElement = React.createElement(FormatEditor_1.FormatEditor, { id: this.state.formats.indexOf(this.state.editingFormat), formatsDoc: this.formatsDoc, format: this.state.editingFormat });
        }
        return React.createElement("div", null,
            React.createElement("div", { ref: (ref) => this.toolbarNode = ref, id: "toolbar" },
                React.createElement("select", { className: "ql-size" },
                    React.createElement("option", { value: "small" }),
                    React.createElement("option", { selected: true }),
                    React.createElement("option", { value: "large" }),
                    React.createElement("option", { value: "huge" })),
                React.createElement("button", { className: "ql-bold" }),
                React.createElement("button", { className: "ql-script", value: "sub" }),
                React.createElement("button", { className: "ql-script", value: "super" }),
                formatsElements,
                React.createElement("button", { className: "", onClick: (e) => this.createFormat() }, "Create")),
            editingFormatElement,
            React.createElement("div", { ref: (ref) => this.editorNode = ref, className: editorClassName }));
    }
    ;
}
QuillEditor.defaultProps = {
    name: '',
    value: '',
    className: '',
    autoFocus: false,
    key: [],
    options: {
        placeholder: 'write something...',
        theme: 'snow',
        modules: {
        // toolbar: (():HTMLElement => this.toolbarNode
        }
    }
};
exports.QuillEditor = QuillEditor;
;
//# sourceMappingURL=QuillEditor.js.map