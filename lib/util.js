function isNull(data, replace) {
    return data === undefined ? replace : data;
}

function isNotNull(data) {
    return data === undefined || data === "" ? false : data;
}

function makeEnum(arr) {
    let obj = {};
    for (let val of arr) {
        obj[val] = Symbol(val);
    }
    return Object.freeze(obj);
}

function isIncludeEnum(enumObject, enumValue) {
    if (enumObject[enumValue]) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    isNull,
    isNotNull,
    makeEnum,
    isIncludeEnum,
};
