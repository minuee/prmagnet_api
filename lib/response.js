const Message = require("./message");

const returnFunction = function (statusCode, json) {
  /*console.log(
    this.req.method + " " + this.req.url.replace(/(\?.*)/g, ""),
    JSON.stringify(this.req.query),
    JSON.stringify(this.req.body)
  );*/
  this.status(statusCode).send(json);
};

const returnErrorFunction = function (error) {
  console.error(
    this.req.method + " " + this.req.url.replace(/(\?.*)/g, ""),
    JSON.stringify(this.req.query),
    JSON.stringify(this.req.body)
  );
  console.error(error);
  if (error.sz) {
    var message = new Message(error.code, { message: error.message });
    this.status(error.statusCode).send(message);
  } else if (error.name === "SequelizeValidationError") {
    console.error(
      this.req.method + " " + this.req.url.replace(/(\?.*)/g, ""),
      JSON.stringify(this.req.query),
      JSON.stringify(this.req.body)
    );
    console.error("Wrong Parameter");
    var message = new Message(-1, { message: "Wrong Parameter" });
    this.status(403).send(message);
  } else {
    var message = new Message(-1, { message: "Unknown Server Error" });
    this.status(500).send(message);
  }
};

const returnNotAccessFunction = function () {
  console.error(
    this.req.method + " " + this.req.url.replace(/(\?.*)/g, ""),
    JSON.stringify(this.req.query),
    JSON.stringify(this.req.body)
  );
  console.error("Unauthorized. Not Accessed");
  var message = new Message(-2, { message: "Unauthorized. Not Accessed" });
  this.status(402).send(message);
};

const returnWrongParameterFunction = function () {
  console.error(
    this.req.method + " " + this.req.url.replace(/(\?.*)/g, ""),
    JSON.stringify(this.req.query),
    JSON.stringify(this.req.body)
  );
  console.error("Wrong Parameter");
  var message = new Message(-1, { message: "Wrong Parameter" });
  this.status(403).send(message);
};

module.exports = {
  returnFunction,
  returnErrorFunction,
  returnNotAccessFunction,
  returnWrongParameterFunction,
};
