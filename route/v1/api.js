var express = require("express");
var app = express.Router();

const {
  isNull,
  isNotNull,
  makeEnum,
  isIncludeEnum,
} = require("../../lib/util");
const dateUtil = require("../../lib/dateUtil");
const Message = require("../../lib/message");
const { Op, fn, literal, UUIDV4 } = require("sequelize");
const { sendImageDownload } = require("../../lib/filedown");


app.get("/imgdownload", async function (req, res) {

  /* try {
    res.json({ success: true});
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  } */
  
  const directory = req.query.directory;
  const filename = req.query.filename;
  const full_path = `public/${directory}/${filename}`;
  try {
    const url = await sendImageDownload(req,directory,filename );
    res.json({ success: true, url });    
  } catch (error) {   
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
   
  
}); 

/**
 * @swagger
 * "/user-type":
 *   get:
 *     tags: [login]
 *     summary: "로그인 후 회원 타입 획득"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             is_brand_user:
 *               description: ""
 *               type: boolean
 *               example: true
 *             is_mgzn_user:
 *               description: ""
 *               type: boolean
 *               example: true
 *             is_stylist_user:
 *               description: ""
 *               type: boolean
 *               example: true
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 */
app.get("/user-type", async function (req, res) {
  const user_id = req.user_id;
  const is_brand_user = req.is_brand_user;
  const is_mgzn_user = req.is_mgzn_user;
  const is_stylist_user = req.is_stylist_user;

  if ( is_brand_user ) {
    try {
      const selectQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "SELECT.MY.INFO",
        { user_id },
        { language: "sql", indent: "  " }
      );

      const selectResult = await req.sequelize.query(selectQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      });

      res.json({
        success: true,
        is_brand_user,
        is_mgzn_user,
        is_stylist_user,
        ...selectResult[0],
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: String(error),
      });
    }
  }else{

    const selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "SELECT.MY.INFO",
      { user_id },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    try {
      res.json({
          success: true,
          is_brand_user,
          is_mgzn_user,
          is_stylist_user,
          ...selectResult[0],
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          error: String(error),
      });
  }
  }

  
});

module.exports = app;
