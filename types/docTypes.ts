export interface CodeDoc {
    code: string,
    error?:string
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
    formatId:string,
    backendCode:BackendCodeDoc,
    displayCode:DisplayCodeDoc,
    blots: {
        [blotId:string]: {
            blotId:string,
            state: {
                [key:string]: any
            }
        }
    }
};
export interface FormatDoc {
    formats: {
        [formatId:string]:DocUIFormat
    }
};