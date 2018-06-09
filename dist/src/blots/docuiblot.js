"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parchment_1 = require("parchment");
class DocUIBlot extends parchment_1.default.Inline {
    static create(url) {
        const node = super.create(null);
        node.setAttribute('href', url);
        node.setAttribute('target', '_blank');
        node.setAttribute('title', node.textContent);
        return node;
    }
    ;
    static formats(domNode) {
        return domNode.getAttribute('href') || true;
    }
    ;
    format(name, value) {
        console.log(name, value);
        if (name === 'link' && value) {
            this.domNode.setAttribute('href', value);
        }
        else {
            super.format(name, value);
        }
    }
    ;
    formats() {
        const formats = super.formats();
        formats['link'] = DocUIBlot.formats(this.domNode);
        return formats;
    }
    ;
}
DocUIBlot.blotName = 'link';
DocUIBlot.tagName = 'B';
exports.DocUIBlot = DocUIBlot;
;
//# sourceMappingURL=docuiblot.js.map