var mysql = require('mysql');
var config = require('../config/default.js')

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
gift_card_245 =
    `create table if not exists gift_card_245(
 id INT NOT NULL AUTO_INCREMENT,
 consignee VARCHAR(255) NOT NULL,
 phone_number VARCHAR(255) NOT NULL,
 address VARCHAR(255) NOT NULL,
 ship_status INT(255) NOT NULL,
 tracking_number VARCHAR(255) NOT NULL,
 card_code VARCHAR(255) NOT NULL,
 card_pwd VARCHAR(255) NOT NULL,
 company_code VARCHAR(255) NOT NULL,
 PRIMARY KEY ( id )
);`

// 创建表
let createTable = function( sql ) {
    return query( sql, [] )
}

// 建表
createTable(gift_card_245)

// 注册用户
let insertData = function( value ) {
    let _sql = "insert into users(name,pass) values(?,?);"
    return query( _sql, value )
}

// 通过名字查找用户
let findDataByCardCode = function (card_code) {
    let _sql = `SELECT * from gift_card_245 where card_code="${card_code}"`
    return query(_sql)
}

module.exports={
    query,
    createTable,
    findDataByCardCode,
    insertData,
}
