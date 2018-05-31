import * as React from "react";
import * as ReactDOM from "react-dom";

import { CodeEditor } from "./components/CodeEditor";
import { QuillEditor } from "./components/QuillEditor";
require('codemirror/mode/javascript/javascript');

ReactDOM.render(
    <div>
        <CodeEditor doc={['example', 'backend-code']} options={{mode:'text/typescript-jsx'}} />
        <CodeEditor doc={['example', 'display-code']} options={{mode:'text/typescript-jsx'}} />
        <QuillEditor />
    </div>,
    document.getElementById("example")
);