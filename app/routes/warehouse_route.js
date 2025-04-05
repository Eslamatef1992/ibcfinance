const { jwt_middleware, verify_middleware, upload_middleware} = require("../middleware");
const warehouse_controller = require("../controllers/warehouse_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/warehouse/warehouse-list",[jwt_middleware.verify_token, jwt_middleware.is_all_user],warehouse_controller.warehouse_list);
    app.get("/warehouse/warehouse-list-active",[jwt_middleware.verify_token, jwt_middleware.is_all_user],warehouse_controller.warehouse_list_active);
    app.get("/warehouse/get-warehouse/:warehouse_id",[jwt_middleware.verify_token, jwt_middleware.is_all_user],warehouse_controller.get_warehouse);
    app.post("/warehouse/warehouse-create",[jwt_middleware.verify_token, jwt_middleware.is_manager],warehouse_controller.warehouse_create);
    app.put("/warehouse/warehouse-update/:warehouse_id",[jwt_middleware.verify_token, jwt_middleware.is_manager],warehouse_controller.warehouse_update);
    app.delete("/warehouse/warehouse-delete/:warehouse_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],warehouse_controller.warehouse_delete);
};
