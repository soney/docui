import Parchment from 'parchment';

export class DocUIBlot extends Parchment.Inline {
    public static blotName:string = 'link2';
    public static tagName:string = 'A';
    public static create(url:string):Node {
        console.log(url);
        const node:Element = super.create(null) as Element;
        node.setAttribute('href', url);
        node.setAttribute('target', '_blank');
        node.setAttribute('title', node.textContent);
        return node;
    };

    public static formats(domNode:Element):string|boolean {
        return domNode.getAttribute('href') || true;
    };

    public format(name:string, value:any):void {
        console.log(name, value);
        if(name === 'link2' && value) {
            this.domNode.setAttribute('href', value);
        } else {
            super.format(name, value);
        }
    };

    public formats():{[index:string]: any} {
        const formats = super.formats();
        formats['link2'] = DocUIBlot.formats(this.domNode);
        return formats;
    };
}; 