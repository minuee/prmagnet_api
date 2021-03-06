var express = require("express");
var app = express.Router();
var AWS = require("aws-sdk");
/* var s3 = new AWS.S3({
  region: "ap-northeast-1",
}); */
const s3 = new AWS.S3({ 
  accessKeyId: 'AKIAUZDSPFPYVQWRF5WA', 
  secretAccessKey: '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',
  region: "ap-northeast-2",
});

const { sendImageDownload } = require("../../lib/filedown");

const {isNull,isNotNull,makeEnum,isIncludeEnum} = require("../../lib/util");
const dateUtil = require("../../lib/dateUtil");
const Message = require("../../lib/message");
const send = require("../../lib/direct.send");
const { Op, fn, literal, col } = require("sequelize");

app.get("/test", async function (req, res) {
  // var code_type = req.query.code_type;
  try {
    res.json({ success: true });
  } catch (error) {
    res.returnError(error);
  }
});
app.get("/imgdownload", async function (req, res) {  
  const directory = req.query.directory;
  const filename = req.query.filename;
  try {
    const url = await sendImageDownload(req,directory,filename );
    res.json({ success: true, url });
    /* var options = {
      Bucket: "fpr-prod-file",
      Key: full_url
    };
    s3.getObject(options, function (err, data) {
      if ( err) {
        res.status(500).json({
          success: false,
          error: String(err),
        });
      }
      res.attachment(full_url);
      res.send(data.Body);      
    }); */
    /* const full_url = req.query.img_url;
    res.attachment(full_url);
    var file = s3.getObject({
        Bucket: "fpr-prod-file",
        Key: "public/showroomImage/3f324426-1fc0-4dea-a54b-82a352cf8d45.png"
      }).createReadStream()
        .on("error", error => {
          res.status(500).json({
            success: false,
            error: String(error),
          });
        });
    file.pipe(res);
    res.send(file.Body); */
  } catch (error) {   
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
   
  /* 
  try {
    res.json({ success: full_url});
  } catch (error) {
    res.returnError(error);
  } */

  
  /* try {
    var params = {
      Bucket: 'fpr-prod-file', Key: full_url
    }; 
    var file = fs.createWriteStream('https://fpr-prod-file.s3.ap-northeast-2.amazonaws.com/public/showroomImage/3f324426-1fc0-4dea-a54b-82a352cf8d45.png'); 
    s3.getObject(params).createReadStream().pipe(file);
  } catch (error) {   
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
 */
  /* //const fileName = await Math.floor(new Date().getTime());
  const params = { Bucket: "fpr-prod-file", Key: full_url}; 
  try {
    s3.getObject(params, function(err, data) { 
      if (err) {
        res.status(500).json({
          success: false,
          error: String(err),
        });
      } 
      fs.writeFileSync(full_url, data.Body.toString()); 
    });
  } catch (error) {   
    res.status(500).json({
      success: false,
      error: String(error),
    });
  } */

  /* try {
    var params = {Bucket: 'fpr-prod-file', Key: '3f324426-1fc0-4dea-a54b-82a352cf8d45.png'};
    var file = require('fs').createWriteStream(full_url);

    s3.getObject(params).
      on('httpData', function(chunk) { file.write(chunk); }).
      on('httpDone', function() { file.end(); }).
      send();
  } catch (error) {   
    res.status(500).json({
      success: false,
      error: String(error),
    });
  } */

 /*  const fileName = await Math.floor(new Date().getTime());
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`); // ?????? ?????? 
  res.download(full_url); */

  
  /* const file = fs.createWriteStream(full_url);
  let params = {Bucket : 'fpr-prod-file', key: file};
  
  return new Promise((resolve, reject) => {
    s3.getObject(params).createReadStream()
    .on('end', () => {
        return resolve();
    })
    .on('error', (error) => {
        return reject(error);
    }).pipe(file);
  }); */


  /* res.setHeader("content-type", "some/type");
  var params = {Bucket : 'fpr-prod-file', Key : full_url};
  var stream = s3.getObject(params).createReadStream(full_url);
  stream.pipe(res); */
  
}); 
/**
 * @swagger
 * "/brand/position":
 *   get:
 *     tags: [brand]
 *     summary: "????????? ?????? ???????????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "??????. cd_id=?????? ID, CD_NM=?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             list:
 *               description: "??????"
 *               type: array
 *               example: [{"cd_id":"BP0001","cd_nm":"??????"},{"cd_id":"BP0007","cd_nm":"??????"},{"cd_id":"BP0004","cd_nm":"??????"},{"cd_id":"BP0006","cd_nm":"??????"},{"cd_id":"BP0008","cd_nm":"??????"},{"cd_id":"BP0005","cd_nm":"??????"},{"cd_id":"BP0009","cd_nm":"??????"},{"cd_id":"BP0003","cd_nm":"??????"},{"cd_id":"BP0002","cd_nm":"??????"}]
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/brand/position", async function (req, res) {
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.001",
      {},
      { language: "sql", indent: "  " }
    );

    const list = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * @swagger
 * "/brand/search-company":
 *   get:
 *     tags: [brand]
 *     summary: "????????? ???????????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "search_text"
 *         description: "????????? ?????????"
 *         in: query
 *         required: true
 *         type: string
 *         example: "BRAND"
 *     responses:
 *       200:
 *         description: "??????. brand_id=??????????????? ID, COMPY_NM=?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             list:
 *               description: "??????"
 *               type: array
 *               example: [{"brand_id":"BRAND_TEST001","compy_nm":"????????????????????????1","brand_nm":"??????????????????1","brand_nm_kor":null,"brand_logo_url_adres":null,"logo_full_url":null},{"brand_id":"BRAND_TEST002","compy_nm":"????????????????????????2","brand_nm":"??????????????????2","brand_nm_kor":null,"brand_logo_url_adres":"logo.jpg","logo_full_url":"https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/logo.jpg"},{"brand_id":"BRAND_TEST003","compy_nm":"????????????????????????3","brand_nm":"??????????????????3","brand_nm_kor":null,"brand_logo_url_adres":null,"logo_full_url":null},{"brand_id":"BRAND_TEST004","compy_nm":"????????????????????????1","brand_nm":"ABC","brand_nm_kor":null,"brand_logo_url_adres":null,"logo_full_url":null},{"brand_id":"BRAND_TEST005","compy_nm":"????????????????????????1","brand_nm":"BCD","brand_nm_kor":null,"brand_logo_url_adres":null,"logo_full_url":null},{"brand_id":"BRAND_TEST006","compy_nm":"????????????????????????1","brand_nm":"DDDddd","brand_nm_kor":null,"brand_logo_url_adres":null,"logo_full_url":null}]
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/brand/search-company", async function (req, res) {
  try {
    const search_text = isNull(req.query.search_text, null);

    const selectQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.002",
      {
        search_text,
      },
      { language: "sql", indent: "  " }
    );

    ////console.log(Object.keys(req));

    const list = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

/**
 * @swagger
 * "/brand/search-company/a-z":
 *   get:
 *     tags: [brand]
 *     summary: "????????? ???????????? ??????. (????????????)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "??????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             list:
 *               description: "??????"
 *               type: array
 *               example: [{"first_character":"A","each_list":[{"brand_id":"BRAND_TEST004","brand_nm":"ABC","brand_nm_kor":null}]},{"first_character":"B","each_list":[{"brand_id":"BRAND_TEST005","brand_nm":"BCD","brand_nm_kor":null}]},{"first_character":"C","each_list":[]},{"first_character":"D","each_list":[{"brand_id":"BRAND_TEST006","brand_nm":"DDD","brand_nm_kor":null}]},{"first_character":"E","each_list":[]},{"first_character":"F","each_list":[]},{"first_character":"G","each_list":[]},{"first_character":"H","each_list":[]},{"first_character":"I","each_list":[]},{"first_character":"J","each_list":[]},{"first_character":"K","each_list":[]},{"first_character":"L","each_list":[]},{"first_character":"M","each_list":[]},{"first_character":"N","each_list":[]},{"first_character":"O","each_list":[]},{"first_character":"P","each_list":[]},{"first_character":"Q","each_list":[]},{"first_character":"R","each_list":[]},{"first_character":"S","each_list":[]},{"first_character":"T","each_list":[]},{"first_character":"U","each_list":[]},{"first_character":"V","each_list":[]},{"first_character":"W","each_list":[]},{"first_character":"X","each_list":[]},{"first_character":"Y","each_list":[]},{"first_character":"Z","each_list":[]}]
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/brand/search-company/a-z", async function (req, res) {
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.BRAND.LIST.A-Z",
      {},
      { language: "sql", indent: "  " }
    );

    const list = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

/**
 * @swagger
 * "/magazine/position":
 *   get:
 *     tags: [magazine]
 *     summary: "????????? ?????? ???????????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "??????. cd_id=?????? ID, CD_NM=?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             list:
 *               description: "??????"
 *               type: array
 *               example: [{"cd_id":"MP0007","cd_nm":"??????"},{"cd_id":"MP0008","cd_nm":"?????????"},{"cd_id":"MP0009","cd_nm":"??????"},{"cd_id":"MP0011","cd_nm":"????????????"},{"cd_id":"MP0012","cd_nm":"??????"},{"cd_id":"MP0010","cd_nm":"?????????"},{"cd_id":"MP0005","cd_nm":"??????"},{"cd_id":"MP0004","cd_nm":"??????"},{"cd_id":"MP0006","cd_nm":"??????"},{"cd_id":"MP0001","cd_nm":"??????"},{"cd_id":"MP0002","cd_nm":"??????"},{"cd_id":"MP0003","cd_nm":"????????????"}]
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/magazine/position", async function (req, res) {
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.003",
      {},
      { language: "sql", indent: "  " }
    );

    //console.log(Object.keys(req));

    const list = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * @swagger
 * "/magazine/search-company":
 *   get:
 *     tags: [magazine]
 *     summary: "????????? ???????????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "search_text"
 *         description: "????????? ?????????"
 *         in: query
 *         required: true
 *         type: string
 *         example: "BRAND"
 *     responses:
 *       200:
 *         description: "??????. mgzn_id=????????? ?????? ID, COMPY_NM=?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             list:
 *               description: "??????"
 *               type: array
 *               example: [ { "mgzn_id": "MGZN_TEST001", "compy_nm": "????????????????????????1" }, { "mgzn_id": "MGZN_TEST002", "compy_nm": "????????????????????????2" }, { "mgzn_id": "MGZN_TEST003", "compy_nm": "????????????????????????3" } ]
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/magazine/search-company", async function (req, res) {
  try {
    const search_text = isNull(req.query.search_text, null);

    const selectQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.004",
      { search_text },
      { language: "sql", indent: "  " }
    );

    const list = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * @swagger
 * "/stylist/position":
 *   get:
 *     tags: [stylist]
 *     summary: "?????????????????? ?????? ???????????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "??????. cd_id=?????? ID, CD_NM=?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             list:
 *               description: "??????"
 *               type: array
 *               example: [{"cd_id":"SLP001","cd_nm":"??????"},{"cd_id":"SLP002","cd_nm":"??????"},{"cd_id":"SLP003","cd_nm":"??????"}]
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/stylist/position", async function (req, res) {
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.005",
      {},
      { language: "sql", indent: "  " }
    );
    //console.log(selectQuery);
    //console.log("\n\n\n\n\n\n\n");
    const list = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

/**
 * @swagger
 * "/search-team-member":
 *   get:
 *     tags: [team]
 *     summary: "??? ?????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "search_type"
 *         description: "???????????? BRAND. ??????????????? MAGAZINE. ????????????????????? STYLIST"
 *         in: query
 *         required: true
 *         type: string
 *         example: "BRAND"
 *       - name: "brand_id"
 *         description: "????????? ?????? ID. ????????? ????????? ?????? ??????."
 *         in: body
 *         required: false
 *         type: string
 *         example: "BR00011"
 *       - name: "mgzn_id"
 *         description: "????????? ?????? ID. ????????? ????????? ?????? ??????."
 *         in: body
 *         required: false
 *         type: string
 *         example: "BR00011"
 *       - name: "company_nm"
 *         description: "?????????????????? ?????????. ?????????????????? ????????? ?????? ??????."
 *         in: body
 *         required: false
 *         type: string
 *         example: "(???)????????????"
 *     responses:
 *       200:
 *         description: "??????. user_id=????????? ?????????. user_nm=??????. position=??????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             list:
 *               description: "??????"
 *               type: array
 *               example: [{"user_id":"3a27da16-9b06-43a1-964e-70f70acf9806","user_nm":"?????????","position":"??????"}]
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/search-team-member", async function (req, res) {
  const search_type = isNull(req.query.search_type, null);
  const brand_id = isNull(req.query.brand_id, null);
  const mgzn_id = isNull(req.query.mgzn_id, null);
  const compy_nm = isNull(req.query.compy_nm, null);

  let is_brand = false;
  let is_mgzn = false;
  let is_stylist = false;

  switch (search_type) {
    case "BRAND":
      if (brand_id === null) {
        res.status(400).json({
          success: false,
          error: "bad parameter",
        });
        return;
      }
      is_brand = true;
      break;
    case "MAGAZINE":
      if (mgzn_id === null) {
        res.status(400).json({
          success: false,
          error: "bad parameter",
        });
        return;
      }
      is_mgzn = true;
      break;
    case "STYLIST":
      if (compy_nm === null) {
        res.status(400).json({
          success: false,
          error: "bad parameter",
        });
        return;
      }
      is_stylist = true;
      break;
    default:
      res.status(400).json({ success: false, error: "bad parameter" });
      return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.012",
      {
        is_brand,
        is_mgzn,
        is_stylist,
        brand_id,
        mgzn_id,
        compy_nm,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list: selectResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

/**
 * @swagger
 * "/sample/info":
 *   get:
 *     tags: [sample]
 *     summary: "?????? ?????? ?????? ??????."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "??????. season=?????? ?????? ??????. category=???????????? ??????+????????? ??????. gender=?????? ??????. buying=?????? ??????. color=?????? ??????. material=?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             season:
 *               description: "??????"
 *               type: array
 *               example: [{"cd_id":"SS0004","cd_nm":"??????"},{"cd_id":"SS0005","cd_nm":"?????????"},{"cd_id":"SS0008","cd_nm":"??????"},{"cd_id":"SS0010","cd_nm":"??????"},{"cd_id":"SS0002","cd_nm":"???"},{"cd_id":"SS0007","cd_nm":"?????????"},{"cd_id":"SS0009","cd_nm":"?????????"},{"cd_id":"SS0003","cd_nm":"?????????"},{"cd_id":"SS0001","cd_nm":"??????"},{"cd_id":"SS0006","cd_nm":"??????"}]
 *             category:
 *               description: "??????"
 *               type: array
 *               example: [{"sample_catgry_lrge_cl_cd":"SCLC01","sample_catgry_lrge_cl_nm":"RTW","each_list":[{"sample_catgry_middle_cl_cd":"SCMC01","sample_catgry_middle_cl_nm":"Dress"},{"sample_catgry_middle_cl_cd":"SCMC02","sample_catgry_middle_cl_nm":"OuterWear"},{"sample_catgry_middle_cl_cd":"SCMC03","sample_catgry_middle_cl_nm":"Skirt"},{"sample_catgry_middle_cl_cd":"SCMC04","sample_catgry_middle_cl_nm":"Pants & Short"},{"sample_catgry_middle_cl_cd":"SCMC05","sample_catgry_middle_cl_nm":"Top & Shirt"},{"sample_catgry_middle_cl_cd":"SCMC06","sample_catgry_middle_cl_nm":"Denim"},{"sample_catgry_middle_cl_cd":"SCMC07","sample_catgry_middle_cl_nm":"Swatshirt & T-Shirt"},{"sample_catgry_middle_cl_cd":"SCMC08","sample_catgry_middle_cl_nm":"Knitwear"},{"sample_catgry_middle_cl_cd":"SCMC09","sample_catgry_middle_cl_nm":"Underwear/Swimwear"},{"sample_catgry_middle_cl_cd":"SCMC10","sample_catgry_middle_cl_nm":"Active Wear"}],"gender_size_list":null},{"sample_catgry_lrge_cl_cd":"SCLC02","sample_catgry_lrge_cl_nm":"Bag","each_list":[{"sample_catgry_middle_cl_cd":"SCMC11","sample_catgry_middle_cl_nm":"Top Handle Bags"},{"sample_catgry_middle_cl_cd":"SCMC12","sample_catgry_middle_cl_nm":"Tote Bags"},{"sample_catgry_middle_cl_cd":"SCMC13","sample_catgry_middle_cl_nm":"Shoulder Bags"},{"sample_catgry_middle_cl_cd":"SCMC14","sample_catgry_middle_cl_nm":"Crossbody Bags"},{"sample_catgry_middle_cl_cd":"SCMC15","sample_catgry_middle_cl_nm":"Belt Bags & Backpacks"},{"sample_catgry_middle_cl_cd":"SCMC16","sample_catgry_middle_cl_nm":"Mini Bags"},{"sample_catgry_middle_cl_cd":"SCMC17","sample_catgry_middle_cl_nm":"Clutch bags & Portfolios & Briefcases"},{"sample_catgry_middle_cl_cd":"SCMC18","sample_catgry_middle_cl_nm":"Luggages  & Travel Bags"}],"gender_size_list":null},{"sample_catgry_lrge_cl_cd":"SCLC03","sample_catgry_lrge_cl_nm":"Jewelry","each_list":[{"sample_catgry_middle_cl_cd":"SCMC19","sample_catgry_middle_cl_nm":"Ring"},{"sample_catgry_middle_cl_cd":"SCMC20","sample_catgry_middle_cl_nm":"Bracelet"},{"sample_catgry_middle_cl_cd":"SCMC21","sample_catgry_middle_cl_nm":"Earring"},{"sample_catgry_middle_cl_cd":"SCMC22","sample_catgry_middle_cl_nm":"Watches"}],"gender_size_list":null},{"sample_catgry_lrge_cl_cd":"SCLC04","sample_catgry_lrge_cl_nm":"Acessory","each_list":[{"sample_catgry_middle_cl_cd":"SCMC23","sample_catgry_middle_cl_nm":"Belt"},{"sample_catgry_middle_cl_cd":"SCMC24","sample_catgry_middle_cl_nm":"Eyewear"},{"sample_catgry_middle_cl_cd":"SCMC25","sample_catgry_middle_cl_nm":"Tie"},{"sample_catgry_middle_cl_cd":"SCMC26","sample_catgry_middle_cl_nm":"Hat"},{"sample_catgry_middle_cl_cd":"SCMC27","sample_catgry_middle_cl_nm":"Scarf  & Gloves"}],"gender_size_list":null},{"sample_catgry_lrge_cl_cd":"SCLC05","sample_catgry_lrge_cl_nm":"Deco","each_list":[{"sample_catgry_middle_cl_cd":"SCMC28","sample_catgry_middle_cl_nm":"Candle"},{"sample_catgry_middle_cl_cd":"SCMC29","sample_catgry_middle_cl_nm":"Furniture"},{"sample_catgry_middle_cl_cd":"SCMC30","sample_catgry_middle_cl_nm":"Tableware"},{"sample_catgry_middle_cl_cd":"SCMC31","sample_catgry_middle_cl_nm":"Cushion"},{"sample_catgry_middle_cl_cd":"SCMC32","sample_catgry_middle_cl_nm":"Blanket"},{"sample_catgry_middle_cl_cd":"SCMC33","sample_catgry_middle_cl_nm":"Vase"},{"sample_catgry_middle_cl_cd":"SCMC34","sample_catgry_middle_cl_nm":"Tray"}],"gender_size_list":null},{"sample_catgry_lrge_cl_cd":"SCLC06","sample_catgry_lrge_cl_nm":"Shoes","each_list":[{"sample_catgry_middle_cl_cd":"SCMC35","sample_catgry_middle_cl_nm":"Pumps & Mule"},{"sample_catgry_middle_cl_cd":"SCMC36","sample_catgry_middle_cl_nm":"Moccasins & Loafers"},{"sample_catgry_middle_cl_cd":"SCMC37","sample_catgry_middle_cl_nm":"Ballet Flats"},{"sample_catgry_middle_cl_cd":"SCMC38","sample_catgry_middle_cl_nm":"Sandals"},{"sample_catgry_middle_cl_cd":"SCMC39","sample_catgry_middle_cl_nm":"Slippers"},{"sample_catgry_middle_cl_cd":"SCMC40","sample_catgry_middle_cl_nm":"Slide & Thongs Sandals"},{"sample_catgry_middle_cl_cd":"SCMC41","sample_catgry_middle_cl_nm":"Boot & Booties"},{"sample_catgry_middle_cl_cd":"SCMC42","sample_catgry_middle_cl_nm":"Espadrilles & Wedges"},{"sample_catgry_middle_cl_cd":"SCMC43","sample_catgry_middle_cl_nm":"Sneakers"},{"sample_catgry_middle_cl_cd":"SCMC44","sample_catgry_middle_cl_nm":"Lace Up Shoes"},{"sample_catgry_middle_cl_cd":"SCMC45","sample_catgry_middle_cl_nm":"Driving Shoes"}],"gender_size_list":[{"size_list":[{"size_nm":"7 (260)","direct_yn":false,"size_cd_id":"S00001"},{"size_nm":"7.5 (265)","direct_yn":false,"size_cd_id":"S00002"},{"size_nm":"8 (270)","direct_yn":false,"size_cd_id":"S00003"},{"size_nm":"8.5 (275)","direct_yn":false,"size_cd_id":"S00004"},{"size_nm":"9 (280)","direct_yn":false,"size_cd_id":"S00005"},{"size_nm":"9.5 (285)","direct_yn":false,"size_cd_id":"S00006"},{"size_nm":"10 (290)","direct_yn":false,"size_cd_id":"S00007"},{"size_nm":"Others","direct_yn":true,"size_cd_id":"S00008"}],"gender_cd_id":"SSS002"},{"size_list":[{"size_nm":"35.5 (225)","direct_yn":false,"size_cd_id":"S00014"},{"size_nm":"36 (230)","direct_yn":false,"size_cd_id":"S00015"},{"size_nm":"36.5 (235)","direct_yn":false,"size_cd_id":"S00016"},{"size_nm":"37 (240)","direct_yn":false,"size_cd_id":"S00017"},{"size_nm":"37.5 (245)","direct_yn":false,"size_cd_id":"S00018"},{"size_nm":"38 (250)","direct_yn":false,"size_cd_id":"S00019"},{"size_nm":"38.5 (255)","direct_yn":false,"size_cd_id":"S00020"},{"size_nm":"39 (260)","direct_yn":false,"size_cd_id":"S00021"},{"size_nm":"Others","direct_yn":true,"size_cd_id":"S00022"}],"gender_cd_id":"SSS001"}]}]
 *             gender:
 *               description: "??????"
 *               type: array
 *               example: [{"cd_id":"SSS001","cd_nm":"WOMAN"},{"cd_id":"SSS002","cd_nm":"MAN"},{"cd_id":"SSS003","cd_nm":"UNISEX"}]
 *             buying:
 *               description: "??????"
 *               type: array
 *               example: [{"cd_id":"SBS001","cd_nm":"??????"},{"cd_id":"SBS002","cd_nm":"PR??????"},{"cd_id":"SBS003","cd_nm":"?????????"},{"cd_id":"SBS004","cd_nm":"??????"},{"cd_id":"SBS005","cd_nm":"??????"}]
 *             color:
 *               description: "??????"
 *               type: array
 *               example: [{"cd_id":"SCS001","cd_nm":"???"},{"cd_id":"SCS002","cd_nm":"??????"},{"cd_id":"SCS003","cd_nm":"??????"},{"cd_id":"SCS004","cd_nm":"?????????"},{"cd_id":"SCS005","cd_nm":"??????"},{"cd_id":"SCS006","cd_nm":"??????"},{"cd_id":"SCS007","cd_nm":"??????"},{"cd_id":"SCS008","cd_nm":"???"},{"cd_id":"SCS009","cd_nm":"??????"},{"cd_id":"SCS010","cd_nm":"???"},{"cd_id":"SCS011","cd_nm":"???"},{"cd_id":"SCS012","cd_nm":"??????"},{"cd_id":"SCS014","cd_nm":"??????"}]
 *             material:
 *               description: "??????"
 *               type: array
 *               example: [{"cd_id":"MS0001","cd_nm":"???"},{"cd_id":"MS0002","cd_nm":"??????????????????"},{"cd_id":"MS0003","cd_nm":"?????????"},{"cd_id":"MS0004","cd_nm":"??????"},{"cd_id":"MS0005","cd_nm":"??????"},{"cd_id":"MS0006","cd_nm":"??????"},{"cd_id":"MS0007","cd_nm":"?????????"},{"cd_id":"MS0008","cd_nm":"???"},{"cd_id":"MS0009","cd_nm":"????????????"},{"cd_id":"MS0010","cd_nm":"?????????"},{"cd_id":"MS0011","cd_nm":"???"},{"cd_id":"MS0012","cd_nm":"??????"},{"cd_id":"MS0013","cd_nm":"??????"},{"cd_id":"MS0014","cd_nm":"?????????"},{"cd_id":"MS0015","cd_nm":"????????????"},{"cd_id":"MS0016","cd_nm":"????????????"},{"cd_id":"MS0017","cd_nm":"?????????"},{"cd_id":"MS0018","cd_nm":"????????????"}]
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/sample/info", async function (req, res) {
  const brand_id = req.brand_id;
  console.log('brand_idbrand_idbrand_id',brand_id)
  try {
    const selectSeasonQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.006",
      {},
      { language: "sql", indent: "  " }
    );

    const selectCategoryQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.007",
      {},
      { language: "sql", indent: "  " }
    );

    const selectGenderQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.008",
      {},
      { language: "sql", indent: "  " }
    );

    const selectBuyingQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.009",
      {},
      { language: "sql", indent: "  " }
    );

    const selectColorQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.010",
      {},
      { language: "sql", indent: "  " }
    );

    const selectMaterialQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.011",
      {},
      { language: "sql", indent: "  " }
    );

    const [season, category, gender, buying, color, material] =
      await Promise.all([
        req.sequelize.query(selectSeasonQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        }),
        req.sequelize.query(selectCategoryQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        }),
        req.sequelize.query(selectGenderQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        }),
        req.sequelize.query(selectBuyingQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        }),
        req.sequelize.query(selectColorQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        }),
        req.sequelize.query(selectMaterialQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        }),
      ]);

    res.json({
      success: true,
      season,
      category,
      gender,
      buying,
      color,
      material,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

/**
 * @swagger
 * "/login-image":
 *   get:
 *     tags: [image]
 *     summary: "????????? ????????? ???????????????."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "??????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             no_image:
 *               description: ""
 *               type: boolean
 *               example: false
 *             img_adres:
 *               description: ""
 *               type: string
 *               example: "sadhiashdoisa"
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/login-image", async function (req, res) {
  const user_id = req.user_id;

  try {
    const selectLoginImageQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.LOGIN.IMAGE",
      {},
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectLoginImageQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      no_image: selectResult.length === 0,
      img_adres: selectResult[0].img_url_adres,
      full_adres: selectResult[0].full_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/privacy-policy":
 *   get:
 *     tags: [privacy-policy]
 *     summary: "???????????? ???????????? ???????????????."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "??????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             privacy_policy:
 *               description: ""
 *               type: string
 *               example: "?????????????????????????????????."
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/privacy-policy", async function (req, res) {
  const user_id = req.user_id;

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.PRIVACY.POLICY",
      {},
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      privacy_policy: selectResult[0].privacy_policy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * @swagger
 * "/tos":
 *   get:
 *     tags: [tos]
 *     summary: "???????????? ???????????????."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "??????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             tos:
 *               description: ""
 *               type: string
 *               example: "????????????????????????."
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/tos", async function (req, res) {
  const user_id = req.user_id;

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.TOS",
      {},
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      tos: selectResult[0].tos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * @swagger
 * "/lookbook-showroom-list/{lookbook_no}":
 *   get:
 *     tags: [??????]
 *     summary: "????????? ?????? ?????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "share_uuid"
 *         description: "?????? ?????????"
 *         in: path
 *         required: true
 *         type: integer
 *         example: "20210127000002"
 *       - name: "page"
 *         description: "????????? ??????(1?????? ??????). ????????? 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "???????????? ??????(????????? 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: "??????. season_list=???????????? ?????? ??????.(?????? ?????? ????????? ??????.) season_year=????????????. season_cd_id=?????? ?????????. season_text=?????? ?????????. season_simple_text=?????? ????????? ??????. total_count=?????? ?????? ?????? ??????.(????????????). list=????????????. showroom_no=???????????????. showroom_nm=????????????. image_url=?????????????????????. is_new=??????. is_hot=????????????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             season_list:
 *               description: ""
 *               type: array
 *               example: [{"season_year":"2020","season_cd_id":"SS0001","season_text":"Cruise","season_simple_text":"Cruise"}]
 *             total_count:
 *               description: ""
 *               type: integer
 *               example: 5
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"showroom_no":"20210125000010","showroom_nm":"????????? ?????? 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":5,"total_count":5,"is_hot":true},{"showroom_no":"20210125000009","showroom_nm":"????????? ?????? 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":0,"total_count":5,"is_hot":false},{"showroom_no":"20210125000011","showroom_nm":"????????? ?????? 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":0,"total_count":5,"is_hot":false},{"showroom_no":"20210125000012","showroom_nm":"????????? ?????? 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":0,"total_count":5,"is_hot":false},{"showroom_no":"20210127000013","showroom_nm":"????????? ?????? 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":true,"req_count":0,"total_count":5,"is_hot":false}]
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/lookbook-showroom-list/:share_uuid", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const share_uuid = req.params.share_uuid;

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const selectShowroomListQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.LIST",
      {
        offset,
        limit,
        share_uuid,
      },
      { language: "sql", indent: "  " }
    );

    let list = await req.sequelize.query(selectShowroomListQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    list = list.map((e, i) => {
      let is_hot = false;

      if (i < 3 && e.req_count != 0) {
        is_hot = true;
      }

      e.is_hot = is_hot;

      return e;
    });

    res.json({
      success: true,
      total_count: list.length === 0 ? 0 : list[0].total_count,
      list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * @swagger
 * "/lookbook-showroom/{share_uuid}/{showroom_no}":
 *   get:
 *     tags: [??????]
 *     summary: "????????? ?????? ?????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "share_uuid"
 *         description: "?????? ?????????."
 *         in: path
 *         required: true
 *         type: string
 *         example: "23132145"
 *       - name: "showroom_no"
 *         description: "?????? ?????????."
 *         in: path
 *         required: true
 *         type: string
 *         example: "23132145"
 *     responses:
 *       200:
 *         description: "??????. showroom_nm=?????????. prev_showroom_no=????????????. next_showroom_no=????????????. sample_list=????????????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             showroom_nm:
 *               description: ""
 *               type: string
 *               example: "????????? ??????"
 *             season_year:
 *               description: ""
 *               type: string
 *               example: "2020"
 *             season_cd_id:
 *               description: ""
 *               type: string
 *               example: "SS0001"
 *             season_text:
 *               description: ""
 *               type: string
 *               example: "Cruise"
 *             prev_showroom_no:
 *               description: ""
 *               type: string
 *               example: "20210125000009"
 *             next_showroom_no:
 *               description: ""
 *               type: string
 *               example: "20210125000011"
 *             sample_list:
 *               description: ""
 *               type: array
 *               example: [{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "}]
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/lookbook-showroom/:share_uuid/:showroom_no", async (req, res) => {
  const user_id = req.user_id;

  const showroom_no = isNull(req.params.showroom_no, null);
  const share_uuid = isNull(req.params.share_uuid, null);

  if (showroom_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectBrandIdQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "GET.BRAND_ID.FROM.SHOWROOM",
      {
        showroom_no,
      },
      { language: "sql", indent: "  " }
    );

    const [{ brand_id }] = await req.sequelize.query(selectBrandIdQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const selectShowroomQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM",
      {
        showroom_no,
        share_uuid,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectSampleQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SAMPLE.LIST",
      {
        showroom_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const [showroom, sample_list] = await Promise.all([
      req.sequelize.query(selectShowroomQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      }),
      req.sequelize.query(selectSampleQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      }),
    ]);

    res.json({
      success: true,
      ...showroom[0],
      sample_list,
    });
  } catch (error) {
    console.error(JSON.stringify(error));
    res.status(500).json({
      success: false,
      error: String(error),
    });
    //insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/shared-showroom/{share_uuid}":
 *   get:
 *     tags: [??????]
 *     summary: "?????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "share_uuid"
 *         description: "?????? ??????."
 *         in: path
 *         required: true
 *         type: string
 *         example: "23132145"
 *     responses:
 *       200:
 *         description: "??????. showroom_nm=?????????. season_year=????????????. season_cd_id=?????? ?????????. season_text=?????? ?????????. prev_showroom_no=????????????. next_showroom_no=????????????. sample_list=????????????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             showroom_nm:
 *               description: ""
 *               type: string
 *               example: "????????? ??????"
 *             season_year:
 *               description: ""
 *               type: string
 *               example: "2020"
 *             season_cd_id:
 *               description: ""
 *               type: string
 *               example: "SS0001"
 *             season_text:
 *               description: ""
 *               type: string
 *               example: "Cruise"
 *             mfrc_sample_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             prev_showroom_no:
 *               description: ""
 *               type: string
 *               example: "20210125000009"
 *             next_showroom_no:
 *               description: ""
 *               type: string
 *               example: "20210125000011"
 *             sample_list:
 *               description: ""
 *               type: array
 *               example: [{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 1","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"????????? ?????? 2","gender_cd_id":"SSS001","gender_text":"??????","buying_cd_id":"SBS001","buying_text":"?????? ??????","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"???","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"???????????????","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"?????? ??????","caption_korean":"?????? ?????????","brand_id":"BRAND_TEST001","brand_user_no":"1             "}]
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/shared-showroom/:share_uuid", async function (req, res) {
  const user_id = req.user_id;

  const share_uuid = isNull(req.params.share_uuid, null);

  if (share_uuid == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectShowroomNoQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.FROM.SHARE.UUID",
      {
        share_uuid,
      },
      { language: "sql", indent: "  " }
    );

    const [{ showroom_no, brand_id }] = await req.sequelize.query(
      selectShowroomNoQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    const selectShowroomQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM",
      {
        showroom_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectSampleQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SAMPLE.LIST",
      {
        showroom_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const [showroom, sample_list] = await Promise.all([
      req.sequelize.query(selectShowroomQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      }),
      req.sequelize.query(selectSampleQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      }),
    ]);

    res.json({
      success: true,
      ...showroom[0],
      sample_list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * @swagger
 * "/mobile-auth-send":
 *   post:
 *     tags: [signup]
 *     summary: "???????????? ??????(?????????)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "mobile_no"
 *         description: "????????????"
 *         in: body
 *         required: true
 *         type: string
 *         example: "01044444444"
 *     responses:
 *       200:
 *         description: "??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.post("/mobile-auth-send", async function (req, res) {
  const mobile_no = isNull(req.body.mobile_no, null);

  if ([mobile_no].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  var test2;
  const transaction = await req.sequelize.transaction();
  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "CDN",
      "INSERT.MOBILE.AUTH",
      {
        mobile_no,
      },
      { language: "sql", indent: "  " }
    );

    const insertResult = await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });

    const auth_no = insertResult[0].auth_no;

    var test = await send(
      mobile_no,
      `[PR Magnet] ??????????????? ${auth_no}?????????.`
    );
    console.log("ddd", test);
    // await req.sequelize.query(
    //     `insert into tb_error_log(user_id, "error")
    //     values(
    //         :user_id
    //         , :error
    //     )`,
    //     {
    //         replacements: {
    //             user_id: "3a27da16-9b06-43a1-964e-70f70acf9806",
    //             error: test,
    //         },
    //     }
    // );


    res.json({
      success: true,
      //auth_no,
    });
    transaction.commit();
  } catch (error) {
    console.error(error);

    if (transaction) {
      transaction.rollback();
    }
    res.status(500).json({
      success: false,
      error: String(error),

    });
  }
});

app.post("/test", async function (req, res) {
  try {
    var test = await send(
      '01050606165',
      `[PR Magnet] ??????????????? 1111?????????.`
    );
    console.log("ddd", test);
    // await req.sequelize.query(
    //     `insert into tb_error_log(user_id, "error")
    //     values(
    //         :user_id
    //         , :error
    //     )`,
    //     {
    //         replacements: {
    //             user_id: "3a27da16-9b06-43a1-964e-70f70acf9806",
    //             error: test,
    //         },
    //     }
    // );


    res.json({
      success: true,
      //auth_no,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),

    });
  }
});

/**
 * @swagger
 * "/mobile-auth-check":
 *   get:
 *     tags: [signup]
 *     summary: "???????????? ?????? ??????. (????????? ????????? ??????)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "mobile_no"
 *         description: "????????????"
 *         in: query
 *         required: true
 *         type: string
 *         example: "01044444444"
 *       - name: "auth_no"
 *         description: "????????????"
 *         in: query
 *         required: true
 *         type: string
 *         example: "666666"
 *     responses:
 *       200:
 *         description: "??????. auth_success=??????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             auth_success:
 *               description: ""
 *               type: boolean
 *               example: true
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/mobile-auth-check", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const mobile_no = isNull(req.query.mobile_no, null);
  const auth_no = isNull(req.query.auth_no, null);

  if ([mobile_no, auth_no].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "CDN",
      "CHECK.MOBILE.AUTH",
      {
        mobile_no,
        auth_no,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const auth_success =
      checkResult.length === 0 ? false : checkResult[0].auth_success;

    res.json({
      success: true,
      auth_success,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * @swagger
 * "/find-email":
 *   get:
 *     tags: [login]
 *     summary: "????????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "name"
 *         description: "????????????"
 *         in: query
 *         required: true
 *         type: string
 *         example: "01044444444"
 *       - name: "mobile_no"
 *         description: "????????????"
 *         in: query
 *         required: true
 *         type: string
 *         example: "01044444444"
 *       - name: "auth_no"
 *         description: "????????????"
 *         in: query
 *         required: true
 *         type: string
 *         example: "666666"
 *     responses:
 *       200:
 *         description: "??????. email=?????????. reg_dt=????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"email":"test1000@ruu.kr","reg_dt":1617035440}]
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/find-email", async function (req, res) {
  const user_id = req.user_id;

  const name = isNull(req.query.name, null);
  const mobile_no = isNull(req.query.mobile_no, null);
  const auth_no = isNull(req.query.auth_no, null);

  if ([name, mobile_no, auth_no].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "CDN",
      "CHECK.MOBILE.AUTH",
      {
        mobile_no,
        auth_no,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const auth_success =
      checkResult.length === 0 ? false : checkResult[0].auth_success;

    if (auth_success) {
      const selectQuery = req.mybatisMapper.getStatement(
        "CDN",
        "FIND.EMAIL.LIST",
        {
          mobile_no,
          auth_no,
          name,
        },
        { language: "sql", indent: "  " }
      );

      const selectResult = await req.sequelize.query(selectQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      });

      res.json({
        success: true,
        list: selectResult[0].list,
      });
    } else {
      res.json({
        success: false,
        auth_success: false,
      });
    }
  } catch (error) {
    console.error(error);
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
 *     summary: "????????? ??? ?????? ?????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "??????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
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
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/user-type", async function (req, res) {
  const user_id = req.user_id;
  const is_brand_user = req.is_brand_user;
  const is_mgzn_user = req.is_mgzn_user;
  const is_stylist_user = req.is_stylist_user;

  try {
    res.json({
      success: true,
      is_brand_user,
      is_mgzn_user,
      is_stylist_user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

/**
 * @swagger
 * "/press/{share_uuid}":
 *   get:
 *     tags: [????????????]
 *     summary: "???????????? ??????"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "share_uuid"
 *         description: "????????? uuid"
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210126000004"
 *     responses:
 *       200:
 *         description: "??????."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: true
 *             main_img_adres:
 *               description: ""
 *               type: string
 *               example: "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"
 *             monthly_year:
 *               description: ""
 *               type: string
 *               example: "2021"
 *             monthly_month:
 *               description: ""
 *               type: string
 *               example: "3"
 *             title:
 *               description: ""
 *               type: string
 *               example: "??????2"
 *             contents:
 *               description: ""
 *               type: string
 *               example: "??????"
 *             word_file_adres:
 *               description: ""
 *               type: string
 *               example: "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"
 *             link:
 *               description: ""
 *               type: string
 *               example: "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"
 *             add_img_list:
 *               description: ""
 *               type: array
 *               example: ["https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"]
 *       400:
 *         description: "????????? ????????????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 *       500:
 *         description: "?????? ??????"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "?????? ??????"
 *               type: boolean
 *               example: false
 */
app.get("/press/:share_uuid", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const share_uuid = isNull(req.params.share_uuid, null);

  try {
    const selectPressQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.PRESS",
      {
        user_id,
        share_uuid,
      },
      { language: "sql", indent: "  " }
    );

    const selectPressResult = await req.sequelize.query(selectPressQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      ...selectPressResult[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

module.exports = app;
