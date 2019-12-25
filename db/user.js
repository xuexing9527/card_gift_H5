var mysql = require('mysql');
var config = require('../config/default.js')
const { getLogger } = require('../log/index.js');
const moment = require('moment');

const loggerInfo = getLogger('info');
const loggerError = getLogger('error');
const loggerAdd = getLogger('add');
var pool  = mysql.createPool({
    host     : config.database.HOST,
    user     : config.database.USERNAME,
    password : config.database.PASSWORD,
    database : config.database.DATABASE
});

// 查表并返回数据
let query = function( sql, values ) {
    return new Promise(( resolve, reject ) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                resolve( err )
            } else {
                connection.query(sql, values, ( err, rows) => {

                    if ( err ) {
                        reject( err )
                    } else {
                        resolve( rows )
                    }
                    connection.release()
                })
            }
        })
    })
}

// 用户表
const gift_card =
    `create table if not exists gift_card(
 id INT NOT NULL AUTO_INCREMENT,
 consignee VARCHAR(255),
 phone_number VARCHAR(255),
 address VARCHAR(255),
 ship_status INT(255),
 tracking_number VARCHAR(255),
 card_code VARCHAR(255),
 card_pwd VARCHAR(255),
 company_code VARCHAR(255),
 add_time VARCHAR(255),
 note VARCHAR(255),
 PRIMARY KEY ( id )
)CHARACTER SET utf8 COLLATE utf8_general_ci;`

// UPDATE 表名称 SET 列名称 = 新值 WHERE 列名称 = 某值

// 创建表
let createTable = function( sql ) {
    return query( sql, [] )
}

// 建表
createTable(gift_card)

// 注册用户
const insertData = function( value ) {
    const _sql = "insert into users(name,pass) values(?,?);"
    return query( _sql, value )
}

// 通过名字查找用户
const findDataByCardCode = function (card_code) {
    const msg = JSON.stringify({ card_code: card_code });
    loggerInfo.info(msg);
    const _sql = `SELECT * from gift_card where card_code="${card_code}";`
    return query(_sql)
}

const addDetail = function (param) {
    const date = moment().format('YYYY-MM-DD HH:mm:ss')
    const logMsg = JSON.stringify({ ...param, date });
    loggerAdd.info(logMsg);
    const { address, phone_number, consignee, card_code, ship_status, note } = param
    const sql = `UPDATE gift_card SET add_time = "${date}", `
      + `ship_status = ${ship_status}, `
      + `address = "${address}", phone_number = "${phone_number}", `
      + `note = "${note || ''}", `
      + `consignee = "${consignee}" WHERE card_code = "${card_code}";`
    return query(sql)
}

module.exports={
    query,
    createTable,
    findDataByCardCode,
    insertData,
    addDetail,
}
