const { jwt_middleware } = require("../middleware");
const branch_owner_controller = require("../controllers/branch_owner_controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Branch Owner Routes
  app.get(
    "/branch-owner/list",
    [jwt_middleware.verify_token, jwt_middleware.is_manager],
    branch_owner_controller.branch_owner_list
  );
  app.get(
    "/branch-owner/get/:owner_id",
    [jwt_middleware.verify_token, jwt_middleware.is_manager],
    branch_owner_controller.get_branch_owner
  );
  app.post(
    "/branch-owner/create",
    [jwt_middleware.verify_token, jwt_middleware.is_manager],
    branch_owner_controller.branch_owner_create
  );
  app.put(
    "/branch-owner/update/:owner_id",
    [jwt_middleware.verify_token, jwt_middleware.is_manager],
    branch_owner_controller.branch_owner_update
  );
  app.delete(
    "/branch-owner/delete/:owner_id",
    [jwt_middleware.verify_token, jwt_middleware.is_super_admin],
    branch_owner_controller.branch_owner_delete
  );
  app.get(
    "/branch-owner/branches/:owner_id",
    [jwt_middleware.verify_token, jwt_middleware.is_manager],
    branch_owner_controller.get_branches_by_owner
  );
};
