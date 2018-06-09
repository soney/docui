import * as React from "react";
import * as ReactDOM from "react-dom";

import { QuillEditor } from "./components/QuillEditor";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'codemirror/mode/javascript/javascript';
import 'quill/dist/quill.snow.css';

ReactDOM.render(
    <div>
        <QuillEditor />
    </div>,
    document.getElementById("example")
);