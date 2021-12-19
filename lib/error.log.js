async function insertLog(req, system_type, error) {
    const user_id = req.user_id;

    try {
        const insertQuery = req.mybatisMapper.getStatement(
            "SHARE",
            "INSERT.001",
            {
                user_id,
                system_type,
                error: String(error),
                desc: "서버측 오류",
                writer: "SERVER",
                path: req.url,
            },
            { language: "sql", indent: "  " }
        );

        await req.sequelize.query(insertQuery, {
            type: req.sequelize.QueryTypes.SELECT,
        });
    } catch (_error) {
        console.error(_error);
    }
}

module.exports = insertLog;