import * as React from "react";
import * as ReactDOM from "react-dom";

import { CodeEditor } from "./components/CodeEditor";
import { QuillEditor } from "./components/QuillEditor";
require('codemirror/mode/javascript/javascript');

ReactDOM.render(
    <div>
        {/* <CodeEditor options={{mode:'text/typescript'}} /> */}
        <QuillEditor />
    </div>,
    document.getElementById("example")
);