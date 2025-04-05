const { jwt_middleware, verify_middleware, upload_middleware} = require("../middleware");
const customer_controller = require("../controllers/customer_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/customers/customer-list",[jwt_middleware.verify_token, jwt_middleware.is_all_user],customer_controller.customer_list);
    app.get("/customers/customer-list-active/:company",[jwt_middleware.verify_token, jwt_middleware.is_all_user],customer_controller.customer_list_active);
    app.get("/customers/get-customer/:customer_id",[jwt_middleware.verify_token, jwt_middleware.is_all_user],customer_controller.get_customer);
    app.post("/customers/customer-create",[jwt_middleware.verify_token, jwt_middleware.is_purchase, upload_middleware.customer_picture.single("customer_picture")],customer_controller.customer_create);
    app.put("/customers/customer-update/:customer_id",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase, upload_middleware.customer_picture.single("customer_picture")],customer_controller.customer_update);
    app.delete("/customers/customer-delete/:customer_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],customer_controller.customer_delete);
    app.get("/customers/customer-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],customer_controller.customer_report);
    app.get("/customers/customer-sales-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],customer_controller.customer_sales_report);
    app.get("/customers/customer-collection-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],customer_controller.customer_collection_report);
    app.get("/customers/customer-due-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],customer_controller.customer_due_report);
};