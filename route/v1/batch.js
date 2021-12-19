var express = require("express");
var app = express.Router();

const { isNull } = require("../../lib/util");
const dateUtil = require("../../lib/dateUtil");
const insertLog = require("../../lib/error.log");
const iamport = require("./../../lib/iamport");

// var axios = require("axios");
// const _ = require("lodash");

app.get("/test_test_test", async function (req, res) {
  var data = {
    test: "Test",
  };

  try {
    var selectQuery1 = `
          select
            datname
        from
            pg_database
        where
            datistemplate = false;
        `;

    data = await req.sequelize.query(selectQuery1, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    //console.log(data);

    res.send("Hello love dawn 22 :" + JSON.stringify(data));
  } catch (error) {
    //console.log("PPAP: error", error);
    res.status(403).send({ msg: "wrong", error: error });
  }
});

// 구독 자동 결제  언제 시행될지 타이밍잡기
app.post("/auto-subscript", async (req, res, next) => {
  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "PAY",
      "AUTO.PAY",
      {},
      { language: "sql", indent: "  " }
    );

    const result = await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 인증 토큰 발급 받기
    const getToken = await iamport.getAccessToken();
    const { access_token } = getToken.data.response; // 인증 토큰

    for (const e of result) {
      // 주문번호 발급
      ////console.log(JSON.stringify(e));
      const insertMerchantQuery = req.mybatisMapper.getStatement(
        "PAY",
        "INSERT.MERCHANT.UUID",
        {
          user_id: e.user_id,
          brand_id: e.brand_id,
          customer_uid: e.customer_uid,
          subscript_type: e.subscript_type,
          money: e.subscr_chrge_amt,
        },
        { language: "sql", indent: "  " }
      );

      const [{ merchant_uid }] = await req.sequelize.query(
        insertMerchantQuery,
        {
          type: req.sequelize.QueryTypes.SELECT,
        }
      );

      // 결제(재결제) 요청
      const response = await iamport.paymentAgain({
        merchant_uid,
        customer_uid: e.customer_uid,
        access_token,
        price: e.subscr_chrge_amt,
      });

      const paymentResult = response.data;

      //...
      let {
        code,
        message,
        response: { status },
      } = paymentResult;
      const data = paymentResult.response;

      // test only
      // code = 0;
      // status = "paid";
      // message = "??";
      // test only

      //console.log("message: ", message);

      const insertLogQuery = req.mybatisMapper.getStatement(
        "PAY",
        "INSERT.PAY.LOG",
        {
          code,
          message,
          status,
          merchant_uid,
          data: JSON.stringify(data),
        },
        { language: "sql", indent: "  " }
      );

      await req.sequelize.query(insertLogQuery, {
        type: req.sequelize.QueryTypes.INSERT,
      });

      if (code === 0 && status === "paid") {
        // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요합니다.)
        // + 카드 정상 승인

        const updateSubscriptQuery = req.mybatisMapper.getStatement(
          "PAY",
          "UPDATE.SUBSCRIPT",
          {
            subscr_no: e.subscr_no,
            merchant_uid,
          },
          { language: "sql", indent: "  " }
        );

        await req.sequelize.query(updateSubscriptQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        });
      }
    }

    res.json({ success: true, renew_count: result.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

module.exports = app;
