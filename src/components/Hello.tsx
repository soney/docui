import * as React from "react";
import {SDBClient, SDBDoc} from 'sdb-ts';

export interface HelloProps { compiler: string; framework: string; }
export interface HelloState {
    counter:number
}

interface CounterDoc {
    counter: number
};

export class Hello extends React.Component<HelloProps, HelloState> {
    private client:SDBClient = new SDBClient(new WebSocket(`ws://${window.location.host}`));
    private doc:SDBDoc<CounterDoc> = this.client.get<CounterDoc>('example', 'counter');
    constructor(props:HelloProps, state:HelloState) {
        super(props, state);
        this.state = {
            counter: 0
        };
        this.doc.subscribe(() => {
            const data:CounterDoc = this.doc.getData();
            this.setState({counter: data.counter});
        });
    };
    private async incrementCounter():Promise<void> {
        await this.doc.submitNumberAddOp(['counter'], 1);
    };
    public render():React.ReactNode {
        return <div>
            <h1>Counter: {this.state.counter}</h1>
            <button onClick={()=>this.incrementCounter()}>Increment</button>
        </div>;
    };
};