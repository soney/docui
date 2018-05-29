import * as Quill from 'quill';

const Inline = Quill.import('blots/inline');

export class DocUIInlineBlot extends Inline {
    public static blotName:string = 'docui-inline';
    public static tagName:string = 'a';
    public static create(url:string):Node {
        const node:Element = super.create(null) as Element;
        node.setAttribute('href', url);
        node.setAttribute('target', '_blank');
        node.setAttribute('title', node.textContent);
        return node;
    };

    public static formats(domNode:Element):string|boolean {
        return domNode.getAttribute('href') || true;
    };
}; 