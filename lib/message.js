/*
서버 응답 모델
 */
var Message = function (_code, _data={}, _error) { 
    this.code = _code;
    this.data = _data;
    this.error = _error;
    return this;
}

Message.prototype.setCode = function (code) {
    this.code = code;
    return this;
}
Message.prototype.setData = function (data) {
    this.data = data;
    return this;
}
Message.prototype.setError = function (error) {
    this.error = error;
    return this;
}
Message.prototype.toString = function () {
    return JSON.stringify(this);
}
module.exports = Message;