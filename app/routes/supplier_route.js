const { jwt_middleware, verify_middleware, upload_middleware} = require("../middleware");
const supplier_controller = require("../controllers/supplier_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/suppliers/supplier-list",[jwt_middleware.verify_token, jwt_middleware.is_all_user],supplier_controller.supplier_list);
    app.get("/suppliers/supplier-list-active/:company",[jwt_middleware.verify_token, jwt_middleware.is_all_user],supplier_controller.supplier_list_active);
    app.get("/suppliers/get-supplier/:supplier_id",[jwt_middleware.verify_token, jwt_middleware.is_all_user],supplier_controller.get_supplier);
    app.post("/suppliers/supplier-create",[jwt_middleware.verify_token, jwt_middleware.is_purchase, upload_middleware.supplier_picture.single("supplier_picture")],supplier_controller.supplier_create);
    app.put("/suppliers/supplier-update/:supplier_id",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase, upload_middleware.supplier_picture.single("supplier_picture")],supplier_controller.supplier_update);
    app.delete("/suppliers/supplier-delete/:supplier_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],supplier_controller.supplier_delete);
    app.get("/suppliers/supplier-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],supplier_controller.supplier_report);
    app.get("/suppliers/supplier-purchase-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],supplier_controller.supplier_purchase_report);
    app.get("/suppliers/supplier-payment-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],supplier_controller.supplier_payment_report);
    app.get("/suppliers/supplier-due-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],supplier_controller.supplier_due_report);
};