"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var sdb_ts_1 = require("sdb-ts");
var Hello = /** @class */ (function (_super) {
    __extends(Hello, _super);
    function Hello(props, state) {
        var _this = _super.call(this, props, state) || this;
        _this.client = new sdb_ts_1.SDBClient(new WebSocket("ws://" + window.location.host));
        _this.doc = _this.client.get('example', 'counter');
        return _this;
    }
    ;
    Hello.prototype.render = function () {
        return React.createElement("h1", null,
            "Hello from ",
            this.props.compiler,
            " and ",
            this.props.framework,
            "!");
    };
    ;
    return Hello;
}(React.Component));
exports.Hello = Hello;
;
//# sourceMappingURL=Hello.js.map