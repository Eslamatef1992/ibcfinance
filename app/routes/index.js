module.exports = function (app) {
  require("./user_route")(app);
  require("./setting_route")(app);
  require("./company_route")(app);
  require("./company_package_route")(app);
  require("./branch_route")(app);
  require("./accounts_type_route")(app);
  require("./chart_of_accounts_route")(app);
  require("./voucher_type_route")(app);
  require("./accounts_route")(app);
  require("./financial_year_route")(app);
  require("./accounts_link_route")(app);
  require("./product_route")(app);
  require("./supplier_route")(app);
  require("./customer_route")(app);
  require("./warehouse_route")(app);
  require("./purchase_route")(app);
  require("./sales_route")(app);
  require("./report_route")(app);
  require("./branch_owner_route")(app);
};
