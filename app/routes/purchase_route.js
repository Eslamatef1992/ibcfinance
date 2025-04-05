const { jwt_middleware, verify_middleware, upload_middleware} = require("../middleware");
const purchase_controller = require("../controllers/purchase_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/purchase/purchase-list",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.purchase_list);
    app.get("/purchase/purchase-list-active",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.purchase_list_active);
    app.get("/purchase/purchase-search/",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.purchase_search);
    app.get("/purchase/get-purchase/:purchase_id",purchase_controller.get_purchase);
    app.get("/purchase/get-purchase-invoice/",[jwt_middleware.verify_token],purchase_controller.get_purchase_invoice);
    app.post("/purchase/purchase-create",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.purchase_create);
    app.put("/purchase/purchase-update/:purchase_id",[jwt_middleware.verify_token, jwt_middleware.is_manager],purchase_controller.purchase_update);
    app.delete("/purchase/purchase-delete/:purchase_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],purchase_controller.purchase_delete);
    app.get("/purchase/purchase-return-list",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.purchase_return_list);
    app.post("/purchase/purchase-return-create",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.purchase_return_create);
    app.get("/purchase/get-purchase-return/:purchase_return_id",purchase_controller.get_purchase_return);
    app.put("/purchase/purchase-return-update/:purchase_return_id",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.purchase_return_update);
    app.get("/purchase/purchase-due-list/",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.purchase_due_list);
    app.get("/purchase/purchase-return-due-list/",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.purchase_return_due_list);
    app.post("/purchase/due-payment-create/",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.due_payment_create);
    app.post("/purchase/return-due-collection-create/",[jwt_middleware.verify_token, jwt_middleware.is_purchase],purchase_controller.return_due_collection_create);
    app.get("/purchase/get-due-payment/",purchase_controller.get_due_payment);
    app.get("/purchase/get-return-due-collection/",purchase_controller.get_return_due_collection);
    app.get("/purchase/purchase-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],purchase_controller.purchase_report);
    app.get("/purchase/purchase-due-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],purchase_controller.purchase_due_report);
    app.get("/purchase/purchase-payment-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],purchase_controller.purchase_payment_report);
    app.get("/purchase/purchase-return-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],purchase_controller.purchase_return_report);
    app.get("/purchase/return-collection-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],purchase_controller.return_collection_report);
    app.get("/purchase/purchase-balance/:company",[jwt_middleware.verify_token, jwt_middleware.is_all_user],purchase_controller.purchase_balance);
    app.get("/purchase/purchase-balance-branch",[jwt_middleware.verify_token, jwt_middleware.is_all_user],purchase_controller.purchase_balance_branch);
};
