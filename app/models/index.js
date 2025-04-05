const database = require("../config/database");
const Sequelize = require("sequelize");

// DB Connection
const sequelize = new Sequelize(database.DB, database.USER, database.PASSWORD, {
  host: database.HOST,
  dialect: database.dialect,
  operatorsAliases: false,

  pool: {
    max: database.pool.max,
    min: database.pool.min,
    acquire: database.pool.acquire,
    idle: database.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import All Models
db.company_model = require("./company_model")(sequelize, Sequelize);
db.company_package_model = require("./company_package_model")(
  sequelize,
  Sequelize
);
db.user_model = require("./user_model")(sequelize, Sequelize);
db.user_group_model = require("./user_group_model")(sequelize, Sequelize);
db.reset_password_model = require("./reset_password_model")(
  sequelize,
  Sequelize
);
db.status_model = require("./status_model")(sequelize, Sequelize);
db.system_model = require("./system_model")(sequelize, Sequelize);
db.branch_model = require("./branch_model")(sequelize, Sequelize);
db.accounts_type_model = require("./accounts_type_model")(sequelize, Sequelize);
db.chart_of_accounts_model = require("./chart_of_accounts_model")(
  sequelize,
  Sequelize
);
db.accounts_link_model = require("./accounts_link_model")(sequelize, Sequelize);
db.voucher_type_model = require("./voucher_type_model")(sequelize, Sequelize);
db.accounts_model = require("./accounts_model")(sequelize, Sequelize);
db.accounts_details_model = require("./accounts_details_model")(
  sequelize,
  Sequelize
);
db.financial_year_model = require("./financial_year_model")(
  sequelize,
  Sequelize
);

db.warehouse_model = require("./warehouse_model")(sequelize, Sequelize);
db.product_model = require("./product_model")(sequelize, Sequelize);
db.product_stock_model = require("./product_stock_model")(sequelize, Sequelize);
db.product_category_model = require("./product_category_model")(
  sequelize,
  Sequelize
);
db.product_brand_model = require("./product_brand_model")(sequelize, Sequelize);
db.product_type_model = require("./product_type_model")(sequelize, Sequelize);
db.product_unit_model = require("./product_unit_model")(sequelize, Sequelize);

db.supplier_model = require("./supplier_model")(sequelize, Sequelize);
db.supplier_payment_model = require("./supplier_payment_model")(
  sequelize,
  Sequelize
);
db.supplier_payment_return_model = require("./supplier_payment_return_model")(
  sequelize,
  Sequelize
);
db.customer_model = require("./customer_model")(sequelize, Sequelize);
db.customer_payment_model = require("./customer_payment_model")(
  sequelize,
  Sequelize
);
db.customer_payment_return_model = require("./customer_payment_return_model")(
  sequelize,
  Sequelize
);

db.purchase_model = require("./purchase_model")(sequelize, Sequelize);
db.purchase_details_model = require("./purchase_details_model")(
  sequelize,
  Sequelize
);
db.purchase_return_model = require("./purchase_return_model")(
  sequelize,
  Sequelize
);
db.purchase_return_details_model = require("./purchase_return_details_model")(
  sequelize,
  Sequelize
);

db.sales_model = require("./sales_model")(sequelize, Sequelize);
db.sales_details_model = require("./sales_details_model")(sequelize, Sequelize);
db.sales_return_model = require("./sales_return_model")(sequelize, Sequelize);
db.sales_return_details_model = require("./sales_return_details_model")(
  sequelize,
  Sequelize
);
db.branch_owner_model = require("./branch_owner_model")(sequelize, Sequelize);

module.exports = db;
