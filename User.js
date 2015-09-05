//#region MODULES
var bycript = require('bcrypt-nodejs'),
    mysql = require('mysql');
//#endregion

//#region CCONSTANTS
var strParamId = 'id',
    strParamClient = 'client',
    strParamSecret = 'secret',
    strParamRegistered = 'registered',
    strParamIsGeneric = 'isGeneric';
//#endregion
//#region MODULES_CONFIG
// config mysql
//var connection = mysql.createConnection({
//    host: 'localhost',
//    user: 'root',
//    database: 'tumblrdashslides_main'
//  // password : 'root',
//});
//connection.connect();
//#endregion


//function User(id, client, secret, registered,isGeneric,blogname) {
//    this.id = id;
//    this.client = client;
//    this.secret = secret;
//    this.registered = registered != null && registered;
//    this.isGeneric = isGeneric;
//    this.blogName = blogName;
//}
function User(params) {
    this.id = params[strParamId];
    this.client = params[strParamClient];
    this.secret = params[strParamSecret];
    this.registered = params[strParamRegistered];
    this.isGeneric = params[strParamIsGeneric];
}

User.findOrCreate = function (options, callback) {
    switch (options['method']) {
        case 'soundcloud':
            var options = {
                id: options['soundCloudId'],
                client: options['soundCloudToken'],
                secret: options['soundCloudSecret'],
                isGeneric: false
            };
            var user = new User(options);
            callback(null, user);
            break;
        case 'tumblr':
            var options = {
                id: options['tumblrId'],
                client: options['tumblrToken'],
                secret: options['tumblrSecret'],
                isGeneric: false
            };
            var user = new User(options);
            callback(null, user);
            break;
    }
};

User.find = function (options, callback) {
    switch (options['method']) {
        case 'local':
            var username = options['username'],
                password = options['password'];
            connection.query("SELECT * FROM `users` WHERE Id = '" + username + "'", function (err, rows, fields) {
                if (err) callback(err);
                console.log("find user results", rows);
                if (rows.length > 0) {
                    console.log("local user found");
                    console.log("checking password");
                    var row = rows[0];
                    (new User(username)).validPassword(password, function (errPass, res) {
                        if (errPass) callback(errPass);
                        if (res) {
                            var user = new User(
                                row.Id,
                        row.clientkey,
                        row.clientsecret);
                            callback(null, user);
                        } else {
                            // valid user, invalid password.
                            var user = new User(row.Id);
                            callback(null, user);
                        }
                    });
                }
                else {
                    // no user exists
                    callback(null, null);
                }
            });
            break;
    }
}

User.create = function (options, callback) {
    switch (options['method']) {
        case 'local':
            var username = options['username'],
                password = options['password'],
                token = options['tumblrToken'],
                secret = options['tumblrSecret'];
            // if tumblr-id present, create a new user
            bycript.hash(password, null, null, function (errHash, hash) {
                if (errHash) callback(errHash);
                console.log("user not found. Creating one.");
                var sql = "INSERT INTO `users`(`Id`, `password`,`clientkey`,`clientsecret`) VALUES ('" + username + "','" + hash + "','" + token + "','" + secret + "')";
                connection.query(sql, function (updateerr, updaterows, updatefields) {
                    if (updateerr) callback(updateerr);
                    var createdUser = new User(username, token, secret);
                    callback(null, createdUser);
                });
            });
            break;
    }
}

User.prototype.validPassword = function (password, callback) {
    if (this.id == null) return false;
    validPassword(this.id, password, function (err, res) {
        if (err) callback(err);
        // res is bool
        callback(null, res);
    });
};
function validPassword(id, password, callback) {
    var sql = "SELECT * FROM `users` WHERE Id = '" + id + "'";
    connection.query(sql, function (err, rows, fields) {
        var hash = rows[0].password;
        bycript.compare(password, hash, function (errHash, res) {
            if (errHash) callback(errHash);
            // res is bool
            callback(null, res);
        });
    });
}
module.exports = User;
