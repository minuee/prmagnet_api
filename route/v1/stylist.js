let express = require("express");
let app = express.Router();

const _ = require("lodash");

const { isNull } = require("../../lib/util");
const insertLog = require("../../lib/error.log");

const CURRENT_SYSTEM_TYPE = "STYLIST";

// 권한제어
app.use((req, res, next) => {
  if (req.is_stylist_user == false) {
    res.status(403).json({
      success: false,
      error: "you are not stylist user",
    });
    return;
  }

  //console.log("you are magazine user");

  next();
});

app.use("/test", async (req, res) => {
  res.json(
    await req.sequelize.query(`select * from tb_dlvy_adres`, {
      type: req.sequelize.QueryTypes.SELECT,
    })
  );
});
/*
// 권한제어
app.use((req, res, next) => {
    if (req.is_mgzn_user == false) {
        res.status(403).json({
            success: false,
            error: "you are not magazine user",
            not_actor: false,
            not_director: true,
        });
        return;
    }

    //console.log("you are magazine user");

    next();
});*/

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
 *       - name: "mgzn_pos_cd"
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
  const compy_nm = isNull(req.body.compy_nm, null);
  const stylist_pos_cd = isNull(req.body.stylist_pos_cd, null);
  const phone_no = isNull(req.body.phone_no, null);
  const team_user_id = isNull(req.body.team_user_id, null);
  const img_url_adres = isNull(req.body.img_url_adres, null);

  if ([user_nm, compy_nm, stylist_pos_cd, phone_no].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "UPDATE.MY.PROFILE",
      {
        user_id,
        user_nm,
        stylist_pos_cd,
        phone_no,
        team_user_id,
        compy_nm,
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
      // error: String(error),
    });
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/push-token":
 *   post:
 *     tags: [푸시토큰]
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
  const stylist = true;
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
        stylist,
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

