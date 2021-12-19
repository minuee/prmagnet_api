module.exports = function (path, doc) {
    this.use(path, doc.middleware);
    this.get(path, doc.response);
};
