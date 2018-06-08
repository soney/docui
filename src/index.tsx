import * as React from "react";
import * as ReactDOM from "react-dom";

import { QuillEditor } from "./components/QuillEditor";
require('codemirror/mode/javascript/javascript');

ReactDOM.render(
    <div>
        <QuillEditor />
    </div>,
    document.getElementById("example")
);