const { jwt_middleware, verify_middleware, upload_middleware} = require("../middleware");
const report_controller = require("../controllers/report_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/reports/summary-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],report_controller.summary_report);
};
