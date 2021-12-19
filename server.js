//------------------------------------------------
// require
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const { awsMiddleware, httpMiddleware } = require("@psyrenpark/express-lib");
const Response = require("./lib/response");
// const Message = require("./lib/message");
// const Exception = require("./lib/exception");

//------------------------------------------------
// env
const envJson = require(`${__dirname}/env/env.json`);
const port = envJson.port ? envJson.port : 3001;

//-----------------------------------------------------------
// response
//일반적으로 응답 반환
express.response.return = Response.returnFunction;
//오류로 응답 반환
express.response.returnError = Response.returnErrorFunction;
express.response.returnNotAccess = Response.returnNotAccessFunction;
express.response.returnWrongParameter = Response.returnWrongParameterFunction;

//-----------------------------------------------------------
// middleware
var app = express();
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(require(`${__dirname}/middleware/firebase`));
app.use(require(`${__dirname}/middleware/db`));
app.use(require(`${__dirname}/middleware/auth`));
app.use(httpMiddleware);
app.use(awsMiddleware);
// app.use(require(`${__dirname}/middleware/googleapi`));

//-----------------------------------------------------------
// v1

// api
app.use("/v1/brand", require(`${__dirname}/route/v1/brand`));
app.use("/v1/stylist", require(`${__dirname}/route/v1/stylist`));
app.use("/v1/magazine", require(`${__dirname}/route/v1/magazine`));
app.use("/v1/api", require(`${__dirname}/route/v1/api`));
app.use("/v1/cdn", require(`${__dirname}/route/v1`));

app.use("/v1", require(`${__dirname}/route/v1`));

// cdn
app.use("/cdn/v1", require(`${__dirname}/route/v1`));
app.use("/cdn/v1/cdn", require(`${__dirname}/route/v1/cdn`));
//-----------------------------------------------------------

app.get("/cdn/v1/test", async (req, res) => {
    const context = {};

    try {
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json(String(error));
    }
});

if (process.env.NODE_ENV == "dev") {
    //console.log("개발중");

    app.set("views", __dirname + "/ejs");
    app.set("view engine", "ejs");
    app.engine("ejs", require("ejs").__express);

    app.get("/cdn/v1/pay_test", async (req, res) => {
        const context = {};

        try {
            res.render("pay", context);
        } catch (error) {
            console.error(error);
            res.json(String(error));
        }
    });

    app.get("/cdn/v1/push_test", async (req, res) => {
        const context = {};

        try {
            res.render("push", context);
        } catch (error) {
            console.error(error);
            res.json(String(error));
        }
    });

    app.post("/cdn/v1/push_test", async (req, res) => {
        const context = {};

        const message = req.body.message || null;
        const token = req.body.token || null;

        try {
            await req.sendMessage(token, { message });

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.json(String(error));
        }
    });

    app.get("/cdn/v1/log", async (req, res) => {
        const context = {};

        const email = req.query.email || null;

        try {
            const log = await req.sequelize.query(
                `
              select 
                a.*
                , b.*
                , (
                    select email_adres 
                    from
                    (
                      (
                          select email_adres from tb_brand_user c where c.user_id = b.user_id 
                      )
                      union 
                      (
                          select email_adres from tb_mgzn_user c where c.user_id = b.user_id 
                      )
                      union
                      (
                          select email_adres from tb_style_list_user c where c.user_id = b.user_id 
                      )
                    ) t
                    limit 1
                ) as user_email
              from
              (
                select *
                from tb_error_log 
                where 1=1
                and use_yn
                ${
                    email
                        ? `and user_id = (
                      select user_id 
                      from
                      (
                        (select user_id
                        from tb_mgzn_user 
                        where email_adres = '${email}') union
                        (select user_id
                        from tb_style_list_user 
                        where email_adres = '${email}') union
                        (select user_id
                        from tb_brand_user 
                        where email_adres = '${email}') 
                      ) t
                      limit 1
                    )
                  `
                        : ""
                }
                order by reg_dt desc
                limit 50      
              ) a 
              left join tb_user b 
              on 1=1
                and a.user_id = b.user_id
              order by a.log_no desc
            `,
                {
                    type: req.sequelize.QueryTypes.SELECT,
                }
            );
            context.log = log;

            res.render("log", context);
        } catch (error) {
            console.error(error);
            res.json(String(error));
        }
    });

    app.delete("/cdn/v1/log-all", async (req, res) => {
        const context = {};

        try {
            const log = await req.sequelize.query(
                `
            update tb_error_log
            set use_yn = false 
            where 1=1
          `,
                {
                    type: req.sequelize.QueryTypes.SELECT,
                }
            );
            context.log = log;

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.json(String(error));
        }
    });

    // batch 작업
    app.use("/v1/batch", require(`${__dirname}/route/v1/batch`));
    app.use("/cdn/v1/batch", require(`${__dirname}/route/v1/batch`));

    // router
    app.use("/cdn/v1/brand", require(`${__dirname}/route/v1/brand`));
    app.use("/cdn/v1/stylist", require(`${__dirname}/route/v1/stylist`));
    app.use("/cdn/v1/magazine", require(`${__dirname}/route/v1/magazine`));

    // 문서
    try {
        app.registerDoc = require("./lib/register.doc");
        // 문서는 전용 설정 소스파일을 작성 후,
        // 아래와 같이 등록하면 됩니다.
        app.registerDoc("/cdn/v1/doc/brand", require("./doc/brand"));
        app.registerDoc("/cdn/v1/doc/magazine", require("./doc/magazine"));
        app.registerDoc("/cdn/v1/doc/stylist", require("./doc/stylist"));
        app.registerDoc("/cdn/v1/doc/cdn", require("./doc/cdn"));
    } catch (error) {
        console.error("!!!! 문서 오류 발생 !!!!");
        console.error("### YAML 포맷이 깨지지 않았는지 확인해주세요. ###");
        // const sequelize = require("./lib/sequelize");
        // sequelize
        //     .query(
        //         `insert into tb_error_log(user_id, "error")
        //     values(
        //         :user_id
        //         , :error
        //     )`,
        //         {
        //             replacements: {
        //                 user_id: "3a27da16-9b06-43a1-964e-70f70acf9806",
        //                 error: String(error),
        //             },
        //         }
        //     )
        //     .then();
        console.error(error);
    }
}

app.get("/", function (req, res) {
    res.json("check");
});

app.listen(port, () => {
    ////console.log(">>>> APP START >>>>");
});

module.exports = app;
