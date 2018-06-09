"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const QuillEditor_1 = require("./components/QuillEditor");
require('codemirror/mode/javascript/javascript');
ReactDOM.render(React.createElement("div", null,
    React.createElement(QuillEditor_1.QuillEditor, null)), document.getElementById("example"));
//# sourceMappingURL=index.js.map