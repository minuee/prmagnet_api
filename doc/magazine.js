const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
    info: {
        title: "패션PR 매거진용",
        version: "1.0.0",
        description: "패션PR 매거진용 API",
    },
    host: "13.209.158.207:3004/v1/magazine",
    basePath: "/",
};

const option = {
    swaggerDefinition,
    customSiteTitle: "Magazine API",
    apis: [`${__dirname}/../route/v1/magazine.js`],
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
