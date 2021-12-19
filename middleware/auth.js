var authMiddleware = async function (req, res, next) {
  //console.log(req.apiGateway.event);

  // -------------------------------------
  // 개발중 id없을시 default 넣어줌

  var univ_uniq_no = 1;
  var user_info = {};

  let univ_uniq_id = null;

  //console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV == "dev") {
    univ_uniq_id = "1cfa7883-0f2d-4762-b4fa-09a93c9f1b4c"; // da

    //univ_uniq_id = "d9ec09fe-f32d-41f9-afbe-d446e460b69f";

    // generic base user
    //univ_uniq_id = "3a27da16-9b06-43a1-964e-70f70acf9806";

    // 매거진 ELLE
    //univ_uniq_id = "d9ec09fe-f32d-41f9-afbe-d446e460b69f";

    // generic base user
    univ_uniq_id = "3a27da16-9b06-43a1-964e-70f70acf9806";

    // 샤넬
    univ_uniq_id = "0f8d112b-2413-4ae9-907c-e53649316f00";

    // generic base user
    univ_uniq_id = "3a27da16-9b06-43a1-964e-70f70acf9806";

    // generic base user
    univ_uniq_id = "3a27da16-9b06-43a1-964e-70f70acf9806";
    if (req.path.indexOf("/v1/magazine") != -1) {
      //매거진 ELLE
      univ_uniq_id = "d9ec09fe-f32d-41f9-afbe-d446e460b69f";
    }
    if (req.path.indexOf("/v1/brand") != -1) {
      // 구찌
      univ_uniq_id = "3660d4c3-f42f-4f27-9ca5-abdd52142201";
    }
  }

  var user_pool = "ap-northeast-2_oOqP24bWn";

  try {
    var temp =
      req.apiGateway.event.requestContext.identity
        .cognitoAuthenticationProvider;

    univ_uniq_id = temp.split(":")[2];
    user_pool = temp.split("/")[1].split(",")[0];
  } catch (e) {
    //console.log("authMiddleware : univ_uniq_id 가 없음");
    //console.log("temp: " + String(temp));
    //console.log("univ_uniq_id: " + String(univ_uniq_id));
    //console.log("user_pool: " + String(user_pool));
  }

  try {
    var param = {
      user_id: univ_uniq_id,
      lang_code: "en",
    };

    //console.log("param", param);

    var query = req.mybatisMapper.getStatement(
      "AUTH",
      "LAST.ACCESS",
      param,
      format
    );
    await req.sequelize.query(query, {
      type: req.sequelize.QueryTypes.SELECT,
    });

    var format = { language: "sql", indent: "  " };
    var query = req.mybatisMapper.getStatement(
      "AUTH",
      "SELECT.TB_USER.001",
      param,
      format
    );

    //console.log(query);

    ////console.log("전");
    var result = await req.sequelize.query(query, {
      type: req.sequelize.QueryTypes.SELECT,
    });
    ////console.log("후");

    user_info = result[0];
    univ_uniq_no = result[0].user_no;

    req.brand_id = result[0].brand_id;
    req.is_brand_user = result[0].is_brand_user;
    req.brand_user_no = result[0].brand_user_no;

    req.mgzn_id = result[0].mgzn_id;
    req.is_mgzn_user = result[0].is_mgzn_user;
    req.mgzn_user_no = result[0].mgzn_user_no;

    req.is_stylist_user = result[0].is_stylist_user;
    req.stylist_user_no = result[0].stylist_user_no;
  } catch (e) {
    //console.log("rdb");
    //console.log(String(e));
  }

  req.user_id = univ_uniq_id;
  req.user_no = univ_uniq_no;
  req.user_info = user_info;
  req.cognito_info = {
    user_pool: user_pool,
  };
  next();
};

module.exports = authMiddleware;
