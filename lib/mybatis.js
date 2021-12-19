const path = require("path");
const mybatisMapper = require("mybatis-mapper-myyrakle");

const sqlPath = path.join(__dirname, "..", ".", `/sql`);

mybatisMapper.createMapper([
    `${sqlPath}/v1/cms.xml`,
    `${sqlPath}/v1/brand.xml`,
    `${sqlPath}/v1/magazine.xml`,
    `${sqlPath}/v1/stylist.xml`,
    `${sqlPath}/v1/share.xml`,
    `${sqlPath}/v1/pay.xml`,
    `${sqlPath}/v1/cdn.xml`,
    `${sqlPath}/v1/batch.xml`,
    `${sqlPath}/v1/test.xml`,
    `${sqlPath}/auth.xml`,
]);

module.exports = mybatisMapper;