/**
 * @swagger
 * "/alarm":
 *   get:
 *     tags: [알림]
 *     summary: "알림 목록"
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
 *             list:
 *               description: "목록"
 *               type: array
 *               example: [ { "notice_id": "20210122000007", "brand_id": "BRAND_TEST003", "send_user_id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed", "send_dt": 1611315387, "recv_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "subj": "메시지 7번", "cntent": "7번의 내용", "brand_nm": "테스트브랜드3", "username": null, "req_hist_notifi_se_cd": null, "req_type": null, "notifi_type": "brand" }, { "notice_id": "20210122000006", "brand_id": null, "send_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "send_dt": 1611314870, "recv_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "subj": "5번 샘플 메시지입니다", "cntent": "확인 부탁드립니다", "brand_nm": null, "username": "최홍만", "req_hist_notifi_se_cd": "RHNS05", "req_type": "대여", "notifi_type": "req" }]
 *             total_count:
 *               description: ""
 *               type: integer
 *               example: 11
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

app.get("/alarm", async function (req, res) {
  const user_id = req.user_id;

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  if (Number.isInteger(limit) == false || Number.isInteger(offset) == false) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.ALARM.LIST.001",
      { offset, limit, user_id },
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
 *     tags: [알림]
 *     summary: "문의 생성"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "notice_id"
 *         description: "삭제할 문의들의 ID"
 *         in: query
 *         required: true
 *         type: string
 *         example: "20210122000001"
 *       - name: "notifi_type"
 *         description: "알림의 유형으로, 'req'와 'brand'가 있다"
 *         in: query
 *         required: true
 *         type: string
 *         example: "req"
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

app.delete("/alarm-delete", async function (req, res) {
  const user_id = req.user_id;
  const alarm_id = isNull(req.query.notice_id, null);
  const notifi_type = isNull(req.query.notifi_type, null);
  if ([alarm_id, notifi_type].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  try {
    if (notifi_type === "brand") {
      const deleteAlarm = req.mybatisMapper.getStatement(
        "MAGAZINE",
        "DELETE.ALARM.001",
        {
          user_id,
          alarm_id,
        },
        { language: "sql", indent: "  " }
      );
      await req.sequelize.query(deleteAlarm, {
        type: req.sequelize.QueryTypes.SELECT,
      });
    } else {
      const deleteAlarm = req.mybatisMapper.getStatement(
        "MAGAZINE",
        "DELETE.ALARM.002",
        {
          user_id,
          alarm_id,
        },
        { language: "sql", indent: "  " }
      );
      await req.sequelize.query(deleteAlarm, {
        type: req.sequelize.QueryTypes.SELECT,
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
 * "/showroom-request":
 *   post:
 *     tags: [샘플요청]
 *     summary: "샘플 요청을 작성할 때 페이지에 기본적으로 표시되는 정보들을 출력한다"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_list"
 *         description: "현재 선택한 쇼룸들"
 *         in: body
 *         required: false
 *         type: array
 *         example: ["20210125000008","20210125000009","20210125000010"]
 *       - name: "brand_id"
 *         description: "선택한 쇼룸들의 브랜드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "BRAND_TEST001"
 *     responses:
 *       200:
 *         description: "성공. showroom_no=쇼룸 번호. showroom_nm=쇼룸 이름. img_url_adres=쇼룸 이미지 주소. img_path=이미지 경로. user_nm=유저네임. mgzn_nm=잡지사 이름. dlvy_adres_nm=배송지 상세주소.dlvy_adres_no=배송지 주소 일련번호. post_no=우편번호. rn_adres=도로명주소. lmn_adres=지번주소. user_id=브랜드유저ID. brand_user_nm=브랜드유저 이름. phone_no=브랜드유저 전화번호. brand_id=브랜드ID"
 *         schema:
 *           type: object
 *           properties:
 *             showroom_info:
 *               description: "선택한 쇼룸들의 정보. (showroom_list를 입력했을 시만 나옴)"
 *               type: array
 *               example: [ { "showroom_no": "20210125000009", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com5", "img_path": "5" }, { "showroom_no": "20210125000010", "showroom_nm": "테스트 쇼룸 1", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com", "img_path": null } ]
 *             user:
 *               description: "유저정보+배송지 정보."
 *               type: array
 *               example: [ { "user_nm": "최홍만", "mgzn_nm": "테스트매거진1", "dlvy_adres_nm": "송촌빌딩 13층", "dlvy_adres_no": "20210125000002", "post_no": "06132", "rn_adres": null, "lmn_adres": null } ]
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
app.post("/showroom-request", async function (req, res) {
  const user_id = req.user_id;
  const showroom_list = isNull(req.body.showroom_list, null);
  const brand_id = isNull(req.body.brand_id, null);
  let year_default = new Date();
  year_default.setHours(year_default.getHours() + 9);
  year_default = year_default.getFullYear();
  if (brand_id === null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  try {
    var selectResult_1 = null;
    let selectQuery_1 = null;
    if (showroom_list != null) {
      selectQuery_1 = req.mybatisMapper.getStatement(
        "STYLIST",
        "SELECT.REQUEST.001",
        { showroom_list },
        { language: "sql", indent: "  " }
      );
      selectResult_1 = await req.sequelize.query(selectQuery_1, {
        type: req.sequelize.QueryTypes.SELECT,
      });
    }
    // 매거진 이름과 유저네임
    const selectQuery_2 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.REQUEST.002",
      { user_id },
      { language: "sql", indent: "  " }
    );
    const selectResult_2 = await req.sequelize.query(selectQuery_2, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    let selectResult_3 = [];
    let selectResult_4 = [{user_nm:'',mgzn_nm:''}];
    if ( selectResult_2.length > 0 ) {
      // 메거진 연락용 유저 이름, ID, 전화번호 출력
      const selectQuery_3 = req.mybatisMapper.getStatement(
        "STYLIST",
        "SELECT.REQUEST.003",
        { mgzn_id : selectResult_2[0].mgzn_id },
        { language: "sql", indent: "  " }
      );
      // //console.log(JSON.stringify(updateQuery));
      selectResult_3 = await req.sequelize.query(selectQuery_3, {
        type: req.sequelize.QueryTypes.SELECT,
      });
    

      const selectQuery_4 = req.mybatisMapper.getStatement(
        "STYLIST",
        "SELECT.REQUEST.006",
        { user_id, mgzn_id : selectResult_2[0].mgzn_id  },
        { language: "sql", indent: "  " }
      );
      // //console.log(JSON.stringify(updateQuery));
      selectResult_4 = await req.sequelize.query(selectQuery_4, {
        type: req.sequelize.QueryTypes.SELECT,
      });
    }

    const selectQuery_5 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.REQUEST.007",
      { brand_id },
      { language: "sql", indent: "  " }
    );
    // //console.log(JSON.stringify(updateQuery));
    const selectResult_5 = await req.sequelize.query(selectQuery_5, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (showroom_list === null) {
      res.json({
        user_nm: selectResult_4[0].user_nm,
        mgzn_nm: selectResult_4[0].mgzn_nm,
        user: selectResult_2,
        ...selectResult_5[0],
        contact_info: selectResult_3,
        success: true,
      });
    } else {
      res.json({        
        user_nm: selectResult_4[0].user_nm,
        mgzn_nm: selectResult_4[0].mgzn_nm,
        showroom_info: selectResult_1,
        contact_info: selectResult_3,
        ...selectResult_5[0],
        user: selectResult_2,
        success: true,
        qry:selectQuery_1
      });
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
 * "/brand-holiday":
 *   get:
 *     tags: [휴일]
 *     summary: "휴일 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "year"
 *         description: "조회할 연도"
 *         in: body
 *         required: false
 *         type: string
 *         example: '2021'
 *       - name: "brand_id"
 *         description: "브랜드ID"
 *         in: body
 *         required: true
 *         type: string
 *         example: '2'
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
  const brand_id = req.query.brand_id;
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

/**
 * @swagger
 * "/showroom-request-send":
 *   post:
 *     tags: [샘플요청]
 *     summary: "사용자의 샘플요청을 서버에 전송"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_id"
 *         description: "선택한 쇼룸들의 브랜드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "BRAND_TEST001"
 *       - name: "duty_recpt_dt"
 *         description: "의무수령일시 Pickup Date (시/분/초는 적당히-->날짜만 맞으면 됨)"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 1611624568
 *       - name: "photogrf_dt"
 *         description: "촬영일자 Shooting Date (시/분/초는 적당히-->날짜만 맞으면 됨)"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 1611624568
 *       - name: "begin_dt"
 *         description: "촬영시작시각 (시/분/초는 적당히-->날짜만 맞으면 됨)"
 *         in: body
 *         required: true
 *         type: string
 *         example: "10"
 *       - name: "end_dt"
 *         description: "촬영종료시각 (시/분/초는 적당히-->날짜만 맞으면 됨)"
 *         in: body
 *         required: true
 *         type: string
 *         example: "11"
 *       - name: "return_prearnge_dt"
 *         description: "예상반환일자 Returning Date (시/분/초는 적당히-->날짜만 맞으면 됨)"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 1611624568
 *       - name: "photogrf_concept"
 *         description: "촬영의 컨셉"
 *         in: body
 *         required: true
 *         type: string
 *         example: "멋짐"
 *       - name: "model_list"
 *         description: "모델 리스트"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["영희", "철수"]
 *       - name: "celeb_list"
 *         description: "셀럽의 리스트"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["영희", "철수"]
 *       - name: "page_cnt"
 *         description: "페이지수"
 *         in: body
 *         required: true
 *         type: string
 *         example: "5"
 *       - name: "etc_brand"
 *         description: "함께 들어가는 브랜드"
 *         in: body
 *         required: true
 *         type: string
 *         example: "샤넬"
 *       - name: "today_connect"
 *         description: "당일연결 유무"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: true
 *       - name: "add_req_cntent"
 *         description: "추가적인 요구사항->요청화면의 Message 텍스트박스"
 *         in: body
 *         required: true
 *         type: string
 *         example: "아무말"
 *       - name: "dlvy_adres_nm"
 *         description: "배송주소"
 *         in: body
 *         required: true
 *         type: string
 *         example: "송촌빌딩 13층"
 *       - name: "adres_detail"
 *         description: "상세주소"
 *         in: body
 *         required: true
 *         type: string
 *         example: "상세주소명"
 *       - name: "dlvy_atent_matter"
 *         description: "배송 요구사항->Shipping Notes 텍스트박스에 해당됨"
 *         in: body
 *         required: true
 *         type: string
 *         example: "배송메시지"
 *       - name: "showroom_list"
 *         description: "현재 선택한 쇼룸들"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["20210125000008","20210125000009","20210125000010"]
 *       - name: "contact_user_id"
 *         description: "브랜드의 연락을 받을 매거진 유저의 ID"
 *         in: body
 *         required: true
 *         type: string
 *         example: "3a27da16-9b06-43a1-964e-70f70acf9806"
 *       - name: "loc_value"
 *         description: "로케쵤영 정보"
 *         in: body
 *         required: true
 *         type: string
 *         example: ""
 *       - name: "own_paid_pictorial_content"
 *         description: "자사 유가화보 내용"
 *         in: body
 *         required: false
 *         type: string
 *         example: "내용"
 *       - name: "other_paid_pictorial_content"
 *         description: "타사 유가화보 내용"
 *         in: body
 *         required: false
 *         type: string
 *         example: "내용"
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
app.post("/showroom-request-send", async function (req, res) {
  // req_no는 디폴트
  // req_status_cd는 요청용 코드
  // req_user_se_cd는 매거진 코드
  // req_user_id용->유저ID
  const user_id = req.user_id;
  // req_dt는 디폴트
  // brand_id용->브랜드ID
  const brand_id = isNull(req.body.brand_id, null);
  //duty_recpt_dt용->의무수령일시
  const duty_recpt_dt = isNull(req.body.duty_recpt_dt, null);
  // photogrf_dt용 ->촬영시간
  const photogrf_dt = isNull(req.body.photogrf_dt, null);
  const begin_dt_0 = isNull(req.body.begin_dt, null);
  const end_dt_0 = isNull(req.body.end_dt, null);
  // return_prearnge_dt용->예상반환일자
  const return_prearnge_dt = isNull(req.body.return_prearnge_dt, null);
  // photogrf_cntent용->촬영 컨셉+슈팅타임
  const photogrf_cntent =
    isNull(req.body.photogrf_concept, "") + "의 컨셉으로 촬영";
  const photogrf_concept = isNull(req.body.photogrf_concept, "");
  // photogrf_modl_se_cd용->모델구분
  const celeb_list = isNull(req.body.celeb_list, []);
  // photogrf_modl_nm용-> 모델이름
  const model_list = isNull(req.body.model_list, []);
  // pchrg_picalbm_yn용->유료화보 유무
  let picalbm_yn = true;
  let own_paid_pictorial_yn = true;
  let other_paid_pictorial_yn = true;
  const own_paid_pictorial_content = isNull(
    req.body.own_paid_pictorial_content,
    null
  );
  const other_paid_pictorial_content = isNull(
    req.body.other_paid_pictorial_content,
    null
  );
  // pchrg_picalbm_cntent용->유료화보 이름
  if (own_paid_pictorial_content === null) {
    own_paid_pictorial_yn = false;
    if (other_paid_pictorial_content === null) {
      picalbm_yn = false;
      other_paid_pictorial_yn = false;
    }
  } else if (other_paid_pictorial_content === null) {
    other_paid_pictorial_yn = false;
  }
  // page_cnt용->페이지수
  const page_cnt = isNull(req.body.page_cnt, null);
  // etc_brand_info용-> 함께 들어가는 브랜드
  const etc_brand = isNull(req.body.etc_brand, null);
  // today_connect_hope_posbl_yn용->당일연결
  const today_connect = isNull(req.body.today_connect, null);
  // add_req_cntent용->Message
  const add_req_cntent = isNull(req.body.add_req_cntent, null);
  // dlvy_adres_no->배송주소
  const dlvy_adres_nm = isNull(req.body.dlvy_adres_nm, null);
  const adres_detail = isNull(req.body.adres_detail, null);
  const dlvy_adres_no = isNull(req.body.dlvy_adres_no, '0');
  //dlvy_atent_matter용-> Shipping Notes
  const dlvy_atent_matter = isNull(req.body.dlvy_atent_matter, null);
  // del_yn은 디폴트
  const showroom_list = isNull(req.body.showroom_list, null);
  const contact_user_id = isNull(req.body.contact_user_id, null);
  let loc_yn = true;
  const len = showroom_list.length.toString();
  const loc_value = isNull(req.body.loc_value, null);
  if (loc_value === null) {
    loc_yn = false;
  }
  if (
    [
      brand_id,
      duty_recpt_dt,
      begin_dt_0,
      end_dt_0,
      photogrf_dt,
      return_prearnge_dt,
      picalbm_yn,
      today_connect,
      dlvy_adres_nm,
      showroom_list,
      contact_user_id,
      photogrf_concept,
      loc_yn,
      adres_detail,
    ].includes(null)
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  const begin_dt = Number(begin_dt_0);
  const end_dt = Number(end_dt_0);
  let modl_se_cd = "";
  if (
    model_list.length === 0 ||
    model_list === null ||
    (model_list.length === 1 && model_list[0] === "")
  ) {
    if (
      celeb_list.length === 0 ||
      celeb_list === null ||
      (celeb_list.length === 1 && celeb_list[0] === "")
    ) {
      res.status(400).json({ success: false, error: "bad parameter" });
      return;
    } else {
      modl_se_cd = "PMS001";
    }
  } else {
    if (
      celeb_list.length === 0 ||
      celeb_list === null ||
      (celeb_list.length === 1 && celeb_list[0] === "")
    ) {
      modl_se_cd = "PMS002";
    } else {
      modl_se_cd = "PMS004";
    }
  }
  try {
    const selectQuery_1 = req.mybatisMapper.getStatement(
      "STYLIST",
      "INSERT.REQUEST.001",
      {
        user_id,
        brand_id,
        duty_recpt_dt,
        begin_dt,
        end_dt,
        photogrf_dt,
        return_prearnge_dt,
        photogrf_cntent,
        modl_se_cd,
        model_list,
        celeb_list,
        picalbm_yn,
        own_paid_pictorial_yn,
        own_paid_pictorial_content,
        other_paid_pictorial_yn,
        other_paid_pictorial_content,
        page_cnt,
        etc_brand,
        today_connect,
        add_req_cntent,
        dlvy_atent_matter,
        contact_user_id,
        showroom_list,
        dlvy_adres_no,
        dlvy_adres_nm,
        photogrf_concept,
        loc_yn,
        loc_value,
        adres_detail,
        len,
      },
      { language: "sql", indent: "  " }
    );
    const push_result = await req.sequelize.query(selectQuery_1, {
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
 * "/sample-not-receive":
 *   post:
 *     tags: [샘플수령]
 *     summary: "샘플 미수령."
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
app.post("/sample-not-receive", async function (req, res) {
  const user_id = isNull(req.user_id, null);

  const req_no = isNull(req.body.req_no, null);

  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "CHECK.ACCESSABLE.REQ.STYLIST",
      {
        req_no,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can create.",
      });
      return;
    }
    const insertQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "UPDATE.SAMPLE.NOT.RECEIVE",
      {
        user_id,
        req_no,
        user_type: CURRENT_SYSTEM_TYPE,
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
 * "/my-info":
 *   get:
 *     tags: [내정보]
 *     summary: "사용자 정보 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *     responses:
 *       200:
 *         description: "성공. mgzn_user_nm=유저 이름. mgzn_id=유저 잡지ID. user_position_id=유저 직급ID. phone_no=유저 전화번호. email_adres=유저 이메일주소. post_no=유저 우편번호. adres=유저 주소. img_url_adres=유저 사진 주소. img_path=사진 경로. teammate_id=유저 팀원 일련번호. mgzn_nm=유저 잡지 이름. company_nm=유저 회사 이름. user_position=유저 직급 이름. teammate_nm=팀원 이름. unread_notifications=읽지 않은 알림 유무. subscr_no=구독 일련번호. subscr_type=구독 형태 (월결제 등등). subscr_chrge_amt=구독비용. subscr_status=구독 상태 (구독중, 취소 등등). payment_complete=구독 결제 유무. subscription_canceled=구독 취소 유무. refund_complet_yn=환불 완료 유무. subscription_ended=구독 만료 유무. subscr_yn=구독 유무. trial_subscr_available=체험판을 사용할 수 있는지 유무. subscr_begin_dt=구독 시작 날짜. subscr_end_dt= 구독 만료 날짜. req_notifi_recv_yn = 요청 알림 수신여부. notice_notifi_recv_yn = 공지사항 알림 수신여부. not_disturb_begin_dt = 방해 금지모드 시작시간. not_disturb_end_dt = 방해 금지모드 종료시간. not_disturb_mode_yn = 방해 금지여부 설정 여부. press_notifi_recv_yn = 보도자료 알림 수신여부. showroom_notifi_recv_yn = 쇼룸 알림 수신여부. brand_notice_notifi_yn=브랜드 공지사항 알림. req_confirm_notifi_yn=샘플 요청 확인 알림. sample_not_recv_notifi_yn=샘플 미수령 알림. sample_send_notifi_yn=샘플 발송 알림
 *
 *
 * 보기 힘들다면 바로 밑에 있는 'Model' 버튼 클릭"
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
 *             adres:
 *               description: "유저 주소"
 *               type: string
 *               example: "캘리포니아"
 *             img_url_adres:
 *               description: "유저 사진 주소"
 *               type: string
 *               example: "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"
 *             img_path:
 *               description: "유저 사진 경로"
 *               type: string
 *               example: "/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"
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
 *               type: boolean
 *               example: false
 *             subscription_canceled:
 *               description: "구독 취소 유무"
 *               type: string
 *               example: "N"
 *             refund_complet_yn:
 *               description: "환불 완료 유무"
 *               type: boolean
 *               example: false
 *             subscription_ended:
 *               description: "구독 만료 유무"
 *               type: boolean
 *               example: false
 *             subscr_yn:
 *               description: "구독 유무"
 *               type: boolean
 *               example: true
 *             trial_subscr_available:
 *               description: "무료채험판이 사용 가능하면 true"
 *               type: boolean
 *               example: true
 *             subscr_begin_dt:
 *               description: "구독 시작 날짜"
 *               type: integer
 *               example: null
 *             subscr_end_dt:
 *               description: "구독 만료 날짜"
 *               type: integer
 *               example: 1612137600
 *             req_notifi_recv_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             notice_notifi_recv_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             not_disturb_begin_dt:
 *               description: ""
 *               type: integer
 *               example: 12321321
 *             not_disturb_end_dt:
 *               description: ""
 *               type: integer
 *               example: 1232134124
 *             not_disturb_mode_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             press_notifi_recv_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             showroom_notifi_recv_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             brand_notice_notifi_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             req_confirm_notifi_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             sample_not_recv_notifi_yn:
 *               description: ""
 *               type: boolean
 *               example: true
 *             sample_send_notifi_yn:
 *               description: ""
 *               type: boolean
 *               example: true
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
app.get("/my-info", async function (req, res) {
  const user_id = req.user_id;
  try {
    const selectQuery_1 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.INFO.001",
      { user_id },
      { language: "sql", indent: "  " }
    );
    const selectResult_1 = await req.sequelize.query(selectQuery_1, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    if (selectResult_1.length > 0) {
    }
    /* res.json(
      Object.assign({success: true,},
        selectResult_1[0]
      )
    ); */
    res.json({
      success: true,
      ...selectResult_1[0],
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
 * "/showroom-request-list":
 *   get:
 *     tags: [샘플요청]
 *     summary: "내 샘플요청 목록 (될 수 있으면 하단의 POST /showroom-request-list를 사용하시길 바랍니다)"
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
 *       - name: "brand_id"
 *         description: "필터할 브랜드 식별자"
 *         in: query
 *         required: false
 *         type: string
 *         example: "BP0003"
 *       - name: "request_status"
 *         description: "필터할 요청 상태. PENDING, CONFIRMED, CANCELED"
 *         in: query
 *         required: false
 *         type: string
 *         example: "으악"
 *       - name: "order_photogrf_dt"
 *         description: "촬영일 정렬 여부"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
 *       - name: "order_req_dt"
 *         description: "요청일 정렬 여부"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
 *       - name: "desc"
 *         description: "오름/내림차순 여부 (desc=true일 때는 내림차순) "
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
 *     responses:
 *       200:
 *         description: "성공. brand_id=브랜드ID. request_date=요청된 날짜. expected_photograph_date=촬영이 예정된 날짜. expected_return_date=반환 예정 날짜. req_status_code=요청상태코드. brand_nm=브랜드 이름. req_status_nm=요청 상태. total_count=총 요청 개수. no=요청번호"
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
 *               example: [ { "req_no": "20210127000018", "brand_id": "BRAND_TEST003", "request_date": 1611100800, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드3", "req_status_nm": "요청", "total_count": 9, "no": 1 }, { "req_no": "20210127000017", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 2 }, { "req_no": "20210127000016", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 3 }, { "req_no": "20210127000015", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 4 }, { "req_no": "20210126000014", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 5 }, { "req_no": "20210126000013", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 6 }, { "req_no": "20210126000012", "brand_id": "BRAND_TEST001", "request_date": 1611014400, "expected_photograph_date": 1611532800, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 7 }, { "req_no": "20210126000011", "brand_id": "BRAND_TEST001", "request_date": 1611100800, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 8 }, { "req_no": "20210126000005", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 9 } ]
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
app.get("/showroom-request-list", async function (req, res) {
  const user_id = req.user_id;
  const page = isNull(req.query.page, 1);
  const brand_id = isNull(req.query.brand_id, null);
  const shooting_date = isNull(req.query.shooting_date, null);
  const request_date = isNull(req.query.request_date, null);
  const request_status = isNull(req.query.request_status, null);
  const order_brand_nm = isNull(req.body.order_brand_nm, null);
  const order_photogrf_dt = isNull(req.body.order_photogrf_dt, null);
  const order_req_dt = isNull(req.body.order_req_dt, null);
  let desc = isNull(req.body.desc, null);
  if (
    order_brand_nm != true &&
    order_photogrf_dt != true &&
    order_req_dt != true
  ) {
    desc = false;
  }
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.REQUEST.LIST.001",
      {
        offset,
        limit,
        user_id,
        brand_id,
        shooting_date,
        request_date,
        request_status,
        order_brand_nm,
        order_photogrf_dt,
        order_req_dt,
        desc,
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
 * "/showroom-request-list":
 *   post:
 *     tags: [샘플요청]
 *     summary: "내 샘플요청 목록"
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
 *       - name: "brand_id"
 *         description: "필터할 브랜드 식별자"
 *         in: query
 *         required: false
 *         type: string
 *         example: "BP0003"
 *       - name: "request_status"
 *         description: "필터할 요청 상태. PENDING, CONFIRMED, CANCELED"
 *         in: query
 *         required: false
 *         type: string
 *         example: "으악"
 *       - name: "order_photogrf_dt"
 *         description: "촬영일 정렬 여부"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
 *       - name: "order_req_dt"
 *         description: "요청일 정렬 여부"
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
 *       - name: "desc"
 *         description: "오름/내림차순 여부 (desc=true일 때는 내림차순) "
 *         in: body
 *         required: false
 *         type: boolean
 *         example: true
 *     responses:
 *       200:
 *         description: "성공. brand_id=브랜드ID. request_date=요청된 날짜. expected_photograph_date=촬영이 예정된 날짜. expected_return_date=반환 예정 날짜. req_status_code=요청상태코드. brand_nm=브랜드 이름. req_status_nm=요청 상태. total_count=총 요청 개수. no=요청번호"
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
 *               example: [ { "req_no": "20210127000018", "brand_id": "BRAND_TEST003", "request_date": 1611100800, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드3", "req_status_nm": "요청", "total_count": 9, "no": 1 }, { "req_no": "20210127000017", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 2 }, { "req_no": "20210127000016", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 3 }, { "req_no": "20210127000015", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 4 }, { "req_no": "20210126000014", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 5 }, { "req_no": "20210126000013", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 6 }, { "req_no": "20210126000012", "brand_id": "BRAND_TEST001", "request_date": 1611014400, "expected_photograph_date": 1611532800, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 7 }, { "req_no": "20210126000011", "brand_id": "BRAND_TEST001", "request_date": 1611100800, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 8 }, { "req_no": "20210126000005", "brand_id": "BRAND_TEST001", "request_date": 1611619200, "expected_photograph_date": 1611619200, "expected_return_date": 1611619200, "req_status_code": "RS0001", "brand_nm": "테스트브랜드1", "req_status_nm": "요청", "total_count": 9, "no": 9 } ]
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
app.post("/showroom-request-list", async function (req, res) {
  const user_id = req.user_id;
  const page = isNull(req.query.page, 1);
  const brand_id = isNull(req.query.brand_id, null);
  const shooting_date = isNull(req.query.shooting_date, null);
  const request_date = isNull(req.query.request_date, null);
  const request_status = isNull(req.query.request_status, null);
  const order_brand_nm = isNull(req.body.order_brand_nm, null);
  const order_photogrf_dt = isNull(req.body.order_photogrf_dt, null);
  const order_req_dt = isNull(req.body.order_req_dt, null);
  let desc = isNull(req.body.desc, null);
  if (
    order_brand_nm != true &&
    order_photogrf_dt != true &&
    order_req_dt != true
  ) {
    desc = false;
  }
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.REQUEST.LIST.001",
      {
        offset,
        limit,
        user_id,
        brand_id,
        shooting_date,
        request_date,
        request_status,
        order_brand_nm,
        order_photogrf_dt,
        order_req_dt,
        desc,
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
 * "/my-schedule-date":
 *   get:
 *     tags: [스케줄]
 *     summary: "날짜별로 분류된 스케줄"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "min_date"
 *         description: "스케줄을 받을 첫 날짜 (20XX년 XX월 XX일 0시0분을 UTC 정수형으로)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1611100800
 *       - name: "max_date"
 *         description: "스케줄을 받을 마지막 날짜 (20XX년 XX월 XX일 0시0분을 UTC 정수형으로)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1611187200
 *     responses:
 *       200:
 *         description: "성공. date=스케줄의 날짜. individual_schedules=각 날짜에 해당되는 일정들. req_no=일정에 해당되는 요청번호. brand_id=브랜드ID. recieve_date=수령날짜. expected_return_date=예정된 반환 날짜. photogrf_cntent=촬영의 컨셉+ 촬영시간. model_list=모델 배열.celeb_list=셀럽 배열. pchrg_picalbm_yn=유료화보 유무. pchrg_picalbm_cntent=유료화보 제목. page_cnt=페이지수. etc_brand_info=함께 들어가는 브랜드. dlvy_adres_no=배송지번호. brand_user_nm=브랜드 유저 이름. brand_nm=브랜드 이름. model_type=모델 구분. dlvy_adres_nm=주소지. dlvy_post_no=우편번호."
 *         schema:
 *           type: object
 *           properties:
 *             list:
 *               description: "목록"
 *               type: array
 *               example: [
    {
      "date": 1611100800,
      "individual_schedules": [
        {
          "req_no": "20210322000151",
          "brand_id": "BRAND_TEST001",
          "receive_date": 1611100800,
          "expected_return_date": 1611619200,
          "photogrf_cntent": "멋짐의 컨셉으로 촬영",
          "model_list": [
            "영희",
            "철수"
          ],
          "celeb_list": [
            "영희",
            "철수"
          ],
          "pchrg_picalbm_yn": true,
          "own_paid_pictorial_yn": true,
          "own_paid_pictorial_content": "책casdfasdf",
          "other_paid_pictorial_yn": true,
          "other_paid_pictorial_content": "asdfasfads책",
          "loc_yn": true,
          "pchrg_picalbm_cntent": null,
          "page_cnt": "5",
          "etc_brand_info": "샤넬",
          "dlvy_adres_no": "20210322000186",
          "contact_user_nm": "테스트",
          "contact_phone_no": "01044444444",
          "brand_nm": "테스트브랜드1",
          "brand_logo_url_adres": null,
          "model_type": "콜라보",
          "dlvy_adres_nm": "송촌빌딩 13층",
          "adres_detail": "sangsae",
          "post_no": null,
          "img_url_adres_array": [],
          "date": 1611100800,
          "send_user_name": "테스트"
        }]}]
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
app.get("/my-schedule-date", async function (req, res) {
  const user_id = req.user_id;
  const min_date = isNull(req.query.min_date, null);
  const max_date = isNull(req.query.max_date, null);
  if ([min_date, max_date].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SCHEDULE.DATE.001",
      {
        user_id,
        min_date,
        max_date,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      list: selectResult,
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
 * "/my-schedule-brand":
 *   get:
 *     tags: [스케줄]
 *     summary: "브랜드별로 분류된 스케줄"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "min_date"
 *         description: "스케줄을 받을 첫 날짜 (20XX년 XX월 XX일 0시0분을 UTC 정수형으로)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1611100800
 *       - name: "max_date"
 *         description: "스케줄을 받을 마지막 날짜 (20XX년 XX월 XX일 0시0분을 UTC 정수형으로)"
 *         in: query
 *         required: false
 *         type: integer
 *         example: 1611187200
 *     responses:
 *       200:
 *         description: "성공. date=스케줄의 날짜. individual_schedules=각 날짜에 해당되는 일정들. req_no=일정에 해당되는 요청번호. brand_id=브랜드ID. recieve_date=수령날짜. expected_return_date=예정된 반환 날짜. photogrf_cntent=촬영의 컨셉+ 촬영시간. photogrf_modl_nm=모델 이름. pchrg_picalbm_yn=유료화보 유무. pchrg_picalbm_cntent=유료화보 제목. page_cnt=페이지수. etc_brand_info=함께 들어가는 브랜드. dlvy_adres_no=배송지번호. brand_user_nm=브랜드 유저 이름. brand_nm=브랜드 이름. model_type=모델 구분. dlvy_adres_nm=주소지. dlvy_post_no=우편번호."
 *         schema:
 *           type: object
 *           properties:
 *             list:
 *               description: "목록"
 *               type: array
 *               example: [ { "brand_nm": "테스트브랜드1", "brand_id": "BRAND_TEST001", "individual_schedules": [ { "req_no": "20210318000134", "brand_id": "BRAND_TEST001", "receive_date": 1611100800, "expected_return_date": 1611619200, "photogrf_cntent": "쿨함의 컨셉으로 촬영", "model_list": [ "영희", "철구" ], "celeb_list": [ "영희", "철구" ], "pchrg_picalbm_yn": false, "own_paid_pictorial_yn": false, "own_paid_pictorial_content": null, "other_paid_pictorial_yn": false, "other_paid_pictorial_content": null, "loc_yn": true, "page_cnt": "5", "etc_brand_info": "샤넬", "dlvy_adres_no": "20210322000183", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "model_type": "콜라보", "dlvy_adres_nm": "송촌빌딩 13층", "adres_detail": "try to see if it works", "post_no": null, "img_url_adres_array": [], "date": 1611100800, "send_user_name": "테스트" }, { "req_no": "20210319000142", "brand_id": "BRAND_TEST001", "receive_date": 1611100800, "expected_return_date": 1611619200, "photogrf_cntent": "멋짐의 컨셉으로 촬영", "model_list": [ "영희", "철수" ], "celeb_list": [ "영희", "철수" ], "pchrg_picalbm_yn": true, "own_paid_pictorial_yn": true, "own_paid_pictorial_content": "책casdfasdf", "other_paid_pictorial_yn": true, "other_paid_pictorial_content": "asdfasfads책", "loc_yn": false, "page_cnt": "5", "etc_brand_info": "샤넬", "dlvy_adres_no": "20210319000170", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "model_type": "콜라보", "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "post_no": null, "img_url_adres_array": [], "date": 1611100800, "send_user_name": "테스트" }, { "req_no": "20210318000131", "brand_id": "BRAND_TEST001", "receive_date": 1611100800, "expected_return_date": 1611619200, "photogrf_cntent": "멋짐의 컨셉으로 촬영", "model_list": [ "영희", "철수" ], "celeb_list": [ "영희", "철수" ], "pchrg_picalbm_yn": true, "own_paid_pictorial_yn": false, "own_paid_pictorial_content": null, "other_paid_pictorial_yn": false, "other_paid_pictorial_content": null, "loc_yn": false, "page_cnt": "5", "etc_brand_info": "샤넬", "dlvy_adres_no": "20210318000156", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "model_type": "콜라보", "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "post_no": null, "img_url_adres_array": [], "date": 1611100800, "send_user_name": "테스트" }, { "req_no": "20210317000117", "brand_id": "BRAND_TEST001", "receive_date": 1611100800, "expected_return_date": 1611619200, "photogrf_cntent": "멋짐의 컨셉으로 촬영", "model_list": [ "영희", "철수" ], "celeb_list": [ "영희", "철수" ], "pchrg_picalbm_yn": true, "own_paid_pictorial_yn": false, "own_paid_pictorial_content": null, "other_paid_pictorial_yn": false, "other_paid_pictorial_content": null, "loc_yn": false, "page_cnt": "5", "etc_brand_info": "샤넬", "dlvy_adres_no": "20210317000124", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "model_type": "콜라보", "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "post_no": null, "img_url_adres_array": [ "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/5" ], "date": 1611100800, "send_user_name": "테스트" }, { "req_no": "20210322000146", "brand_id": "BRAND_TEST001", "receive_date": 1611100800, "expected_return_date": 1611619200, "photogrf_cntent": "멋짐의 컨셉으로 촬영", "model_list": [ "영희", "철수" ], "celeb_list": [ "영희", "철수" ], "pchrg_picalbm_yn": true, "own_paid_pictorial_yn": true, "own_paid_pictorial_content": "책casdfasdf", "other_paid_pictorial_yn": true, "other_paid_pictorial_content": "asdfasfads책", "loc_yn": true, "page_cnt": "5", "etc_brand_info": "샤넬", "dlvy_adres_no": "20210322000177", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "model_type": "콜라보", "dlvy_adres_nm": "송촌빌딩 13층", "adres_detail": "sangsae", "post_no": null, "img_url_adres_array": [], "date": 1611100800, "send_user_name": "테스트" }, { "req_no": "20210317000128", "brand_id": "BRAND_TEST001", "receive_date": 1611100800, "expected_return_date": 1611619200, "photogrf_cntent": "멋짐의 컨셉으로 촬영", "model_list": [ "영희", "철수" ], "celeb_list": [ "영희", "철수" ], "pchrg_picalbm_yn": true, "own_paid_pictorial_yn": false, "own_paid_pictorial_content": null, "other_paid_pictorial_yn": false, "other_paid_pictorial_content": null, "loc_yn": false, "page_cnt": "5", "etc_brand_info": "샤넬", "dlvy_adres_no": "20210317000142", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "model_type": "콜라보", "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "post_no": null, "img_url_adres_array": [ "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/5" ], "date": 1611100800, "send_user_name": "테스트" }, { "req_no": "20210319000135", "brand_id": "BRAND_TEST001", "receive_date": 1611100800, "expected_return_date": 1611619200, "photogrf_cntent": "멋짐의 컨셉으로 촬영", "model_list": [ "영희", "철수" ], "celeb_list": [ "영희", "철수" ], "pchrg_picalbm_yn": false, "own_paid_pictorial_yn": false, "own_paid_pictorial_content": null, "other_paid_pictorial_yn": false, "other_paid_pictorial_content": null, "loc_yn": false, "page_cnt": "5", "etc_brand_info": "샤넬", "dlvy_adres_no": "20210319000163", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "model_type": "콜라보", "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "post_no": null, "img_url_adres_array": [], "date": 1611100800, "send_user_name": "테스트" }, { "req_no": "20210319000143", "brand_id": "BRAND_TEST001", "receive_date": 1611100800, "expected_return_date": 1611619200, "photogrf_cntent": "멋짐의 컨셉으로 촬영", "model_list": [ "영희", "철수" ], "celeb_list": [ "영희", "철수" ], "pchrg_picalbm_yn": true, "own_paid_pictorial_yn": true, "own_paid_pictorial_content": "책casdfasdf", "other_paid_pictorial_yn": true, "other_paid_pictorial_content": "asdfasfads책", "loc_yn": true, "page_cnt": "5", "etc_brand_info": "샤넬", "dlvy_adres_no": "20210319000171", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "model_type": "콜라보", "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "post_no": null, "img_url_adres_array": [], "date": 1611100800, "send_user_name": "테스트" }, { "req_no": "20210129000024", "brand_id": "BRAND_TEST003", "receive_date": 1611100800, "expected_return_date": 1611619200, "photogrf_cntent": "멋짐의 컨셉으로 2시간동안 촬영", "model_list": null, "celeb_list": null, "pchrg_picalbm_yn": true, "own_paid_pictorial_yn": false, "own_paid_pictorial_content": null, "other_paid_pictorial_yn": false, "other_paid_pictorial_content": null, "loc_yn": false, "page_cnt": "5", "etc_brand_info": "샤넬", "dlvy_adres_no": "20210129000028", "contact_user_nm": "테스트", "contact_phone_no": "01044444444", "brand_nm": "테스트브랜드3", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/", "model_type": "패션모델", "dlvy_adres_nm": "서울 강남구 논현로 503", "adres_detail": "송촌빌딩 13층", "post_no": "06132", "img_url_adres_array": [ "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/3", "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com/5" ], "date": 1611100800, "send_user_name": "테스트" } ] } ]
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
app.get("/my-schedule-brand", async function (req, res) {
  const user_id = req.user_id;
  const min_date = isNull(req.query.min_date);
  const max_date = isNull(req.query.max_date);
  if ([min_date, max_date].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SCHEDULE.BRAND.001",
      {
        user_id,
        min_date,
        max_date,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      list: selectResult,
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
 * "/press":
 *   get:
 *     tags: [보도자료]
 *     summary: "보도자료 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_month"
 *         description: "조회하려는 월 (1,2,3,4 등등), 디폴트는 최슨글 날짜를 따름"
 *         in: query
 *         required: false
 *         type: string
 *         example: "3"
 *       - name: "req_year"
 *         description: "조회하려는 연도 (2020,2021 등등), 디폴트는 최신글 날짜를 따름"
 *         in: query
 *         required: false
 *         type: string
 *         example: "2021"
 *       - name: "brand_id"
 *         description: "찾으려는 브랜드의 ID"
 *         in: query
 *         required: false
 *         type: string
 *         example: "2"
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
 *             list:
 *               description: "목록"
 *               type: array
 *               example: [ { "brand_press_no": "20210126000004", "title": "제목2 (수정됨)", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "dibs_yn": false }, { "brand_press_no": "20210126000003", "title": "제목", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "dibs_yn": true }, { "brand_press_no": "20210126000002", "title": "제목", "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "dibs_yn": false } ]
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
app.get("/press", async function (req, res) {
  const user_id = req.user_id;
  const req_month = isNull(req.query.req_month, null);
  const req_year = isNull(req.query.req_year, null);
  let brand_id = isNull(req.query.brand_id, null);
  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const selectBrandListQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.002",
      {
        brand_id,
        search_text: "",
      },
      { language: "sql", indent: "  " }
    );

    const brand_list = await req.sequelize.query(selectBrandListQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const brand_info =
      brand_id == null ? null : brand_list.find((e) => e.brand_id == brand_id);
    const selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "SELECT.PRESS.001",
      {
        user_id,
        req_month,
        req_year,
        brand_id,
        offset,
        limit,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery_2 = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "SELECT.PRESS.SEASON.LIST",
      {
        user_id,
        req_month,
        req_year,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult_2 = await req.sequelize.query(selectQuery_2, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      list: selectResult,
      season_list: selectResult_2,
      current_brand_info: brand_info,
      brand_list,
      total_count: selectResult.length === 0 ? 0 : selectResult[0].total_count,
      next_page:
        (selectResult.length == 0 ? 0 : selectResult[0].total_count) / limit <=
        page
          ? null
          : parseInt(page, 10) + 1,
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
 * "/showroom-list":
 *   post:
 *     tags: [디지털쇼룸]
 *     summary: "쇼룸 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_id"
 *         description: "조회하려는 브랜드의 ID (null 가능)"
 *         in: body
 *         required: false
 *         type: string
 *         example: "BRAND_TEST001"
 *       - name: "season_year"
 *         description: "시즌의 연도"
 *         in: body
 *         required: false
 *         type: string
 *         example: "2020"
 *       - name: "season_cd_id"
 *         description: "시즌 코드"
 *         in: body
 *         required: false
 *         type: string
 *         example: "SS0001"
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
 *       - name: "available_start_dt"
 *         description: ""
 *         in: body
 *         required: false
 *         type: integer
 *         example: 1212321321
 *       - name: "available_end_dt"
 *         description: ""
 *         in: body
 *         required: false
 *         type: integer
 *         example: 151413233
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
 *         description: "성공. season_list=시즌 목록(디폴트는 첫번째의 최신 시즌). total_count=전체개수. list=쇼룸목록. current_brand_info=현재 조회한 브랜드의 정보. brand_list=브랜드 전체목록"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             season_list:
 *               description: "시즌 목록 (시즌값이 null일 때 디폴트 생성용으로 사용)"
 *               type: array
 *               example: [ { "season_year": "2020", "season_cd_id": "SS0001", "season_text": "Cruise", "season_simple_text": "Cruise" } ]
 *             total_count:
 *               description: "쇼룸의 개수"
 *               type: integer
 *               example: 7
 *             list:
 *               description: "쇼룸 목록"
 *               type: array
 *               example: [ { "showroom_no": "20210125000009", "showroom_nm": "테스트 쇼룸 1", "image_url": "5", "is_new": false, "req_count": 7, "total_count": 7, "is_fav": false, "is_hot": true }, { "showroom_no": "20210125000011", "showroom_nm": "테스트 쇼룸 1", "image_url": null, "is_new": false, "req_count": 0, "total_count": 7, "is_fav": false, "is_hot": false }, { "showroom_no": "20210125000012", "showroom_nm": "테스트 쇼룸 1", "image_url": "7", "is_new": false, "req_count": 0, "total_count": 7, "is_fav": false, "is_hot": false }, { "showroom_no": "20210127000013", "showroom_nm": "테스트 쇼룸 1", "image_url": "8", "is_new": false, "req_count": 0, "total_count": 7, "is_fav": false, "is_hot": false }, { "showroom_no": "20210128000020", "showroom_nm": "테스트 쇼룸 1", "image_url": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "is_new": false, "req_count": 0, "total_count": 7, "is_fav": false, "is_hot": false }, { "showroom_no": "20210128000022", "showroom_nm": "테스트 쇼룸 1", "image_url": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "is_new": false, "req_count": 0, "total_count": 7, "is_fav": false, "is_hot": false }, { "showroom_no": "20210128000023", "showroom_nm": "테스트 쇼룸 1", "image_url": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "is_new": false, "req_count": 0, "total_count": 7, "is_fav": false, "is_hot": false } ]
 *             current_brand_info:
 *               description: ""
 *               type: object
 *               example: {"brand_id":"BRAND_TEST002","compy_nm":"테스트브랜드회사1","brand_nm":"테스트브랜드1","brand_nm_kor":null}
 *             brand_list:
 *               description: ""
 *               type: array
 *               example: [{"brand_id":"BRAND_TEST002","compy_nm":"테스트브랜드회사1","brand_nm":"테스트브랜드1","brand_nm_kor":null},{"brand_id":"BRAND_TEST002","compy_nm":"테스트브랜드회사2","brand_nm":"테스트브랜드2","brand_nm_kor":null},{"brand_id":"BRAND_TEST003","compy_nm":"테스트브랜드회사3","brand_nm":"테스트브랜드3","brand_nm_kor":null},{"brand_id":"BRAND_TEST004","compy_nm":"테스트브랜드회사1","brand_nm":"ABC","brand_nm_kor":null},{"brand_id":"BRAND_TEST005","compy_nm":"테스트브랜드회사1","brand_nm":"BCD","brand_nm_kor":null},{"brand_id":"BRAND_TEST006","compy_nm":"테스트브랜드회사1","brand_nm":"DDDddd","brand_nm_kor":null}]

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
  let brand_id = isNull(req.body.brand_id, null);

  let season_year = isNull(req.body.season_year, null);
  let season_cd_id = isNull(req.body.season_cd_id, null);

  const sesaon_input_yn = season_year !== null || season_cd_id !== null;

  const page = isNull(req.body.page, 1);
  const limit = parseInt(isNull(req.body.limit, 10));
  const offset = parseInt((page - 1) * limit);
  const search_text = isNull(req.body.search_text, null);
  //필터
  const gender_list = isNull(req.body.gender_list, null);
  const available_start_dt = isNull(req.body.available_start_dt, null);
  const available_end_dt = isNull(req.body.available_start_dt, null);
  const category_list = isNull(req.body.category_list, []);
  const color_list = isNull(req.body.color_list, []);
  const material_list = isNull(req.body.material_list, []);
  const size_list = isNull(req.body.size_list, []);
  const wrhousng_yn = isNull(req.body.in_yn, null);
  const still_life_img_yn = isNull(req.body.still_life_img_yn, null);

  try {
    const selectBrandListQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.002",
      {
        brand_id,
        search_text: "",
      },
      { language: "sql", indent: "  " }
    );

    const brand_list = await req.sequelize.query(selectBrandListQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (brand_id == null) {
      brand_id = brand_list[0].brand_id;
    }

    const brand_info = brand_list.find((e) => e.brand_id == brand_id);

    let gender = null;
    if (Array.isArray(gender_list) && gender_list.length !== 0) {
      gender =
        "(" +
        gender_list.map((e) => `'${String(e).replace("'", "''")}'`).join(", ") +
        ")";
    }

    let category = null;
    if (Array.isArray(category_list) && category_list.length !== 0) {
      category =
        "(" +
        category_list
          .map((e) => `'${String(e).replace("'", "''")}'`)
          .join(", ") +
        ")";
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

    const selectNoticeQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "SELECT.BRAND.NOTICE",
      {
        brand_id,
      },
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
          error: selectNoticeQuery,
        },
      }
    );
    const selectNoticeResult = await req.sequelize.query(selectNoticeQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    var selectSeasonListQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SHOWROOM.SEASON.LIST",
      {
        brand_id,
        season_year,
        season_cd_id,
        category,
        color,
        material,
        size,
        gender,
        available_start_dt,
        available_end_dt,
        search_text,
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
      "MAGAZINE",
      "SELECT.SHOWROOM.LIST",
      {
        brand_id,
        offset,
        limit,
        season_year,
        season_cd_id,
        category,
        color,
        material,
        size,
        gender,
        available_start_dt,
        available_end_dt,
        user_id,
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
      season_list,
      total_count: list.length === 0 ? 0 : list[0].total_count,
      next_page:
        (list.length === 0 ? 0 : list[0].total_count) / limit <= page
          ? null
          : parseInt(page, 10) + 1,
      list,
      current_brand_info: brand_info,
      brand_list,
      brand_notice: selectNoticeResult[0],
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
 *               example: [{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"35.5 (225)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36 (230)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"36.5 (235)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37 (240)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"37.5 (245)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38 (250)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"38.5 (255)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"39 (260)","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 1","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "},{"sample_image_url":"https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg","mfrc_sample_yn":true,"sample_nm":"테스트 샘플 2","gender_cd_id":"SSS001","gender_text":"여성","buying_cd_id":"SBS001","buying_text":"국내 바잉","color_cd_id":"SCS001","material_cd_id":"MS0001","material_text":"면","size_cd_id":null,"size_text":"Others","size_direct_input":null,"sample_catgry_middle_cl_cd":"SCMC01","category_middle_text":"아우터웨어","sample_catgry_lrge_cl_cd":"SCLC06","category_large_text":"RTW","sample_catgry_direct_input":null,"in_yn":true,"etc":"asdf","sku":"Abcd","caption_english":"캡션 영어","caption_korean":"캡션 한국어","brand_id":"BRAND_TEST001","brand_user_no":"1             "}]
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

  const showroom_no = isNull(req.params.showroom_no, null);

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
    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/fav-show":
 *   get:
 *     tags: [즐겨찾기]
 *     summary: "쇼룸 즐겨찾기목록 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     responses:
 *       200:
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             list:
 *               description: "찜한 목록"
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
app.get("/fav-show", async function (req, res) {
  const user_id = req.user_id;
  const gender_cd_id = isNull(req.body.gender_cd_id, null);
  const available_start_dt = isNull(req.body.available_start_dt, null);
  const available_end_dt = isNull(req.body.available_start_dt, null);
  const category_list = isNull(req.body.category_list, []);
  const color_list = isNull(req.body.color_list, []);
  const material_list = isNull(req.body.material_list, []);
  const size_list = isNull(req.body.size_list, []);
  const wrhousng_yn = isNull(req.body.in_yn, null);
  const still_life_img_yn = isNull(req.body.still_life_img_yn, null);
  try {
    let category = null;
    if (Array.isArray(category_list) && category_list.length !== 0) {
      category =
        "(" +
        category_list
          .map((e) => `'${String(e).replace("'", "''")}'`)
          .join(", ") +
        ")";
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

    var selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "SELECT.FAV.SHOW.001",
      {
        user_id,
        category,
        color,
        material,
        size,
        gender_cd_id,
        wrhousng_yn,
        still_life_img_yn,
        available_start_dt,
        available_end_dt,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      list: selectResult,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: String(error),
      selectQuery,
    });

    insertLog(req, CURRENT_SYSTEM_TYPE, error);
  }
});

/**
 * @swagger
 * "/fav-press":
 *   get:
 *     tags: [즐겨찾기]
 *     summary: "언론보도 즐겨찾기목록 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     responses:
 *       200:
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             list:
 *               description: "찜한 목록"
 *               type: array
 *               example: [ { "brand_press_no": "20210126000003", "press_subj": "제목", "main_img_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "main_img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg" }, { "brand_press_no": "20210126000002", "press_subj": "제목", "main_img_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "main_img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg" } ]
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
 app.get("/fav-press", async function (req, res) {
  const user_id = req.user_id;
  let brand_id = isNull(req.query.brand_id, null);
  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);
  try {
    const selectBrandListQuery = req.mybatisMapper.getStatement(
      "CDN",
      "SELECT.002",
      {
        brand_id,
        search_text: "",
      },
      { language: "sql", indent: "  " }
    );

    const brand_list = await req.sequelize.query(selectBrandListQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const brand_info =
      brand_id == null ? null : brand_list.find((e) => e.brand_id == brand_id);

    const selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "SELECT.FAV.PRESS.001",
      {
        user_id,
        brand_id,
        limit,
        offset,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      list: selectResult,
      current_brand_info: brand_info,
      brand_list,
      total_count: selectResult.length === 0 ? 0 : selectResult[0].total_count,
      next_page:
        (selectResult.length == 0 ? 0 : selectResult[0].total_count) / limit <=
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
 * "/fav-brand":
 *   get:
 *     tags: [즐겨찾기]
 *     summary: "브랜드 즐겨찾기목록 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     responses:
 *       200:
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             list:
 *               description: "찜한 목록"
 *               type: array
 *               example: [{"brand_id":"BRAND_TEST006","compy_nm":"테스트브랜드회사1","brand_nm":"DDDddd","brand_nm_kor":null}]
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
app.get("/fav-brand", async function (req, res) {
  const user_id = req.user_id;
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "SELECT.DIBS.BRAND_LIST",
      {
        user_id,
      },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      list: selectResult,
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
 * "/fav-brand":
 *   put:
 *     tags: [즐겨찾기]
 *     summary: "브랜드 즐겨찾기목록 등록 및 수정"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_id"
 *         description: "브랜드 ID"
 *         in: body
 *         required: true
 *         type: string
 *         example: "BRAND_TEST"
 *       - name: "dibs_yn"
 *         description: "즐겨찾기 추가는 true, 취소는 false"
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
 *             list:
 *               description: "찜한 목록"
 *               type: array
 *               example: [ { "brand_press_no": "20210126000003", "press_subj": "제목", "main_img_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "main_img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg" }, { "brand_press_no": "20210126000002", "press_subj": "제목", "main_img_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "main_img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg" } ]
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
app.put("/fav-brand", async function (req, res) {
  const user_id = req.user_id;

  const brand_id = isNull(req.body.brand_id, null);
  const dibs_yn = isNull(req.body.dibs_yn, null);

  try {
    const updateQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "UPDATE.DIBS.BRAND",
      {
        brand_id,
        dibs_yn,
        user_id,
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
 * "/article/:id":
 *   get:
 *     tags: [보도자료]
 *     summary: "기사 개별조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "id"
 *         description: "조회하려는 기사의 ID"
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
 *             brand_press_no:
 *               description: "기사 번호"
 *               type: string
 *               example: "20210126000004"
 *             title:
 *               description: "기사의 제목"
 *               type: string
 *               example: "오늘의 대박사건"
 *             contents:
 *               description: "기사의 내용"
 *               type: string
 *               example: "대박사건의 내용"
 *             press_period_nm:
 *               description: "언론기관명"
 *               type: string
 *               example: "타임"
 *             brand_id:
 *               description: "브랜드의 ID"
 *               type: string
 *               example: "BRAND_TEST001"
 *             brand_user_no:
 *               description: "브랜드유저의 일련번호"
 *               type: string
 *               example: "1             "
 *             word_file_adres:
 *               description: "워드, pdf 파일 링크"
 *               type: string
 *               example: "abc.com/def.pdf"
 *             link:
 *               description: "링크"
 *               type: string
 *               example: "abc.com"
 *             img_url_adres:
 *               description: "신문기사 이미지 주소"
 *               type: string
 *               example: "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"
 *             img_url_oath:
 *               description: "신문기사 이미지 경로"
 *               type: string
 *               example: "/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"
 *             monthly_month:
 *               description: "기사가 작성된 월"
 *               type: string
 *               example: "3"
 *             monthly_year:
 *               description: "기사가 작성된 연도"
 *               type: string
 *               example: "2021"
 *             add_img_list:
 *               description: "추가적인 이미지들"
 *               type: array
 *               example: [
    "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg",
    "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg"
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
app.get("/article/:id", async function (req, res) {
  const user_id = req.user_id;
  const article_id = isNull(req.params.id, null);
  if ([article_id].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "SELECT.ARTICLE.001",
      {
        user_id,
        article_id,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({ test: selectResult });
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
 * "/pickup-schedule":
 *   get:
 *     tags: [픽업]
 *     summary: "픽업 일정 조회"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "start_date"
 *         description: "픽업 날짜 필터의 시작일"
 *         in: query
 *         required: true
 *         type: string
 *         example: "20210126000004"
 *       - name: "fin_date"
 *         description: "픽업 날짜 필터의 종료일"
 *         in: query
 *         required: true
 *         type: string
 *         example: "20210126000004"
 *       - name: "brand_id"
 *         description: "브랜드 ID 필터"
 *         in: query
 *         required: false
 *         type: string
 *         example: "BRAND_TEST001"
 *     responses:
 *       200:
 *         description: "성공. date=각 날짜 UTC. each_list=각 날짜에 존재하는 요청 목록. req_no=요청 식별자. mgzn_nm=요청한 매거진명. brand_nm=요청받은 브랜드명. mgzn_color=매거진 색상. req_user_nm=요청한 유저명. brand_user_nm=요청 확인한 유저명. req_user_type=매거진인지, 스타일리스트인지. contact_user_nm=연락담당 유저명(어시스턴트). mgzn_logo_adres=매거진 로고. req_user_position=요청한 유저 직급. brand_user_position=브랜드유저 직급. stylist_company_name=스타일리스트 회사명"
 *         schema:
 *           type: object
 *           properties:
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"date":1611619200,"year":"2021","month":"01","day":"26","each_list":[{"req_no":"20210127000016","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"테스트","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null},{"req_no":"20210219000074","mgzn_nm":null,"brand_nm":"테스트브랜드1","mgzn_color":null,"req_user_nm":"테스트22","brand_user_nm":"박서준","req_user_type":"STYLIST","contact_user_nm":"테스트22","mgzn_logo_adres":null,"req_user_position":"실장","brand_user_position":"이사","stylist_company_name":"그냥회사"},{"req_no":"20210219000076","mgzn_nm":null,"brand_nm":"테스트브랜드1","mgzn_color":null,"req_user_nm":"테스트22","brand_user_nm":"박서준","req_user_type":"STYLIST","contact_user_nm":"테스트22","mgzn_logo_adres":null,"req_user_position":"실장","brand_user_position":"이사","stylist_company_name":"그냥회사"},{"req_no":"20210129000025","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"테스트","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null},{"req_no":"20210126000011","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"이영표","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null}],"each_count":5}]
 *             brand_list:
 *               description: "브랜드들의 목록"
 *               type: array
 *               example: [ { "brand_id": "BRAND_TEST001", "brand_nm": "테스트브랜드1" } ]
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
app.get("/pickup-schedule", async function (req, res) {
  const user_id = req.user_id;
  const stylist_id = user_id;
  const start_date = isNull(req.query.start_date, null);
  const fin_date = isNull(req.query.fin_date, null);
  const brand_id = isNull(req.query.brand_id, null);

  // 체크할것
  if ([start_date, fin_date].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {   
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST",
      { brand_id, start_date, fin_date, type: "SENDOUT", stylist_id },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery2 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.PICKUP.SCHEDULE.002",
      {
        user_id,
        start_date,
        fin_date,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult2 = await req.sequelize.query(selectQuery2, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      list: selectResult,
      brand_list: selectResult2,
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

app.get("/pickup-schedule-mobile", async function (req, res) {
  const user_id = req.user_id;
  const stylist_id = user_id;
  const start_date = isNull(req.query.start_date, null);
  const fin_date = isNull(req.query.fin_date, null);
  const brand_id = isNull(req.query.brand_id, null);

  // 체크할것
  if ([start_date, fin_date].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {   
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST.MOBILE",
      { brand_id, start_date, fin_date, type: "SENDOUT", stylist_id },
      { language: "sql", indent: "  " }
    );

    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery2 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.PICKUP.SCHEDULE.002",
      {
        user_id,
        start_date,
        fin_date,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult2 = await req.sequelize.query(selectQuery2, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      list: selectResult,
      brand_list: selectResult2,
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
 * "/sendout-schedule":
 *   get:
 *     tags: [발송]
 *     summary: "sendout 일정 조회"
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
 *       - name: "brand_id"
 *         description: "브랜드 ID 필터"
 *         in: query
 *         required: false
 *         type: string
 *         example: "BRAND_TEST001"
 *     responses:
 *       200:
 *         description: "성공. date=각 날짜 UTC. each_list=각 날짜에 존재하는 요청 목록. req_no=요청 식별자. mgzn_nm=요청한 매거진명. brand_nm=요청받은 브랜드명. mgzn_color=매거진 색상. req_user_nm=요청한 유저명. brand_user_nm=요청 확인한 유저명. req_user_type=매거진인지, 스타일리스트인지. contact_user_nm=연락담당 유저명(어시스턴트). mgzn_logo_adres=매거진 로고. req_user_position=요청한 유저 직급. brand_user_position=브랜드유저 직급. stylist_company_name=스타일리스트 회사명"
 *         schema:
 *           type: object
 *           properties:
 *             list:
 *               description: ""
 *               type: array
 *               example: [{"date":1611619200,"year":"2021","month":"01","day":"26","each_list":[{"req_no":"20210127000016","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"테스트","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null},{"req_no":"20210219000074","mgzn_nm":null,"brand_nm":"테스트브랜드1","mgzn_color":null,"req_user_nm":"테스트22","brand_user_nm":"박서준","req_user_type":"STYLIST","contact_user_nm":"테스트22","mgzn_logo_adres":null,"req_user_position":"실장","brand_user_position":"이사","stylist_company_name":"그냥회사"},{"req_no":"20210219000076","mgzn_nm":null,"brand_nm":"테스트브랜드1","mgzn_color":null,"req_user_nm":"테스트22","brand_user_nm":"박서준","req_user_type":"STYLIST","contact_user_nm":"테스트22","mgzn_logo_adres":null,"req_user_position":"실장","brand_user_position":"이사","stylist_company_name":"그냥회사"},{"req_no":"20210129000025","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"테스트","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null},{"req_no":"20210126000011","mgzn_nm":"테스트매거진1","brand_nm":"테스트브랜드1","mgzn_color":"#000000","req_user_nm":"테스트","brand_user_nm":"박서준","req_user_type":"MAGAZINE","contact_user_nm":"이영표","mgzn_logo_adres":null,"req_user_position":"팀장","brand_user_position":"이사","stylist_company_name":null}],"each_count":5}]
 *             brand_list:
 *               description: "브랜드들의 목록"
 *               type: array
 *               example: [ { "brand_id": "BRAND_TEST001", "brand_nm": "테스트브랜드1" } ]
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
app.get("/sendout-schedule", async function (req, res) {
  const user_id = req.user_id;
  const stylist_id = isNull(req.stylist_id, null);
  const start_date = isNull(req.query.start_date, null);
  const fin_date = isNull(req.query.fin_date, null);
  const brand_id = isNull(req.query.brand_id, null);
  if ([start_date, fin_date].includes(null)) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  try {
    // const selectQuery = req.mybatisMapper.getStatement(
    //     "STYLIST",
    //     "SELECT.SENDOUT.SCHEDULE.001",
    //     {
    //         user_id,
    //         start_date,
    //         fin_date,
    //         brand_id,
    //     },
    //     { language: "sql", indent: "  " }
    // );
    const selectQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST",
      { brand_id, start_date, fin_date, type: "RETURN", stylist_id },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const selectBrandQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SENDOUT.SCHEDULE.002",
      {
        user_id,
        start_date,
        fin_date,
        brand_id,
      },
      { language: "sql", indent: "  " }
    );
    const brand_list = await req.sequelize.query(selectBrandQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      list: selectResult,
      brand_list,
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
 * "/brand-notice":
 *   get:
 *     tags: [브랜드공지사항]
 *     summary: "브랜드 공지사항"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_id"
 *         description: "브랜드 식별자"
 *         in: query
 *         required: true
 *         type: string
 *         example: "BRAND_TEST"
 *     responses:
 *       200:
 *         description: "성공. notice=브랜드 공지사항. inquiry_number=브랜드 문의번호. showroom_inquiry_contact=쇼룸 연락처. showroom_inquiry_email=쇼룸 이메일"
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               description: "성공 여부"
 *               type: boolean
 *               example: true
 *             notice:
 *               description: ""
 *               type: string
 *               example: "공지"
 *             inquiry_number:
 *               description: ""
 *               type: string
 *               example: "010-4444-4444"
 *             showroom_inquiry_contact:
 *               description: ""
 *               type: string
 *               example: "010-4444-4444"
 *             showroom_inquiry_email:
 *               description: ""
 *               type: string
 *               example: "asdf@gmail.com"
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
app.get("/brand-notice", async function (req, res) {
  const user_id = req.user_id;
  const brand_user_no = req.brand_user_no;

  const brand_id = isNull(req.query.brand_id, null);

  if (brand_id == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "SELECT.BRAND.NOTICE",
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
 * "/pickup-detailed/{date}":
 *   get:
 *     tags: [픽업]
 *     summary: "픽업 상세보기"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "date"
 *         description: "시간"
 *         in: path
 *         required: true
 *         type: integer
 *         example: 1232321321
 *     responses:
 *       200:
 *         description: "성공."
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
 *               example: [{"req_no":"20210126000011","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":null,"contact_user_phone":null,"loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210126000012","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 133층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210126000012","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 133층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210126000012","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 133층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000015","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000015","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000015","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000016","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000016","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000016","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210129000024","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210129000024","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210129000024","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210129000025","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210129000025","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210129000025","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210129000026","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210129000026","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210129000026","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000073","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000073","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000074","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210219000074","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000075","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000075","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000076","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210219000076","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210315000099","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210315000099","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]}]
 *             date:
 *               description: "날짜 (프린트용)"
 *               type: integer
 *               example: 1232321321
 *             list:
 *               description: "개별 쇼룸 정보를 제외한 모든 정보"
 *               type: array
 *               example: [ { "brand_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "receive_date": 1611100800, "photo_date": 1611619200, "dlvy_adres_no": "20210126000015", "dlvy_adres_nm": "강남구 논현동","adres_detail": "송촌빌딩 13층", "brand_id": "BRAND_TEST001", "mgzn_user_nm": "최홍만", "phone_no": "01088888888", "assi_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "mgzn_nm": "테스트매거진1", "assi_user_nm": "최홍만", "assi_phone_no": "01088888888", "brand_user_nm": "김병수", "brand_phone_no": "01043434343", "brand_nm": "테스트브랜드1" } ]
 *             list2:
 *               description: "요청된 쇼룸들의 정보"
 *               type: array
 *               example: [ { "showroom_no": "20210125000009", "individual_samples": [ { "showroom_no": "20210125000009", "sample_no": "20210125000007", "sample_category_code": "SCMC01", "price": 4444, "sample_category": "아우터웨어", "image_url": "5" } ] }, { "showroom_no": "20210125000008", "individual_samples": [ { "showroom_no": "20210125000008", "sample_no": "20210125000006", "sample_category_code": "SCMC01", "price": 3333, "sample_category": "아우터웨어", "image_url": "2" } ] } ]
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
app.get("/pickup-detailed/:date", async function (req, res) {  
  const user_id = req.user_id;
  const stylist_id = isNull(req.stylist_id, null);
  const date = isNull(req.query.date, null);

  try {
    // 오른쪽 프린트 출력데이터
    const selectRightQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.DETAIL",
      {
        stylist_id,
        date,
        type: "SENDOUT",
        check: "MGZN_PICKUP",
      },
      { language: "sql", indent: "  " }
    );
    const selectRightResult = await req.sequelize.query(selectRightQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 왼쪽 리스트
    const selectLeftQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST",
      { stylist_id, date, type: "SENDOUT" },
      { language: "sql", indent: "  " }
    );

    const selectLeftResult = await req.sequelize.query(selectLeftQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
  

    res.json({
      left: selectLeftResult[0],
      right: selectRightResult,
      qry : selectLeftQuery,
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
 * "/pickup-detailed/req/{req_no}":
 *   get:
 *     tags: [픽업]
 *     summary: "픽업 상세보기"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청번호"
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210126000011"
 *     responses:
 *       200:
 *         description: "성공."
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
 *             date:
 *               description: "날짜 (프린트용)"
 *               type: integer
 *               example: 1232321321
 *             list:
 *               description: "개별 쇼룸 정보를 제외한 모든 정보"
 *               type: array
 *               example: [ { "brand_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "receive_date": 1611100800, "photo_date": 1611619200, "dlvy_adres_no": "20210126000015", "dlvy_adres_nm": "강남구 논현동","adres_detail": "송촌빌딩 13층", "brand_id": "BRAND_TEST001", "mgzn_user_nm": "최홍만", "phone_no": "01088888888", "assi_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "mgzn_nm": "테스트매거진1", "assi_user_nm": "최홍만", "assi_phone_no": "01088888888", "brand_user_nm": "김병수", "brand_phone_no": "01043434343", "brand_nm": "테스트브랜드1" } ]
 *             list2:
 *               description: "요청된 쇼룸들의 정보"
 *               type: array
 *               example: [ { "showroom_no": "20210125000009", "individual_samples": [ { "showroom_no": "20210125000009", "sample_no": "20210125000007", "sample_category_code": "SCMC01", "price": 4444, "sample_category": "아우터웨어", "image_url": "5" } ] }, { "showroom_no": "20210125000008", "individual_samples": [ { "showroom_no": "20210125000008", "sample_no": "20210125000006", "sample_category_code": "SCMC01", "price": 3333, "sample_category": "아우터웨어", "image_url": "2" } ] } ]
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
app.get("/pickup-detailed/req/:req_no", async function (req, res) {
  const stylist_id = req.user_id;
  const req_no = isNull(req.params.req_no, null);

  try {
    // 오른쪽 프린트 출력데이터
    const selectRightQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.DETAIL",
      {
        stylist_id,
        req_no,
        type: "SENDOUT",
        check: "MGZN_PICKUP",
      },
      { language: "sql", indent: "  " }
    );
    const selectRightResult = await req.sequelize.query(selectRightQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 왼쪽 리스트
    const selectLeftQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST",
      { stylist_id, req_no, type: "SENDOUT" },
      { language: "sql", indent: "  " }
    );

    const selectLeftResult = await req.sequelize.query(selectLeftQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // const selectQuery = req.mybatisMapper.getStatement(
    //     "MAGAZINE",
    //     "SELECT.PICKUP.DETAILED.001",
    //     {
    //         user_id,
    //         req_no,
    //         type: "SENDOUT",
    //     },
    //     { language: "sql", indent: "  " }
    // );
    // const selectResult = await req.sequelize.query(selectQuery, {
    //     type: req.sequelize.QueryTypes.SELECT,
    // });
    // const selectQuery2 = req.mybatisMapper.getStatement(
    //     "MAGAZINE",
    //     "SELECT.PICKUP.DETAILED.002",
    //     {
    //         user_id,
    //         req_no,
    //     },
    //     { language: "sql", indent: "  " }
    // );
    // const selectResult2 = await req.sequelize.query(selectQuery2, {
    //     type: req.sequelize.QueryTypes.SELECT,
    // });
    // const selectQuery3 = req.mybatisMapper.getStatement(
    //     "MAGAZINE",
    //     "SELECT.SENDOUT.PRINT.001",
    //     {
    //         user_id,
    //         type: "SENDOUT",
    //         req_no,
    //     },
    //     { language: "sql", indent: "  " }
    // );
    // const selectResult3 = await req.sequelize.query(selectQuery3, {
    //     type: req.sequelize.QueryTypes.SELECT,
    // });

    res.json({
      //...selectResult[0],
      // showroom_list: selectResult2,
      // printinfo: selectResult3[0],
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
 * "/sendout-detailed/{date}":
 *   get:
 *     tags: [발송]
 *     summary: "sendout 상세보기. (시간 기준)"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "date"
 *         description: "시간"
 *         in: path
 *         required: true
 *         type: integer
 *         example: 20210126000011
 *     responses:
 *       200:
 *         description: "성공."
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
 *               example: [{"req_no":"20210126000011","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":null,"contact_user_phone":null,"loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210126000012","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 133층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210126000012","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 133층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210126000012","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 133층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000015","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000015","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000015","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000016","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000016","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210127000016","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611619200,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":3333,"category":"아우터웨어","sample_no":"20210125000006","image_list":["2"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000008"}]},{"req_no":"20210129000024","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210129000024","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210129000024","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210129000025","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210129000025","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210129000025","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210129000026","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"이영표","contact_user_phone":"01098773333","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210129000026","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"테스트","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210129000026","user_type":"MAGAZINE","req_user_nm":"테스트","contact_user_nm":"lee","contact_user_phone":"01077778889","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000073","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000073","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000074","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210219000074","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000075","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000075","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210219000076","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"},{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"}]},{"req_no":"20210219000076","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210315000099","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"박세리","contact_user_phone":"01077778888","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]},{"req_no":"20210315000099","user_type":"STYLIST","req_user_nm":"테스트22","contact_user_nm":"테스트22","contact_user_phone":"01044444444","loaning_date":1611619200,"shooting_date":1611619200,"returning_date":1611100800,"studio":"송촌빌딩 13층","from_user_nm":null,"from_user_phone":null,"to_user_nm":"테스트22","to_user_phone":"01044444444","showroom_list":[{"sample_list":[{"price":4444,"category":"아우터웨어","sample_no":"20210125000007","image_list":["3"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000009"},{"sample_list":[{"price":5555,"category":"아우터웨어","sample_no":"20210125000008","image_list":["5"]},{"price":6666,"category":"아우터웨어","sample_no":"20210125000009","image_list":["4"]}],"showroom_nm":"테스트 쇼룸 1","showroom_no":"20210125000010"}]}]
 *             date:
 *               description: "날짜 (프린트용)"
 *               type: integer
 *               example: 1232321321
 *             list:
 *               description: "개별 쇼룸 정보를 제외한 모든 정보"
 *               type: array
 *               example: [ { "brand_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "receive_date": 1611100800, "photo_date": 1611619200, "dlvy_adres_no": "20210126000015", "brand_id": "BRAND_TEST001", "mgzn_user_nm": "최홍만", "phone_no": "01088888888", "assi_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "mgzn_nm": "테스트매거진1", "assi_user_nm": "최홍만", "assi_phone_no": "01088888888", "brand_user_nm": "김병수", "brand_phone_no": "01043434343", "brand_nm": "테스트브랜드1" } ]
 *             list2:
 *               description: "요청된 쇼룸들의 정보"
 *               type: array
 *               example: [ { "showroom_no": "20210125000009", "individual_samples": [ { "showroom_no": "20210125000009", "sample_no": "20210125000007", "sample_category_code": "SCMC01", "price": 4444, "sample_category": "아우터웨어", "image_url": "5" } ] }, { "showroom_no": "20210125000008", "individual_samples": [ { "showroom_no": "20210125000008", "sample_no": "20210125000006", "sample_category_code": "SCMC01", "price": 3333, "sample_category": "아우터웨어", "image_url": "2" } ] } ]
 *             printinfo:
 *               description: "인쇄정보"
 *               type: array
 *               example: [ { "showroom_no": "20210125000009", "individual_samples": [ { "showroom_no": "20210125000009", "sample_no": "20210125000007", "sample_category_code": "SCMC01", "price": 4444, "sample_category": "아우터웨어", "image_url": "5" } ] }, { "showroom_no": "20210125000008", "individual_samples": [ { "showroom_no": "20210125000008", "sample_no": "20210125000006", "sample_category_code": "SCMC01", "price": 3333, "sample_category": "아우터웨어", "image_url": "2" } ] } ]
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
  const stylist_id = isNull(req.stylist_id, null);
  const date = isNull(req.query.date, null);

  try {
    // 오른쪽 프린트 출력데이터
    const selectRightQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.DETAIL",
      {
        user_id, 
        stylist_id,
        date,
        type: "RETURN",
        check: "MGZN_SENDOUT",
      },
      { language: "sql", indent: "  " }
    );
    const selectRightResult = await req.sequelize.query(selectRightQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 왼쪽 리스트
    const selectLeftQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST",
      { stylist_id, date, type: "RETURN" },
      { language: "sql", indent: "  " }
    );

    const selectLeftResult = await req.sequelize.query(selectLeftQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // const selectQuery = req.mybatisMapper.getStatement(
    //     "MAGAZINE",
    //     "SELECT.SENDOUT.DETAILED.001",
    //     {
    //         user_id,
    //         req_no,
    //     },
    //     { language: "sql", indent: "  " }
    // );
    // const selectResult = await req.sequelize.query(selectQuery, {
    //     type: req.sequelize.QueryTypes.SELECT,
    // });
    // const selectQuery2 = req.mybatisMapper.getStatement(
    //     "MAGAZINE",
    //     "SELECT.SENDOUT.DETAILED.002",
    //     {
    //         user_id,
    //         req_no,
    //     },
    //     { language: "sql", indent: "  " }
    // );
    // const selectResult2 = await req.sequelize.query(selectQuery2, {
    //     type: req.sequelize.QueryTypes.SELECT,
    // });
    // const selectQuery3 = req.mybatisMapper.getStatement(
    //     "MAGAZINE",
    //     "SELECT.SENDOUT.PRINT.001",
    //     {
    //         user_id,
    //         req_no,
    //         type: "SENDOUT",
    //         date,
    //     },
    //     { language: "sql", indent: "  " }
    // );
    // const selectResult3 = await req.sequelize.query(selectQuery3, {
    //     type: req.sequelize.QueryTypes.SELECT,
    // });
    res.json({
      //...selectResult[0],
      left: selectLeftResult[0],
      right: selectRightResult,
      //showroom_list: selectResult2,
      //printinfo: selectResult3,
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
 * "/sendout-detailed/{req_no}":
 *   get:
 *     tags: [발송]
 *     summary: "sendout 상세보기"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청번호"
 *         in: path
 *         required: true
 *         type: string
 *         example: "20210126000011"
 *     responses:
 *       200:
 *         description: "성공."
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
 *             date:
 *               description: "날짜 (프린트용)"
 *               type: integer
 *               example: 1232321321
 *             list:
 *               description: "개별 쇼룸 정보를 제외한 모든 정보"
 *               type: array
 *               example: [ { "brand_user_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "receive_date": 1611100800, "photo_date": 1611619200, "dlvy_adres_no": "20210126000015", "brand_id": "BRAND_TEST001", "mgzn_user_nm": "최홍만", "phone_no": "01088888888", "assi_id": "3a27da16-9b06-43a1-964e-70f70acf9806", "mgzn_nm": "테스트매거진1", "assi_user_nm": "최홍만", "assi_phone_no": "01088888888", "brand_user_nm": "김병수", "brand_phone_no": "01043434343", "brand_nm": "테스트브랜드1" } ]
 *             list2:
 *               description: "요청된 쇼룸들의 정보"
 *               type: array
 *               example: [ { "showroom_no": "20210125000009", "individual_samples": [ { "showroom_no": "20210125000009", "sample_no": "20210125000007", "sample_category_code": "SCMC01", "price": 4444, "sample_category": "아우터웨어", "image_url": "5" } ] }, { "showroom_no": "20210125000008", "individual_samples": [ { "showroom_no": "20210125000008", "sample_no": "20210125000006", "sample_category_code": "SCMC01", "price": 3333, "sample_category": "아우터웨어", "image_url": "2" } ] } ]
 *             printinfo:
 *               description: "인쇄정보"
 *               type: array
 *               example: [ { "showroom_no": "20210125000009", "individual_samples": [ { "showroom_no": "20210125000009", "sample_no": "20210125000007", "sample_category_code": "SCMC01", "price": 4444, "sample_category": "아우터웨어", "image_url": "5" } ] }, { "showroom_no": "20210125000008", "individual_samples": [ { "showroom_no": "20210125000008", "sample_no": "20210125000006", "sample_category_code": "SCMC01", "price": 3333, "sample_category": "아우터웨어", "image_url": "2" } ] } ]
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
  const stylist_id = isNull(req.stylist_id, null);
  const req_no = isNull(req.params.req_no, null);

  try {
    const selectRightQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SENDOUT.DETAIL",
      {
        user_id,
        stylist_id,
        req_no,
        type: "RETURN",
        check: "MGZN_SENDOUT",
      },
      { language: "sql", indent: "  " }
    );
    const selectRightResult = await req.sequelize.query(selectRightQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    // 왼쪽 리스트
    const selectLeftQuery = req.mybatisMapper.getStatement(
      "BRAND",
      "SELECT.SCHEDULE.LIST",
      { stylist_id, req_no, type: "RETURN" },
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
 * "/fav-press/{brand_press_no}":
 *   post:
 *     tags: [즐겨찾기]
 *     summary: "보도 즐겨찾기 등록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_press_no"
 *         description: "보도자료 번호"
 *         in: query
 *         required: true
 *         type: string
 *         example: "20210126000002"
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
app.post("/fav-press/:brand_press_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_press_no = req.params.brand_press_no;
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "INSERT.FAV.PRESS.001",
      {
        user_id,
        brand_press_no,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
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
 * "/fav-show/{showroom_no}":
 *   post:
 *     tags: [즐겨찾기]
 *     summary: "쇼룸 즐겨찾기 등록"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_no"
 *         description: "쇼룸 번호"
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
app.post("/fav-show/:showroom_no", async function (req, res) {
  const user_id = req.user_id;
  const showroom_no = isNull(req.params.showroom_no, null);
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "INSERT.FAV.SHOW.001",
      {
        user_id,
        showroom_no,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
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
 * "/fav-press/{brand_press_no}":
 *   put:
 *     tags: [즐겨찾기]
 *     summary: "보도 즐겨찾기 삭제"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "brand_press_no"
 *         description: "보도자료 번호"
 *         in: query
 *         required: true
 *         type: string
 *         example: "20210126000002"
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
app.put("/fav-press/:brand_press_no", async function (req, res) {
  const user_id = req.user_id;
  const brand_press_no = req.params.brand_press_no;
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "UPDATE.FAV.PRESS.001",
      {
        user_id,
        brand_press_no,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
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
 * "/fav-show/{showroom_no}":
 *   put:
 *     tags: [즐겨찾기]
 *     summary: "쇼룸 즐겨찾기 삭제"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "showroom_no"
 *         description: "쇼룸 번호"
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
app.put("/fav-show/:showroom_no", async function (req, res) {
  const user_id = req.user_id;
  const showroom_no = req.params.showroom_no;
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "MAGAZINE",
      "UPDATE.FAV.SHOW.001",
      {
        user_id,
        showroom_no,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
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
 * "/pickup-fail":
 *   post:
 *     tags: [픽업]
 *     summary: "샘플 미수령을 브랜드에 보고"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210127000015"
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
app.post("/pickup-fail", async function (req, res) {
  const user_id = req.user_id;
  const req_no = req.body.req_no;
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "INSERT.PICKUP.FAIL.001",
      {
        user_id,
        req_no,
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
 * "/pickup-fail-individual":
 *   post:
 *     tags: [픽업]
 *     summary: "샘플 개별미수령을 브랜드에 보고"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210330000185"
 *       - name: "sample_no"
 *         description: "샘플 번호"
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

app.post("/pickup-fail-individual", async function (req, res) {
  const user_id = req.user_id;
  const req_no = isNull(req.body.req_no, null);
  const sample_no = isNull(req.body.sample_no, null);
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "INSERT.PICKUP.FAIL.INDIVIDUAL",
      {
        user_id,
        req_no,
        sample_no,
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
 * "/pickup-success":
 *   post:
 *     tags: [픽업]
 *     summary: "샘플 수령을 브랜드에 보고"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210127000015"
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

app.post("/pickup-success", async function (req, res) {
  const user_id = req.user_id;
  const req_no = req.body.req_no;
  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "CHECK.ACCESSABLE.REQ.STYLIST",
      {
        req_no,
        user_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can create.",
      });
      return;
    }
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "UPDATE.PICKUP.SUCCESS.001",
      {
        user_id,
        req_no,
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
 * "/pickup-success-individual":
 *   post:
 *     tags: [픽업]
 *     summary: "하나의 샘플 수령을 브랜드에 보고"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210127000015"
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

app.post("/pickup-success-individual", async function (req, res) {
  const user_id = req.user_id;
  const req_no = req.body.req_no;
  const sample_no = req.body.sample_no;
  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "CHECK.ACCESSABLE.REQ.STYLIST",
      {
        req_no,
        user_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can create.",
      });
      return;
    }
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "UPDATE.PICKUP.SUCCESS.INDIVIDUAL",
      {
        user_id,
        req_no,
        sample_no,
      },
      { language: "sql", indent: "  " }
    );
    const push_result = await req.sequelize.query(selectQuery, {
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
      "STYLIST",
      "SELECT.REQUEST.004",
      {
        user_id,
        req_no,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery2 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.REQUEST.005",
      {
        user_id,
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
 * "/showroom-request-update":
 *   post:
 *     tags: [샘플요청]
 *     summary: "샘플요청 수정"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_no"
 *         description: "요청 번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210127000015"
 *       - name: "showroom_list"
 *         description: "현재 선택한 쇼룸들"
 *         in: body
 *         required: false
 *         type: array
 *         example: ["20210125000008","20210125000009","20210125000010"]
 *       - name: "duty_recpt_dt"
 *         description: "수령일"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 1611100800
 *       - name: "photogrf_dt"
 *         description: "촬영일"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 1611624568
 *       - name: "begin_dt"
 *         description: "촬영시작시각 (시/분/초는 적당히-->날짜만 맞으면 됨)"
 *         in: body
 *         required: true
 *         type: string
 *         example: "15"
 *       - name: "end_dt"
 *         description: "촬영종료시각 (시/분/초는 적당히-->날짜만 맞으면 됨)"
 *         in: body
 *         required: true
 *         type: string
 *         example: "17"
 *       - name: "return_prearnge_dt"
 *         description: "반환 예정일"
 *         in: body
 *         required: true
 *         type: integer
 *         example: 1611619200
 *       - name: "photogrf_concept"
 *         description: "촬영 컨셉"
 *         in: body
 *         required: true
 *         type: string
 *         example: "수상함"
 *       - name: "model_list"
 *         description: "모델 리스트"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["영희", "철수"]
 *       - name: "celeb_list"
 *         description: "셀럽의 리스트"
 *         in: body
 *         required: true
 *         type: array
 *         example: ["영희", "철수"]
 *       - name: "page_cnt"
 *         description: "페이지 수"
 *         in: body
 *         required: true
 *         type: string
 *         example: "5"
 *       - name: "etc_brand"
 *         description: "기타브랜드정보"
 *         in: body
 *         required: true
 *         type: string
 *         example: "샤넬"
 *       - name: "today_connect"
 *         description: "당일연결희망가능여부"
 *         in: body
 *         required: true
 *         type: boolean
 *         example: false
 *       - name: "add_req_cntent"
 *         description: "추가요청내용"
 *         in: body
 *         required: true
 *         type: string
 *         example: "잘 부탁드립니다."
 *       - name: "dlvy_adres_nm"
 *         description: "배송주소"
 *         in: body
 *         required: true
 *         type: string
 *         example: "송촌빌딩 133층"
 *       - name: "adres_detail"
 *         description: "상세주소"
 *         in: body
 *         required: true
 *         type: string
 *         example: "상세주소명"
 *       - name: "dlvy_atent_matter"
 *         description: "배송메시지"
 *         in: body
 *         required: true
 *         type: string
 *         example: "상품 늦지않게 보내주셔야되요!!"
 *       - name: "contact_user_id"
 *         description: "연락받을 유저"
 *         in: body
 *         required: true
 *         type: string
 *         example: "3a27da16-9b06-43a1-964e-70f70acf9806"
 *       - name: "loc_value"
 *         description: "로케쵤영 정보"
 *         in: body
 *         required: true
 *         type: string
 *         example: ""
 *       - name: "own_paid_pictorial_content"
 *         description: "자사 유가화보 내용"
 *         in: body
 *         required: false
 *         type: string
 *         example: "내용"
 *       - name: "other_paid_pictorial_content"
 *         description: "타사 유가화보 내용"
 *         in: body
 *         required: false
 *         type: string
 *         example: "내용"
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
app.post("/showroom-request-update", async function (req, res) {
  // req_no는 디폴트
  // req_status_cd는 요청용 코드
  // req_user_se_cd는 매거진 코드
  // req_user_id용->유저ID

  const user_id = req.user_id;
  const req_no = isNull(req.body.req_no, null);
  const duty_recpt_dt = isNull(req.body.duty_recpt_dt, null);
  const photogrf_dt = isNull(req.body.photogrf_dt, null);
  const begin_dt = isNull(req.body.begin_dt, null);
  const end_dt = isNull(req.body.end_dt, null);
  const return_prearnge_dt = isNull(req.body.return_prearnge_dt, null);
  const photogrf_concept = isNull(req.body.photogrf_concept, "");
  const photogrf_cntent =
    isNull(req.body.photogrf_concept, "") + "의 컨셉으로 촬영";
  const model_list = isNull(req.body.model_list, []);
  const celeb_list = isNull(req.body.celeb_list, []);
  const showroom_list = isNull(req.body.showroom_list, null);
  // pchrg_picalbm_yn용->유료화보 유무
  let picalbm_yn = true;
  let own_paid_pictorial_yn = true;
  let other_paid_pictorial_yn = true;
  const own_paid_pictorial_content = isNull(
    req.body.own_paid_pictorial_content,
    null
  );
  const other_paid_pictorial_content = isNull(
    req.body.other_paid_pictorial_content,
    null
  );
  // pchrg_picalbm_cntent용->유료화보 이름
  if (own_paid_pictorial_content === null) {
    own_paid_pictorial_yn = false;
    if (other_paid_pictorial_content === null) {
      picalbm_yn = false;
      other_paid_pictorial_yn = false;
    }
  } else if (other_paid_pictorial_content === null) {
    other_paid_pictorial_yn = false;
  }
  // page_cnt용->페이지수
  const page_cnt = isNull(req.body.page_cnt, null);
  // etc_brand_info용-> 함께 들어가는 브랜드
  const etc_brand = isNull(req.body.etc_brand, null);
  // today_connect_hope_posbl_yn용->당일연결
  const today_connect = isNull(req.body.today_connect, null);
  // add_req_cntent용->Message
  const add_req_cntent = isNull(req.body.add_req_cntent, null);
  // dlvy_adres_no->배송주소
  const dlvy_adres_nm = isNull(req.body.dlvy_adres_nm, null);
  const adres_detail = isNull(req.body.adres_detail, null);
  const dlvy_adres_no = isNull(req.body.dlvy_adres_no, '0');
  //dlvy_atent_matter용-> Shipping Notes
  const dlvy_atent_matter = isNull(req.body.dlvy_atent_matter, null);
  // del_yn은 디폴트
  const contact_user_id = isNull(req.body.contact_user_id, null);

  let loc_yn = true;
  const loc_value = isNull(req.body.loc_value, null);
  if (loc_value === null) {
    loc_yn = false;
  }
  if (
    [
      duty_recpt_dt,
      photogrf_dt,
      return_prearnge_dt,
      today_connect,
      dlvy_adres_nm,
      adres_detail,
      photogrf_concept,
      req_no,
      contact_user_id,
      begin_dt,
      end_dt,
      showroom_list,
    ].includes(null)
  ) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  if (showroom_list.length === 0) {
    res.status(400).json({
      success: false,
      error: "bad parameter: showroom_list cannot be empty",
    });
  }
  let modl_se_cd = "";
  if (model_list.length === 0) {
    if (celeb_list.length === 0) {
      res.status(400).json({
        success: false,
        error:
          "bad parameter: model_list and celeb_list must not be empty at the same time",
      });
      return;
    } else {
      modl_se_cd = "PMS001";
    }
  } else {
    if (celeb_list.length === 0) {
      modl_se_cd = "PMS002";
    } else {
      modl_se_cd = "PMS004";
    }
  }
  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "CHECK.ACCESSABLE.REQ.STYLIST",
      {
        req_no,
        user_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can create.",
      });
      return;
    }

    const updateQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "UPDATE.REQUEST.001",
      {
        user_id,
        duty_recpt_dt,
        photogrf_dt,
        return_prearnge_dt,
        photogrf_cntent,
        modl_se_cd,
        model_list,
        celeb_list,
        picalbm_yn,
        own_paid_pictorial_yn,
        own_paid_pictorial_content,
        other_paid_pictorial_yn,
        other_paid_pictorial_content,
        page_cnt,
        etc_brand,
        today_connect,
        add_req_cntent,
        dlvy_atent_matter,
        dlvy_adres_nm,
        dlvy_adres_no,
        photogrf_concept,
        req_no,
        contact_user_id,
        begin_dt,
        end_dt,
        loc_value,
        loc_yn,
        showroom_list,
        adres_detail,
      },
      { language: "sql", indent: "  " }
    );
    await req.sequelize.query(updateQuery, {
      type: req.sequelize.QueryTypes.UPDATE,
    });
    res.json({
      success: true,
      qry : updateQuery
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
 * "/showroom-request-delete":
 *   delete:
 *     tags: [샘플요청]
 *     summary: "샘플요청 삭제"
 *     consumes: [application/json]
 *     produces: [application/json]
 *     parameters:
 *       - name: "req_list"
 *         description: "요청의 배열"
 *         in: body
 *         required: true
 *         type: string
 *         example: ["20210127000015","20210127000016"]
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
app.delete("/showroom-request-delete", async function (req, res) {
  // req_no는 디폴트
  // req_status_cd는 요청용 코드
  // req_user_se_cd는 매거진 코드
  // req_user_id용->유저ID
  const user_id = req.user_id;
  const req_list = isNull(req.body.req_list, null);
  if (req_list === null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }
  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "CHECK.ACCESSABLE.REQ.STYLIST",
      {
        req_no,
        user_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can create.",
      });
      return;
    }

    const selectQuery_1 = req.mybatisMapper.getStatement(
      "STYLIST",
      "DELETE.REQUEST.001",
      {
        user_id,
        req_list,
      },
      { language: "sql", indent: "  " }
    );
    await req.sequelize.query(selectQuery_1, {
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
 *             cnfirm_request:
 *               description: "확인된 요청들의 목록"
 *               type: array
 *               example: [ { "req_no": "20210127000016", "floor": 1611619200, "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com" } ]
 *             cnfirm_request_total_count:
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
 *               example: 6
 *             cnfirm_history:
 *               description: "지난 12개월 동안 브랜드사측에서 확인한 샘플요청 통계"
 *               type: array
 *               example: [ { "year": "2020", "month": "02", "count": 0 }, { "year": "2020", "month": "03", "count": 0 }, { "year": "2020", "month": "04", "count": 0 }, { "year": "2020", "month": "05", "count": 0 }, { "year": "2020", "month": "06", "count": 0 }, { "year": "2020", "month": "07", "count": 0 }, { "year": "2020", "month": "08", "count": 0 }, { "year": "2020", "month": "09", "count": 0 }, { "year": "2020", "month": "10", "count": 0 }, { "year": "2020", "month": "11", "count": 0 }, { "year": "2020", "month": "12", "count": 0 }, { "year": "2021", "month": "01", "count": 7 }, { "year": "2021", "month": "02", "count": 0 } ]
 *             pickup_history:
 *               description: "지난 12개월 동안 수령한 샘플 통계"
 *               type: array
 *               example: [ { "year": "2020", "month": "02", "count": 0 }, { "year": "2020", "month": "03", "count": 0 }, { "year": "2020", "month": "04", "count": 0 }, { "year": "2020", "month": "05", "count": 0 }, { "year": "2020", "month": "06", "count": 0 }, { "year": "2020", "month": "07", "count": 0 }, { "year": "2020", "month": "08", "count": 0 }, { "year": "2020", "month": "09", "count": 0 }, { "year": "2020", "month": "10", "count": 0 }, { "year": "2020", "month": "11", "count": 0 }, { "year": "2020", "month": "12", "count": 0 }, { "year": "2021", "month": "01", "count": 27 }, { "year": "2021", "month": "02", "count": 1 } ]
 *             brand_ratio:
 *               description: "지난 12개월동안 수령한 샘플의 브랜드사 비율의 통계"
 *               type: array
 *               example: [ { "brand_nm": "테스트브랜드1", "brand_id": "BRAND_TEST001", "count": 12 }, { "brand_nm": "테스트브랜드3", "brand_id": "BRAND_TEST003", "count": 15 }, { "brand_nm": "DDDddd", "brand_id": "BRAND_TEST006", "count": 1 } ]
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
  const date = req.query.date;
  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.HOME.001",
      {
        user_id,
        date,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery2 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.HOME.002",
      {
        user_id,
        date,
        limit: 6,
        offset: 0,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult2 = await req.sequelize.query(selectQuery2, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery3 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.HOME.003",
      {
        user_id,
        date,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult3 = await req.sequelize.query(selectQuery3, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery4 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.HOME.004",
      {
        user_id,
        date,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult4 = await req.sequelize.query(selectQuery4, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    const selectQuery5 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.HOME.005",
      {
        user_id,
        date,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult5 = await req.sequelize.query(selectQuery5, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    res.json({
      cnfirm_request: selectResult,
      cnfirm_request_total_count:
        selectResult.length === 0 ? 0 : selectResult[0].total_count,
      today_request: selectResult2,
      today_request_total_count:
        selectResult2.length === 0 ? 0 : selectResult2[0].total_count,
      cnfirm_history: selectResult3.every((e) => e.count === 0)
        ? []
        : selectResult3,
      pickup_history: selectResult4.every((e) => e.count === 0)
        ? []
        : selectResult4,
      brand_ratio: selectResult5,
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
 * "/home/confirmed-request":
 *   get:
 *     tags: [메인페이지]
 *     summary: "유저 홈 화면"
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
 *         description: "성공."
 *         schema:
 *           type: object
 *           properties:
 *             list:
 *               description: "확인된 요청들의 목록"
 *               type: array
 *               example: [ { "req_no": "20210127000016", "floor": 1611619200, "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com" } ]
 *             total_count:
 *               description: ""
 *               type: integer
 *               example: 6
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
app.get("/home/confirmed-request", async function (req, res) {
  const user_id = req.user_id;
  const date = req.query.date;

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.HOME.001",
      {
        user_id,
        date,
        limit,
        offset,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult = await req.sequelize.query(selectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      list: selectResult,
      total_count: selectResult.length === 0 ? 0 : selectResult[0].total_count,
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
 * "/home/today-request":
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
 *             list:
 *               description: "오늘 수령할 예정인 샘플 요청들"
 *               type: array
 *               example: [ { "req_no": "20210127000016", "floor": 1611619200, "brand_nm": "테스트브랜드1", "brand_logo_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.com" } ]
 *             total_count:
 *               description: ""
 *               type: integer
 *               example: 6
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

app.get("/home/today-request", async function (req, res) {
  const user_id = req.user_id;
  const date = req.query.date;
  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const selectQuery2 = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.HOME.002",
      {
        user_id,
        date,
        limit,
        offset,
      },
      { language: "sql", indent: "  " }
    );
    const selectResult2 = await req.sequelize.query(selectQuery2, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      list: selectResult2,
      total_count:
        selectResult2.length === 0 ? 0 : selectResult2[0].total_count,

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
 *               description: "쇼룸/샘플 내의 검색결과"
 *               type: array
 *               example: [ { "showroom_no": "20210226000048", "sample_no": "20210304000068", "title": "Test Edit Sample", "brand_nm": "테스트브랜드1", "reg_dt": 1614849027, "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.compublic/showroomImage/4623de91-de64-4c61-899d-b47679016bca.png", "img_path": "public/showroomImage/4623de91-de64-4c61-899d-b47679016bca.png", "subtitle": "2021S/S", "search_type": "sample" }, { "showroom_no": "20210304000067", "sample_no": "20210304000067", "title": "테스트 샘플 1", "brand_nm": "테스트브랜드1", "reg_dt": 1614847910, "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "subtitle": "2020Cruise", "search_type": "sample" }, { "showroom_no": "20210304000067", "sample_no": "20210304000065", "title": "테스트 샘플 1", "brand_nm": "테스트브랜드1", "reg_dt": 1614847842, "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "subtitle": "2020Cruise", "search_type": "sample" }, { "showroom_no": "20210304000067", "sample_no": "20210304000065", "title": "테스트 쇼룸????", "brand_nm": "테스트브랜드1", "reg_dt": 1614847842, "img_url_adres": "https://fpr-prod-file.s3-ap-northeast-2.amazonaws.comhttps://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "img_path": "https://thumbs.dreamstime.com/z/woman-praying-free-birds-to-nature-sunset-background-woman-praying-free-birds-enjoying-nature-sunset-99680945.jpg", "subtitle": "2020Cruise", "search_type": "showroom" }]
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
  const search_text = isNull(req.query.search_text, null);
  try {
    const showroomSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.SHOWROOM",
      { user_id, search_text },
      { language: "sql", indent: "  " }
    );
    const showroomSelectResult = await req.sequelize.query(
      showroomSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    const reqSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.REQ",
      { user_id, search_text },
      { language: "sql", indent: "  " }
    );
    const reqSelectResult = await req.sequelize.query(reqSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const scheduleSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.SCHEDULE",
      { user_id, search_text },
      { language: "sql", indent: "  " }
    );
    const scheduleSelectResult = await req.sequelize.query(
      scheduleSelectQuery,
      {
        type: req.sequelize.QueryTypes.SELECT,
      }
    );

    const sendoutSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.RETURN",
      { user_id, search_text },
      { language: "sql", indent: "  " }
    );
    const sendoutSelectResult = await req.sequelize.query(sendoutSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    const pressSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.PRESS",
      { user_id, search_text },
      { language: "sql", indent: "  " }
    );
    const pressSelectResult = await req.sequelize.query(pressSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      net_count_app: showroomSelectResult.length,
      net_count_web:
        showroomSelectResult.length +
        reqSelectResult.length +
        scheduleSelectResult.length +
        sendoutSelectResult.length +
        pressSelectResult.length,
      showroom: showroomSelectResult,
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
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const showroomSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.SHOWROOM",
      { user_id, search_text, limit, offset },
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

app.get("/search/req", async function (req, res) {
  const user_id = req.user_id;
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const reqSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.REQ",
      { user_id, search_text, limit, offset },
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
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const scheduleSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.SCHEDULE",
      { user_id, search_text, limit, offset },
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

app.get("/search/returns", async function (req, res) {
  const user_id = req.user_id;
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const sendoutSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.RETURN",
      { user_id, search_text, limit, offset },
      { language: "sql", indent: "  " }
    );
    const sendoutSelectResult = await req.sequelize.query(sendoutSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      returns: sendoutSelectResult,
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

app.get("/search/pickup", async function (req, res) {
  const user_id = req.user_id;
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const pickupSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.PICKUP",
      { user_id, search_text, limit, offset },
      { language: "sql", indent: "  " }
    );
    const pickupSelectResult = await req.sequelize.query(pickupSelectQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    res.json({
      pickup: pickupSelectResult,
      total_count:
        pickupSelectResult.length === 0 ? 0 : pickupSelectResult[0].total_count,
      next_page:
        (pickupSelectResult.length == 0
          ? 0
          : pickupSelectResult[0].total_count) /
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
  const search_text = isNull(req.query.search_text, null);

  const page = isNull(req.query.page, 1);
  const limit = parseInt(isNull(req.query.limit, 10));
  const offset = parseInt((page - 1) * limit);

  try {
    const pressSelectQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "SELECT.SEARCH.PRESS",
      { user_id, search_text, limit, offset },
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
      { notice_no },
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
 * "/notify-control/brand-notice":
 *   put:
 *     tags: [알림]
 *     summary: "브랜드 공지사항 알림 수신 여부 제어입니다."
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
app.put("/notify-control/brand-notice", async (req, res) => {
  const user_id = req.user_id;

  const recv_yn = isNull(req.body.recv_yn, null);

  if (recv_yn == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.NOTIFY.CONTROL.BRAND.NOTICE",
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
 * "/notify-control/sample-send":
 *   put:
 *     tags: [알림]
 *     summary: "샘플 전송 알림 수신 여부 제어입니다."
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
app.put("/notify-control/sample-send", async (req, res) => {
  const user_id = req.user_id;

  const recv_yn = isNull(req.body.recv_yn, null);

  if (recv_yn == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.NOTICE.CONTROL.SAMPLE.SEND",
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
 * "/notify-control/request-confirm":
 *   put:
 *     tags: [알림]
 *     summary: "샘플 요청 확인 알림 수신 여부 제어입니다."
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
app.put("/notify-control/request-confirm", async (req, res) => {
  const user_id = req.user_id;

  const recv_yn = isNull(req.body.recv_yn, null);

  if (recv_yn == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.CONTROL.REQUEST.CONFIRM",
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
 *     summary: "공지사항 알림 수신 여부 제어입니다. (삭제)"
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
 * "/notify-control/press":
 *   put:
 *     tags: [알림]
 *     summary: "보도자료 알림 수신 여부 제어입니다."
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
app.put("/notify-control/press", async (req, res) => {
  const user_id = req.user_id;

  const recv_yn = isNull(req.body.recv_yn, null);

  if (recv_yn == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.NOTIFY.CONTROL.PRESS",
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
 * "/notify-control/showroom":
 *   put:
 *     tags: [알림]
 *     summary: "쇼룸 알림 수신 여부 제어입니다."
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
app.put("/notify-control/showroom", async (req, res) => {
  const user_id = req.user_id;

  const recv_yn = isNull(req.body.recv_yn, null);

  if (recv_yn == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const selectQuery = req.mybatisMapper.getStatement(
      "SHARE",
      "UPDATE.NOTIFY.CONTROL.SHOWROOM",
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

  const req_no = isNull(req.body.req_no, null);
  const len = isNull(req.body.len.toString(), null);

  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "CHECK.ACCESSABLE.REQ.STYLIST",
      {
        req_no,
        user_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can create.",
      });
      return;
    }
    const insertQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "UPDATE.SENDOUT.PUSH",
      {
        user_id,
        req_no,
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
 *       - name: "sample_no"
 *         description: "발송한 샘플의 일련번호"
 *         in: body
 *         required: true
 *         type: string
 *         example: "20210302000058"
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
app.post("/sendout-push-individual", async function (req, res) {
  const user_id = isNull(req.user_id, null);
  const sample_no = isNull(req.body.sample_no, null);
  const req_no = isNull(req.body.req_no, null);
  const len = isNull(req.body.len.toString(), null);

  if (req_no == null) {
    res.status(400).json({ success: false, error: "bad parameter" });
    return;
  }

  try {
    const checkQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "CHECK.ACCESSABLE.REQ.STYLIST",
      {
        req_no,
        user_id,
      },
      { language: "sql", indent: "  " }
    );

    const checkResult = await req.sequelize.query(checkQuery, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    if (checkResult.length === 0 || checkResult[0].accessable == false) {
      res.status(403).json({
        success: false,
        error: "It's not a request you can create.",
      });
      return;
    }
    const insertQuery = req.mybatisMapper.getStatement(
      "STYLIST",
      "UPDATE.SENDOUT.PUSH.INDIVIDUAL",
      {
        user_id,
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

module.exports = app;
