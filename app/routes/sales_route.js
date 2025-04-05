const { jwt_middleware, verify_middleware, upload_middleware} = require("../middleware");
const sales_controller = require("../controllers/sales_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/sales/sales-list",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_list);
    app.get("/sales/sales-list-active",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_list_active);
    app.get("/sales/sales-search/",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_search);
    app.get("/sales/get-sales/:sales_id",sales_controller.get_sales);
    app.get("/sales/get-sales-invoice/",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.get_sales_invoice);
    app.post("/sales/sales-create",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_create);
    app.put("/sales/sales-update/:sales_id",[jwt_middleware.verify_token, jwt_middleware.is_manager],sales_controller.sales_update);
    app.delete("/sales/sales-delete/:sales_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],sales_controller.sales_delete);
    app.get("/sales/sales-return-list",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_return_list);
    app.post("/sales/sales-return-create",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_return_create);
    app.get("/sales/get-sales-return/:sales_return_id",sales_controller.get_sales_return);
    app.put("/sales/sales-return-update/:sales_return_id",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_return_update);
    app.put("/sales/sales-return-update/:sales_return_id",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_return_update);
    app.get("/sales/sales-due-list/",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_due_list);
    app.get("/sales/sales-return-due-list/",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.sales_return_due_list);
    app.post("/sales/due-collection-create/",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.due_collection_create);
    app.post("/sales/return-due-payment-create/",[jwt_middleware.verify_token, jwt_middleware.is_sales],sales_controller.return_due_payment_create);
    app.get("/sales/get-due-collection/",sales_controller.get_due_collection);
    app.get("/sales/get-return-due-payment/",sales_controller.get_return_due_payment);
    app.get("/sales/sales-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],sales_controller.sales_report);
    app.get("/sales/sales-due-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],sales_controller.sales_due_report);
    app.get("/sales/sales-collection-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],sales_controller.sales_collection_report);
    app.get("/sales/sales-return-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],sales_controller.sales_return_report);
    app.get("/sales/return-payment-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],sales_controller.return_payment_report);
    app.get("/sales/sales-balance/:company",[jwt_middleware.verify_token, jwt_middleware.is_all_user],sales_controller.sales_balance);
    app.get("/sales/sales-balance-branch",[jwt_middleware.verify_token, jwt_middleware.is_all_user],sales_controller.sales_balance_branch);
};
