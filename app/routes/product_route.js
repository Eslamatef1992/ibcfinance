const { jwt_middleware, verify_middleware, upload_middleware} = require("../middleware");
const product_category_controller = require("../controllers/product_category_controller");
const product_brand_controller = require("../controllers/product_brand_controller");
const product_type_controller = require("../controllers/product_type_controller");
const product_unit_controller = require("../controllers/product_unit_controller");
const product_controller = require("../controllers/product_controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/product-category/product-category-list",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_category_controller.product_category_list);
    app.get("/product-category/product-category-list-active/:company",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_category_controller.product_category_list_active);
    app.get("/product-category/get-product-category/:product_category_id",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_category_controller.get_product_category);
    app.post("/product-category/product-category-create",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_category_controller.product_category_create);
    app.put("/product-category/product-category-update/:product_category_id",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_category_controller.product_category_update);
    app.delete("/product-category/product-category-delete/:product_category_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],product_category_controller.product_category_delete);

    app.get("/product-brand/product-brand-list",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_brand_controller.product_brand_list);
    app.get("/product-brand/product-brand-list-active/:company",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_brand_controller.product_brand_list_active);
    app.get("/product-brand/get-product-brand/:product_brand_id",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_brand_controller.get_product_brand);
    app.post("/product-brand/product-brand-create",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_brand_controller.product_brand_create);
    app.put("/product-brand/product-brand-update/:product_brand_id",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_brand_controller.product_brand_update);
    app.delete("/product-brand/product-brand-delete/:product_brand_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],product_brand_controller.product_brand_delete);

    app.get("/product-type/product-type-list",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_type_controller.product_type_list);
    app.get("/product-type/product-type-list-active/:company",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_type_controller.product_type_list_active);
    app.get("/product-type/get-product-type/:product_type_id",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_type_controller.get_product_type);
    app.post("/product-type/product-type-create",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_type_controller.product_type_create);
    app.put("/product-type/product-type-update/:product_type_id",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_type_controller.product_type_update);
    app.delete("/product-type/product-type-delete/:product_type_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],product_type_controller.product_type_delete);

    app.get("/product-unit/product-unit-list",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_unit_controller.product_unit_list);
    app.get("/product-unit/product-unit-list-active/:company",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_unit_controller.product_unit_list_active);
    app.get("/product-unit/get-product-unit/:product_unit_id",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_unit_controller.get_product_unit);
    app.post("/product-unit/product-unit-create",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_unit_controller.product_unit_create);
    app.put("/product-unit/product-unit-update/:product_unit_id",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase],product_unit_controller.product_unit_update);
    app.delete("/product-unit/product-unit-delete/:product_unit_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],product_unit_controller.product_unit_delete);

    app.get("/product/product-list",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_controller.product_list);
    app.get("/product/product-list-active/:company",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_controller.product_list_active);
    app.get("/product/product-search",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_controller.product_search);
    app.get("/product/get-product/:product_id",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_controller.get_product);
    app.post("/product/product-create",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase, upload_middleware.product_picture.single("product_picture")],product_controller.product_create);
    app.put("/product/product-update/:product_id",[jwt_middleware.verify_token, jwt_middleware.is_sales_purchase, upload_middleware.product_picture.single("product_picture")],product_controller.product_update);
    app.delete("/product/product-delete/:product_id",[jwt_middleware.verify_token, jwt_middleware.is_super_admin],product_controller.product_delete);
    app.get("/product/product-report",[jwt_middleware.verify_token, jwt_middleware.is_all_user],product_controller.product_report);
};