var express = require("express");
var app = express.Router();

const _ = require("lodash");

const { isNull } = require("../../lib/util");
const insertLog = require("../../lib/error.log");
const axios = require("axios");

const CURRENT_SYSTEM_TYPE = "BRAND";

app.get("/test", async (req, res) => {
  try {
    // await req.sequelize.query(
    //     `update tb_mgzn
    // set
    // mgzn_logo_url_adres =
    // 'public/showroomImage/680ed0e9-8664-4874-9187-34b7e0ea11b1.png'
    // where mgzn_id = '5'`
    // );
  } catch (error) {
    console.error(error);
  }

  res.json({
    magzine_user: await req.sequelize.query(
      `select a.email_adres, a.mgzn_id, b.mgzn_nm, b.mgzn_logo_url_adres from tb_mgzn_user a join tb_mgzn b on a.mgzn_id = b.mgzn_id`,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    ),
  });
});

// 권한제어
app.use((req, res, next) => {
  if (req.is_brand_user == false) {
    res.status(403).json({
      success: false,
      error: "you are not brand user",
    });
    return;
  }

  //console.log("you are brand user");

  next();
});

/**
 * @swagger
 * "/log":
 *   post:
 *     tags: [로그]
 *     summary: "서버에 로그 기록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "error"
 *         description: "에러 객체, 혹은 텍스트"
 *         in: body
 *         required: false
 *         type: string
 *         example: "error: ..."
 *       - name: "desc"
 *         description: "보충 설명"
 *         in: body
 *         required: false
 *         type: string
 *         example: "..."
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
 *             list:
 *               description: "목록"
 *               type: array
 *               example: [{"audition_recruit_no":77,"role_name":"슈퍼맨","each_count":1,"item":[{"age":30,"name":"김까르보나라","height":180,"weight":80,"actor_no":67,"mobile_no":"01044443333","profile_image":"https://wsp-prod-file.s3-ap-northeast-1.amazonaws.com/public/profile/profile.png","audition_apply_no":2}]}]
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

app.post("/log", async function (req, res) {
  const user_id = req.user_id;

  const error = isNull(req.body.error, "");
  const desc = isNull(req.body.desc, "");

  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "INSERT.001",
      {
        user_id,
        system_type: CURRENT_SYSTEM_TYPE,
        error: String(error),
        desc,
        writer: "APP",
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
    });
  } catch (_error) {
    console.error(_error);
    res.status(500).json({
      success: false,
      error: String(_error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, _error);
  }
});

/**
 * @swagger
 * "/push-token":
 *   post:
 *     tags: [푸시알림]
 *     summary: "기기 푸시토큰 등록 (앱 전용)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "token_value"
 *         description: "토큰값"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asdxwfextwerzgr"
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
app.post("/push-token", async function (req, res) {
  const user_id = isNull(req.user_id, null);

  const token_value = isNull(req.body.token_value, null);

  if (token_value == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "INSERT.PUSH.TOKEN",
      {
        user_id,
        user_type: CURRENT_SYSTEM_TYPE,
        token_value,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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

app.get("/sample/info", async function (req, res) {
  const brand_id = req.brand_id;
  console.log('brand_idbrand_idbrand_id',brand_id)
  try {
    const selectSeasonQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.BRAND.SEASON.LIST",
      {brand_id},
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
    res.status(500).json({ success: false,error: String(_error) });
  }
});
/**
 * @swagger
 * "/my-profile":
 *   put:
 *     tags: [프로필]
 *     summary: "내 프로필 수정"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "user_nm"
 *         description: "사용자명"
 *         in: body
 *         required: true
 *         type: string
 *         example: "김마마마"
 *       - name: "post_no"
 *         description: "주소 번호"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 565421
 *       - name: "adres"
 *         description: "주소 텍스트"
 *         in: body
 *         required: true
 *         type: string
 *         example: "서울시 관악구..."
 *       - name: "adres_detail"
 *         description: "상세주소 텍스트"
 *         in: body
 *         required: true
 *         type: string
 *         example: "1층"
 *       - name: "brand_pos_cd"
 *         description: "직급"
 *         in: body
 *         required: true
 *         type: string
 *         example: "mgss"
 *       - name: "phone_no"
 *         description: "전화번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "010-4444-3333"
 *       - name: "team_user_id"
 *         description: "팀 id"
 *         in: body
 *         required: true
 *         type: string
 *         example: "sadsadwqdf312"
 *       - name: "img_url_adres"
 *         description: "프로필 이미지"
 *         in: body
 *         required: false
 *         type: string
 *         example: "/public/asdf/asdsd..."
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
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.put("/my-profile", async function (req, res) {
  const user_id = req.user_id;

  const user_nm = isNull(req.body.user_nm, null);
  const adres = isNull(req.body.adres, null);
  const adres_detail = isNull(req.body.adres_detail, null);
  const post_no = isNull(req.body.post_no, null);
  const brand_pos_cd = isNull(req.body.brand_pos_cd, null);
  const phone_no = isNull(req.body.phone_no, null);
  const team_user_id = isNull(req.body.team_user_id, null);
  const img_url_adres = isNull(req.body.img_url_adres, null);

  if ([user_nm, brand_pos_cd, phone_no].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.MY.PROFILE",
      {
        user_id,
        adres,
        adres_detail,
        post_no,
        user_nm,
        brand_pos_cd,
        phone_no,
        team_user_id,
        img_url_adres,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/qna-list":
 *   get:
 *     tags: [고객문의]
 *     summary: "내 고객문의 목록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *       - name: "search_text"
 *         description: "검색용 텍스트"
 *         in: query
 *         required: false
 *         type: string
 *         example: "으악"
 *     responses:
 *       200:
 *         description: "성공. total_count=전체 항목 개수(카운팅용). list=조회목록. sys_inqry_no: 문의번호. inqry_dt=문의날짜. inqry_subj=문의제목. del_yn=삭제여부. answer_yn=답변여부.total_count=총 개수. no=몇번째 문의인지."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             total_count:
 *               description: "전체 항목 개수"
 *               type: integer
 *               example: 2
 *             list:
 *               description: "목록"
 *               type: array
 *               example: [ { "sys_inqry_no": "20210121000005", "inqry_dt": 1611240971, "inqry_subj": "잘 지내고 있어요?", "del_yn": "N", "answer_yn": true, "total_count": 2, "no": 1 }, { "sys_inqry_no": "20210121000006", "inqry_dt": 1611237371, "inqry_subj": "안녕하세요!", "del_yn": "N", "answer_yn": false, "total_count": 2, "no": 2 }]
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.get("/qna-list", async function (req, res) {
  const user_id = req.user_id;
  const page = isNull(req.query.page, 1);
  const search_text = isNull(req.query.search_text, null);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);
  const brand = true;

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "SELECT.001",
      {
        has_search: search_text != null,
        search_text,
        offset,
        limit,
        user_id,
        brand,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      success: true,
      total_count: selectResult.length == 0 ? 0 : selectResult[0].total_count,
      list: selectResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/qna":
 *   post:
 *     tags: [고객문의]
 *     summary: "문의 생성"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "subject"
 *         description: "문의의 제목"
 *         in: body
 *         required: true
 *         type: string
 *         example: "으악"
 *       - name: "content"
 *         description: "문의의 내용"
 *         in: body
 *         required: true
 *         type: string
 *         example: "안돼"
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
 *             sys_inqry_no:
 *               description: "문의 일련번호"
 *               type: string
 *               example: "20210121000006"
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.post("/qna", async function (req, res) {
  const user_id = req.user_id;
  const subject = isNull(req.body.subject, null); // 제목
  const content = isNull(req.body.content, null);

  if (subject == null || content == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "INSERT.002",
      { user_id, subject, content },
      { language: "sql", indent: "  " }
    );

    const [insertResult] = await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      sys_inqry_no: insertResult.sys_inqry_no,
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
 * "/qna/{sys_inqry_no}":
 *   get:
 *     tags: [고객문의]
 *     summary: "문의 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "sys_inqry_no"
 *         description: "문의 식별자"
 *         in: path
 *         required: true
 *         type: string
 *         example: "2092020209"
 *     responses:
 *       200:
 *         description: "성공. inqry_dt=문의일자. inqry_subj=문의제목. inqry_cntent=문의내용. inqry_user_nm=문의자이름. answer_yn=답변여부. answer_cntent=답변내용. answer_user_nm=답변자이름. answer_dt=답변일자"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             inqry_dt:
 *               description: ""
 *               type: integer
 *               example: 1020302
 *             inqry_subj:
 *               description: ""
 *               type: string
 *               example: "질문 제목"
 *             inqry_cntent:
 *               description: ""
 *               type: string
 *               example: "질문 내용"
 *             inqry_user_nm:
 *               description: ""
 *               type: integer
 *               example: "질문자 이름"
 *             answer_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             answer_cntent:
 *               description: ""
 *               type: string
 *               example: "답변입니다."
 *             answer_user_nm:
 *               description: ""
 *               type: string
 *               example: "김매니저"
 *             answer_dt:
 *               description: ""
 *               type: integer
 *               example: 1020302
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.get("/qna/:sys_inqry_no", async function (req, res) {
  const user_id = req.user_id;
  const sys_inqry_no = isNull(req.params.sys_inqry_no, null);

  if (sys_inqry_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "SELECT.INQRY",
      { user_id, sys_inqry_no },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      ...selectResult[0],
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
 * "/qna-delete":
 *   put:
 *     tags: [고객문의]
 *     summary: "문의 삭제"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "del_list"
 *         description: "삭제할 문의들의 ID"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["20210121000002","20210121000003"]
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
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.put("/qna-delete", async function (req, res) {
  const user_id = req.user_id;
  const del_list = isNull(req.body.del_list, null);
  if ([del_list].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  const transaction = await req.sequelize.transaction();
  try {
    const updateQuery_1 = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.001",
      { del_list, user_id },
      { language: "sql", indent: "  " }
    );
    // //console.log(JSON.stringify(updateQuery));
    const updateResult_1 = await req.sequelize.query(updateQuery_1, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });
    const updateQuery_2 = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.002",
      { del_list },
      { language: "sql", indent: "  " }
    );
    // //console.log(JSON.stringify(updateQuery));
    const updateResult_2 = await req.sequelize.query(updateQuery_2, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });
    transaction.commit();
    res.json({
      success: true,
    });
  } catch (error) {
    transaction.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      // error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

// 실 결제 시작.
/**
 * @swagger
 * "/billings/before":
 *   post:
 *     tags: [결제]
 *     summary: "결제 전 체크"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "subscript_type"
 *         description: "구독 방식 선택. ('MONTH'=월간구독. 'YEAR'=연간구독)"
 *         in: body
 *         required: true
 *         type: string
 *         example: "MONTH"
 *     responses:
 *       200:
 *         description: "성공. already_paid=이미 결제, 구독중인 상태일 경우."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             already_paid:
 *               description: ""
 *               type: boolean
 *               example: false
 *             customer_uid:
 *               description: ""
 *               type: string
 *               example: "8261f6ad-e6e9-a355-a2e7-6b4a9e868608"
 *             merchant_uid:
 *               description: ""
 *               type: string
 *               example: "ec938bf1-801b-8492-6c59-8d7443809f7d"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.post("/billings/before", async (req, res) => {
  let transaction = null;
  try {
    const subscript_type = isNull(req.body.subscript_type, null);
    const brand_id = isNull(req.brand_id, null);
    const user_id = isNull(req.user_id, null);

    if (["MONTH", "YEAR"].includes(subscript_type) == false) {
      res.status(400).json({ success: true, error: "bad parameter" });
      return;
    }

    const checkQuery = req.mybatisMapper.getStatement(
      "PAY",
      "CHECK.PAYABLE",
      {
        user_id,
        brand_id,
        subscript_type,
      },
      { language: "sql", indent: "  " }
    );

    const [{ already_paid }] = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (already_paid) {
      res.json({
        success: true,
        already_paid: true,
      });
      return;
    }

    transaction = await req.sequelize.transaction();

    const insertCustomerQuery = req.mybatisMapper.getStatement(
      "PAY",
      "INSERT.CUSTOMER.UUID",
      {
        user_id,
        brand_id,
        subscript_type,
      },
      { language: "sql", indent: "  " }
    );

    const [{ customer_uid }] = await req.sequelize.query(insertCustomerQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });

    console.error(customer_uid);

    const insertMerchantQuery = req.mybatisMapper.getStatement(
      "PAY",
      "INSERT.MERCHANT.UUID",
      {
        user_id,
        brand_id,
        customer_uid,
        subscript_type,
        money: 0,
      },
      { language: "sql", indent: "  " }
    );

    const [{ merchant_uid }] = await req.sequelize.query(insertMerchantQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });

    await transaction.commit();

    res.json({
      success: true,
      already_paid: false,
      customer_uid,
      merchant_uid,
    });
  } catch (error) {
    console.error(error);
    try {
      if (transaction) {
        await transaction.rollback();
      }
    } catch { }
    res.status(500).json({ success: false, error: String(error) });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

const iamport = require("./../../lib/iamport");

// 실 결제 시작.
/**
 * @swagger
 * "/billings":
 *   post:
 *     tags: [결제]
 *     summary: "자동구독 시작(PG 연동 테스트 필요)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "customer_uid"
 *         description: "쇼룸 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "1202923213"
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
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.post("/billings", async (req, res) => {
  const transaction = await req.sequelize.transaction();
  try {
    const user_id = isNull(req.user_id, null);
    const brand_id = isNull(req.brand_id, null);
    const customer_uid = isNull(req.body.customer_uid, null); // req의 body에서 customer_uid 추출

    if (customer_uid === null) {
      res.status(400).json({ success: true, error: "bad parameter" });
      return;
    }

    // 구독 종류 추출
    const selectSubscriptTypeQuery = req.mybatisMapper.getStatement(
      "PAY",
      "SELECT.SUBSCRIPT_TYPE.FROM.CUSTOMER",
      {
        customer_uid,
      },
      { language: "sql", indent: "  " }
    );

    const [{ subscript_type }] = await req.sequelize.query(
      selectSubscriptTypeQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    // 구독 신청 가능한지 체크
    const checkPayableQuery = req.mybatisMapper.getStatement(
      "PAY",
      "CHECK.PAYABLE",
      {
        brand_id,
        user_id,
        customer_uid,
      },
      { language: "sql", indent: "  " }
    );

    const [{ already_subscript, customer_uid_valid }] =
      await req.sequelize.query(checkPayableQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      });

    // 유효하지 않은 카드정보
    if (customer_uid_valid === false) {
      res.status(400).json({ success: false, error: "bad parameter" });
      return;
    }

    // 이미 구독중일 경우
    if (already_subscript) {
      res.json({
        success: false,
        already_subscript,
        error: "already subscripted",
      });
      return;
    }

    // 체험판 사용가능한지 체크
    const checkTrialQuery = req.mybatisMapper.getStatement(
      "PAY",
      "CHECK.TRIAL",
      {
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const [{ trial_available_yn }] = await req.sequelize.query(
      checkTrialQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    // 월간 or 연간 가격 획득
    const selectPriceQuery = req.mybatisMapper.getStatement(
      "PAY",
      "SELECT.PRICE",
      {
        price_id: subscript_type,
      },
      { language: "sql", indent: "  " }
    );

    let [{ price }] = await req.sequelize.query(selectPriceQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 체험판이면 무료
    price = trial_available_yn ? 0 : price;

    // 체험판 권한 사용
    if (trial_available_yn) {
      const useTrialQuery = req.mybatisMapper.getStatement(
        "PAY",
        "USE.TRIAL",
        {
          brand_id,
        },
        { language: "sql", indent: "  " }
      );

      await req.sequelize.query(useTrialQuery, {
        type: req.sequelize.QueryTypes.SELECT,
        transaction,
      });
    }

    // 인증 토큰 발급 받기
    const getToken = await iamport.getAccessToken();
    const { access_token } = getToken.data.response; // 인증 토큰
    // ...

    // 주문번호 발급
    const insertMerchantQuery = req.mybatisMapper.getStatement(
      "PAY",
      "INSERT.MERCHANT.UUID",
      {
        user_id,
        brand_id,
        customer_uid,
        subscript_type,
        money: price,
      },
      { language: "sql", indent: "  " }
    );

    const [{ merchant_uid }] = await req.sequelize.query(insertMerchantQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });

    console.error("price: ", price);

    // 결제(재결제) 요청
    const response = await iamport.paymentAgain({
      merchant_uid,
      customer_uid,
      access_token,
      price,
    });

    const paymentResult = response.data;

    //...
    const {
      code,
      message,
      response: { status },
    } = paymentResult;
    const data = paymentResult.response;

    // 로깅
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

    if (code === 0) {
      // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요합니다.)
      if (status === "paid") {
        //카드 정상 승인

        // 구독 생성
        const current_subscript = trial_available_yn ? "TRIAL" : subscript_type;

        const insertSubscriptQuery = req.mybatisMapper.getStatement(
          "PAY",
          "INSERT.SUBSCRIPT",
          {
            user_id,
            brand_id,
            customer_uid,
            price,
            subscript_type,
            current_subscript,
            merchant_uid,
          },
          { language: "sql", indent: "  " }
        );

        const [{ subscr_no }] = await req.sequelize.query(
          insertSubscriptQuery,
          {
            type: req.sequelize.QueryTypes.SELECT,
            transaction,
          }
        );

        const updateSubscriptQuery = req.mybatisMapper.getStatement(
          "PAY",
          "UPDATE.SUBSCRIPT",
          {
            subscr_no,
          },
          { language: "sql", indent: "  " }
        );

        await req.sequelize.query(updateSubscriptQuery, {
          type: req.sequelize.QueryTypes.SELECT,
          transaction,
        });

        transaction.commit();
        res.json({
          success: true,
          card_auth_failed: false,
          already_subscript,
          request_failed: false,
        });
      } else {
        //카드 승인 실패 (ex. 고객 카드 한도초과, 거래정지카드, 잔액부족 등)
        //paymentResult.status : failed 로 수신됩니다.
        console.error("카드 승인 실패");
        transaction.rollback();
        res.json({
          success: false,
          card_auth_failed: true,
          already_subscript,
          request_failed: true,
        });
      }
    } else {
      // 카드사 요청에 실패 (paymentResult is null)
      console.error("카드사 요청 실패");
      transaction.rollback();
      res.json({
        success: false,
        card_auth_failed: false,
        already_subscript,
        request_failed: true,
      });
    }
  } catch (error) {
    if (transaction) {
      transaction.rollback();
    }
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/billings/change":
 *   post:
 *     tags: [결제]
 *     summary: "자동구독 방식 변경"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "subscript_type"
 *         description: "구독 방식 선택. ('MONTH'=월간구독. 'YEAR'=연간구독)"
 *         in: body
 *         required: true
 *         type: string
 *         example: "MONTH"
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
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.post("/billings/change", async (req, res) => {
  try {
    const user_id = isNull(req.user_id, null);
    const brand_id = isNull(req.brand_id, null);
    const subscript_type = isNull(req.body.subscript_type, null);

    if (["MONTH", "YEAR"].includes(subscript_type) == false) {
      res.status(400).json({ success: true, error: "bad parameter" });
      return;
    }

    const updateQuery = req.mybatisMapper.getStatement(
      "PAY",
      "CHANGE.AUTO.SUBSCRIPT",
      {
        brand_id,
        subscript_type,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
    });
  } catch (e) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/billings/cancel":
 *   post:
 *     tags: [결제]
 *     summary: "자동구독 취소"
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
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.post("/billings/cancel", async (req, res) => {
  const transaction = await req.sequelize.transaction();
  try {
    const user_id = isNull(req.user_id, null);
    const brand_id = isNull(req.brand_id, null);

    //취소가 당일인지 1년인지등에 대해서 조사필요

    const cancelQuery = req.mybatisMapper.getStatement(
      "PAY",
      "CANCEL.AUTO.SUBSCRIPT",
      {
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(cancelQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    
    res.json({
      success: true,
    });
    transaction.commit();
  } catch (e) {
    console.error(error);
    if (transaction) {
      transaction.rollback();
    }
    res.status(500).json({ success: false, error: String(error) });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/my-info":
 *   get:
 *     tags: [내정보]
 *     summary: "사용자 정보 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "성공. brand_user_nm=유저 이름. brand_id=유저 잡지ID. user_position_id=유저 직급ID. phone_no=유저 전화번호. email_adres=유저 이메일주소. post_no=유저 우편번호. adres=유저 주소. img_url_adres=유저 사진 주소. teammate_id=유저 팀원 일련번호. brand_nm=유저 잡지 이름. company_nm=유저 회사 이름. user_position=유저 직급 이름. teammate_nm=팀원 이름. unread_notifications=읽지 않은 알림 유무. subscr_type=구독 형태 (월결제 등등).  subscr_status=구독 상태 (구독중, 취소 등등). subscr_yn=구독 여부. trial_subscr_available=3개월 체험 구독 가능한지. subscr_begin_dt=구독시작일. subscr_end_dt=구독만료일. subscription_canceled=구독 취소 유무. req_notifi_recv_yn=샘플요청 알림 여부. not_disturb_mode_yn=방해금지 모드 여부. sample_not_recv_notifi_yn=샘플 미수령 알림 여부. not_disturb_begin_dt=방해금지 시작시간. not_disturb_end_dt=방해금지 종료시간"
 *         schema:
 *           type: object
 *           properties:
 *             mgzn_user_nm:
 *               description: "유저 이름"
 *               type: string
 *               example: "최홍만"
 *             mgzn_id:
 *               description: "유저 잡지ID"
 *               type: string
 *               example: "MGZN_TEST001"
 *             user_position_id:
 *               description: "유저 직급ID"
 *               type: string
 *               example: "MP0007"
 *             phone_no:
 *               description: "유저 전화번호"
 *               type: string
 *               example: "01088888888"
 *             email_adres:
 *               description: "유저 이메일"
 *               type: string
 *               example: "sasddf@gmail.com"
 *             post_no:
 *               description: "유저 우편번호"
 *               type: string
 *               example: "06132"
 *             adres:
 *               description: "유저 주소"
 *               type: string
 *               example: "캘리포니아"
 *             img_url_adres:
 *               description: "유저 사진 주소"
 *               type: string
 *               example: "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"
 *             teammate_id:
 *               description: "유저 팀원 일련번호"
 *               type: string
 *               example: "3a27da16-9b06-43a1-964e-70f70acf9806"
 *             mgzn_nm:
 *               description: "유저 잡지 이름"
 *               type: string
 *               example: "테스트매거진1"
 *             company_nm:
 *               description: "유저 회사 이름"
 *               type: string
 *               example: "테스트매거진회사1"
 *             user_position:
 *               description: "유저 직급 이름"
 *               type: string
 *               example: "이사"
 *             teammate_nm:
 *               description: "팀원 이름"
 *               type: string
 *               example: "최홍민"
 *             unread_notifications:
 *               description: "읽지 않은 알림 유무"
 *               type: boolean
 *               example: true
 *             subscr_no:
 *               description: "구독 일련번호"
 *               type: string
 *               example: "20210126000002"
 *             subscr_type:
 *               description: "구독 형태 (월결제 등등)"
 *               type: string
 *               example: "월결제"
 *             subscr_chrge_amt:
 *               description: "구독비용"
 *               type: string
 *               example: "200"
 *             subscr_status:
 *               description: "구독 상태 (구독중, 취소 등등)"
 *               type: string
 *               example: "신청"
 *             payment_complete:
 *               description: "구독 결제 유무"
 *               type: string
 *               example: "N"
 *             subscription_canceled:
 *               description: "구독 취소 유무"
 *               type: string
 *               example: "N"
 *             refund_complet_yn:
 *               description: "환불 완료 유무"
 *               type: string
 *               example: "N"
 *             subscription_ended:
 *               description: "구독 만료 유무"
 *               type: string
 *               example: "N"
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             subscr_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             trial_subscr_available:
 *               description: ""
 *               type: boolean
 *               example: true
 *             subscr_begin_dt:
 *               description: ""
 *               type: integer
 *               example: 12222222
 *             subscr_end_dt:
 *               description: ""
 *               type: integer
 *               example: 12222222
 *             req_notifi_recv_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             sample_not_recv_notifi_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             not_disturb_mode_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             not_disturb_begin_dt:
 *               description: ""
 *               type: integer
 *               example: 12222222
 *             not_disturb_end_dt:
 *               description: ""
 *               type: integer
 *               example: 12222222
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.get("/my-info", async function (req, res) {
  const user_id = req.user_id;

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
      ...selectResult[0],
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

app.use(async function (req, res, next) {
  const user_id = req.user_id;

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

    if (selectResult[0].subscr_yn === false) {
      res.status(403).json({
        success: false,
        not_subscript: true,
        message: "구독이 필요합니다.",
      });
    } else {
      //console.log(">>> 구독됨");
    }

    // res.json({
    //     success: true,
    //     ...selectResult[0],
    // });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }

  next();
});

/**
 * @swagger
 * "/showroom":
 *   post:
 *     tags: [디지털쇼룸]
 *     summary: "쇼룸 및 샘플목록 등록. 여기서의 쇼룸은 기획에서 정의한 샘플입니다. 여러개의 상품을 포함합니다."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_nm"
 *         description: "쇼룸 이름."
 *         in: body
 *         required: true
 *         type: string
 *         example: "# Look 1"
 *       - name: "season_year"
 *         description: "연도"
 *         in: body
 *         required: true
 *         type: string
 *         example: "2021"
 *       - name: "season_cd_id"
 *         description: "시즌 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asfeafweichewoimxhrioeqwxmho"
 *       - name: "season_direct_input"
 *         description: "시즌 직접입력(season_cd_id 생략)"
 *         in: body
 *         required: false
 *         type: string
 *         example: "asfeafweichewoimxhrioeqwxmho"
 *       - name: "mfrc_sample_yn"
 *         description: "주력상품 여부"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: true
 *       - name: "sample_list"
 *         description: "샘플 목록의 오브젝트 배열. 오브젝트 목록은 바로 아래에 서술합니다."
 *         in: body
 *         required: true
 *         type: array
 *         example: [{}]
 *       - name: "sample_list[N].sample_image_list"
 *         description: "업로드한 샘플 이미지 목록. url=링크. img_type=이미지타입(RUNWAY, HR, LR). main_yn=샘플 대표이미지 여부. showroom_main_yn =쇼룸 대표이미지 여부"
 *         in: body
 *         required: true
 *         type: array
 *         example: [{"url": "링크", "img_type":"HR", "main_yn":true}]
 *       - name: "sample_list[N].sample_nm"
 *         description: "샘플명"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asfeafweichewoimxhrioeqwxmho"
 *       - name: "sample_list[N].gender_cd_id"
 *         description: "성별 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SSS001"
 *       - name: "sample_list[N].buying_cd_id"
 *         description: "구매 코드 리스트"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["SBS001"]
 *       - name: "sample_list[N].color_cd_id"
 *         description: "색상 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SCS001"
 *       - name: "sample_list[N].material_cd_id"
 *         description: "재질 코드"
 *         in: body
 *         required: false
 *         type: string
 *         example: "MS0001"
 *       - name: "sample_list[N].size_cd_id"
 *         description: "사이즈코드"
 *         in: body
 *         required: false
 *         type: string
 *         example: null
 *       - name: "sample_list[N].size_direct_input"
 *         description: "사이즈 직접입력"
 *         in: body
 *         required: false
 *         type: string
 *         example: null
 *       - name: "sample_list[N].sample_catgry_middle_cl_cd"
 *         description: "샘플 카테고리 중분류 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SCMC01"
 *       - name: "sample_list[N].sample_catgry_direct_input"
 *         description: "샘플 카테고리 직접입력"
 *         in: body
 *         required: false
 *         type: string
 *         example: null
 *       - name: "sample_list[N].sku"
 *         description: "SKU"
 *         in: body
 *         required: false
 *         type: string
 *         example: "ㅁㄴㅇㄴㄹ"
 *       - name: "sample_list[N].etc"
 *         description: "ETC"
 *         in: body
 *         required: false
 *         type: string
 *         example: "ㅁㄴㅇㄴㄹ"
 *       - name: "sample_list[N].in_yn"
 *         description: "입고여부"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: true
 *       - name: "sample_list[N].caption_korean"
 *         description: "한국어 캡션"
 *         in: body
 *         required: false
 *         type: string
 *         example: "ㅁㄴㅇㄴㄹ"
 *       - name: "sample_list[N].caption_english"
 *         description: "영어 캡션"
 *         in: body
 *         required: false
 *         type: string
 *         example: "ㅁㄴㅇㄴㄹ"
 *       - name: "sample_list[N].price"
 *         description: "상품의 가격"
 *         in: body
 *         required: false
 *         type: integer
 *         example: 10101
 *       - name: "sample_list[N].still_life_img_yn"
 *         description: "Still Life 사진의 유무"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
 *       - name: "sample_list[N].sample_img_yn"
 *         description: "샘플이미지 사진의 유무"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
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
app.post("/showroom", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const showroom_nm = isNull(req.body.showroom_nm, null);
  const season_year = isNull(req.body.season_year, null);
  let season_cd_id = isNull(req.body.season_cd_id, null);
  const season_direct_input = isNull(req.body.season_direct_input, null);
  const mfrc_sample_yn = isNull(req.body.mfrc_sample_yn, false);
  const show_yn = isNull(req.body.show_yn, 'Y');
  const sample_list = isNull(req.body.sample_list, null);
  if ([sample_list].includes(null) || Array.isArray(sample_list) == false ||sample_list.length === 0
  ) {
    res.status(400).json({
      success: false,
      error: "bad parameter: showroom",
    });
    return;
  }

  let transaction = null;
  try {
    transaction = await req.sequelize.transaction();
    if (season_direct_input) {
      const insertQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "INSERT.CUSTOM.SEASON",
        { user_id, brand_id, season_nm: season_direct_input },
        { language: "sql", indent: "  " }
      );

      const [insertResult] = await req.sequelize.query(insertQuery, {
        type: req.sequelize.QueryTypes.SELECT,
        transaction,
      });
      season_cd_id = insertResult.cd_id;
    }

    const insertShowroomQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "INSERT.SHOWROOM",
      {
        user_id,
        showroom_nm,
        sample_list,
        season_year,
        season_cd_id,
        mfrc_sample_yn,
        show_yn
      },
      { language: "sql", indent: "  " }
    );

    const [{ showroom_no }] = await req.sequelize.query(insertShowroomQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });

    const promises = [];
    for (const e of sample_list) {
      const still_life_img_yn = isNull(e.still_life_img_yn, false);
      const sample_img_yn = isNull(e.sample_img_yn, false);
      const sample_image_list = isNull(e.sample_image_list, []);
      //const mfrc_sample_yn = isNull(e.mfrc_sample_yn, null);
      const sample_nm = isNull(e.sample_nm, null);
      const gender_cd_id = isNull(e.gender_cd_id, null);
      const buying_cd_id = isNull(e.buying_cd_id, null);
      const color_cd_id = isNull(e.color_cd_id, null);
      const material_cd_id = isNull(e.material_cd_id, null);
      const size_cd_id = isNull(e.size_cd_id, null);
      const size_direct_input = isNull(e.size_direct_input, null);

      const sample_catgry_middle_cl_cd = isNull(
        e.sample_catgry_middle_cl_cd,
        null
      );
      const sample_catgry_lrge_cl_cd = isNull(e.sample_catgry_lrge_cl_cd, null);

      const sample_catgry_direct_input = isNull(
        e.sample_catgry_direct_input,
        null
      );

      const sku = isNull(e.sku, "");
      const etc = isNull(e.etc, "");
      const wrhousng_yn = isNull(e.in_yn, null);

      const caption_korean = isNull(e.caption_korean, "");
      const caption_english = isNull(e.caption_english, "");

      const price = isNull(e.price, 0);

      if (
        [
          sample_image_list,
          //mfrc_sample_yn,
          sample_nm,
          sample_catgry_middle_cl_cd,
          gender_cd_id,
          buying_cd_id,
          color_cd_id,
          //material_cd_id,
        ].includes(null) ||
        Array.isArray(sample_image_list) == false ||
        sample_image_list.length == 0
      ) {
        await transaction.rollback();
        res.status(400).json({
          success: false,
          error: "bad parameter: imglist1",
        });
        return;
      }

      let main_count = 0;
      for (const e of sample_image_list) {
        if (e.main_yn) {
          main_count++;
        }

        if (
          [e.url, e.img_type, e.main_yn, e.showroom_main_yn].includes(undefined)
        ) {
          res.status(400).json({
            success: false,
            error: "bad parameter: sample_image_list",
          });
          return;
        }
      }

      if (main_count !== 1) {
        res.status(400).json({
          success: false,
          error: "bad parameter: no has main image",
        });
        return;
      }

      const img_list = sample_image_list
        .map(
          (e) =>
            `(
              '${String(e.url).replace("'", "''")}'
              , '${String(e.img_type).replace("'", "''")}'
              , ${e.main_yn === true}
              , ${e.showroom_main_yn === true}
          )`
        )
        .join(", ");

      const insertQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "INSERT.SAMPLE",
        {
          user_id,
          //mfrc_sample_yn,
          season_year,
          season_cd_id,
          sample_nm,
          sample_catgry_middle_cl_cd,
          sample_catgry_lrge_cl_cd,
          sample_catgry_direct_input,
          gender_cd_id,
          buying_cd_id,
          color_cd_id,
          material_cd_id,
          sku,
          etc,
          wrhousng_yn,
          caption_korean,
          caption_english,
          size_cd_id,
          size_direct_input,
          showroom_no,
          img_list,
          price  : (price == null || price == "") ? 0 : price,
          still_life_img_yn,
          sample_img_yn,
        },
        { language: "sql", indent: "  " }
      );

      promises.push(
        req.sequelize.query(insertQuery, {
          type: req.sequelize.QueryTypes.SELECT,
          transaction,
        })
      );
    }

    await Promise.all(promises);

    await transaction.commit();
    res.json({
      success: true,
      showroom_no,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error(error);
    res.status(500).json({
      success: false,
      data : sample_list,
      error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/showroom/{showroom_no}":
 *   get:
 *     tags: [디지털쇼룸]
 *     summary: "쇼룸 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_no"
 *         description: "쇼룸 이름."
 *         in: path
 *         required: true
 *         type: string
 *         example: "23132145"
 *     responses:
 *       200:
 *         description: "성공. showroom_nm=쇼룸명. season_year=시즌연도. season_cd_id=시즌 코드값. season_text=시즌 텍스트. prev_showroom_no=이전쇼룸. next_showroom_no=다음쇼룸. sample_list=샘플목록."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             showroom_nm:
 *               description: ""
 *               type: string
 *               example: "테스트 쇼룸"
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
 *               example: [{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "}]
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
app.get("/showroom/:showroom_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const showroom_no = isNull(req.params.showroom_no, null);
  const is_all = "true";
  if (showroom_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectShowroomQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM",
      {
        showroom_no,
        brand_id,
        is_all
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
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/* 쇼룸 알림 전송 */
app.get("/sendpush/showroom/:showroom_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const showroom_no = isNull(req.params.showroom_no, null);  

  if (showroom_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "INSERT.SHOWROOM.NOTIFICATION",
      {
        brand_id,
        user_id,
        showroom_no,
      },
      { language: "sql", indent: "  " }
    );
    const push_result = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    await Promise.all(
      push_result.map((e) => {
        const token = e.token_value;
        delete e.token_value;
        req.sendMessage(token, e);
      })
    );
    res.json({
      success: true,
      push_result
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

// 쇼룸 전체 공개비공개 처리
app.put("/showroom-allupdate/:gubun", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const gubun = isNull(req.params.gubun, null);  
  const season_year = isNull(req.body.season_year, null);
  const season_cd_id = isNull(req.body.season_cd_id, null);

  
  if (gubun == null || season_year == null || season_cd_id == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.SHOWROOM.SHOW.ALLUPDATE",
      {
        brand_id,
        user_id,
        show_yn : gubun == 'hide' ? 'N' : 'Y',
        season_year,
        season_cd_id,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      brand_id,
      user_id,
      gubun,
      season_year,
      season_cd_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      brand_id,
      user_id,
      gubun,
      season_year,
      season_cd_id,
      error: String(error)
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
  
});

/**
 * @swagger
 * "/showroom/{showroom_no}":
 *   put:
 *     tags: [디지털쇼룸]
 *     summary: "쇼룸 수정 쇼룸 생성과 거의 동일합니다. 대신 기존에 존재하던 목록은 sample_no를 함께 보내고, 새로 생성하는 목록은 생성과 동일하게 보냅니다."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_no"
 *         description: "쇼룸 이름."
 *         in: path
 *         required: true
 *         type: string
 *         example: "23132145"
 *       - name: "showroom_nm"
 *         description: "쇼룸 이름."
 *         in: body
 *         required: true
 *         type: string
 *         example: "# Look 1"
 *       - name: "season_year"
 *         description: "연도"
 *         in: body
 *         required: true
 *         type: string
 *         example: "2021"
 *       - name: "season_cd_id"
 *         description: "시즌 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asfeafweichewoimxhrioeqwxmho"
 *       - name: "season_direct_input"
 *         description: "시즌 직접입력(season_cd_id 생략)"
 *         in: body
 *         required: false
 *         type: string
 *         example: "asfeafweichewoimxhrioeqwxmho"
 *       - name: "mfrc_sample_yn"
 *         description: "주력상품 여부"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: true
 *       - name: "sample_list"
 *         description: "샘플 목록의 오브젝트 배열. 오브젝트 목록은 바로 아래에 서술합니다."
 *         in: body
 *         required: true
 *         type: array
 *         example: [{}]
 *       - name: "sample_list[N].sample_img_yn"
 *         description: "샘플이미지 유무"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: false
 *       - name: "sample_list[N].still_life_img_yn"
 *         description: "Still Life Image 유무"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: false
 *       - name: "sample_list[N].sample_image_list"
 *         description: "업로드한 샘플 이미지 목록. url=링크. img_type=이미지타입(RUNWAY, HR, LR). main_yn= 샘플 대표이미지 여부. showroom_main_yn= 쇼룸 대표이미지 여부"
 *         in: body
 *         required: true
 *         type: array
 *         example: [{"url": "링크", "img_type":"HR", "main_yn":true}]
 *       - name: "sample_list[N].sample_nm"
 *         description: "샘플명"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asfeafweichewoimxhrioeqwxmho"
 *       - name: "sample_list[N].gender_cd_id"
 *         description: "성별 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SSS001"
 *       - name: "sample_list[N].buying_cd_id"
 *         description: "구매 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: ["SBS001"]
 *       - name: "sample_list[N].color_cd_id"
 *         description: "색상 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SCS001"
 *       - name: "sample_list[N].material_cd_id"
 *         description: "재질 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "MS0001"
 *       - name: "sample_list[N].size_cd_id"
 *         description: "사이즈코드"
 *         in: body
 *         required: false
 *         type: string
 *         example: null
 *       - name: "sample_list[N].size_direct_input"
 *         description: "사이즈 직접입력"
 *         in: body
 *         required: false
 *         type: string
 *         example: null
 *       - name: "sample_list[N].sample_catgry_middle_cl_cd"
 *         description: "샘플 카테고리 중분류 코드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SCMC01"
 *       - name: "sample_list[N].sample_catgry_direct_input"
 *         description: "샘플 카테고리 직접입력"
 *         in: body
 *         required: false
 *         type: string
 *         example: null
 *       - name: "sample_list[N].sku"
 *         description: "SKU"
 *         in: body
 *         required: false
 *         type: string
 *         example: "ㅁㄴㅇㄴㄹ"
 *       - name: "sample_list[N].etc"
 *         description: "ETC"
 *         in: body
 *         required: false
 *         type: string
 *         example: "ㅁㄴㅇㄴㄹ"
 *       - name: "sample_list[N].in_yn"
 *         description: "입고여부"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: true
 *       - name: "sample_list[N].caption_korean"
 *         description: "한국어 캡션"
 *         in: body
 *         required: false
 *         type: string
 *         example: "ㅁㄴㅇㄴㄹ"
 *       - name: "sample_list[N].caption_english"
 *         description: "영어 캡션"
 *         in: body
 *         required: false
 *         type: string
 *         example: "ㅁㄴㅇㄴㄹ"
 *       - name: "delete_sample_no_list"
 *         description: "삭제할 샘플들의 샘플번호가 들어간 리스트"
 *         in: body
 *         required: false
 *         type: array
 *         example: ["20210406000099","20210406000100"]
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
app.put("/showroom/:showroom_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const showroom_no = isNull(req.params.showroom_no, null);

  const showroom_nm = isNull(req.body.showroom_nm, null);
  const season_year = isNull(req.body.season_year, null);
  let season_cd_id = isNull(req.body.season_cd_id, null);
  const season_direct_input = isNull(req.body.season_direct_input, null);
  const sample_list = isNull(req.body.sample_list, null);
  const mfrc_sample_yn = isNull(req.body.mfrc_sample_yn, null);
  const show_yn = isNull(req.body.show_yn, 'Y');
  const replacement_showroom = isNull(req.body.replacement_showroom, null);
  const delete_sample_no_list = isNull(req.body.delete_sample_no_list, []);

  if (
    [mfrc_sample_yn, sample_list, season_year].includes(null) ||
    Array.isArray(sample_list) == false ||
    sample_list.length === 0
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  let transaction = null;
  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "CHECK.ACCESSABLE.SHOWROOM",
      {
        showroom_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a showroom you can access.",
      });
      return;
    }
    transaction = await req.sequelize.transaction();

    if (season_direct_input) {
      const insertQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "INSERT.CUSTOM.SEASON",
        { user_id, brand_id, season_nm: season_direct_input },
        { language: "sql", indent: "  " }
      );

      const [insertResult] = await req.sequelize.query(insertQuery, {
        type: req.sequelize.QueryTypes.SELECT,
        transaction,
      });
      season_cd_id = insertResult.cd_id;
    }

    const updateShowroomQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.SHOWROOM",
      {
        user_id,
        showroom_nm,
        sample_list,
        season_year,
        season_cd_id,
        showroom_no,
        mfrc_sample_yn,
        show_yn,
        delete_sample_no_list,
        replacement_showroom,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    //console.log(JSON.stringify({ test: updateShowroomQuery }));

    await req.sequelize.query(updateShowroomQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });

    //console.log(2);

    const promises = [];
    for (const e of sample_list) {
      const sample_no = isNull(e.sample_no, null);
      const still_life_img_yn = isNull(e.still_life_img_yn, false);
      const sample_img_yn = isNull(e.sample_img_yn, false);
      const sample_image_list = isNull(e.sample_image_list, []);

      //const mfrc_sample_yn = isNull(e.mfrc_sample_yn, null);
      const sample_nm = isNull(e.sample_nm, null);
      const gender_cd_id = isNull(e.gender_cd_id, null);
      const buying_cd_id = isNull(e.buying_cd_id, null);
      const color_cd_id = isNull(e.color_cd_id, null);
      const material_cd_id = isNull(e.material_cd_id, null);
      const size_cd_id = isNull(e.size_cd_id, null);
      const size_direct_input = isNull(e.size_direct_input, null);
      const sample_catgry_middle_cl_cd = isNull(
        e.sample_catgry_middle_cl_cd,
        null
      );
      const sample_catgry_lrge_cl_cd = isNull(e.sample_catgry_lrge_cl_cd, null);
      const sample_catgry_direct_input = isNull(
        e.sample_catgry_direct_input,
        null
      );

      const sku = isNull(e.sku, "");
      const etc = isNull(e.etc, "");
      const wrhousng_yn = isNull(e.in_yn, null);

      const caption_korean = isNull(e.caption_korean, "");
      const caption_english = isNull(e.caption_english, "");

      const price = isNull(e.price, null);

      //const delete_yn = isNull(e.delete_yn, false);

      const del_yn = "N";

      if (
        [
          sample_image_list,
          //mfrc_sample_yn,
          sample_nm,
          sample_catgry_middle_cl_cd,
          gender_cd_id,
          buying_cd_id,
          color_cd_id,
        ].includes(null) ||
        Array.isArray(sample_image_list) == false ||
        sample_image_list.length == 0
      ) {
        await transaction.rollback();
        res.status(400).json({
          success: false,
          error: "bad parameter",
        });
        return;
      }

      let main_count = 0;
      for (const e of sample_image_list) {
        if (e.main_yn) {
          main_count++;
        }

        if ([e.url, e.img_type, e.main_yn].includes(undefined)) {
          res.status(400).json({
            success: false,
            error: "bad parameter: sample_image_list",
          });
          return;
        }
      }

      if (main_count !== 1) {
        res.status(400).json({
          success: false,
          error: "bad parameter: no has main image",
        });
        return;
      }

      const img_list = sample_image_list
        .map(
          (e) =>
            `(
                        '${String(e.url).replace("'", "''")}'
                        , '${String(e.img_type).replace("'", "''")}'
                        , ${e.main_yn === true}
                        , ${e.showroom_main_yn === true}
                    )`
        )
        .join(", ");

      //console.log(3);

      const insertQuery = req.mybatisMapper.getStatement(
        "BRAND",
        sample_no == null ? "INSERT.SAMPLE" : "UPDATE.SAMPLE",
        {
          user_id,
          //mfrc_sample_yn,
          season_year,
          season_cd_id,
          sample_nm,
          sample_catgry_middle_cl_cd,
          sample_catgry_lrge_cl_cd,
          sample_catgry_direct_input,
          gender_cd_id,
          buying_cd_id,
          color_cd_id,
          material_cd_id,
          sku,
          etc,
          wrhousng_yn,
          caption_korean,
          caption_english,
          size_cd_id,
          size_direct_input,
          showroom_no,
          img_list,
          still_life_img_yn,
          sample_img_yn,
          price,
          sample_no,
          del_yn,
          showroom_no,
          brand_id
        },
        { language: "sql", indent: "  " }
      );

      promises.push(
        req.sequelize.query(insertQuery, {
          type: req.sequelize.QueryTypes.SELECT,
          transaction,
        })
      );
    }

    await Promise.all(promises);

    await transaction.commit();
    res.json({
      success: true,
      showroom_no,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
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
 * "/showroom/{showroom_no}":
 *   DELETE:
 *     tags: [테스트용]
 *     summary: "쇼룸 삭제"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_no"
 *         description: "삭제할 쇼룸 식별자"
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210121000002"
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
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */

app.delete("/showroom/:showroom_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const showroom_no = isNull(req.params.showroom_no, null);

  if ([showroom_no].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  let transaction = null;
  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "CHECK.ACCESSABLE.SHOWROOM",
      {
        showroom_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a showroom you can access.",
      });
      return;
    }

    transaction = await req.sequelize.transaction();
    const showroomInReqSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.IN.REQ",
      { showroom_no },
      { language: "sql", indent: "  " }
    );
    const showroomInReqSelectResult = await req.sequelize.query(
      showroomInReqSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (showroomInReqSelectResult.valid_count === true) {
      await transaction.rollback();
      res.status(403).json({
        success: false,
        error: "The showroom is in a showroom request.",
      });
      return;
    }

    const showroomInLookbookSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.IN.LOOKBOOK",
      { showroom_no },
      { language: "sql", indent: "  " }
    );
    const showroomInLookbookSelectResult = await req.sequelize.query(
      showroomInLookbookSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (showroomInLookbookSelectResult.valid_count === true) {
      await transaction.rollback();
      res.status(403).json({
        success: false,
        error: "The showroom is in a lookbook.",
      });
      return;
    }

    const showroomDeleteQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "DELETE.SHOWROOM",
      {
        user_id,
        brand_id,
        showroom_no,
      },
      { language: "sql", indent: "  " }
    );

    //console.log(JSON.stringify({ test: updateShowroomQuery }));

    await req.sequelize.query(showroomDeleteQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });

    //console.log(2);

    await transaction.commit();
    res.json({
      success: true,
      showroom_no,
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
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
 * "/showroom-list":
 *   post:
 *     tags: [디지털쇼룸]
 *     summary: "쇼룸 목록 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: body
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: body
 *         required: false
 *         type: integer
 *         example: 10
 *       - name: "season_year"
 *         description: "시즌 연도."
 *         in: body
 *         required: false
 *         type: string
 *         example: "2020"
 *       - name: "season_cd_id"
 *         description: "시즌 코드값."
 *         in: body
 *         required: false
 *         type: string
 *         example: "SS0002"
 *       - name: "gender_list"
 *         description: "성별"
 *         in: body
 *         required: false
 *         type: string
 *         example: ["asdsaf"]
 *       - name: "wrhousng_yn"
 *         description: "샘플 존재여부"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
 *       - name: "still_life_img_yn"
 *         description: "still_life 이미지 존재여부"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
 *       - name: "category_list"
 *         description: ""
 *         in: body
 *         required: false
 *         type: array
 *         example: ["asdsaf"]
 *       - name: "color_list"
 *         description: ""
 *         in: body
 *         required: false
 *         type: array
 *         example: ["asdsaf"]
 *       - name: "size_list"
 *         description: ""
 *         in: body
 *         required: false
 *         type: array
 *         example: ["asdsaf"]
 *       - name: "material_list"
 *         description: ""
 *         in: body
 *         required: false
 *         type: array
 *         example: ["asdsaf"]
 *     responses:
 *       200:
 *         description: "성공. season_list=존재하는 시즌 목록.(시즌 선택 조회에 사용.) season_year=시즌연도. season_cd_id=시즌 코드값. season_text=시즌 텍스트. season_simple_text=시즌 텍스트 축약. total_count=쇼룸 목록 전체 개수.(카운팅용). list=쇼룸목록. showroom_no=쇼룸식별자. showroom_nm=쇼룸이름. image_url=쇼룸대표이미지. is_new=새것. is_hot=왕관표시."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
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
 *               example: [{"showroom_no":"20210125000010","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":5,"total_count":5,"is_hot":true},{"showroom_no":"20210125000009","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":0,"total_count":5,"is_hot":false},{"showroom_no":"20210125000011","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":0,"total_count":5,"is_hot":false},{"showroom_no":"20210125000012","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":0,"total_count":5,"is_hot":false},{"showroom_no":"20210127000013","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":true,"req_count":0,"total_count":5,"is_hot":false}]
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
app.post("/showroom-list", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  let season_year = isNull(req.body.season_year, null);
  let season_cd_id = isNull(req.body.season_cd_id, null);

  const sesaon_input_yn = season_year !== null || season_cd_id !== null;

  const page = isNull(req.body.page, 1);
  const limit = parseInt(isNull(req.body.limit, 10));
  const offset = parseInt((page - 1) * limit);

  //필터
  const gender_list = isNull(req.body.gender_list, null);
  const available_start_dt = isNull(req.body.available_start_dt, null);
  const available_end_dt = isNull(req.body.available_start_dt, null);
  const category_list = isNull(req.body.category_list, []);
  const color_list = isNull(req.body.color_list, []);
  const material_list = isNull(req.body.material_list, []);
  const size_list = isNull(req.body.size_list, []);
  const wrhousng_yn = isNull(req.body.wrhousng_yn, null);
  const still_life_img_yn = isNull(req.body.still_life_img_yn, null);
  try {
    let gender = null;
    if (Array.isArray(gender_list) && gender_list.length !== 0) {
      gender =
        "(" +
        gender_list.map((e) => `'${String(e).replace("'", "''")}'`).join(", ") +
        ")";
    }

    let category = null;
    if (Array.isArray(category_list) && category_list.length !== 0) {
      category ="(" +category_list.map((e) => `'${String(e).replace("'", "''")}'`).join(", ") +")";
    }

    let color = null;
    if (Array.isArray(color_list) && color_list.length !== 0) {
      color =
        "(" +
        color_list.map((e) => `'${String(e).replace("'", "''")}'`).join(", ") +
        ")";
    }

    let material = null;
    if (Array.isArray(material_list) && material_list.length !== 0) {
      material =
        "(" +
        material_list
          .map((e) => `'${String(e).replace("'", "''")}'`)
          .join(", ") +
        ")";
    }

    let size = null;
    if (Array.isArray(size_list) && size_list.length !== 0) {
      size =
        "(" +
        size_list.map((e) => `'${String(e).replace("'", "''")}'`).join(", ") +
        ")";
    }
    let filtercolor = null;
    if (Array.isArray(color_list) && color_list.length !== 0) {
      filtercolor = color_list;
    }  
    var selectSeasonListQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.SEASON.LIST",
      {
        brand_id,
        season_year,
        season_cd_id,
        category,
        filtercolor,
        material,
        size,
        gender,
        available_start_dt,
        available_end_dt,
        wrhousng_yn,
        still_life_img_yn,
      },
      { language: "sql", indent: "  " }
    );
    const season_list = await req.sequelize.query(selectSeasonListQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const recent_season = season_list.length != 0 ? season_list[0] : null;
    const recent_season_year = recent_season ? recent_season.season_year : null;
    const recent_season_cd_id = recent_season
      ? recent_season.season_cd_id
      : null;

    if (!sesaon_input_yn) {
      season_year = recent_season_year;
      season_cd_id = recent_season_cd_id;
    }
  
    var selectShowroomListQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.LIST",
      {
        brand_id,
        offset,
        limit,
        season_year,
        season_cd_id,
        category,
        filtercolor,
        material,
        size,
        gender,
        available_start_dt,
        available_end_dt,
        wrhousng_yn,
        still_life_img_yn,
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
      category_list,
      season_list,
      total_count: list.length === 0 ? 0 : list[0].total_count,
      next_page:
        (list.length == 0 ? 0 : list[0].total_count) / limit <= page
          ? null
          : parseInt(page, 10) + 1,
      list,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
      selectSeasonListQuery,
      selectShowroomListQuery,
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/lookbook-showroom-list/{lookbook_no}":
 *   get:
 *     tags: [룩북]
 *     summary: "룩북의 쇼룸 목록 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "lookbook_no"
 *         description: "룩북 식별자"
 *         in: path
 *         required: true
 *         type: integer
 *         example: "20210127000002"
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: "성공. total_count=쇼룸 목록 전체 개수.(카운팅용). list=쇼룸목록. showroom_no=쇼룸식별자. showroom_nm=쇼룸이름. image_url=쇼룸대표이미지. is_new=새것. is_hot=왕관표시."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             total_count:
 *               description: ""
 *               type: integer
 *               example: 5
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"showroom_no":"20210125000010","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":5,"total_count":5,"is_hot":true},{"showroom_no":"20210125000009","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":0,"total_count":5,"is_hot":false},{"showroom_no":"20210125000011","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":0,"total_count":5,"is_hot":false},{"showroom_no":"20210125000012","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":false,"req_count":0,"total_count":5,"is_hot":false},{"showroom_no":"20210127000013","showroom_nm":"테스트 쇼룸 1","image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","is_new":true,"req_count":0,"total_count":5,"is_hot":false}]
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
app.get("/lookbook-showroom-list/:lookbook_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const lookbook_no = req.params.lookbook_no;

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  // if (showroom_no == null) {
  //     res.status(400).json({ success: false, error: "bad parameter" });
  //     return;
  // }

  try {
    const selectShowroomListQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.LIST",
      {
        brand_id,
        offset,
        limit,
        lookbook_no,
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

    const selectLookbookQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.LOOKBOOK",
      {
        lookbook_no,
      },
      { language: "sql", indent: "  " }
    );

    const selectLookbookResult = await req.sequelize.query(
      selectLookbookQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      success: true,
      ...selectLookbookResult[0],
      total_count: list.length === 0 ? 0 : list[0].total_count,
      list,
      next_page:
        (list.length == 0 ? 0 : list[0].total_count) / limit <= page
          ? null
          : parseInt(page, 10) + 1,
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
 * "/lookbook-showroom/{lookbook_no}/{showroom_no}":
 *   get:
 *     tags: [룩북]
 *     summary: "룩북의 쇼룸 개별 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "lookbook_no"
 *         description: "룩북 식별자."
 *         in: path
 *         required: true
 *         type: string
 *         example: "23132145"
 *       - name: "showroom_no"
 *         description: "쇼룸 식별자."
 *         in: path
 *         required: true
 *         type: string
 *         example: "23132145"
 *     responses:
 *       200:
 *         description: "성공. showroom_nm=쇼룸명. season_year=시즌연도. season_cd_id=시즌 코드값. season_text=시즌 텍스트. prev_showroom_no=이전쇼룸. next_showroom_no=다음쇼룸. sample_list=샘플목록."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             showroom_nm:
 *               description: ""
 *               type: string
 *               example: "테스트 쇼룸"
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
 *               example: [{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":["SBS001"],"buying_text":["국내 바잉"],"color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "}]
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
app.get("/lookbook-showroom/:lookbook_no/:showroom_no", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const showroom_no = isNull(req.params.showroom_no, null);
  const lookbook_no = isNull(req.params.lookbook_no, null);

  if (showroom_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectLookbookQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.LOOKBOOK",
      {
        lookbook_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );
    const is_all = "";
    const selectShowroomQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM",
      {
        showroom_no,
        lookbook_no,
        brand_id,
        is_all
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

    const [showroom, sample_list, lookbook] = await Promise.all([
      req.sequelize.query(selectShowroomQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      }),
      req.sequelize.query(selectSampleQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      }),
      req.sequelize.query(selectLookbookQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      }),
    ]);

    res.json({
      success: true,
      ...showroom[0],
      sample_list,
      lookbook_nm: lookbook[0].lookbook_nm,
      lookbookData : lookbook[0]
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
 * "/lookbook":
 *   post:
 *     tags: [룩북]
 *     summary: "룩북 등록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "lookbook_nm"
 *         description: "룩북 이름."
 *         in: body
 *         required: true
 *         type: string
 *         example: "# Look 1"
 *       - name: "showroom_list"
 *         description: "룩북 식별자 목록"
 *         in: body
 *         required: true
 *         type: string
 *         example: ["20210125000009", "20210125000010"]
 *       - name: "season_cd_id"
 *         description: "시즌 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SS0001"
 *       - name: "gender_cd_id"
 *         description: "성별 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SSS001"
 *       - name: "made_for"
 *         description: "대상 매거진"
 *         in: body
 *         required: false
 *         type: string
 *         example: "BAZZAR"
 *       - name: "made_for_mgzn_id"
 *         description: "매거진 식별자. (삭제예정)"
 *         in: body
 *         required: false
 *         type: string
 *         example: "MGZN_TEST001"
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
app.post("/lookbook", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const lookbook_nm = isNull(req.body.lookbook_nm, null);
  const showroom_list = isNull(req.body.showroom_list, []);
  const season_cd_id = isNull(req.body.season_cd_id, null);
  const gender_cd_id = isNull(req.body.gender_cd_id, null);
  const made_for = isNull(req.body.made_for, null);
  const made_for_mgzn_id = isNull(req.body.made_for_mgzn_id, null);

  if (
    [lookbook_nm, gender_cd_id, season_cd_id].includes(null) ||
    Array.isArray(showroom_list) == false ||
    showroom_list.length === 0
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  const list = showroom_list
    .map((e) => `('${String(e).replace("'", "''")}')`)
    .join(", ");

  //console.error(list);

  try {
    const insertLookbookQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "INSERT.LOOKBOOK",
      {
        user_id,
        brand_id,
        brand_user_no,
        lookbook_nm,
        list,
        gender_cd_id,
        season_cd_id,
        made_for_mgzn_id,
        made_for,
      },
      { language: "sql", indent: "  " }
    );

    const [{ lookbook_no }] = await req.sequelize.query(insertLookbookQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      lookbook_no,
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
 * "/lookbook/{lookbook_no}/share-uuid":
 *   get:
 *     tags: [룩북]
 *     summary: "룩북 링크 공유용 UUID 조회. domain/cdn/v1/cdn/lookbook-showroom-list/:share_uuid 와 연결"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "lookbook_no"
 *         description: "룩북 식별자."
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210125000009"
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
 *             share_uuid:
 *               description: "성공 여부"
 *               type: string
 *               example: "..."
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
app.get("/lookbook/:lookbook_no/share-uuid", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const lookbook_no = isNull(req.params.lookbook_no, null);

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.LOOKBOOK.SHARE.UUID",
      {
        user_id,
        lookbook_no,
      },
      { language: "sql", indent: "  " }
    );

    const [{ share_uuid }] = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      share_uuid,
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
 * "/showroom/{showroom_no}/share-uuid":
 *   get:
 *     tags: [룩북]
 *     summary: "쇼룸 링크 공유용 UUID 조회. domain/cdn/v1/cdn/shared-showroom/:share_uuid 와 연결"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_no"
 *         description: "쇼룸 식별자."
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210125000009"
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
 *             share_uuid:
 *               description: "성공 여부"
 *               type: string
 *               example: "..."
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
app.get("/showroom/:showroom_no/share-uuid", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const showroom_no = isNull(req.params.showroom_no, null);

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.SHARE.UUID",
      {
        user_id,
        showroom_no,
      },
      { language: "sql", indent: "  " }
    );

    const [{ share_uuid }] = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      share_uuid,
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
 * "/lookbook-share/send-email":
 *   post:
 *     tags: [룩북]
 *     summary: "룩북 공유 - 이메일 전송 (미구현)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "link"
 *         description: "룩북 공유용 링크"
 *         in: body
 *         required: true
 *         type: string
 *         example: "# Look 1"
 *       - name: "showroom_list"
 *         description: "룩북 식별자 목록"
 *         in: body
 *         required: true
 *         type: string
 *         example: ["20210125000009", "20210125000010"]
 *       - name: "season_cd_id"
 *         description: "시즌 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SS0001"
 *       - name: "gender_cd_id"
 *         description: "성별 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SSS001"
 *       - name: "made_for_mgzn_id"
 *         description: "매거진 식별자"
 *         in: body
 *         required: false
 *         type: string
 *         example: "MGZN_TEST001"
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
app.post("/lookbook-share/send-email", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const lookbook_nm = isNull(req.body.lookbook_nm, null);
  const showroom_list = isNull(req.body.showroom_list, []);
  const season_cd_id = isNull(req.body.season_cd_id, null);
  const gender_cd_id = isNull(req.body.gender_cd_id, null);
  const made_for_mgzn_id = isNull(req.body.made_for_mgzn_id, []);

  if (
    [lookbook_nm, gender_cd_id, season_cd_id].includes(null) ||
    Array.isArray(showroom_list) == false ||
    showroom_list.length === 0
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  const list =
    "(" +
    showroom_list.map((e) => `'${String(e).replace("'", "''")}'`).join(", ") +
    ")";

  try {
    const insertLookbookQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "INSERT.LOOKBOOK",
      {
        user_id,
        brand_id,
        brand_user_no,
        lookbook_nm,
        list,
        gender_cd_id,
        season_cd_id,
        made_for_mgzn_id,
      },
      { language: "sql", indent: "  " }
    );

    const [{ lookbook_no }] = await req.sequelize.query(insertLookbookQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      lookbook_no,
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
 * "/lookbook/{lookbook_no}":
 *   put:
 *     tags: [룩북]
 *     summary: "룩북 수정"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "lookbook_no"
 *         description: "룩북 식별자."
 *         in: path
 *         required: true
 *         type: string
 *         example: "# Look 1"
 *       - name: "lookbook_nm"
 *         description: "쇼룸 이름."
 *         in: body
 *         required: true
 *         type: string
 *         example: "# Look 1"
 *       - name: "remove_showroom_list"
 *         description: "삭제할 쇼룸 식별자 목록"
 *         in: body
 *         required: true
 *         type: string
 *         example: ["20210125000010", "20210125000010"]
 *       - name: "season_cd_id"
 *         description: "시즌 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SS0001"
 *       - name: "gender_cd_id"
 *         description: "성별 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "SSS001"
 *       - name: "made_for"
 *         description: "대상 매거진"
 *         in: body
 *         required: false
 *         type: string
 *         example: "BAZZAR"
 *       - name: "made_for_mgzn_id"
 *         description: "매거진 식별자"
 *         in: body
 *         required: false
 *         type: string
 *         example: "MGZN_TEST001"
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
app.put("/lookbook/:lookbook_no", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const lookbook_no = req.params.lookbook_no;

  const lookbook_nm = isNull(req.body.lookbook_nm, null);
  const remove_showroom_list = isNull(req.body.remove_showroom_list, []);
  const season_cd_id = isNull(req.body.season_cd_id, null);
  const gender_cd_id = isNull(req.body.gender_cd_id, null);
  const made_for = isNull(req.body.made_for, null);
  const made_for_mgzn_id = isNull(req.body.made_for_mgzn_id, null);

  if (
    [lookbook_nm, gender_cd_id, season_cd_id].includes(null) ||
    Array.isArray(remove_showroom_list) == false
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  const list = remove_showroom_list
    .map((e) => `('${String(e).replace("'", "''")}')`)
    .join(", ");

  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "CHECK.ACCESSABLE.LOOKBOOK",
      {
        lookbook_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a lookbook you can access.",
      });
      return;
    }

    const updateLookbookQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.LOOKBOOK",
      {
        user_id,
        brand_id,
        brand_user_no,
        lookbook_nm,
        list,
        gender_cd_id,
        season_cd_id,
        made_for_mgzn_id,
        made_for,
        lookbook_no,
        remove: remove_showroom_list.length !== 0,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateLookbookQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      lookbook_no,
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
 * "/lookbook-delete":
 *   put:
 *     tags: [룩북]
 *     summary: "룩북 수정"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "lookbook_no_list"
 *         description: "룩북 식별자 목록"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["130293423", "213219382", "21321321"]
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
app.put("/lookbook-delete", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const lookbook_no_list = isNull(req.body.lookbook_no_list, []);

  if (
    [lookbook_no_list].includes(null) ||
    Array.isArray(lookbook_no_list) == false ||
    lookbook_no_list.length == 0
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const promises = [];

    for (const lookbook_no of lookbook_no_list) {
      const checkQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "CHECK.ACCESSABLE.LOOKBOOK",
        {
          lookbook_no,
          brand_id,
        },
        { language: "sql", indent: "  " }
      );

      const checkResult = await req.sequelize.query(checkQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      });

      if (checkResult.length === 0 || checkResult[0].accessable == false) {
        res.status(403).json({
          success: false,
          error: "It's not a press you can access.",
        });
        return;
      }

      const deleteLookbookQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "DELETE.LOOKBOOK",
        {
          user_id,
          lookbook_no,
        },
        { language: "sql", indent: "  " }
      );

      promises.push(
        req.sequelize.query(deleteLookbookQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        })
      );
    }

    await Promise.all(promises);

    res.json({
      success: true,
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
 * "/lookbook-list":
 *   get:
 *     tags: [룩북]
 *     summary: "룩북목록 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *       - name: "search_text"
 *         description: "검색용 텍스트"
 *         in: query
 *         required: false
 *         type: string
 *         example: "2321"
 *     responses:
 *       200:
 *         description: "성공. total_count=룩북 목록 전체 개수.(카운팅용). list=룩북목록."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
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
 *               example: [{"lookbook_no":"20210127000002","lookbook_nm":"테스트 룩북 1","date_created":1611733619,"season":null,"gender":null,"made_for":null,"total_count":3},{"lookbook_no":"20210128000003","lookbook_nm":"테스트 룩북 1","date_created":1611800405,"season":"Cruise","gender":"여성","made_for":"테스트매거진1","total_count":3},{"lookbook_no":"20210128000004","lookbook_nm":"테스트 룩북 2","date_created":1611808960,"season":"Cruise","gender":"여성","made_for":"테스트매거진1","total_count":3}]
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
app.get("/lookbook-list", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const selectListQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.LOOKBOOK.LIST",
      {
        brand_id,
        search_text,
        limit,
        offset,
      },
      { language: "sql", indent: "  " }
    );

    const list = await req.sequelize.query(selectListQuery, {
      type: req.sequelize.QueryTypes.SELECT,
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
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/press":
 *   post:
 *     tags: [보도자료]
 *     summary: "보도자료 등록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "main_img_adres"
 *         description: "메인 이미지 주소."
 *         in: body
 *         required: true
 *         type: string
 *         example: "https://sadniqwednkqwodmqw"
 *       - name: "title"
 *         description: "제목"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asdasf"
 *       - name: "contents"
 *         description: "내용"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asfeafweichewoimxhrioeqwxmho"
 *       - name: "word_file_adres"
 *         description: "업로드한 워드 파일 주소"
 *         in: body
 *         required: false
 *         type: string
 *         example: "https://dsaedqwewq"
 *       - name: "monthly_year"
 *         description: "연도"
 *         in: body
 *         required: true
 *         type: string
 *         example: "2020"
 *       - name: "monthly_month"
 *         description: "달"
 *         in: body
 *         required: true
 *         type: string
 *         example: "11"
 *       - name: "link"
 *         description: "입력 링크"
 *         in: body
 *         required: true
 *         type: string
 *         example: "https://asdbiujqwbdiqwdbuiwqb"
 *       - name: "add_img_list"
 *         description: "업로드한 샘플 이미지의 URL 배열"
 *         in: body
 *         required: false
 *         type: array
 *         example: ["https://sdadsda..."]
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
app.post("/press", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;
  
  const main_img_adres = isNull(req.body.main_img_adres, null);
  const title = isNull(req.body.title, null);
  const contents = isNull(req.body.contents, null);
  const word_file_adres = isNull(req.body.word_file_adres, null);
  const monthly_year = isNull(req.body.monthly_year, null);
  const monthly_month = isNull(req.body.monthly_month, null);
  const link = isNull(req.body.link, null);
  const inquiry_charge = isNull(req.body.inquiry_charge, null);
  const inquiry_email = isNull(req.body.inquiry_email, null);
  const inquiry_tel = isNull(req.body.inquiry_tel, null);
  const show_yn = isNull(req.body.show_yn, null);
  const add_img_list = isNull(req.body.add_img_list, []);

  if (
    [main_img_adres, title, contents, monthly_year, monthly_month].includes(
      null
    ) ||
    Array.isArray(add_img_list) == false
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  let transatcion = null;
  try {
    transatcion = await req.sequelize.transaction();
    const insertPressQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "INSERT.PRESS",
      {
        user_id,
        main_img_adres,
        title,
        contents,
        monthly_year,
        monthly_month,
        word_file_adres,
        link,
        inquiry_charge,
        inquiry_email,
        inquiry_tel,
        show_yn,
        brand_id,
        brand_user_no,
      },
      { language: "sql", indent: "  " }
    );

    const [{ brand_press_no }] = await req.sequelize.query(insertPressQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transatcion,
    });

    if (add_img_list.length !== 0) {
      const list = add_img_list
        .map((e) => `('${String(e).replace("'", "''")}')`)
        .join(", ");

      const insertImageQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "INSERT.PRESS.IMAGE",
        {
          brand_press_no,
          add_img_list,
        },
        { language: "sql", indent: "  " }
      );

      await req.sequelize.query(insertImageQuery, {
        type: req.sequelize.QueryTypes.SELECT,
        transatcion,
      });
    }
    if ( show_yn === 'Y' ) {
      const insertNotifyQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "INSERT.PRESS.NOTIFY",
        {
          user_id,
          brand_press_no,
          brand_id,
          brand_user_no,
        },
        { language: "sql", indent: "  " }
      );

      await req.sequelize.query(insertNotifyQuery, {
        type: req.sequelize.QueryTypes.SELECT,
        transatcion,
      });
    }

    await transatcion.commit();
    res.json({
      success: true,
      brand_press_no,
    });
  } catch (error) {
    if (transatcion) {
      transatcion.rollback();
    }
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
 * "/press/{brand_press_no}":
 *   get:
 *     tags: [보도자료]
 *     summary: "보도자료 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_press_no"
 *         description: "메인 이미지 주소."
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210126000004"
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
 *               example: "제목2"
 *             contents:
 *               description: ""
 *               type: string
 *               example: "내용"
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
app.get("/press/:brand_press_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const brand_press_no = isNull(req.params.brand_press_no, null);

  try {
    const selectPressQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.PRESS",
      {
        user_id,
        brand_press_no,
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

/**
 * @swagger
 * "/press/{brand_press_no}/share-uuid":
 *   get:
 *     tags: [보도자료]
 *     summary: "보도자료 공유"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_press_no"
 *         description: "보도자료 식별자"
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210126000004"
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
 *             share_uuid:
 *               description: "성공 여부"
 *               type: string
 *               example: "..."
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
app.get("/press/:brand_press_no/share-uuid", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const brand_press_no = isNull(req.params.brand_press_no, null);

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.PRESS.SHARE.UUID",
      {
        user_id,
        brand_press_no,
      },
      { language: "sql", indent: "  " }
    );

    const [{ share_uuid }] = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      share_uuid,
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
 * "/press/{brand_press_no}":
 *   put:
 *     tags: [보도자료]
 *     summary: "보도자료 수정"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_press_no"
 *         description: "메인 이미지 주소."
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210126000004"
 *       - name: "main_img_adres"
 *         description: "메인 이미지 주소."
 *         in: body
 *         required: true
 *         type: string
 *         example: "https://sadniqwednkqwodmqw"
 *       - name: "title"
 *         description: "제목"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asdasf"
 *       - name: "contents"
 *         description: "내용"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asfeafweichewoimxhrioeqwxmho"
 *       - name: "word_file_adres"
 *         description: "업로드한 워드 파일 주소"
 *         in: body
 *         required: false
 *         type: string
 *         example: "https://dsaedqwewq"
 *       - name: "monthly_year"
 *         description: "연도"
 *         in: body
 *         required: true
 *         type: string
 *         example: "2020"
 *       - name: "monthly_month"
 *         description: "달"
 *         in: body
 *         required: true
 *         type: string
 *         example: "11"
 *       - name: "link"
 *         description: "입력 링크"
 *         in: body
 *         required: true
 *         type: string
 *         example: "https://asdbiujqwbdiqwdbuiwqb"
 *       - name: "add_img_list"
 *         description: "업로드한 샘플 이미지의 URL 배열"
 *         in: body
 *         required: false
 *         type: array
 *         example: ["https://sdadsda..."]
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
app.put("/press/:brand_press_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const brand_press_no = isNull(req.params.brand_press_no, null);

  const main_img_adres = isNull(req.body.main_img_adres, null);
  const title = isNull(req.body.title, null);
  const contents = isNull(req.body.contents, null);
  const word_file_adres = isNull(req.body.word_file_adres, null);
  const monthly_year = isNull(req.body.monthly_year, null);
  const monthly_month = isNull(req.body.monthly_month, null);
  const link = isNull(req.body.link, null);
  const inquiry_charge = isNull(req.body.inquiry_charge, null);
  const inquiry_email = isNull(req.body.inquiry_email, null);
  const inquiry_tel = isNull(req.body.inquiry_tel, null);
  const show_yn = isNull(req.body.show_yn, null);
  const add_img_list = isNull(req.body.add_img_list, []);

  if (
    [main_img_adres, title, contents, monthly_year, monthly_month].includes( null ) ||
    Array.isArray(add_img_list) == false
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  let transatcion = null;
  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "CHECK.ACCESSABLE.PRESS",
      {
        brand_press_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a press you can access.",
      });
      return;
    }

    transatcion = await req.sequelize.transaction();
    const updatePressQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.PRESS",
      {
        brand_press_no,
        user_id,
        main_img_adres,
        title,
        contents,
        monthly_year,
        monthly_month,
        word_file_adres,
        link,
        inquiry_charge,
        inquiry_email,
        inquiry_tel,
        show_yn,
        brand_id,
        brand_user_no,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updatePressQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transatcion,
    });

    if (add_img_list.length > 0) {
      /* const list = add_img_list
        .map((e) => `('${String(e).replace("'", "''")}')`)
        .join(", ");

         */
      const insertImageQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "INSERT.PRESS.IMAGE",
        {
          brand_press_no,
          add_img_list,
        },
        { language: "sql", indent: "  " }
      );

      await req.sequelize.query(insertImageQuery, {
        type: req.sequelize.QueryTypes.SELECT,
        transatcion,
      });
    }

    await transatcion.commit();

    res.json({
      success: true,
      add_img_list
    });
  } catch (error) {
    if (transatcion) {
      transatcion.rollback();
    }
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
 * "/press/{brand_press_no}":
 *   delete:
 *     tags: [보도자료]
 *     summary: "보도자료 삭제"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_press_no"
 *         description: "메인 이미지 주소."
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210126000004"
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
app.delete("/press/:brand_press_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const brand_press_no = isNull(req.params.brand_press_no, null);

  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "CHECK.ACCESSABLE.PRESS",
      {
        brand_press_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a press you can access.",
      });
      return;
    }

    const deletePressQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "DELETE.PRESS",
      {
        brand_press_no,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(deletePressQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/press-list":
 *   get:
 *     tags: [보도자료]
 *     summary: "보도자료 목록 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *       - name: "year"
 *         description: "조회할 연도"
 *         in: query
 *         required: false
 *         type: string
 *         example: "2021"
 *       - name: "month"
 *         description: "조회할 월"
 *         in: query
 *         required: false
 *         type: string
 *         example: "2"
 *     responses:
 *       200:
 *         description: "성공. season_list=조회할 수 있는 시즌 목록. total_count=전체 보도자료 개수(카운팅용). list=보도자료 목록."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             season_list:
 *               description: ""
 *               type: array
 *               example: [{"year":"2021","month":"3"},{"year":"2020","month":"2"}]
 *             total_count:
 *               description: ""
 *               type: integer
 *               example: 3
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"title":"제목2 (수정됨)","contents":"내용","total_count":3,"main_img_adres":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"},{"title":"제목","contents":"내용","total_count":3,"main_img_adres":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"},{"title":"제목","contents":"내용","total_count":3,"main_img_adres":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"}]
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
app.get("/press-list", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  let year = isNull(req.query.year, null);
  let month = isNull(req.query.month, null);
  const sesaon_input_yn = year !== null || month !== null;

  try {
    const selectSeasonQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.PRESS.SEASON.LIST",
      {
        user_id,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectSeasonResult = await req.sequelize.query(selectSeasonQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (!sesaon_input_yn) {
      if (selectSeasonResult.length !== 0) {
        year = selectSeasonResult[0].year;
        month = selectSeasonResult[0].month;
      }
    }

    const selectPressQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.PRESS.LIST",
      {
        user_id,
        year,
        month,
        limit,
        offset,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectPressResult = await req.sequelize.query(selectPressQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const total_count =
      selectPressResult.length === 0 ? 0 : selectPressResult[0].total_count;
    res.json({
      success: true,
      season_list: selectSeasonResult,
      total_count,
      next_page: total_count / limit <= page ? null : parseInt(page, 10) + 1,
      list: selectPressResult,
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
 * "/notice":
 *   get:
 *     tags: [디지털쇼룸]
 *     summary: "디지털쇼룸 공지사항 조회"
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
 *             notice_contents:
 *               description: ""
 *               type: string
 *               example: "공지사항입니다..."
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
app.get("/notice", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  //console.log(brand_id);

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.NOTICE",
      {
        user_id,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      ...selectResult[0],
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
 * "/notice":
 *   post:
 *     tags: [디지털쇼룸]
 *     summary: "공지사항 수정 및 등록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "notice_contents"
 *         description: "메인 이미지 주소."
 *         in: body
 *         required: true
 *         type: string
 *         example: "공지사항입니다..."
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
app.post("/notice", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const notice_contents = isNull(req.body.notice_contents, null);

  if (notice_contents == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.NOTICE",
      {
        user_id,
        brand_id,
        notice_contents,
        brand_user_no,
      },
      { language: "sql", indent: "  " }
    );

    const notify_list = await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    /// TODO: 알림 전송 구현
    await Promise.all(
      notify_list.map((e) => {
        const token = e.token_value;
        delete e.token_value;
        req.sendMessage(token, e);
      })
    );

    res.json({
      success: true,
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

/* 브랜드 알림발송 */
app.post("/notice", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const notice_contents = isNull(req.body.notice_contents, null);

  if (notice_contents == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.NOTICE",
      {
        user_id,
        brand_id,
        notice_contents,
        brand_user_no,
      },
      { language: "sql", indent: "  " }
    );

    const notify_list = await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    /// TODO: 알림 전송 구현
    await Promise.all(
      notify_list.map((e) => {
        const token = e.token_value;
        delete e.token_value;
        req.sendMessage(token, e);
      })
    );

    res.json({
      success: true,
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
 * "/inquiry-number":
 *   get:
 *     tags: [디지털쇼룸]
 *     summary: "inquiry number"
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
 *             inquiry_number:
 *               description: ""
 *               type: string
 *               example: "010-4444-4444"
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
app.get("/inquiry-number", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.INQUIRY.NUMBER",
      {
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      ...selectResult[0],
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
 * "/inquiry-number":
 *   post:
 *     tags: [디지털쇼룸]
 *     summary: "문의번호 수정 및 등록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "inquiry_number"
 *         description: "설정할 연락처"
 *         in: body
 *         required: true
 *         type: string
 *         example: "01044444444"
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
app.post("/inquiry-number", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const inquiry_number = isNull(req.body.inquiry_number, null);

  if (inquiry_number == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.INQUIRY.NUMBER",
      {
        user_id,
        brand_id,
        inquiry_number,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    /// TODO: 알림 전송 구현

    res.json({
      success: true,
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
 * "/showroom-inquiry":
 *   get:
 *     tags: [디지털쇼룸]
 *     summary: "쇼룸 문의정보 조회"
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
 *             showroom_inquiry_contact:
 *               description: ""
 *               type: string
 *               example: "010-4444-4444"
 *             showroom_inquiry_email:
 *               description: ""
 *               type: string
 *               example: "sds@gmail.com"
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
app.get("/showroom-inquiry", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.INQUIRY",
      {
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      ...selectResult[0],
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
 * "/showroom-inquiry":
 *   post:
 *     tags: [디지털쇼룸]
 *     summary: "쇼룸 문의정보 수정 및 등록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_inquiry_contact"
 *         description: "설정할 연락처"
 *         in: body
 *         required: true
 *         type: string
 *         example: "01044444444"
 *       - name: "showroom_inquiry_email"
 *         description: "설정할 이메일"
 *         in: body
 *         required: true
 *         type: string
 *         example: "sadas@gmail.com"
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
app.post("/showroom-inquiry", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const showroom_inquiry_contact = isNull(req.body.showroom_inquiry_contact,null);
  const inquiry_charge = isNull(req.body.inquiry_charge, null);
  const showroom_inquiry_email = isNull(req.body.showroom_inquiry_email, null);
  if ([showroom_inquiry_email, showroom_inquiry_contact].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.SHOWROOM.INQUIRY",
      {
        user_id,
        brand_id,
        showroom_inquiry_email,
        showroom_inquiry_contact,
        inquiry_charge
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    /// TODO: 알림 전송 구현

    res.json({
      success: true,
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
 * "/sendout-detailed/{date}":
 *   get:
 *     tags: [발송]
 *     summary: "sendout 상세보기"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "date"
 *         description: "조회할 날짜 UTC"
 *         in: path
 *         required: true
 *         type: string
 *         example: "1611619200"
 *     responses:
 *       200:
 *         description: "성공. left=좌측 발송목록. right=프린트할 내용 목록. req_user_nm=요청자명. contact_user_nm=어시스턴트 이름. contact_user_nm=어시스턴트 번호. "
 *         schema:
 *           type: object
 *           properties:
 *             left:
 *               description: ""
 *               type: object
 *               example: {"date":1611619200,"year":"2021","month":"01","day":"26","each_list":[{"req_no":"20210127000016","mgzn_nm":"테스트매거진1","mgzn_color":"#c18c8c90 ","req_user_nm":"테스트","req_user_type":"MAGAZINE","mgzn_logo_adres":null},{"req_no":"20210129000025","mgzn_nm":"테스트매거진1","mgzn_color":"#c18c8c90 ","req_user_nm":"테스트","req_user_type":"MAGAZINE","mgzn_logo_adres":null},{"req_no":"20210219000074","mgzn_nm":null,"mgzn_color":null,"req_user_nm":"테스트22","req_user_type":"STYLIST","mgzn_logo_adres":null}]}
 *             right:
 *               description: "요청된 쇼룸들의 정보"
 *               type: array
 *               example: []
 *             success:
 *               description: "성공 여부"
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
app.get("/sendout-detailed/:date", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  //const req_no = isNull(req.params.req_no, null);
  const date = isNull(req.params.date, null);
  const showroomList = isNull(req.query.showroomList, null);
  const reqnoList = isNull(req.query.reqnoList, null);
  let showroom_Array = JSON.parse(showroomList);
  let reqNo_Array = JSON.parse(reqnoList);
  try {
    // 오른쪽 프린트 출력데이터
    const selectRightQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.DETAIL",
      {
        brand_id,
        user_id,
        date,
        type: "SENDOUT",
        check: "BRAND_SENDOUT",
        showroom_no : showroom_Array,
        req_no_array : reqNo_Array
      },
      { language: "sql", indent: "  " }
    );
    const selectRightResult = await req.sequelize.query(selectRightQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 왼쪽 리스트
    const selectLeftQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST.MOBILE",
      { brand_id, date, type: "SENDOUT" ,showroom_no : showroom_Array,req_no_array : reqNo_Array},
      { language: "sql", indent: "  " }
    );

    const selectLeftResult = await req.sequelize.query(selectLeftQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      left: selectLeftResult[0],
      right: selectRightResult,
      reqnoList,

      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      reqnoList,
      showroomList,
      error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});



/**
 * @swagger
 * "/return-detailed/{date}":
 *   get:
 *     tags: [발송]
 *     summary: "return 상세보기. (sendout과 거의 동일)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "date"
 *         description: "날짜 UTC"
 *         in: path
 *         required: true
 *         type: integer
 *         example: 1232321321
 *     responses:
 *       200:
 *         description: "성공. left=좌측 발송목록. right=프린트할 내용 목록. req_user_nm=요청자명. contact_user_nm=어시스턴트 이름. contact_user_nm=어시스턴트 번호. "
 *         schema:
 *           type: object
 *           properties:
 *             left:
 *               description: ""
 *               type: object
 *               example: {"date":1611619200,"year":"2021","month":"01","day":"26","each_list":[{"req_no":"20210127000016","mgzn_nm":"테스트매거진1","mgzn_color":"#c18c8c90 ","req_user_nm":"테스트","req_user_type":"MAGAZINE","mgzn_logo_adres":null},{"req_no":"20210129000025","mgzn_nm":"테스트매거진1","mgzn_color":"#c18c8c90 ","req_user_nm":"테스트","req_user_type":"MAGAZINE","mgzn_logo_adres":null},{"req_no":"20210219000074","mgzn_nm":null,"mgzn_color":null,"req_user_nm":"테스트22","req_user_type":"STYLIST","mgzn_logo_adres":null}]}
 *             right:
 *               description: "요청된 쇼룸들의 정보"
 *               type: array
 *               example: []
 *             success:
 *               description: "성공 여부"
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
app.get("/return-detailed/:date", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  //const req_no = isNull(req.params.req_no, null);
  const date = isNull(req.params.date, null);
  const showroomList = isNull(req.query.showroomList, null);
  const reqnoList = isNull(req.query.reqnoList, null);
  let showroom_Array = JSON.parse(showroomList);
  let reqNo_Array = JSON.parse(reqnoList);
  try {
    const selectRightQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.DETAIL",
      {
        user_id,
        date,
        brand_id,
        type: "RETURN",
        check: "BRAND_RETURN",
        showroom_no : showroom_Array,
        req_no_array : reqNo_Array
      },
      { language: "sql", indent: "  " }
    );
    const selectRightResult = await req.sequelize.query(selectRightQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 왼쪽 리스트
    const selectLeftQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST.MOBILE",
      { brand_id, date, type: "RETURN",showroom_no : showroom_Array,req_no_array : reqNo_Array },
      { language: "sql", indent: "  " }
    );

    const selectLeftResult = await req.sequelize.query(selectLeftQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      left: selectLeftResult[0],
      right: selectRightResult,
      success: true,
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
 * "/sendout-detailed/req/{req_no}":
 *   get:
 *     tags: [발송]
 *     summary: "sendout 상세보기"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "조회할 날짜 UTC"
 *         in: path
 *         required: true
 *         type: string
 *         example: "1611619200"
 *     responses:
 *       200:
 *         description: "성공. left=좌측 발송목록. right=프린트할 내용 목록. req_user_nm=요청자명. contact_user_nm=어시스턴트 이름. contact_user_nm=어시스턴트 번호. "
 *         schema:
 *           type: object
 *           properties:
 *             left:
 *               description: ""
 *               type: object
 *               example: {"date":1611619200,"year":"2021","month":"01","day":"26","each_list":[{"req_no":"20210127000016","mgzn_nm":"테스트매거진1","mgzn_color":"#c18c8c90 ","req_user_nm":"테스트","req_user_type":"MAGAZINE","mgzn_logo_adres":null},{"req_no":"20210129000025","mgzn_nm":"테스트매거진1","mgzn_color":"#c18c8c90 ","req_user_nm":"테스트","req_user_type":"MAGAZINE","mgzn_logo_adres":null},{"req_no":"20210219000074","mgzn_nm":null,"mgzn_color":null,"req_user_nm":"테스트22","req_user_type":"STYLIST","mgzn_logo_adres":null}]}
 *             right:
 *               description: "요청된 쇼룸들의 정보"
 *               type: array
 *               example: {"req_no":"20210126000011","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":null,"contact_user_phone":null,"loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]}
 *             success:
 *               description: "성공 여부"
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
app.get("/sendout-detailed/req/:req_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const req_no = isNull(req.params.req_no, null);
  //const date = isNull(req.params.date, null);
  const showroom_no = isNull(req.query.showroom_no, null);
  let showroom_Array = [];
  try {
    // 오른쪽 프린트 출력데이터
    const selectRightQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.DETAIL",
      {
        brand_id,
        user_id,
        req_no,
        type: "SENDOUT",
        check: "BRAND_SENDOUT",
        showroom_no :showroom_Array.concat(showroom_no)
      },
      { language: "sql", indent: "  " }
    );
    const selectRightResult = await req.sequelize.query(selectRightQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 왼쪽 리스트
    const selectLeftQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST.MOBILE",
      { brand_id, req_no, type: "SENDOUT",showroom_no:showroom_Array.concat(showroom_no) },
      { language: "sql", indent: "  " }
    );

    const selectLeftResult = await req.sequelize.query(selectLeftQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      left: selectLeftResult[0],
      right: selectRightResult[0],
      success: true,
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
 * "/return-detailed/req/{req_no}":
 *   get:
 *     tags: [발송]
 *     summary: "return 상세보기. (sendout과 거의 동일)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "날짜 UTC"
 *         in: path
 *         required: true
 *         type: integer
 *         example: 1232321321
 *     responses:
 *       200:
 *         description: "성공. left=좌측 발송목록. right=프린트할 내용 목록. req_user_nm=요청자명. contact_user_nm=어시스턴트 이름. contact_user_nm=어시스턴트 번호. "
 *         schema:
 *           type: object
 *           properties:
 *             left:
 *               description: ""
 *               type: object
 *               example: {"date":1611619200,"year":"2021","month":"01","day":"26","each_list":[{"req_no":"20210127000016","mgzn_nm":"테스트매거진1","mgzn_color":"#c18c8c90 ","req_user_nm":"테스트","req_user_type":"MAGAZINE","mgzn_logo_adres":null},{"req_no":"20210129000025","mgzn_nm":"테스트매거진1","mgzn_color":"#c18c8c90 ","req_user_nm":"테스트","req_user_type":"MAGAZINE","mgzn_logo_adres":null},{"req_no":"20210219000074","mgzn_nm":null,"mgzn_color":null,"req_user_nm":"테스트22","req_user_type":"STYLIST","mgzn_logo_adres":null}]}
 *             right:
 *               description: "요청된 쇼룸들의 정보"
 *               type: array
 *               example: {"req_no":"20210126000011","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":null,"contact_user_phone":null,"loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]}
 *             success:
 *               description: "성공 여부"
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
app.get("/return-detailed/req/:req_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const req_no = isNull(req.params.req_no, null);
  const showroom_no = isNull(req.query.showroom_no, null);
  let showroom_Array = [];
  try {
    const selectRightQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.DETAIL",
      {
        user_id,
        brand_id,
        req_no,
        type: "RETURN",
        check: "BRAND_RETURN",
        showroom_no :showroom_Array.concat(showroom_no)
      },
      { language: "sql", indent: "  " }
    );
    const selectRightResult = await req.sequelize.query(selectRightQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 왼쪽 리스트
    const selectLeftQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST.MOBILE",
      { brand_id, req_no, type: "RETURN",showroom_no:showroom_Array.concat(showroom_no) },
      { language: "sql", indent: "  " }
    );

    const selectLeftResult = await req.sequelize.query(selectLeftQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      left: selectLeftResult[0],
      right: selectRightResult[0],
      success: true,
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
 * "/send-out/notice":
 *   post:
 *     tags: [발송]
 *     summary: "send out 공지사항 수정 및 등록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "content"
 *         description: "공지사항 내용"
 *         in: body
 *         required: true
 *         type: string
 *         example: "ㄴㅁㅇㄴㅁㅇㄴㅁ"
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
app.post("/send-out/notice", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const content = isNull(req.body.content, null);

  if (content == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.SENDOUT.NOTICE",
      {
        user_id,
        brand_id,
        content,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    /// TODO: 알림 전송 구현

    res.json({
      success: true,
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
 * "/send-out/notice":
 *   get:
 *     tags: [발송]
 *     summary: "send out 공지사항 조회"
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
 *             content:
 *               description: ""
 *               type: string
 *               example: "asdasf"
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
app.get("/send-out/notice", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.NOTICE",
      {
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      ...selectResult[0],
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
 * "/sendout-schedule":
 *   get:
 *     tags: [샘플발송]
 *     summary: "발송할 목록 조회입니다."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "start_date"
 *         description: "픽업 날짜 필터의 시작일"
 *         in: query
 *         required: false
 *         type: string
 *         example: "20210126000004"
 *       - name: "fin_date"
 *         description: "픽업 날짜 필터의 종료일"
 *         in: query
 *         required: false
 *         type: string
 *         example: "20210126000004"
 *     responses:
 *       200:
 *         description: "성공. date=각 날짜 UTC. each_list=각 날짜에 존재하는 요청 목록. req_no=요청 식별자. mgzn_nm=요청한 매거진명. brand_nm=요청받은 브랜드명. mgzn_color=매거진 색상. req_user_nm=요청한 유저명. brand_user_nm=요청 확인한 유저명. req_user_type=매거진인지, 스타일리스트인지. contact_user_nm=연락담당 유저명(어시스턴트). mgzn_logo_adres=매거진 로고. req_user_position=요청한 유저 직급. brand_user_position=브랜드유저 직급. stylist_company_name=스타일리스트 회사명"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"date":1611619200,"year":"2021","month":"01","day":"26","each_list":[{"req_no":"20210127000016","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"테스트","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null},{"req_no":"20210219000074","mgzn_nm":null,"brand_nm":"테스트브랜드1","mgzn_color":null,"req_user_nm":"테스트22","brand_user_nm":"박서준","req_user_type":"STYLIST","contact_user_nm":"테스트22","mgzn_logo_adres":null,"req_user_position":"실장","brand_user_position":"이사","stylist_company_name":"그냥회사"},{"req_no":"20210219000076","mgzn_nm":null,"brand_nm":"테스트브랜드1","mgzn_color":null,"req_user_nm":"테스트22","brand_user_nm":"박서준","req_user_type":"STYLIST","contact_user_nm":"테스트22","mgzn_logo_adres":null,"req_user_position":"실장","brand_user_position":"이사","stylist_company_name":"그냥회사"},{"req_no":"20210129000025","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"테스트","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null},{"req_no":"20210126000011","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"이영표","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null}],"each_count":5}]
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
app.get("/sendout-schedule", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const start_date = isNull(req.query.start_date, null);
  const fin_date = isNull(req.query.fin_date, null);

  if ([start_date, fin_date].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST.MOBILE",
      { brand_id, start_date, fin_date, type: "SENDOUT" },
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
    res.status(500).json({
      success: false,
      error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});


/**
 * @swagger
 * "/return-schedule":
 *   get:
 *     tags: [샘플반환]
 *     summary: "반환목록 조회입니다."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "start_date"
 *         description: "픽업 날짜 필터의 시작일"
 *         in: query
 *         required: false
 *         type: string
 *         example: "20210126000004"
 *       - name: "fin_date"
 *         description: "픽업 날짜 필터의 종료일"
 *         in: query
 *         required: false
 *         type: string
 *         example: "20210126000004"
 *     responses:
 *       200:
 *         description: "성공. date=각 날짜 UTC. each_list=각 날짜에 존재하는 요청 목록. req_no=요청 식별자. mgzn_nm=요청한 매거진명. brand_nm=요청받은 브랜드명. mgzn_color=매거진 색상. req_user_nm=요청한 유저명. brand_user_nm=요청 확인한 유저명. req_user_type=매거진인지, 스타일리스트인지. contact_user_nm=연락담당 유저명(어시스턴트). mgzn_logo_adres=매거진 로고. req_user_position=요청한 유저 직급. brand_user_position=브랜드유저 직급. stylist_company_name=스타일리스트 회사명"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"date":1611619200,"year":"2021","month":"01","day":"26","each_list":[{"req_no":"20210127000016","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"테스트","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null},{"req_no":"20210219000074","mgzn_nm":null,"brand_nm":"테스트브랜드1","mgzn_color":null,"req_user_nm":"테스트22","brand_user_nm":"박서준","req_user_type":"STYLIST","contact_user_nm":"테스트22","mgzn_logo_adres":null,"req_user_position":"실장","brand_user_position":"이사","stylist_company_name":"그냥회사"},{"req_no":"20210219000076","mgzn_nm":null,"brand_nm":"테스트브랜드1","mgzn_color":null,"req_user_nm":"테스트22","brand_user_nm":"박서준","req_user_type":"STYLIST","contact_user_nm":"테스트22","mgzn_logo_adres":null,"req_user_position":"실장","brand_user_position":"이사","stylist_company_name":"그냥회사"},{"req_no":"20210129000025","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"테스트","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null},{"req_no":"20210126000011","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"이영표","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null}],"each_count":5}]
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
app.get("/return-schedule", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const start_date = isNull(req.query.start_date, null);
  const fin_date = isNull(req.query.fin_date, null);

  if ([start_date, fin_date].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST.MOBILE",
      { brand_id, start_date, fin_date, type: "RETURN" },
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
    res.status(500).json({
      success: false,
      error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/return-success":
 *   post:
 *     tags: [샘플반환]
 *     summary: "반환 확인"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asdxwfextwerzgr"
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
app.post("/return-success", async function (req, res) {
  const user_id = isNull(req.user_id, null);
  const brand_id = isNull(req.brand_id, null);
  const req_no = isNull(req.body.req_no, null);
  const targetSampleList = isNull(req.body.targetSampleList, []);

  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {

    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.RETURN.TARGETLIST",
      {
        user_id,
        req_no,
        targetSampleList
      },
      { language: "sql", indent: "  " }
    );
    const idresult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    if ( idresult.length > 0 ) {
      idresult.forEach( async(element) => {
        const insertQuery = req.mybatisMapper.getStatement(
          "BRAND",
          "UPDATE.RETURN.CHECK",
          {
            user_id,
            brand_id,
            req_no,
            pickup_userid : element.pickup_userid,
            targetSampleList
          },
          { language: "sql", indent: "  " }
        );

        const push_result = await req.sequelize.query(insertQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        });
        await Promise.all(
          push_result.map((e) => {
            const token = e.token_value;
            delete e.token_value;
            req.sendMessage(token, e);
          })
        );
      });
    }
    res.json({
      success: true,
      qry : selectQuery
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
 * "/return-success-individual":
 *   post:
 *     tags: [샘플반환]
 *     summary: "반환 개별확인"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asdxwfextwerzgr"
 *       - name: "sample_no"
 *         description: "수령한 샘플의 번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210302000058"
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
app.post("/return-success-individual", async function (req, res) {
  const user_id = isNull(req.user_id, null);
  const brand_id = isNull(req.brand_id, null);

  const req_no = isNull(req.body.req_no, null);
  const sample_no = isNull(req.body.sample_no, null);

  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.RETURN.CHECK.INDIVIDUAL",
      {
        user_id,
        brand_id,
        req_no,
        sample_no,
      },
      { language: "sql", indent: "  " }
    );

    const push_result = await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    await Promise.all(
      push_result.map((e) => {
        const token = e.token_value;
        delete e.token_value;
        req.sendMessage(token, e);
      })
    );
    res.json({
      success: true,
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
 * "/sendout-push":
 *   post:
 *     tags: [발송]
 *     summary: "발송알림 전송"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asdxwfextwerzgr"
 *       - name: "len"
 *         description: "발송한 쇼룸의 개수 (=요청한 총 쇼룸의 개수)"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 4
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
 *             req_no:
 *               description: "요청번호"
 *               type: path
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
app.post("/sendout-push", async function (req, res) {
  const user_id = isNull(req.user_id, null);
  const brand_id = isNull(req.brand_id, null);

  const req_no = isNull(req.body.req_no, null);
  const len = isNull(req.body.len.toString(), null);
  const targetSampleList = isNull(req.body.targetSampleList, []);


  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {

    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.TARGETLIST",
      {
        user_id,
        req_no,
        targetSampleList
      },
      { language: "sql", indent: "  " }
    );
    const idresult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    if ( idresult.length > 0 ) {
      idresult.forEach( async(element) => {     
        const insertQuery = req.mybatisMapper.getStatement(
          "BRAND",
          "UPDATE.SENDOUT.PUSH",
          {
            user_id,
            brand_id,
            req_no,
            len,
            pickup_userid : element.pickup_userid,
            targetSampleList
          },
          { language: "sql", indent: "  " }
        );
    
        const push_result = await req.sequelize.query(insertQuery, {
          type: req.sequelize.QueryTypes.SELECT,
        });
        await Promise.all(
          push_result.map((e) => {
            const token = e.token_value;
            delete e.token_value;
            req.sendMessage(token, e);
          })
        );

      });
    }
    
    res.json({
      success: true,
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
 * "/sendout-push-individual":
 *   post:
 *     tags: [발송]
 *     summary: "발송알림 개별전송"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210330000185"
 *       - name: "len"
 *         description: "발송한 쇼룸의 개수 (=요청한 총 쇼룸의 개수)"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 4
 *       - name: "sample_no"
 *         description: "발송한 샘플의 번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210302000058"
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
 *             req_no:
 *               description: "요청번호"
 *               type: path
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
app.post("/sendout-push-individual", async function (req, res) {
  const user_id = isNull(req.user_id, null);
  const brand_id = isNull(req.brand_id, null);
  const sample_no = isNull(req.body.sample_no, null);
  const req_no = isNull(req.body.req_no, null);
  const len = isNull(req.body.len.toString(), null);
  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.SENDOUT.PUSH.INDIVIDUAL",
      {
        user_id,
        brand_id,
        req_no,
        sample_no,
        len,
      },
      { language: "sql", indent: "  " }
    );

    const push_result = await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    await Promise.all(
      push_result.map((e) => {
        const token = e.token_value;
        delete e.token_value;
        req.sendMessage(token, e);
      })
    );
    res.json({
      success: true,
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
 * "/return-fail":
 *   post:
 *     tags: [샘플반환]
 *     summary: "반환 미수령"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "asdxwfextwerzgr"
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
app.post("/return-fail", async function (req, res) {
  const user_id = isNull(req.user_id, null);
  const brand_id = isNull(req.brand_id, null);

  const req_no = isNull(req.body.req_no, null);

  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.RETURN.NOT.RECEIVE",
      {
        user_id,
        brand_id,
        req_no,
      },
      { language: "sql", indent: "  " }
    );

    const push_result = await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    await Promise.all(
      push_result.map((e) => {
        const token = e.token_value;
        delete e.token_value;
        req.sendMessage(token, e);
      })
    );
    res.json({
      success: true,
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
 * "/return-fail-individual":
 *   post:
 *     tags: [샘플반환]
 *     summary: "반환 개별미수령"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210330000185"
 *       - name: "sample_no"
 *         description: "샘플 식별번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210304000068"
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
app.post("/return-fail-individual", async function (req, res) {
  const user_id = isNull(req.user_id, null);
  const brand_id = isNull(req.brand_id, null);
  const sample_no = isNull(req.body.sample_no, null);

  const req_no = isNull(req.body.req_no, null);

  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.RETURN.NOT.RECEIVE.INDIVIDUAL",
      {
        user_id,
        brand_id,
        req_no,
        sample_no,
      },
      { language: "sql", indent: "  " }
    );

    const push_result = await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    await Promise.all(
      push_result.map((e) => {
        const token = e.token_value;
        delete e.token_value;
        req.sendMessage(token, e);
      })
    );
    res.json({
      success: true,
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
 * "/alarm":
 *   get:
 *     tags: [alarm]
 *     summary: "알림 목록 (대변경 예정)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: "성공. notice_id=알림번호. brand_id=브랜드 코드. send_user_id=발신자 ID. send_dt=발신시각. recv_user_id=수신자ID. subj=알림 제목. cntent=알림 내용. brand_nm=브랜드 이름. username=수신자 이름. req_hist_notifi_se_cd=요청 코드. req_type=요청 유형. notice_type= 알림 타입"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             list:
 *               description: "목록"
 *               type: array
 *               example: [ { "notice_id": "20210122000007", "brand_id": "BRAND_TEST003", "send_user_id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed", "send_dt": 1611315387, "recv_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "subj": "메시지 7번", "cntent": "7번의 내용", "brand_nm": "테스트브랜드3", "username": null, "req_hist_notifi_se_cd": null, "req_type": null, "notice_type": "brand" }, { "notice_id": "20210122000006", "brand_id": null, "send_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "send_dt": 1611314870, "recv_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "subj": "5번 샘플 메시지입니다", "cntent": "확인 부탁드립니다", "brand_nm": null, "username": "최홍만", "req_hist_notifi_se_cd": "RHNS05", "req_type": "대여", "notice_type": "req" }]
 *             total_count:
 *               description: ""
 *               type: integer
 *               example: 122
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.get("/alarm", async (req, res) => {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  if (Number.isInteger(limit) == false || Number.isInteger(limit) == false) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    var selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.ALARM.LIST",
      { offset, limit, user_id, brand_id },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list: selectResult,
      total_count: selectResult.length == 0 ? 0 : selectResult[0].total_count,
      next_page:
        (selectResult.length == 0 ? 0 : selectResult[0].total_count) / limit <=
          page
          ? null
          : parseInt(page, 10) + 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/alarm-delete":
 *   delete:
 *     tags: [alarm]
 *     summary: "알람 삭제. (대변경예정)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "notice_id"
 *         description: "삭제할 문의의 ID"
 *         in: query
 *         required: true
 *         type: string
 *         example: "20210122000001"
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
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.delete("/alarm-delete", async (req, res) => {
  const user_id = req.user_id;
  const notice_id = isNull(req.query.notice_id, null);

  if ([notice_id].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const deleteAlarm = req.mybatisMapper.getStatement(
      "BRAND",
      "DELETE.ALARM",
      {
        user_id,
        notice_id,
      },
      { language: "sql", indent: "  " }
    );
    await req.sequelize.query(deleteAlarm, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/request-check/{req_no}":
 *   post:
 *     tags: [샘플요청]
 *     summary: "대여요청 확인. (아마 삭제예정)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: path
 *         required: true
 *         type: string
 *         example: "2021020200005"
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
app.post("/request-check/:req_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;

  const req_no = isNull(req.params.req_no, null);

  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "CHECK.ACCESSABLE.REQ",
      {
        req_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can access.",
      });
      return;
    }

    const updateQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "CHECK.REQUEST",
      {
        user_id,
        brand_id,
        req_no,
        brand_user_no,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/request-accept/{req_no}":
 *   post:
 *     tags: [샘플요청]
 *     summary: "대여요청 수락"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: path
 *         required: true
 *         type: string
 *         example: "2021020200005"
 *       - name: "showroom_list"
 *         description: "쇼룸 식별자"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["2021020200005"]
 *       - name: "msg"
 *         description: "승인할 때 보내는 메시지 (필수아님)"
 *         in: body
 *         required: false
 *         type: string
 *         example: "감사합니다"
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
app.post("/request-accept/:req_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;
  const msg = isNull(req.body.msg, null);
  const isDuplicateInfo = isNull(req.body.isDuplicateInfo, null);
  const showroom_list = isNull(req.body.showroom_list, null);

  const req_no = isNull(req.params.req_no, null);
  //console.log(req_no);
  //console.log(showroom_list);
  var is_msg = true;
  if (msg == "" || msg == null) {
    is_msg = false;
  }
  if (req_no == null || showroom_list == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  const transaction = await req.sequelize.transaction();
  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "CHECK.ACCESSABLE.REQ",
      {
        req_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can access.",
      });
      return;
    }
    //개별처리를 하기 위한 추가작업 by noh.sn 20211110
/* 
    {
      "target_req_no": "20211119000357",
      "target_showroom_no": "20211115000308",
      "target_user_name": "최엘르",
      "target_user_position": "부편집장",
      "target_company_name": "ELLE",
      "data": {
          "first_target": {
              "target_req_no": "20211119000358",
              "target_showroom_no": "20211115000308",
              "target_user_name": "김바자",
              "target_company_name": "BAZZAR"
          },
          "second_target": {
              "target_req_no": "20211119000357",
              "target_showroom_no": "20211115000308",
              "target_user_name": "최엘르",
              "target_company_name": "ELLE"
          },
          "nowTarget": "new"
      }
  } */
    let updateSubQuery = null;
    let sub_query_result = null;
    if (Array.isArray(showroom_list) && showroom_list.length !== 0) {
      showroom_list.map((item) => {
        if ( isDuplicateInfo != null ) {
          if ( isDuplicateInfo.target_showroom_no == item ) {
            if( isDuplicateInfo.data.nowTarget === 'new') {
              updateSubQuery = req.mybatisMapper.getStatement(
                "BRAND",
                "ACCEPT.REQUEST.SUBACTION.SAMEDATE",
                {
                  user_id,
                  brand_id,
                  req_no,
                  brand_user_no,
                  pickup_date : checkResult[0].duty_recpt_dt,
                  photogrf_dt  : checkResult[0].photogrf_dt,
                  return_date : checkResult[0].return_prearnge_dt,
                  ID : item,                  
                  my_data : isDuplicateInfo.data.first_target,
                  target_data : isDuplicateInfo.data.second_target
                },
                { language: "sql", indent: "  " }
              );
            }else{
              updateSubQuery = req.mybatisMapper.getStatement(
                "BRAND",
                "ACCEPT.REQUEST.SUBACTION.SAMEDATE2",
                {
                  user_id,
                  brand_id,
                  req_no,
                  brand_user_no,
                  pickup_date : checkResult[0].duty_recpt_dt,
                  photogrf_dt  : checkResult[0].photogrf_dt,
                  return_date : checkResult[0].return_prearnge_dt,
                  ID : item,                  
                  my_data : isDuplicateInfo.data.second_target,
                  target_data : isDuplicateInfo.data.first_target
                },
                { language: "sql", indent: "  " }
              );
            }
          }else{
            updateSubQuery = req.mybatisMapper.getStatement(
              "BRAND",
              "ACCEPT.REQUEST.SUBACTION",
              {
                user_id,
                brand_id,
                req_no,
                brand_user_no,
                pickup_date : checkResult[0].duty_recpt_dt,
                return_date : checkResult[0].return_prearnge_dt,
                ID : item
              },
              { language: "sql", indent: "  " }
            );
          }

        }else{
          updateSubQuery = req.mybatisMapper.getStatement(
            "BRAND",
            "ACCEPT.REQUEST.SUBACTION",
            {
              user_id,
              brand_id,
              req_no,
              brand_user_no,
              pickup_date : checkResult[0].duty_recpt_dt,
              return_date : checkResult[0].return_prearnge_dt,
              ID : item
            },
            { language: "sql", indent: "  " }
          );
        }
        sub_query_result = req.sequelize.query(updateSubQuery, {
          type: req.sequelize.QueryTypes.SELECT,
          transaction,
        });
        
      })    
    }
    
    let updateQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "ACCEPT.REQUEST.MAGAZINE",
        {
          user_id,
          brand_id,
          req_no,
          brand_user_no,
          msg,
          is_msg,
          showroom_list
        },
        { language: "sql", indent: "  " }
      );
    
    const push_result = await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
      transaction,
    });
    await Promise.all(
      push_result.map((e) => {
        const token = e.token_value;
        delete e.token_value;
        req.sendMessage(token, e);
      })
    );
    if ( isDuplicateInfo != null ) {
      if ( sub_query_result.length > 0 ) {
      await Promise.all(
        sub_query_result.map((e2) => {
          const token2 = e2.token_value;
          delete e2.token_value;
          req.sendMessage(token2, e2);
        })
      );
      }
    }
    transaction.commit();
    res.json({
      success: true,
      qry : updateQuery
    });
  } catch (error) {
    console.error(error);
    transaction.rollback();
    res.status(500).json({
      success: false,      
      error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/request-refuse/{req_no}":
 *   post:
 *     tags: [샘플요청]
 *     summary: "대여요청 거절"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: path
 *         required: true
 *         type: string
 *         example: "2021020200005"
 *       - name: "showroom_list"
 *         description: "쇼룸 식별자"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["2021020200005"]
 *       - name: "msg"
 *         description: "승인할 때 보내는 메시지 (필수아님)"
 *         in: body
 *         required: false
 *         type: string
 *         example: "감사합니다"
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
app.post("/request-refuse/:req_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const brand_user_no = req.brand_user_no;
  const msg = isNull(req.body.msg, null);
  const showroom_list = isNull(req.body.showroom_list, null);

  var is_msg = true;
  if (msg == "" || msg == null) {
    is_msg = false;
  }

  const req_no = isNull(req.params.req_no, null);

  if (req_no == null || showroom_list == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "CHECK.ACCESSABLE.REQ",
      {
        req_no,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can access.",
      });
      return;
    }
    var updateQuery = null;
    if (checkResult[0].req_user_se_cd === "RUS001") {
      updateQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "REFUSE.REQUEST.MAGAZINE",
        {
          user_id,
          brand_id,
          req_no,
          brand_user_no,
          msg,
          is_msg,
          showroom_list,
        },
        { language: "sql", indent: "  " }
      );
    } else {
      updateQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "REFUSE.REQUEST.STYLIST",
        {
          user_id,
          brand_id,
          req_no,
          brand_user_no,
          msg,
          is_msg,
          showroom_list,
        },
        { language: "sql", indent: "  " }
      );
    }

    const push_result = await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    await Promise.all(
      push_result.map((e) => {
        const token = e.token_value;
        delete e.token_value;
        req.sendMessage(token, e);
      })
    );

    res.json({
      success: true,
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
 * "/request-detailed/{req_no}":
 *   post:
 *     tags: [샘플요청]
 *     summary: "샘플요청의 상세정보 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 식별자"
 *         in: path
 *         required: true
 *         type: string
 *         example: "2021020200005"
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
 *             req_mgzn_username:
 *               description: "요청한 매거진유저의 유저네임"
 *               type: string
 *               example: "김동현"
 *             mgzn_nm:
 *               description: "요청한 매거진의 이름"
 *               type: string
 *               example: "보그"
 *             mgzn_logo_url_adres:
 *               description: "매거진 로고의 URL"
 *               type: string
 *               example: "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com"
 *             contact_mgzn_username:
 *               description: "연락 가능한 매거진 유저의 유저네임"
 *               type: string
 *               example: "김철수"
 *             contact_mgzn_phone_no:
 *               description: "연락 가능한 매거진 유저의 전화번호"
 *               type: string
 *               example: "01077777777"
 *             shooting_start_time:
 *               description: "촬영 시작시간"
 *               type: integer
 *               example: 1611619200
 *             shooting_end_time:
 *               description: "촬영 종료시간"
 *               type: integer
 *               example: 1611626400
 *             shooting_date:
 *               description: "촬영일"
 *               type: integer
 *               example: 1611619200
 *             pickup_date:
 *               description: "매거진이 샘플을 수령하는 일자"
 *               type: integer
 *               example: 1611100800
 *             sendout_date:
 *               description: "매거진이 샘플을 반환하는 일자"
 *               type: integer
 *               example: 1611619200
 *             dlvy_adres_nm:
 *               description: "배송주소"
 *               type: string
 *               example: "송촌빌딩 13층"
 *             post_no:
 *               description: "배송 우편번호"
 *               type: string
 *               example: "06132"
 *             dlvy_atent_matter:
 *               description: "배송메시지"
 *               type: string
 *               example: "조심히 배달해주세요"
 *             photogrf_concept:
 *               description: "촬영 컨셉"
 *               type: string
 *               example: "멋짐"
 *             photogrf_modl_nm:
 *               description: "촬영모델 이름"
 *               type: string
 *               example: "김영희"
 *             modl_tyoe:
 *               description: "촬영모델 유형"
 *               type: string
 *               example: "패션모델"
 *             is_it_yukahwabo:
 *               description: "유가화보 여부"
 *               type: boolean
 *               example: true
 *             yukahwabo_content:
 *               description: "유가화보 제목"
 *               type: string
 *               example: "멋진 화보"
 *             today_connect:
 *               description: "당일연결 가능여부"
 *               type: boolean
 *               example: false
 *             page_cnt:
 *               description: "페이지 수"
 *               type: string
 *               example: "5"
 *             etc_brand_infp:
 *               description: "기타 브랜드 이름"
 *               type: string
 *               example: "샤넬"
 *             message:
 *               description: "Message 부분의 내용"
 *               type: string
 *               example: "아무말"
 *             showroom_list:
 *               description: "요청 내의 쇼룸들에 관한 정보"
 *               type: array
 *               example: [ { "showroom_no": "20210125000009", "showroom_nm": "테스트 쇼룸 1", "image_url": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com3", "user_info": [ [ "테스트", "테스트매거진1", "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com" ] ] }, { "showroom_no": "20210125000010", "showroom_nm": "테스트 쇼룸 1", "image_url": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com5", "user_info": [ [ "테스트", "테스트매거진1", "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com" ] ] } ]
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
app.get("/request-detailed/:req_no", async function (req, res) {
  const req_no = isNull(req.params.req_no, null);
  const brand_id = req.brand_id;
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.REQUEST.DETAILED.001",
      { req_no, brand_id },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery2 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.REQUEST.DETAILED.002",
      { req_no, brand_id },
      { language: "sql", indent: "  " }
    );

    const selectResult2 = await req.sequelize.query(selectQuery2, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      ...selectResult[0],
      showroom_list: selectResult2,
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
 * "/home":
 *   get:
 *     tags: [메인페이지]
 *     summary: "유저 홈 화면"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "date"
 *         description: "현재시각"
 *         in: query
 *         required: true
 *         type: integer
 *         example: 1611619200
 *     responses:
 *       200:
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             new_request:
 *               description: "새로운 요청들의 목록"
 *               type: array
 *               example: [ { "req_no": "20210127000016", "floor": 1611619200, "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com" } ]
 *             new_request_total_count:
 *               description: ""
 *               type: integer
 *               example: 6
 *             today_request:
 *               description: "오늘 수령할 예정인 샘플 요청들"
 *               type: array
 *               example: [ { "req_no": "20210127000016", "floor": 1611619200, "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com" } ]
 *             today_request_total_count:
 *               description: ""
 *               type: integer
 *               example: 0
 *             cnfirm_history:
 *               description: "지난 12개월 동안 브랜드사측에서 확인한 샘플요청 통계"
 *               type: array
 *               example: [ { "year": "2020", "month": "02", "count": 0 }, { "year": "2020", "month": "03", "count": 0 }, { "year": "2020", "month": "04", "count": 0 }, { "year": "2020", "month": "05", "count": 0 }, { "year": "2020", "month": "06", "count": 0 }, { "year": "2020", "month": "07", "count": 0 }, { "year": "2020", "month": "08", "count": 0 }, { "year": "2020", "month": "09", "count": 0 }, { "year": "2020", "month": "10", "count": 0 }, { "year": "2020", "month": "11", "count": 0 }, { "year": "2020", "month": "12", "count": 0 }, { "year": "2021", "month": "01", "count": 7 }, { "year": "2021", "month": "02", "count": 0 } ]
 *             pickup_history:
 *               description: "지난 12개월 동안 수령한 샘플 통계"
 *               type: array
 *               example: [ { "year": "2020", "month": "02", "count": 0 }, { "year": "2020", "month": "03", "count": 0 }, { "year": "2020", "month": "04", "count": 0 }, { "year": "2020", "month": "05", "count": 0 }, { "year": "2020", "month": "06", "count": 0 }, { "year": "2020", "month": "07", "count": 0 }, { "year": "2020", "month": "08", "count": 0 }, { "year": "2020", "month": "09", "count": 0 }, { "year": "2020", "month": "10", "count": 0 }, { "year": "2020", "month": "11", "count": 0 }, { "year": "2020", "month": "12", "count": 0 }, { "year": "2021", "month": "01", "count": 27 }, { "year": "2021", "month": "02", "count": 1 } ]
 *             mgzn_ratio:
 *               description: "지난 12개월동안 수령한 샘플의 매거진사 비율의 통계"
 *               type: array
 *               example: [ { "mgzn_nm": "테스트매거진1", "mgzn_id": "MGZN_TEST001", "count": 16 } ]
 *             success:
 *               description: "성공 여부"
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
app.get("/home", async function (req, res) {
  const user_id = req.user_id;
  const date = isNull(req.query.date, null);
  const brand_id = req.brand_id;
  if (date === null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.HOME.001",
      {
        user_id,
        date,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    /* const selectQuery2 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.HOME.002",
      {
        user_id,
        date,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult2 = await req.sequelize.query(selectQuery2, {
      type: req.sequelize.QueryTypes.SELECT,
    }); */

    const selectQuery2 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST.MOBILE",
      { date, type: "SENDOUT", brand_id },
      { language: "sql", indent: "  " }
    );
    const selectResult2 = await req.sequelize.query(selectQuery2, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const selectQuery3 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.HOME.003",
      {
        user_id,
        date,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult3 = await req.sequelize.query(selectQuery3, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const selectQuery4 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.HOME.004",
      {
        user_id,
        date,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult4 = await req.sequelize.query(selectQuery4, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const selectQuery5 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.HOME.005",
      {
        user_id,
        date,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult5 = await req.sequelize.query(selectQuery5, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      new_request: selectResult,
      new_request_total_count:
        selectResult.length === 0 ? 0 : selectResult[0].total_count,

      today_request: selectResult2,
      //today_request_total_count: selectResult2.length === 0 ? 0 : selectResult2[0].total_count,
      today_sendout: selectResult2,
      //today_sendout_total_count: selectResult2.length === 0 ? 0 : selectResult2[0].total_count,
      cnfirm_history: selectResult3.every((e) => e.count === 0)
        ? []
        : selectResult3,

      pickup_history: selectResult4.every((e) => e.count === 0)
        ? []
        : selectResult4,

      mgzn_ratio: selectResult5,
      success: true,
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
 * "/home/new-request":
 *   get:
 *     tags: [메인페이지]
 *     summary: "새로운 요청 전체조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: "성공. notice_id=알림번호. brand_id=브랜드 코드. send_user_id=발신자 ID. send_dt=발신시각. recv_user_id=수신자ID. subj=알림 제목. cntent=알림 내용. brand_nm=브랜드 이름. username=수신자 이름. req_hist_notifi_se_cd=요청 코드. req_type=요청 유형. notifi_type= 알림 타입"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             new_request:
 *               description: "새로운 요청들의 목록"
 *               type: array
 *               example: [ { "req_no": "20210127000016", "floor": 1611619200, "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com" } ]
 *             total_count:
 *               description: "총 개수"
 *               type: integer
 *               example: 32
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */

app.get("/home/new-request", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  const date = isNull(req.query.date, null);

  if (Number.isInteger(limit) == false || Number.isInteger(limit) == false) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.HOME.LIST.001",
      { offset, limit, user_id, brand_id },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      new_request: selectResult,
      total_count: selectResult.length == 0 ? 0 : selectResult[0].total_count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/home/today-request":
 *   get:
 *     tags: [메인페이지]
 *     summary: "오늘의 요청 전체조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "date"
 *         description: "현재시각"
 *         in: query
 *         required: true
 *         type: integer
 *         example: 1611619200
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: "성공. notice_id=알림번호. brand_id=브랜드 코드. send_user_id=발신자 ID. send_dt=발신시각. recv_user_id=수신자ID. subj=알림 제목. cntent=알림 내용. brand_nm=브랜드 이름. username=수신자 이름. req_hist_notifi_se_cd=요청 코드. req_type=요청 유형. notifi_type= 알림 타입"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             today_request:
 *               description: "오늘의 요청들의 목록"
 *               type: array
 *               example: [ { "req_no": "20210127000016", "floor": 1611619200, "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com" } ]
 *             total_count:
 *               description: "총 개수"
 *               type: integer
 *               example: 32
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */

app.get("/home/today-request", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const date = isNull(req.query.date, null);
  const type = isNull(req.query.type, null);
  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  if (
    Number.isInteger(limit) == false ||
    Number.isInteger(offset) == false ||
    date === null
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    /* const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.HOME.LIST.002",
      { offset, limit, user_id, brand_id, date },
      { language: "sql", indent: "  " }
    ); */
    const selectQuery2 = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "SELECT.HOME.002",
      {
        user_id,
        date,
        brand_id,
        type,
        limit,
        offset,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult2 = await req.sequelize.query(selectQuery2, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list: selectResult2,
      //today_request: selectResult,
      //total_count: selectResult.length == 0 ? 0 : selectResult[0].total_count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/notice-list":
 *   get:
 *     tags: [공지사항]
 *     summary: "공지사항 목록 조회입니다."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: "성공. mngr_nm=관리자명. title=제목. view_count=조회수. show_yn=노출여부. reg_dt=등록일시."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             total_count:
 *               description: ""
 *               type: integer
 *               example: 3
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"notice_no":"20210302000003","no":4,"title":"공지사항 제목3","reg_dt":1614647291,"mngr_nm":"관리자","view_count":0,"show_yn":true,"total_count":4,"reg_dt_excel":"2021-03-02","show_yn_excel":"✔"},{"notice_no":"20210226000002","no":3,"title":"공지사항 제목3","reg_dt":1614303238,"mngr_nm":"관리자","view_count":0,"show_yn":true,"total_count":4,"reg_dt_excel":"2021-02-26","show_yn_excel":"✔"},{"notice_no":"20210226000001","no":2,"title":"공지사항 제목2","reg_dt":1614303231,"mngr_nm":"관리자","view_count":0,"show_yn":true,"total_count":4,"reg_dt_excel":"2021-02-26","show_yn_excel":"✔"},{"notice_no":"20210226000000","no":1,"title":"공지사항 제목1","reg_dt":1614303182,"mngr_nm":"관리자","view_count":0,"show_yn":true,"total_count":4,"reg_dt_excel":"2021-02-26","show_yn_excel":"✔"}]
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
app.get("/notice-list", async (req, res) => {
  const user_id = req.user_id;

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  if (isNaN(limit) || isNaN(offset)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "SELECT.NOTICE.LIST",
      { offset, limit },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const total_count =
      selectResult.length === 0 ? 0 : selectResult[0].total_count;

    res.json({
      success: true,
      list: selectResult,
      total_count,
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
 * "/notice/{notice_no}":
 *   get:
 *     tags: [공지사항]
 *     summary: "공지사항 조회입니다."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "notice_no"
 *         description: "공지사항 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20202120202"
 *     responses:
 *       200:
 *         description: "성공. title=제목. content=내용. reg_dt=등록일시. img_adres_url=이미지경로. file_origin_path=이미지도메인."
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             title:
 *               description: ""
 *               type: string
 *               example: "공지사항 제목3"
 *             content:
 *               description: ""
 *               type: string
 *               example: "공지사항 내용3"
 *             reg_dt:
 *               description: ""
 *               type: integer
 *               example: 1614647291
 *             img_adres_url:
 *               description: ""
 *               type: string
 *               example: "loginImage/559a1b57-3079-408c-a989-61ead251ef71.jpeg"
 *             file_origin_path:
 *               description: ""
 *               type: string
 *               example: "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com"
 *             img_full_url:
 *               description: ""
 *               type: string
 *               example: "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/loginImage/559a1b57-3079-408c-a989-61ead251ef71.jpeg"
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
app.get("/notice/:notice_no", async (req, res) => {
  const user_id = req.user_id;

  const notice_no = isNull(req.params.notice_no, null);

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "SELECT.NOTICE",
      { notice_no,user_id },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      ...selectResult[0],
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
 * "/notify-control/sample-request":
 *   put:
 *     tags: [알림]
 *     summary: "샘플 요청 알림 수신 여부 제어입니다."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "recv_yn"
 *         description: "알림을 받을 것이라면 true, 받지 않을 거라면 false"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: true
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
app.put("/notify-control/sample-request", async (req, res) => {
  const user_id = req.user_id;

  const recv_yn = isNull(req.body.recv_yn, null);

  if (recv_yn == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.NOTICE.CONTROL.SAMPLE_REQUEST",
      { user_id, recv_yn, current: CURRENT_SYSTEM_TYPE },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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



/* 일반 공지사항 추가 2021.12.13 By Noh */
app.put("/notify-control/admin-notice", async (req, res) => {
  const user_id = req.user_id;
  const recv_yn = isNull(req.body.recv_yn, null);

  if (recv_yn == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.NOTIFY.CONTROL.ADMIN.NOTICE",
      { user_id, recv_yn, current: CURRENT_SYSTEM_TYPE },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/notify-control/sample-not-receive":
 *   put:
 *     tags: [알림]
 *     summary: "샘플 미수령 알림 수신 여부 제어입니다."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "recv_yn"
 *         description: "알림을 받을 것이라면 true, 받지 않을 거라면 false"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: true
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
app.put("/notify-control/sample-not-receive", async (req, res) => {
  const user_id = req.user_id;

  const recv_yn = isNull(req.body.recv_yn, null);

  if (recv_yn == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.NOTICE.CONTROL.NOT.RECEIVE",
      { user_id, recv_yn, current: CURRENT_SYSTEM_TYPE },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/notify-control/notice":
 *   put:
 *     tags: [알림]
 *     summary: "공지사항 알림 수신 여부 제어입니다. (삭제예정)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "recv_yn"
 *         description: "알림을 받을 것이라면 true, 받지 않을 거라면 false"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: true
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
app.put("/notify-control/notice", async (req, res) => {
  const user_id = req.user_id;

  const recv_yn = isNull(req.body.recv_yn, null);

  if (recv_yn == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.NOTIFY.CONTROL.NOTICE",
      { user_id, recv_yn, current: CURRENT_SYSTEM_TYPE },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/notify-control/not-disturb-mode":
 *   put:
 *     tags: [알림]
 *     summary: "알림 방해금지 시간 제어입니다."
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "mode_on"
 *         description: "방해금지 모드를 설정할 것이라면 true, 아니면 false"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: true
 *       - name: "begin_dt"
 *         description: "방해금지 모드를 설정했을 경우의 시간 범위"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 1231242134
 *       - name: "end_dt"
 *         description: "방해금지 모드를 설정했을 경우의 시간 범위"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 123214213421
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
app.put("/notify-control/not-disturb-mode", async (req, res) => {
  const user_id = req.user_id;

  const mode_on = isNull(req.body.mode_on, null);
  const begin_dt = isNull(req.body.begin_dt, null);
  const end_dt = isNull(req.body.end_dt, null);

  if (mode_on == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.NOTIFY.CONTROL.NOT_DISTURB_MODE",
      {
        user_id,
        mode_on,
        begin_dt,
        end_dt,
        current: CURRENT_SYSTEM_TYPE,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/memo":
 *   get:
 *     tags: [메모]
 *     summary: "메모 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_no"
 *         description: "쇼룸 식별자"
 *         in: query
 *         required: true
 *         type: string
 *         example: "1202923213"
 *       - name: "date"
 *         description: "메모 일자"
 *         in: query
 *         required: true
 *         type: integer
 *         example: 1010203030
 *     responses:
 *       200:
 *         description: "성공. memo_no=메모 식별자. color=색상. content=메모내용. memo_dt=메모일자"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             memo:
 *               description: ""
 *               type: boolean
 *               example: {"memo_no":"20210318000012","color":"#000000","content":"그냥 메모","memo_ymd":"20210120","memo_dt":1611100800}
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.get("/memo", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const date = isNull(req.query.date, null);
  const showroom_no = isNull(req.query.showroom_no, null);

  // if ([showroom_no, date].includes(null)) {
  //     res.status(400).json({ success: false, error: "bad parameter" });
  //     return;
  // }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.MEMO",
      { date, showroom_no },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    await req.sequelize.query(
      `insert into tb_error_log(user_id, "error")
                values(
                    :user_id
                    , :error
                )`,
      {
        replacements: {
          user_id: "3a27da16-9b06-43a1-964e-70f70acf9806",
          error: selectQuery,
        },
      }
    );

    res.json({
      success: true,
      not_exists: selectResult.length === 0,
      memo: selectResult.length === 0 ? null : selectResult[0],
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
 * "/memo":
 *   post:
 *     tags: [메모]
 *     summary: "메모 작성"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_no"
 *         description: "쇼룸 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "1202923213"
 *       - name: "date"
 *         description: "메모 일자"
 *         in: body
 *         required: false
 *         type: integer
 *         example: 1010203030
 *       - name: "color"
 *         description: "색상값"
 *         in: body
 *         required: false
 *         type: string
 *         example: "#000000"
 *       - name: "content"
 *         description: "메모내용"
 *         in: body
 *         required: true
 *         type: string
 *         example: "메모"
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
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.post("/memo", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const date = isNull(req.body.date, null);
  const color = isNull(req.body.color, null);
  const showroom_no = isNull(req.body.showroom_no, null);
  const content = isNull(req.body.content, null);

  if ([showroom_no, content].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "INSERT.MEMO",
      { user_id, date, brand_id, content, color, showroom_no },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(
      `insert into tb_error_log(user_id, "error")
            values(
                :user_id
                , :error
            )`,
      {
        replacements: {
          user_id: "3a27da16-9b06-43a1-964e-70f70acf9806",
          error: insertQuery,
        },
      }
    );

    const insertResult = await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      ...insertResult[0],
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
 * "/memo/{memo_no}":
 *   delete:
 *     tags: [메모]
 *     summary: "메모 삭제"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "memo_no"
 *         description: "메모 식별자"
 *         in: path
 *         required: true
 *         type: string
 *         example: "1010203030"
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
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.delete("/memo/:memo_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const memo_no = isNull(req.params.memo_no, null);

  try {
    const deleteQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "DELETE.MEMO",
      { user_id, memo_no, brand_id },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(deleteQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/memo/{memo_no}":
 *   put:
 *     tags: [메모]
 *     summary: "메모 수정"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "memo_no"
 *         description: "메모 식별자"
 *         in: path
 *         required: true
 *         type: string
 *         example: "1010203030"
 *       - name: "showroom_no"
 *         description: "쇼룸 식별자"
 *         in: body
 *         required: true
 *         type: string
 *         example: "1202923213"
 *       - name: "date"
 *         description: "메모 일자"
 *         in: body
 *         required: false
 *         type: integer
 *         example: 1010203030
 *       - name: "color"
 *         description: "색상값"
 *         in: body
 *         required: false
 *         type: string
 *         example: "#000000"
 *       - name: "content"
 *         description: "메모내용"
 *         in: body
 *         required: true
 *         type: string
 *         example: "메모"
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
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.put("/memo/:memo_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const memo_no = isNull(req.params.memo_no, null);

  const date = isNull(req.body.date, null);
  const color = isNull(req.body.color, null);
  const showroom_no = isNull(req.body.showroom_no, null);
  const content = isNull(req.body.content, null);

  if ([showroom_no, content].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "UPDATE.MEMO",
      {
        user_id,
        memo_no,
        brand_id,
        date,
        content,
        color,
        showroom_no,
        content,
      },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/showroom-list/for-memo":
 *   get:
 *     tags: [메모]
 *     summary: "메모 쇼룸 목록 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "date"
 *         description: "날짜 UTC"
 *         in: query
 *         required: true
 *         type: string
 *         example: 12323232
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
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"showroom_no":"20210125000009","showroom_nm":"테스트 쇼룸 1"},{"showroom_no":"20210125000010","showroom_nm":"테스트 쇼룸 1"}]
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.get("/showroom-list/for-memo", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  const date = isNull(req.query.date, null);

  if ([date].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.LIST.FOR.MEMO",
      {
        user_id,
        brand_id,
        date,
      },
      { language: "sql", indent: "  " }
    );
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", selectQuery);

    const selecResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
      list: selecResult,
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
 * "/my-schedule":
 *   get:
 *     tags: [스케줄]
 *     summary: "날짜별로 분류된 스케줄"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "min_date"
 *         description: "스케줄을 받을 첫 날짜 (20XX년 XX월 XX일 0시0분을 UTC 정수형으로)"
 *         in: query
 *         required: true
 *         type: integer
 *         example: 1611100800
 *       - name: "max_date"
 *         description: "스케줄을 받을 마지막 날짜 (20XX년 XX월 XX일 0시0분을 UTC 정수형으로)"
 *         in: query
 *         required: true
 *         type: integer
 *         example: 1611187200
 *       - name: "season_year"
 *         description: "시즌의 연도"
 *         in: query
 *         required: false
 *         type: string
 *         example: "2020"
 *       - name: "season_cd_id"
 *         description: "시즌 코드 - SS0001이면 Cruise, SS0002면 Spring/Summer, SS0003이면 Pre-fall, SS0004면 Fall/Winter, SS0005면 Carry Over"
 *         in: query
 *         required: false
 *         type: string
 *         example: "SS0002"
 *       - name: "gender - SSS001이면 여성, SSS002면 남성, SSS003이면 유니섹스(공통) "
 *         description: "성별 코드"
 *         in: query
 *         required: false
 *         type: string
 *         example: "SSS001"
 *     responses:
 *       200:
 *         description: "성공. list=전체목록. season_list=계절목록 req_list=샘플요청목록. req_list.start_dt=시작날짜. req_list.end_dt=종료날짜. req_list.loc_yn=로케여부(비행기아이콘). req_list.pchrg_picalbm_yn=유가화보여부(돈 아이콘). req_list.req_no=요청식별자. req_list.address=주소. req_list.req_user_nm=요청자명. company_name=회사명. company_type=매거진이면 MAGAZINE, 스타일리스트면 STYLIST. req_list.contact_user_nm=어시스턴스명. req_list.contact_user_phone=어시스턴스 폰번호. req_list.mgzn_logo_adres=매거진 로고. showroom_memo_list=쇼룸메모목록. memo_list=날짜메모목록"
 *         schema:
 *           type: object
 *           properties:
 *             list:
 *               description: "목록"
 *               type: array
 *               example: [
    {
      "showroom_no": "20210706000133",
      "season_year": "2017",
      "season_se_cd": "SS0002",
      "showroom_nm": "ᆼᆼᆼ",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/6ccb2cc0-4ab7-47be-a9f0-66e520bfda8a.png",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210406000088",
      "season_year": "2020",
      "season_se_cd": "SS0001",
      "showroom_nm": "테스트 쇼룸????",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/416d60c1-818e-46ce-a6bb-1be1d3c0403d.png",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210407000093",
      "season_year": "2020",
      "season_se_cd": "SS0001",
      "showroom_nm": "테스트 쇼룸 1555",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210503000119",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "JPG TEST",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210324000075",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "Look 1",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/377c824b-3694-43f9-a5c4-6d3fa4262d54.png",
      "req_list": [
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616574252,
          "req_no": "20210324000164",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616684400,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616725973,
          "req_no": "20210326000177",
          "address": "경기 가평군 조종면 현창로44번길 4 (현리, 제일스튜디오)",
          "start_dt": 1616684400,
          "mgzn_color": "#c18c8c",
          "req_user_nm": "김바자",
          "company_name": "BAZZAR",
          "company_type": "MAGAZINE",
          "contact_user_nm": "김바자",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/7ce3f6cb-02f8-4037-88c8-910a156d6024.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01054678888",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        }
      ],
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210324000077",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "Look 2",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/bfc3950c-61d4-4ed5-96dd-045fb8caa584.png",
      "req_list": [
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616574252,
          "req_no": "20210324000164",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616684400,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616725973,
          "req_no": "20210326000177",
          "address": "경기 가평군 조종면 현창로44번길 4 (현리, 제일스튜디오)",
          "start_dt": 1616684400,
          "mgzn_color": "#c18c8c",
          "req_user_nm": "김바자",
          "company_name": "BAZZAR",
          "company_type": "MAGAZINE",
          "contact_user_nm": "김바자",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/7ce3f6cb-02f8-4037-88c8-910a156d6024.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01054678888",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617116400,
          "loc_yn": false,
          "req_dt": 1616981380,
          "req_no": "20210329000180",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616943600,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617375600,
          "loc_yn": false,
          "req_dt": 1617164286,
          "req_no": "20210331000191",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1617289200,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": false,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": false,
          "other_paid_pictorial_yn": false
        }
      ],
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210323000072",
      "season_year": "2020",
      "season_se_cd": "SS0004",
      "showroom_nm": "Look 20",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/e60f17e8-1044-4aff-8837-cf73b7234cd7.png",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210421000099",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "LOOK 223",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/9565390a-d98d-46fb-ba74-92d0eef0e5ad.png",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210319000069",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "Look 24",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/8426d8bd-e078-4744-bbec-9589ff83a705.png",
      "req_list": [
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616726147,
          "req_no": "20210326000178",
          "address": "경기 가평군 조종면 현창로44번길 4 (현리, 제일스튜디오)",
          "start_dt": 1616684400,
          "mgzn_color": "#c18c8c",
          "req_user_nm": "김바자",
          "company_name": "BAZZAR",
          "company_type": "MAGAZINE",
          "contact_user_nm": "김바자",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/7ce3f6cb-02f8-4037-88c8-910a156d6024.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01054678888",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617116400,
          "loc_yn": false,
          "req_dt": 1616981380,
          "req_no": "20210329000180",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616943600,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617202800,
          "loc_yn": false,
          "req_dt": 1617156095,
          "req_no": "20210331000189",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1617116400,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": false,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": false,
          "other_paid_pictorial_yn": false
        }
      ],
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": [
        {
          "color": "#c18c8c",
          "content": "ㄹㄹㄹㄹ",
          "memo_dt": 1617116400,
          "memo_no": "20210331000063"
        }
      ]
    },
    {
      "showroom_no": "20210319000068",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "Look 27",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/16d07ba2-644a-4779-a22f-962cdbb29b4f.png",
      "req_list": [
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616726147,
          "req_no": "20210326000178",
          "address": "경기 가평군 조종면 현창로44번길 4 (현리, 제일스튜디오)",
          "start_dt": 1616684400,
          "mgzn_color": "#c18c8c",
          "req_user_nm": "김바자",
          "company_name": "BAZZAR",
          "company_type": "MAGAZINE",
          "contact_user_nm": "김바자",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/7ce3f6cb-02f8-4037-88c8-910a156d6024.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01054678888",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617116400,
          "loc_yn": false,
          "req_dt": 1616981380,
          "req_no": "20210329000180",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616943600,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        }
      ],
      "req_wait_list": null,
      "showroom_memo_list": [
        {
          "color": "#c1c3c3",
          "content": "asdfffff",
          "memo_no": "20210328000041"
        }
      ],
      "memo_list": [
        {
          "color": "#c18c8c",
          "content": "NONONO rrrrrrr",
          "memo_dt": 1616943600,
          "memo_no": "20210331000064"
        }
      ]
    },
    {
      "showroom_no": "20210323000073",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "Look 28",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/9febf95a-93ea-4f97-adaf-c1b81969f372.png",
      "req_list": [
        {
          "end_dt": 1617116400,
          "loc_yn": false,
          "req_dt": 1616981380,
          "req_no": "20210329000180",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616943600,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617202800,
          "loc_yn": false,
          "req_dt": 1617156095,
          "req_no": "20210331000189",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1617116400,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": false,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": false,
          "other_paid_pictorial_yn": false
        }
      ],
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210319000070",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "Look 29",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/82c5a6b3-c85a-4c40-842f-b893f6758f72.png",
      "req_list": [
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616726147,
          "req_no": "20210326000178",
          "address": "경기 가평군 조종면 현창로44번길 4 (현리, 제일스튜디오)",
          "start_dt": 1616684400,
          "mgzn_color": "#c18c8c",
          "req_user_nm": "김바자",
          "company_name": "BAZZAR",
          "company_type": "MAGAZINE",
          "contact_user_nm": "김바자",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/7ce3f6cb-02f8-4037-88c8-910a156d6024.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01054678888",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617030000,
          "loc_yn": false,
          "req_dt": 1616575460,
          "req_no": "20210324000165",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616857200,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        }
      ],
      "req_wait_list": null,
      "showroom_memo_list": [
        {
          "color": "#e1c668",
          "content": "holy eys",
          "memo_no": "20210328000042"
        }
      ],
      "memo_list": [
        {
          "color": "#c1a68c",
          "content": "why",
          "memo_dt": 1616857200,
          "memo_no": "20210328000039"
        },
        {
          "color": "#e6e667",
          "content": "jaebal",
          "memo_dt": 1616943600,
          "memo_no": "20210329000053"
        }
      ]
    },
    {
      "showroom_no": "20210324000076",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "Look 33",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/4d1d33d4-5ea2-4fad-baab-236f35b5a8d2.png",
      "req_list": [
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616574252,
          "req_no": "20210324000164",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616684400,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617030000,
          "loc_yn": false,
          "req_dt": 1616575460,
          "req_no": "20210324000165",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616857200,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617375600,
          "loc_yn": true,
          "req_dt": 1617164032,
          "req_no": "20210331000190",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1617116400,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": false,
          "other_paid_pictorial_yn": true
        }
      ],
      "req_wait_list": null,
      "showroom_memo_list": [
        {
          "color": "#e1af7b",
          "content": "수고하셨습니다 마지막 test",
          "memo_no": "20210328000046"
        }
      ],
      "memo_list": [
        {
          "color": "#c18c8c",
          "content": "wow",
          "memo_dt": 1616943600,
          "memo_no": "20210329000054"
        }
      ]
    },
    {
      "showroom_no": "20210323000074",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "Look 38",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/b87ae83c-47cb-4e6e-bc2f-165d59bfa2eb.png",
      "req_list": [
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616574252,
          "req_no": "20210324000164",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1616684400,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1616857200,
          "loc_yn": false,
          "req_dt": 1616726147,
          "req_no": "20210326000178",
          "address": "경기 가평군 조종면 현창로44번길 4 (현리, 제일스튜디오)",
          "start_dt": 1616684400,
          "mgzn_color": "#c18c8c",
          "req_user_nm": "김바자",
          "company_name": "BAZZAR",
          "company_type": "MAGAZINE",
          "contact_user_nm": "김바자",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/7ce3f6cb-02f8-4037-88c8-910a156d6024.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01054678888",
          "own_paid_pictorial_yn": true,
          "other_paid_pictorial_yn": false
        },
        {
          "end_dt": 1617375600,
          "loc_yn": true,
          "req_dt": 1617164032,
          "req_no": "20210331000190",
          "address": "서울 강서구 초록마을로2길 15 (화곡동, 순환레미안)",
          "start_dt": 1617116400,
          "mgzn_color": "#8cafc1",
          "req_user_nm": "최엘르",
          "company_name": "ELLE",
          "company_type": "MAGAZINE",
          "contact_user_nm": "최엘르",
          "mgzn_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/776b6a9c-277f-4a72-9ea5-a05a2c357cb5.png",
          "pchrg_picalbm_yn": true,
          "contact_user_phone": "01098765432",
          "own_paid_pictorial_yn": false,
          "other_paid_pictorial_yn": true
        }
      ],
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210423000100",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "TEST 123",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210407000094",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "TEST1234",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210409000098",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "TEST 1314",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210430000118",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "TEST LOOK #3",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/public/showroomImage/62097e6e-5107-4f33-875f-a17ff96c3b79.png",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    },
    {
      "showroom_no": "20210426000110",
      "season_year": "2021",
      "season_se_cd": "SS0002",
      "showroom_nm": "TTT",
      "image_list": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/",
      "req_list": null,
      "req_wait_list": null,
      "showroom_memo_list": null,
      "memo_list": null
    }
  ]
 *             season_list:
 *               description: "목록"
 *               type: array
 *               example: [{"season_year":"2020","season_cd_id":"SS0001","season_text":"Cruise","season_simple_text":"Cruise","order_value":10}]
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.get("/my-schedule", async function (req, res) {
  const user_id = req.user_id;
  const min_date = isNull(req.query.min_date, null);
  const max_date = isNull(req.query.max_date, null);
  const brand_id = req.brand_id;

  const season_year = isNull(req.query.season_year, null);
  const season_cd_id = isNull(req.query.season_cd_id, null);
  const gender = isNull(req.query.gender, null);

  //const season_input_yn = season_year !== null || season_cd_id !== null;

  if ([min_date, max_date].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectSeasonListQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.SEASON.LIST",
      {
        user_id,
        min_date,
        max_date,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const season_list = await req.sequelize.query(selectSeasonListQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    if (season_list != null) {
      if (season_list.length != 0) {
        season_list.unshift({
          season_year: null,
          season_cd_id: null,
          season_text: "All Season",
          season_simple_text: "All Season",
        });
      }
    }

    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.DATE",
      {
        user_id,
        min_date,
        max_date,
        brand_id,
        season_year,
        season_cd_id,
        gender,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

 
    res.json({
      list: selectResult,
      season_list,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/search":
 *   get:
 *     tags: [검색]
 *     summary: "유저 검색 화면"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "search_text"
 *         description: "검색용 텍스트"
 *         in: query
 *         required: true
 *         type: string
 *         example: "으악"
 *     responses:
 *       200:
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             showroom:
 *               description: "쇼룸/샘플 내의 검색결과 (웹/앱 모두 사용)"
 *               type: array
 *               example: [ { "showroom_no": "20210226000048", "sample_no": "20210304000068", "title": "Test Edit Sample", "brand_nm": "테스트브랜드1", "reg_dt": 1614849027, "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.compublic/showroomImage/4623de91-de64-4c61-899d-b47679016bca.png", "img_path": "public/showroomImage/4623de91-de64-4c61-899d-b47679016bca.png", "subtitle": "2021S/S", "search_type": "sample" }, { "showroom_no": "20210304000067", "sample_no": "20210304000067", "title": "테스트 샘플 1", "brand_nm": "테스트브랜드1", "reg_dt": 1614847910, "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "subtitle": "2020Cruise", "search_type": "sample" }, { "showroom_no": "20210304000067", "sample_no": "20210304000065", "title": "테스트 샘플 1", "brand_nm": "테스트브랜드1", "reg_dt": 1614847842, "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "subtitle": "2020Cruise", "search_type": "sample" }, { "showroom_no": "20210304000067", "sample_no": "20210304000065", "title": "테스트 쇼룸????", "brand_nm": "테스트브랜드1", "reg_dt": 1614847842, "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "subtitle": "2020Cruise", "search_type": "showroom" }]
 *             lookbook:
 *               description: "룩북 내의 검색결과 (웹/앱 모드 사용)"
 *               type: array
 *               example: [ { "req_no": "20210224000089", "req_dt": 1614156518, "showroom_no": "20210125000010", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com5", "img_path": "5", "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210224000086", "req_dt": 1614156334, "showroom_no": "20210125000009", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com3", "img_path": "3", "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210224000085", "req_dt": 1614156328, "showroom_no": "20210125000010", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com5", "img_path": "5", "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210224000085", "req_dt": 1614156328, "showroom_no": "20210125000009", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com3", "img_path": "3", "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210224000084", "req_dt": 1614156204, "showroom_no": "20210125000010", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com", "img_path": null, "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210224000084", "req_dt": 1614156204, "showroom_no": "20210125000009", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com3", "img_path": "3", "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210224000083", "req_dt": 1614156035, "showroom_no": "20210125000010", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com5", "img_path": "5", "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210224000083", "req_dt": 1614156035, "showroom_no": "20210125000009", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com3", "img_path": "3", "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210224000082", "req_dt": 1614155850, "showroom_no": "20210125000010", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com5", "img_path": "5", "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210219000073", "req_dt": 1613732703, "showroom_no": "20210125000009", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com3", "img_path": "3", "user_nm": "테스트", "brand_nm": "테스트브랜드1" }, { "req_no": "20210218000072", "req_dt": 1613614940, "showroom_no": "20210125000010", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com", "img_path": null, "user_nm": "테스트", "brand_nm": "테스트브랜드1" }]
 *             web_press:
 *               description: "보도자료 내의 검색결과 (웹만 사용)"
 *               type: array
 *               example: [ { "brand_press_no": "20210126000004", "press_subj": "제목2 (수정됨)", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "input_dt": "2021-01-26T04:34:05.470Z" }, { "brand_press_no": "20210126000003", "press_subj": "제목", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "input_dt": "2021-01-26T04:31:01.936Z" }, { "brand_press_no": "20210126000002", "press_subj": "제목", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "input_dt": "2021-01-26T04:30:10.378Z" }, { "brand_press_no": "20210126000001", "press_subj": "제목", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "input_dt": "2021-01-26T04:30:05.293Z" } ]
 *             success:
 *               description: "성공 여부"
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
app.get("/search", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const search_text = isNull(req.query.search_text, null);

  // if(search_text==null) {
  //     res.status(400).json({success:true, error:'bad parameter'});
  // }

  try {
    const showroomSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.SHOWROOM",
      { user_id, search_text, brand_id },
      { language: "sql", indent: "  " }
    );
    const showroomSelectResult = await req.sequelize.query(
      showroomSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    const lookbookSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.LOOKBOOK",
      { user_id, search_text, brand_id },
      { language: "sql", indent: "  " }
    );
    const lookbookSelectResult = await req.sequelize.query(
      lookbookSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    const reqSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.REQ",
      { user_id, search_text, brand_id },
      { language: "sql", indent: "  " }
    );
    const reqSelectResult = await req.sequelize.query(reqSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const scheduleSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.SCHEDULE",
      { user_id, search_text, brand_id },
      { language: "sql", indent: "  " }
    );
    const scheduleSelectResult = await req.sequelize.query(
      scheduleSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    const sendoutSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.SENDOUT",
      { user_id, search_text, brand_id },
      { language: "sql", indent: "  " }
    );
    const sendoutSelectResult = await req.sequelize.query(sendoutSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const pressSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.PRESS",
      { user_id, search_text, brand_id },
      { language: "sql", indent: "  " }
    );
    const pressSelectResult = await req.sequelize.query(pressSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      net_count_app: showroomSelectResult.length + lookbookSelectResult.length,
      net_count_web:
        showroomSelectResult.length +
        lookbookSelectResult.length +
        reqSelectResult.length +
        scheduleSelectResult.length +
        sendoutSelectResult.length +
        pressSelectResult.length,
      showroom: showroomSelectResult,
      lookbook: lookbookSelectResult,
      web_press: pressSelectResult,
      request: reqSelectResult,
      schedule: scheduleSelectResult,
      sendout: sendoutSelectResult,
      success: true,
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

app.get("/search/showroom", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  let limit = parseInt(isNull(req.query.limit, 10));
  if (limit > 100) limit = 100;
  const offset = parseInt((page - 1) * limit);

  try {
    const showroomSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.SHOWROOM",
      { user_id, search_text, brand_id, limit, offset },
      { language: "sql", indent: "  " }
    );
    const showroomSelectResult = await req.sequelize.query(
      showroomSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      showroom: showroomSelectResult,
      total_count:
        showroomSelectResult.length === 0
          ? 0
          : showroomSelectResult[0].total_count,
      next_page:
        (showroomSelectResult.length == 0
          ? 0
          : showroomSelectResult[0].total_count) /
          limit <=
          page
          ? null
          : parseInt(page, 10) + 1,
      success: true,
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

app.get("/search/lookbook", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  let limit = parseInt(isNull(req.query.limit, 10));
  if (limit > 100) limit = 100;
  const offset = parseInt((page - 1) * limit);

  try {
    const lookbookSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.LOOKBOOK",
      { user_id, search_text, brand_id, limit, offset },
      { language: "sql", indent: "  " }
    );
    const lookbookSelectResult = await req.sequelize.query(
      lookbookSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      lookbook: lookbookSelectResult,
      total_count:
        lookbookSelectResult.length === 0
          ? 0
          : lookbookSelectResult[0].total_count,
      next_page:
        (lookbookSelectResult.length == 0
          ? 0
          : lookbookSelectResult[0].total_count) /
          limit <=
          page
          ? null
          : parseInt(page, 10) + 1,
      success: true,
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

app.get("/search/req", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  let limit = parseInt(isNull(req.query.limit, 10));
  if (limit > 100) limit = 100;
  const offset = parseInt((page - 1) * limit);

  try {
    const reqSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.REQ",
      { user_id, search_text, brand_id, limit, offset },
      { language: "sql", indent: "  " }
    );
    const reqSelectResult = await req.sequelize.query(reqSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      request: reqSelectResult,
      total_count:
        reqSelectResult.length === 0 ? 0 : reqSelectResult[0].total_count,
      next_page:
        (reqSelectResult.length == 0 ? 0 : reqSelectResult[0].total_count) /
          limit <=
          page
          ? null
          : parseInt(page, 10) + 1,
      success: true,
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

app.get("/search/schedule", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  let limit = parseInt(isNull(req.query.limit, 10));
  if (limit > 100) limit = 100;
  const offset = parseInt((page - 1) * limit);

  try {
    const scheduleSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.SCHEDULE",
      { user_id, search_text, brand_id, limit, offset },
      { language: "sql", indent: "  " }
    );
    const scheduleSelectResult = await req.sequelize.query(
      scheduleSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      schedule: scheduleSelectResult,
      total_count:
        scheduleSelectResult.length === 0
          ? 0
          : scheduleSelectResult[0].total_count,
      next_page:
        (scheduleSelectResult.length == 0
          ? 0
          : scheduleSelectResult[0].total_count) /
          limit <=
          page
          ? null
          : parseInt(page, 10) + 1,
      success: true,
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

app.get("/search/sendout", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  let limit = parseInt(isNull(req.query.limit, 10));
  if (limit > 100) limit = 100;
  const offset = parseInt((page - 1) * limit);

  try {
    const sendoutSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.SENDOUT",
      { user_id, search_text, brand_id, limit, offset },
      { language: "sql", indent: "  " }
    );
    const sendoutSelectResult = await req.sequelize.query(sendoutSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      sendout: sendoutSelectResult,
      total_count:
        sendoutSelectResult.length === 0
          ? 0
          : sendoutSelectResult[0].total_count,
      next_page:
        (sendoutSelectResult.length == 0
          ? 0
          : sendoutSelectResult[0].total_count) /
          limit <=
          page
          ? null
          : parseInt(page, 10) + 1,
      success: true,
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

app.get("/search/press", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  let limit = parseInt(isNull(req.query.limit, 10));
  if (limit > 100) limit = 100;
  const offset = parseInt((page - 1) * limit);

  try {
    const pressSelectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.PRESS",
      { user_id, search_text, brand_id, limit, offset },
      { language: "sql", indent: "  " }
    );
    const pressSelectResult = await req.sequelize.query(pressSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      press: pressSelectResult,
      total_count:
        pressSelectResult.length === 0 ? 0 : pressSelectResult[0].total_count,
      next_page:
        (pressSelectResult.length == 0 ? 0 : pressSelectResult[0].total_count) /
          limit <=
          page
          ? null
          : parseInt(page, 10) + 1,
      success: true,
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
 * "/showroom-request-popup/:req_no":
 *   get:
 *     tags: [요청]
 *     summary: "샘플요청에 관한 팝업 API"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청번호"
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210226000048"
 *     responses:
 *       200:
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             req_user_nm:
 *               description: "요청한 유저 이름"
 *               type: string
 *               example: "이영표"
 *             req_user_posi:
 *               description: "요청한 유저 직급"
 *               type: string
 *               example: "팀장"
 *             compy_nm:
 *               description: "요청한 유저 회사(잡지)이름"
 *               type: string
 *               example: "테스트매거진1"
 *             compy_logo_adres:
 *               description: "요청한 유저 회사 로고 주소"
 *               type: string
 *               example: "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/"
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */

app.get("/showroom-request-popup/:req_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const req_no = isNull(req.params.req_no, null);
  const model_type = isNull(req.query.model_type, null);
  try {
    const selectQuery1 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.REQUEST.POPUP.001",
      { user_id, brand_id, req_no },
      { language: "sql", indent: "  " }
    );
    const selectResult1 = await req.sequelize.query(selectQuery1, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery2 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.REQUEST.POPUP.002",
      { user_id, brand_id, req_no },
      { language: "sql", indent: "  " }
    );
    const selectResult2 = await req.sequelize.query(selectQuery2, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery3 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.REQUEST.POPUP.003",
      { user_id, brand_id, req_no },
      { language: "sql", indent: "  " }
    );
    const selectResult3 = await req.sequelize.query(selectQuery3, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json(
      Object.assign(selectResult2[0], {
        popup_list: selectResult1,
        reservation_list: selectResult3,
        success: true,
      })
    );
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
 * "/showroom-request/{req_no}":
 *   get:
 *     tags: [샘플요청]
 *     summary: "샘플요청 상세조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 번호"
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210127000015"
 *     responses:
 *       200:
 *         description: "성공. showroom_list 안의 showroom_status는 'confirmed','rejected','undefined' 세 가지 상태를 가짐."
 *         schema:
 *           type: object
 *           properties:
 *             editable:
 *               description: "수정 가능 여부 (브랜드사 측에서 확인한 후 수정 불가능)"
 *               type: boolean
 *               example: true
 *             req_send_username:
 *               description: "보낸 사람의 이름 (기획 변경으로 인해 조회하는 사람의 유저네임이 아닐 수 있음)"
 *               type: string
 *               example: "최홍만"
 *             mgzn_nm:
 *               description: "보낸 사람의 (매거진) 회사"
 *               type: string
 *               example: "최홍만"
 *             brand_nm:
 *               description: "브랜드의 이름"
 *               type: string
 *               example: "테스트브랜드3"
 *             brand_logo_url_adres:
 *               description: "브랜드의 로고 주소"
 *               type: string
 *               example: "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com"
 *             contact_username:
 *               description: "브렌드로부터 연락을 받을 유저 이름"
 *               type: string
 *               example: "john"
 *             contact_id:
 *               description: "브랜드로부터 연락을 받을 유저의 ID"
 *               type: string
 *               example: "3a27da16-9b06-43a1-964e-70f70acf9806"
 *             contact_phone_no:
 *               description: "브랜드로부터 연락을 받을 유저의 전화번호"
 *               type: string
 *               example: "01044744444"
 *             shooting_date:
 *               description: "촬영 날짜"
 *               type: integer
 *               example: 1611619200
 *             shooting_start_time:
 *               description: "촬영 시작 시각"
 *               type: string
 *               example: "10"
 *             shooting_end_time:
 *               description: "촬영 종료 시각"
 *               type: string
 *               example: "11"
 *             pickup_date:
 *               description: "예상 수령 날짜"
 *               type: integer
 *               example: 1611100800
 *             returning_date:
 *               description: "예상 반환 날짜"
 *               type: integer
 *               example: 1611619200
 *             dlvy_adres_nm:
 *               description: "배송 주소"
 *               type: string
 *               example: "송촌빌딩 13층"
 *             dlvy_atent_matter:
 *               description: "배송메시지"
 *               type: string
 *               example: "상품 늦지않게 보내주세요!"
 *             photogrf_concept:
 *               description: "촬영 컨셉"
 *               type: string
 *               example: "멋짐"
 *             photogrf_modl_se_cd:
 *               description: "모델 타입 일련번호"
 *               type: string
 *               example: "PMS002"
 *             model_list:
 *               description: "모델의 배열"
 *               type: array
 *               example: [영희, 철수]
 *             celeb_list:
 *               description: "셀럽의 배열"
 *               type: array
 *               example: [영희, 철수]
 *             own_paid_pictorial_yn:
 *               description: "자사 유가화보 유무"
 *               type: boolean
 *               example: true
 *             own_paid_pictorial_content:
 *               description: "자사 유가화보 내용"
 *               type: string
 *               example: "제목"
 *             other_paid_pictorial_yn:
 *               description: "타사 유가화보 유무"
 *               type: boolean
 *               example: true
 *             other_paid_pictorial_content:
 *               description: "타사 유가화보 내용"
 *               type: string
 *               example: "제목"
 *             loc_yn:
 *               description: "로케촬영의 여부"
 *               type: boolean
 *               example: true
 *             loc_value:
 *               description: "로케촬영의 내용"
 *               type: string
 *               example: "강남구 ㅇㅇ번지"
 *             today_connect:
 *               description: "당일연결희망가능여부"
 *               type: boolean
 *               example: true
 *             page_cnt:
 *               description: "페이지 수"
 *               type: string
 *               example: "5"
 *             etc_brand_info:
 *               description: "기타브랜드정보"
 *               type: string
 *               example: "샤넬"
 *             message:
 *               description: "브랜드에게 보내는 메시지"
 *               type: string
 *               example: "상품 늦지않게 보내주세요!"
 *             showroom_list:
 *               description: "주문한 쇼룸의 목록. showroom_status 항목은 'selected','rejected','undefined' 세 상태를 가진다"
 *               type: array
 *               example: [
    {
      "showroom_no": "20210225000039",
      "showroom_status": "undecided",
      "showroom_nm": "TEST LOOK #1",
      "image_url": null
    }
  ]
 *             success:
 *               description: "성공 여부"
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

  app.get("/showroom-request/:req_no", async function (req, res) {
    const user_id = req.user_id;
    const req_no = isNull(req.params.req_no, null);
    if ([req_no].includes(null)) {
      res.status(400).json({ success: false, error: "bad parameter" });
      return;
    }
    try {
      const selectQuery = req.mybatisMapper.getStatement(
        "MAGAZINE",
        "SELECT.REQUEST.004",
        {
          req_no,
        },
        { language: "sql", indent: "  " }
      );
      const selectResult = await req.sequelize.query(selectQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      });
      const selectQuery2 = req.mybatisMapper.getStatement(
        "MAGAZINE",
        "SELECT.REQUEST.005",
        {
          req_no,
        },
        { language: "sql", indent: "  " }
      );
      const selectResult2 = await req.sequelize.query(selectQuery2, {
        type: req.sequelize.QueryTypes.SELECT,
      });
      if (selectResult.length === 0) {
        res.status(400).json({
          success: false,
          error: "this request does not exist or has been deleted",
        });
        return;
      } else {
        res.json(
          Object.assign(selectResult[0], {
            showroom_list: selectResult2,
            success: true,
          })
        );
      }
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
 * "/showroom-request-urgency/:date":
 *   get:
 *     tags: [요청]
 *     summary: "urgency 기준의 샘플요청목록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "date"
 *         description: "날짜"
 *         in: path
 *         required: true
 *         type: string
 *         example: "1611673200"
 *       - name: "model_type"
 *         description: "모델 유형 (PMS001은 셀럽, PMS002는 패션모델, PMS004은 둘 다)"
 *         in: path
 *         required: true
 *         type: string
 *         example: "1611673200"
 *     responses:
 *       200:
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             request_list:
 *               description: "샘플요청 목록"
 *               type: array
 *               example: [ { "showroom_no": "20210125000008", "showroom_nm": "테스트 쇼룸 1", "image_url": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/2", "user_info": [ { "req_no": "20210126000011", "req_user_nm": "테스트", "req_user_posi": "팀장", "compy_nm": "테스트매거진1", "compy_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "user_type": "magazine", "model_list": null, "celeb_list": null, "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "photogrf_concept": "멋짐", "duty_recpt_dt": "2021-01-20T00:00:00", "return_prearnge_dt": "2021-01-26T00:00:00", "photogrf_dt": "2021-01-26T00:00:00", "assi_user_nm": "이영표", "assi_phone_no": "01098773333", "showroom_img_array": [ "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/2", "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/3" ] }, { "req_no": "20210126000012", "req_user_nm": "테스트", "req_user_posi": "팀장", "compy_nm": "테스트매거진1", "compy_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "user_type": "magazine", "model_list": [ "영희", "철수" ], "celeb_list": [ "영희", "철수" ], "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "photogrf_concept": "멋짐", "duty_recpt_dt": "2021-01-20T00:00:00", "return_prearnge_dt": "2021-01-26T00:00:00", "photogrf_dt": "2021-01-26T00:00:00", "assi_user_nm": "테스트", "assi_phone_no": "01044444444", "showroom_img_array": [ "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/2" ] } ] }, { "showroom_no": "20210125000009", "showroom_nm": "테스트 쇼룸 1", "image_url": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/3", "user_info": [ { "req_no": "20210126000011", "req_user_nm": "테스트", "req_user_posi": "팀장", "compy_nm": "테스트매거진1", "compy_logo_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "user_type": "magazine", "model_list": null, "celeb_list": null, "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "photogrf_concept": "멋짐", "duty_recpt_dt": "2021-01-20T00:00:00", "return_prearnge_dt": "2021-01-26T00:00:00", "photogrf_dt": "2021-01-26T00:00:00", "assi_user_nm": "이영표", "assi_phone_no": "01098773333", "showroom_img_array": [ "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/2", "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/3" ] } ] } ]
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */

app.get("/showroom-request-urgency/:date", async function (req, res) {
  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const model_type = isNull(req.query.model_type, null);
  const date = isNull(req.params.date, null);
  try {
    const selectQuery1 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.REQUEST.URGENCY.001",
      { offset, limit, user_id, brand_id, model_type, date },
      { language: "sql", indent: "  " }
    );
    const selectResult1 = await req.sequelize.query(selectQuery1, {
      type: req.sequelize.QueryTypes.SELECT,
    });


    res.json({
      request_list: selectResult1,
      total_count: selectResult1.length == 0 ? 0 : selectResult1[0].total_count,
      next_page:
        (selectResult1.length == 0 ? 0 : selectResult1[0].total_count) /
          limit <=
          page
          ? null
          : parseInt(page, 10) + 1,
      success: true,
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


app.get("/showroom-request-reservation/:req_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;  
  const req_no = isNull(req.params.req_no, null);
  try {
    const selectQuery3 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.REQUEST.POPUP.003",
      { user_id, brand_id, req_no },
      { language: "sql", indent: "  " }
    );
    const selectResult3 = await req.sequelize.query(selectQuery3, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      reservation_list: selectResult3,      
      success: true,
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
 * "/showroom-request-requests":
 *   get:
 *     tags: [요청]
 *     summary: "requests 기준의 샘플요청목록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "model_type"
 *         description: "모델 유형 (PMS001은 셀럽, PMS002는 패션모델, PMS003은 둘 다)"
 *         in: path
 *         required: true
 *         type: string
 *         example: "1611673200"
 *       - name: "page"
 *         description: "페이지 넘버(1부터 시작). 기본값 1"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1
 *       - name: "limit"
 *         description: "페이지당 크기(기본값 10)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             total_count:
 *               description: "전체 항목 개수"
 *               type: integer
 *               example: 2
 *             request_list:
 *               description: "샘플요청 목록"
 *               type: array
 *               example: [ { "req_no": "20210126000012", "mgzn_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "thumnail_image_url": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/2", "req_user_nm": "테스트", "mgzn_nm": "테스트매거진1", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "request_date": 1611639280, "total_count": 35 } ]
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */

app.get("/showroom-request-requests", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const model_type = isNull(req.query.model_type, null);
  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);
  try {
    const selectQuery1 = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.REQUEST.REQUESTS.001",
      { user_id, brand_id, model_type, offset, limit },
      { language: "sql", indent: "  " }
    );
    const selectResult1 = await req.sequelize.query(selectQuery1, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      total_count: selectResult1.length > 0 ? selectResult1[0].total_count : 0,
      request_list: selectResult1,

      success: true,
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
 * "/custom-season":
 *   post:
 *     tags: [디지털쇼룸]
 *     summary: "계절 생성"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "season_nm"
 *         description: "시즌명"
 *         in: body
 *         required: true
 *         type: string
 *         example: "으악"
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
 *             sys_inqry_no:
 *               description: "문의 일련번호"
 *               type: string
 *               example: "20210121000006"
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.post("/custom-season", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const season_nm = isNull(req.body.season_nm, null);

  if (season_nm == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const insertQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "INSERT.CUSTOM.SEASON",
      { user_id, brand_id, season_nm },
      { language: "sql", indent: "  " }
    );

    await req.sequelize.query(insertQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      success: true,
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
 * "/custom-season-list":
 *   get:
 *     tags: [디지털쇼룸]
 *     summary: "계절 목록 조회"
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
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"cd_id":"SS0001","cd_nm":"Cruise"},{"cd_id":"SS0002","cd_nm":"Spring/Summer"},{"cd_id":"SS0003","cd_nm":"Pre-fall"},{"cd_id":"SS0004","cd_nm":"Fall/Winter"},{"cd_id":"SS0005","cd_nm":"Carry Over"},{"cd_id":"000000","cd_nm":null}]
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.get("/custom-season-list", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.BRAND.SEASON.LIST",
      { user_id, brand_id },
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
    res.status(500).json({
      success: false,
      error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/brand-holiday":
 *   post:
 *     tags: [휴일]
 *     summary: "휴일 등록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "holiday_list"
 *         description: "휴일 목록(UTC 정수)"
 *         in: body
 *         required: true
 *         type: array
 *         example: [2321312324, 2321321321]
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
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.post("/brand-holiday", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const holiday_list = isNull(req.body.holiday_list, []);

  try {
    const promises = holiday_list.map((e) => {
      const insertQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "INSERT.BRAND.HOLIDAY",
        { user_id, brand_id, holiday_utc: e },
        { language: "sql", indent: "  " }
      );

      return req.sequelize.query(insertQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      });
    });

    await Promise.all(promises);

    res.json({
      success: true,
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
 * "/brand-holiday-delete":
 *   put:
 *     tags: [휴일]
 *     summary: "휴일 삭제"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "holiday_list"
 *         description: "휴일 목록(UTC 정수)"
 *         in: body
 *         required: true
 *         type: array
 *         example: [2321312324, 2321321321]
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
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.put("/brand-holiday-delete", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const holiday_list = isNull(req.body.holiday_list, []);

  try {
    const promises = holiday_list.map((e) => {
      const deleteQuery = req.mybatisMapper.getStatement(
        "BRAND",
        "DELETE.BRAND.HOLIDAY",
        { user_id, brand_id, holiday_utc: e },
        { language: "sql", indent: "  " }
      );

      return req.sequelize.query(deleteQuery, {
        type: req.sequelize.QueryTypes.SELECT,
      });
    });

    await Promise.all(promises);

    res.json({
      success: true,
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
 * "/brand-holiday":
 *   get:
 *     tags: [휴일]
 *     summary: "휴일 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "year"
 *         description: "조회할 연도"
 *         in: query
 *         required: false
 *         type: string
 *         example: '2021'
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
 *             list:
 *               description: ""
 *               type: array
 *               example: [1232323, 123124231321]
 *       400:
 *         description: "잘못된 매개변수"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "bad parameter"
 *       500:
 *         description: "서버 오류"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: false
 *             error:
 *               description: "실패 이유"
 *               type: string
 *               example: "internal server serror"
 */
app.get("/brand-holiday", async function (req, res) {
  let year_default = new Date();
  year_default.setHours(year_default.getHours() + 9);
  year_default = year_default.getFullYear();

  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const year = isNull(req.query.year, year_default);

  if (year == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.BRAND.HOLIDAY",
      { user_id, brand_id, year },
      { language: "sql", indent: "  " }
    );

    let list = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    list = list.map((e) => e.holiday_utc);

    res.json({
      success: true,
      list,
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
/* search-brand */
app.get("/search-brand-showroom", async function (req, res) {
  const user_id = req.user_id;
  const brand_id = req.brand_id;
  const search_text = isNull(req.query.search_text, null);
    const showroom_no = isNull(req.query.showroom_no, null);
  try {
    
    
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SEARCH.BRAND.SHOWROOM",
      {
        brand_id,search_text,showroom_no
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

module.exports = app;
