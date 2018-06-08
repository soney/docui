export interface CodeDoc {
    code: string
};
export interface BackendCodeDoc extends CodeDoc { };
export interface DisplayCodeDoc extends CodeDoc {
    jsCode?: string
};
export type QuillDoc = any[];
export type StateDoc = {
    state: any
};

export interface DocUIFormat {
    name:string,
    backendCode:BackendCodeDoc,
    displayCode:DisplayCodeDoc
};
export interface FormatDoc {
    formats: DocUIFormat[]
};