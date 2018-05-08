import * as React from "react";
import * as ReactDOM from "react-dom";

import { CodeEditor } from "./components/CodeEditor";
require('codemirror/mode/javascript/javascript');

ReactDOM.render(
    <CodeEditor options={{mode:'text/typescript'}} />,
    document.getElementById("example")
);