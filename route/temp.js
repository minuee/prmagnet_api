await req.sequelize
    .query(
        `insert into tb_error_log(user_id, "error")
                values(
                    :user_id
                    , :error
                )`,
        {
            replacements: {
                user_id: "3a27da16-9b06-43a1-964e-70f70acf9806",
                error: insertSubscriptQuery,
            },
        }
    )
    .then();
