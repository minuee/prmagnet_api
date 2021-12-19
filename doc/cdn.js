const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const host = "13.209.158.207:3002";

const swaggerDefinition = {
    info: {
        title: "패션PR CDN",
        version: "1.0.0",
        description: `Who's Pick CDN. 인증없이 접근 가능한 공통 API`,
    },
    host: host + "/cdn/v1/cdn",
    basePath: "/",
};

const option = {
    swaggerDefinition,
    customSiteTitle: "CDN API",
    apis: [`${__dirname}/../route/v1/cdn.js`],
};

// swagger-jsdoc 초기화.
const swaggerSpec = swaggerJSDoc(option);

module.exports = {
    serve: swaggerUi.serve,
    setup: swaggerUi.setup(swaggerSpec),
    middleware: swaggerUi.serveFiles(swaggerSpec, option),
    response: (req, res) =>
        res.send(swaggerUi.generateHTML(swaggerSpec, option)),
};

/**
app.use("/doc", user.middleware);
app.get("/doc", user.response);
 */
