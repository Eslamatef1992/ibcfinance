require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const purchase_model        = db.purchase_model;
const purchase_details_model= db.purchase_details_model;
const product_model         = db.product_model;
const product_stock_model   = db.product_stock_model;
const supplier_model        = db.supplier_model;
const supplier_payment_model= db.supplier_payment_model;
const supplier_payment_return_model= db.supplier_payment_return_model;
const company_model         = db.company_model;
const branch_model          = db.branch_model;
const warehouse_model       = db.warehouse_model;
const product_unit_model    = db.product_unit_model;
const purchase_return_model = db.purchase_return_model;
const purchase_return_details_model = db.purchase_return_details_model;
const sequelize                     = db.sequelize;
const Op                            = db.Sequelize.Op;
let user_id;

// Purchase List
exports.purchase_list = async (req, res) => {
    try {
        const purchase = await purchase_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    purchase_branch: req.query.branch
                }),
                purchase_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                purchase_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    purchase_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        purchase_invoice: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        purchase_payable_amount:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['purchase_date', 'ASC']
            ]
        });

        if(purchase.length > 0) {
            const purchase_data = await Promise.all(purchase.map(async (row) => ({
                purchase_id                 : row.purchase_id,
                purchase_company            : row.purchase_company,
                purchase_company_name       : row.purchase_company <= 0 ? '' : row.company.company_name,
                purchase_branch             : row.purchase_branch,
                purchase_branch_code        : row.purchase_branch <= 0 ? '' : row.branch.branch_code,
                purchase_branch_name        : row.purchase_branch <= 0 ? '' : row.branch.branch_name,
                purchase_warehouse          : row.purchase_warehouse,
                purchase_warehouse_code     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_warehouse_name     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_supplier           : row.purchase_supplier,
                purchase_supplier_name      : row.purchase_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_date               : row.purchase_date,
                purchase_invoice            : row.purchase_invoice,
                purchase_product_amount     : row.purchase_product_amount,
                purchase_discount_percent   : row.purchase_discount_percent,
                purchase_discount_amount    : row.purchase_discount_amount,
                purchase_tax_percent        : row.purchase_tax_percent,
                purchase_tax_amount         : row.purchase_tax_amount,
                purchase_vat_percent        : row.purchase_vat_percent,
                purchase_vat_amount         : row.purchase_vat_amount,
                purchase_tax_vat_percent    : row.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : row.purchase_tax_vat_amount,
                purchase_total_amount       : row.purchase_total_amount,
                purchase_adjustment_amount  : row.purchase_adjustment_amount,
                purchase_payable_amount     : row.purchase_payable_amount,
                purchase_paid_amount        : row.purchase_paid_amount,
                purchase_due_amount         : row.purchase_due_amount,
                purchase_reference_number   : row.purchase_reference_number,
                purchase_payment_type       : row.purchase_payment_type,
                purchase_payment_method     : row.purchase_payment_method,
                purchase_payment_status     : row.purchase_payment_status,
                purchase_status             : row.purchase_status,
            })));

            return res.send({
                status: "1",
                message: "Purchase Find Successfully!",
                data: purchase_data
            });
        }

        return res.send({
            status: "0",
            message: "Purchase Not Found !",
            data: [],
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Purchase List Active
exports.purchase_list_active = async (req, res) => {
    try {
        const purchase = await purchase_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    purchase_branch: req.query.branch
                }),
                purchase_status: 1,
                purchase_delete_status: 0
            },
            order: [
                ['purchase_date', 'DESC']
            ]
        });

        if(purchase.length > 0) {
            const purchase_data = await Promise.all(purchase.map(async (row) => ({
                purchase_id                 : row.purchase_id,
                purchase_company            : row.purchase_company,
                purchase_company_name       : row.purchase_company <= 0 ? '' : row.company.company_name,
                purchase_branch             : row.purchase_branch,
                purchase_branch_code        : row.purchase_branch <= 0 ? '' : row.branch.branch_code,
                purchase_branch_name        : row.purchase_branch <= 0 ? '' : row.branch.branch_name,
                purchase_warehouse          : row.purchase_warehouse,
                purchase_warehouse_code     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_warehouse_name     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_supplier           : row.purchase_supplier,
                purchase_supplier_name      : row.purchase_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_date               : row.purchase_date,
                purchase_invoice            : row.purchase_invoice,
                purchase_product_amount     : row.purchase_product_amount,
                purchase_discount_percent   : row.purchase_discount_percent,
                purchase_discount_amount    : row.purchase_discount_amount,
                purchase_tax_percent        : row.purchase_tax_percent,
                purchase_tax_amount         : row.purchase_tax_amount,
                purchase_vat_percent        : row.purchase_vat_percent,
                purchase_vat_amount         : row.purchase_vat_amount,
                purchase_tax_vat_percent    : row.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : row.purchase_tax_vat_amount,
                purchase_total_amount       : row.purchase_total_amount,
                purchase_adjustment_amount  : row.purchase_adjustment_amount,
                purchase_payable_amount     : row.purchase_payable_amount,
                purchase_paid_amount        : row.purchase_paid_amount,
                purchase_due_amount         : row.purchase_due_amount,
                purchase_reference_number   : row.purchase_reference_number,
                purchase_payment_type       : row.purchase_payment_type,
                purchase_payment_method     : row.purchase_payment_method,
                purchase_payment_status     : row.purchase_payment_status,
                purchase_status             : row.purchase_status,
            })));

            return res.send({
                status: "1",
                message: "Purchase Find Successfully!",
                data: purchase_data
            });
        }
        return res.send({
            status: "0",
            message: "Purchase Not Found !",
            data: [],
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Purchase Search
exports.purchase_search = async (req, res) => {
    try {
        const purchase = await purchase_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    purchase_branch: req.query.branch
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        purchase_invoice: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        purchase_payable_amount:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{}),
                purchase_status: 1,
                purchase_delete_status: 0
            },
            limit: 10,
            order: [
                ['purchase_date', 'DESC']
            ],
        });

        if(purchase.length > 0) {
            const purchase_data = await Promise.all(purchase.map(async (row) => ({
                purchase_id                 : row.purchase_id,
                purchase_company            : row.purchase_company,
                purchase_company_name       : row.purchase_company <= 0 ? '' : row.company.company_name,
                purchase_branch             : row.purchase_branch,
                purchase_branch_code        : row.purchase_branch <= 0 ? '' : row.branch.branch_code,
                purchase_branch_name        : row.purchase_branch <= 0 ? '' : row.branch.branch_name,
                purchase_warehouse          : row.purchase_warehouse,
                purchase_warehouse_code     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_warehouse_name     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_supplier           : row.purchase_supplier,
                purchase_supplier_name      : row.purchase_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_date               : row.purchase_date,
                purchase_invoice            : row.purchase_invoice,
                purchase_product_amount     : row.purchase_product_amount,
                purchase_discount_percent   : row.purchase_discount_percent,
                purchase_discount_amount    : row.purchase_discount_amount,
                purchase_tax_percent        : row.purchase_tax_percent,
                purchase_tax_amount         : row.purchase_tax_amount,
                purchase_vat_percent        : row.purchase_vat_percent,
                purchase_vat_amount         : row.purchase_vat_amount,
                purchase_tax_vat_percent    : row.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : row.purchase_tax_vat_amount,
                purchase_total_amount       : row.purchase_total_amount,
                purchase_adjustment_amount  : row.purchase_adjustment_amount,
                purchase_payable_amount     : row.purchase_payable_amount,
                purchase_paid_amount        : row.purchase_paid_amount,
                purchase_due_amount         : row.purchase_due_amount,
                purchase_reference_number   : row.purchase_reference_number,
                purchase_payment_type       : row.purchase_payment_type,
                purchase_payment_method     : row.purchase_payment_method,
                purchase_payment_status     : row.purchase_payment_status,
                purchase_status             : row.purchase_status,
            })));

            return res.send({
                status: "1",
                message: "Purchase Find Successfully!",
                data: purchase_data
            });
        }
        return res.send({
            status: "0",
            message: "Purchase Not Found !",
            data: [],
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Get Purchase
exports.get_purchase = async (req, res) => {
    try {
        const data = await purchase_model.findOne({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name', 'supplier_contact_person', 'supplier_phone_number'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_id: req.params.purchase_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Purchase Not Found !",
                data: "",
            });

        }

        const getPurchaseDetails = async(purchase_id) => {
            const details_data = await purchase_details_model.findAll({
                include : [
                    {
                        model: product_model,
                        attributes: ['product_code', 'product_name'],
                        association: purchase_details_model.hasOne(product_model, {
                            foreignKey : 'product_id',
                            sourceKey : "purchase_details_product",
                            required:false
                        }),
                    },
                    {
                        model: product_unit_model,
                        attributes: ['product_unit_code', 'product_unit_name'],
                        association: purchase_details_model.hasOne(product_unit_model, {
                            foreignKey : 'product_unit_id',
                            sourceKey : "purchase_details_product_unit",
                            required:false
                        }),
                    },
                ],
                where: {
                    purchase_details_purchase       : purchase_id,
                    purchase_details_status         : 1,
                    purchase_details_delete_status  : 0
                },
                order: [
                    ['purchase_details_id', 'ASC']
                ]
            });
            const purchase_details_data = await Promise.all(details_data.map(async (row) => ({
                purchase_details_id                         : row.purchase_details_id,
                purchase_details_purchase                   : row.purchase_details_purchase,
                purchase_details_product                    : row.purchase_details_product,
                purchase_details_product_code               : row.product <= 0 ? '' : row.product.product_code,
                purchase_details_product_name               : row.product <= 0 ? '' : row.product.product_name,
                purchase_details_product_unit               : row.purchase_details_product_unit,
                purchase_details_product_unit_code          : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                purchase_details_product_unit_name          : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                purchase_details_previous_purchase_price    : row.purchase_details_previous_purchase_price,
                purchase_details_previous_stock             : row.purchase_details_previous_stock,
                purchase_details_current_stock              : row.purchase_details_current_stock,
                purchase_details_unit_price                 : row.purchase_details_unit_price,
                purchase_details_purchase_quantity          : row.purchase_details_purchase_quantity,
                purchase_details_return_quantity            : row.purchase_details_return_quantity,
                purchase_details_product_amount             : row.purchase_details_product_amount,
                purchase_details_discount_percent           : row.purchase_details_discount_percent,
                purchase_details_discount_amount            : row.purchase_details_discount_amount,
                purchase_details_tax_percent                : row.purchase_details_tax_percent,
                purchase_details_tax_amount                 : row.purchase_details_tax_amount,
                purchase_details_vat_percent                : row.purchase_details_vat_percent,
                purchase_details_vat_amount                 : row.purchase_details_vat_amount,
                purchase_details_tax_vat_percent            : row.purchase_details_tax_vat_percent,
                purchase_details_tax_vat_amount             : row.purchase_details_tax_vat_amount,
                purchase_details_purchase_price             : row.purchase_details_purchase_price,
                purchase_details_purchase_price_different   : row.purchase_details_purchase_price_different,
                purchase_details_purchase_amount            : row.purchase_details_purchase_amount
            })));

            return purchase_details_data || [];
        }

        return res.send({
            status: "1",
            message: "Purchase Find Successfully!",
            data: {
                purchase_id                 : data.purchase_id,
                purchase_company            : data.purchase_company,
                purchase_company_name       : data.purchase_company <= 0 ? '' : data.company.company_name,
                purchase_branch             : data.purchase_branch,
                purchase_branch_code        : data.purchase_branch <= 0 ? '' : data.branch.branch_code,
                purchase_branch_name        : data.purchase_branch <= 0 ? '' : data.branch.branch_name,
                purchase_warehouse          : data.purchase_warehouse,
                purchase_warehouse_code     : data.purchase_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                purchase_warehouse_name     : data.purchase_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                purchase_supplier           : data.purchase_supplier,
                purchase_supplier_name      : data.purchase_supplier <= 0 ? '' : data.supplier.supplier_name,
                purchase_supplier_contact_person : data.purchase_supplier <= 0 ? '' : data.supplier.supplier_contact_person,
                purchase_supplier_phone     : data.purchase_supplier <= 0 ? '' : data.supplier.supplier_phone_number,
                purchase_date               : data.purchase_date,
                purchase_invoice            : data.purchase_invoice,
                purchase_product_amount     : data.purchase_product_amount,
                purchase_discount_percent   : data.purchase_discount_percent,
                purchase_discount_amount    : data.purchase_discount_amount,
                purchase_tax_percent        : data.purchase_tax_percent,
                purchase_tax_amount         : data.purchase_tax_amount,
                purchase_vat_percent        : data.purchase_vat_percent,
                purchase_vat_amount         : data.purchase_vat_amount,
                purchase_tax_vat_percent    : data.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : data.purchase_tax_vat_amount,
                purchase_total_amount       : data.purchase_total_amount,
                purchase_adjustment_amount  : data.purchase_adjustment_amount,
                purchase_payable_amount     : data.purchase_payable_amount,
                purchase_paid_amount        : data.purchase_paid_amount,
                purchase_due_amount         : data.purchase_due_amount,
                purchase_reference_number   : data.purchase_reference_number,
                purchase_payment_type       : data.purchase_payment_type,
                purchase_payment_method     : data.purchase_payment_method,
                purchase_payment_status     : data.purchase_payment_status,
                purchase_status             : data.purchase_status,
                purchase_details            : await getPurchaseDetails(data.purchase_id)
            }
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data:"",
        });
    }
};

// Get Purchase Invoice
exports.get_purchase_invoice = async (req, res) => {
    try {
        const data = await purchase_model.findOne({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_company: req.query.company,
                purchase_branch: req.query.branch,
                purchase_invoice: req.query.invoice
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Purchase Not Found !",
                data: "",
            });

        }

        const getPurchaseDetails = async(purchase_id) => {
            const details_data = await purchase_details_model.findAll({
                include : [
                    {
                        model: product_model,
                        attributes: ['product_code', 'product_name'],
                        association: purchase_details_model.hasOne(product_model, {
                            foreignKey : 'product_id',
                            sourceKey : "purchase_details_product",
                            required:false
                        }),
                    },
                    {
                        model: product_unit_model,
                        attributes: ['product_unit_code', 'product_unit_name'],
                        association: purchase_details_model.hasOne(product_unit_model, {
                            foreignKey : 'product_unit_id',
                            sourceKey : "purchase_details_product_unit",
                            required:false
                        }),
                    },
                ],
                where: {
                    purchase_details_purchase       : purchase_id,
                    purchase_details_status         : 1,
                    purchase_details_delete_status  : 0
                },
                order: [
                    ['purchase_details_id', 'ASC']
                ]
            });
            const purchase_details_data = await Promise.all(details_data.map(async (row) => ({
                purchase_details_id                         : row.purchase_details_id,
                purchase_details_purchase                   : row.purchase_details_purchase,
                purchase_details_product                    : row.purchase_details_product,
                purchase_details_product_code               : row.product <= 0 ? '' : row.product.product_code,
                purchase_details_product_name               : row.product <= 0 ? '' : row.product.product_name,
                purchase_details_product_unit               : row.purchase_details_product_unit,
                purchase_details_product_unit_code          : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                purchase_details_product_unit_name          : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                purchase_details_previous_purchase_price    : row.purchase_details_previous_purchase_price,
                purchase_details_previous_stock             : row.purchase_details_previous_stock,
                purchase_details_current_stock              : row.purchase_details_current_stock,
                purchase_details_unit_price                 : row.purchase_details_unit_price,
                purchase_details_purchase_quantity          : row.purchase_details_purchase_quantity,
                purchase_details_return_quantity            : row.purchase_details_return_quantity,
                purchase_details_product_amount             : row.purchase_details_product_amount,
                purchase_details_discount_percent           : row.purchase_details_discount_percent,
                purchase_details_discount_amount            : row.purchase_details_discount_amount,
                purchase_details_tax_percent                : row.purchase_details_tax_percent,
                purchase_details_tax_amount                 : row.purchase_details_tax_amount,
                purchase_details_vat_percent                : row.purchase_details_vat_percent,
                purchase_details_vat_amount                 : row.purchase_details_vat_amount,
                purchase_details_tax_vat_percent            : row.purchase_details_tax_vat_percent,
                purchase_details_tax_vat_amount             : row.purchase_details_tax_vat_amount,
                purchase_details_purchase_price             : row.purchase_details_purchase_price,
                purchase_details_purchase_price_different   : row.purchase_details_purchase_price_different,
                purchase_details_purchase_amount            : row.purchase_details_purchase_amount
            })));

            return purchase_details_data || [];
        }

        return res.send({
            status: "1",
            message: "Purchase Find Successfully!",
            data: {
                purchase_id                 : data.purchase_id,
                purchase_company            : data.purchase_company,
                purchase_company_name       : data.purchase_company <= 0 ? '' : data.company.company_name,
                purchase_branch             : data.purchase_branch,
                purchase_branch_code        : data.purchase_branch <= 0 ? '' : data.branch.branch_code,
                purchase_branch_name        : data.purchase_branch <= 0 ? '' : data.branch.branch_name,
                purchase_warehouse          : data.purchase_warehouse,
                purchase_warehouse_code     : data.purchase_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                purchase_warehouse_name     : data.purchase_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                purchase_supplier           : data.purchase_supplier,
                purchase_supplier_name      : data.purchase_supplier <= 0 ? '' : data.supplier.supplier_name,
                purchase_date               : data.purchase_date,
                purchase_invoice            : data.purchase_invoice,
                purchase_product_amount     : data.purchase_product_amount,
                purchase_discount_percent   : data.purchase_discount_percent,
                purchase_discount_amount    : data.purchase_discount_amount,
                purchase_tax_percent        : data.purchase_tax_percent,
                purchase_tax_amount         : data.purchase_tax_amount,
                purchase_vat_percent        : data.purchase_vat_percent,
                purchase_vat_amount         : data.purchase_vat_amount,
                purchase_tax_vat_percent    : data.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : data.purchase_tax_vat_amount,
                purchase_total_amount       : data.purchase_total_amount,
                purchase_adjustment_amount  : data.purchase_adjustment_amount,
                purchase_payable_amount     : data.purchase_payable_amount,
                purchase_paid_amount        : data.purchase_paid_amount,
                purchase_due_amount         : data.purchase_due_amount,
                purchase_reference_number   : data.purchase_reference_number,
                purchase_payment_type       : data.purchase_payment_type,
                purchase_payment_method     : data.purchase_payment_method,
                purchase_payment_status     : data.purchase_payment_status,
                purchase_status             : data.purchase_status,
                purchase_details            : await getPurchaseDetails(data.purchase_id)
            }
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data:"",
        });
    }
};

// Purchase Create
exports.purchase_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const purchase_data         = req.body.purchase_data;
        const purchase_details_data = req.body.purchase_details_data;


        const purchase_date = new Date(purchase_data.purchase_date);
        const d_date    = purchase_date.getDate();
        const m_date    = purchase_date.getMonth()+1;
        const year      = purchase_date.getFullYear().toString().substr(-2);

        let day; if (d_date < 10) { day = '0' + d_date;} else {day = d_date}
        let month; if (m_date < 10) { month = '0' + m_date;} else {month = m_date}

        const p_date = day+month+year;

        const purchase_count = await purchase_model.count({where: {purchase_company: purchase_data.purchase_company, purchase_branch: purchase_data.purchase_branch}})+1;
        const p_code = purchase_count.toString().padStart(5, '0');
        const digit_numbers = p_date+""+p_code;
        let checkNumbers = 0;
        for (let i = 0; i < digit_numbers.length; i++) {
            const digit = parseFloat(digit_numbers[i]);
            if (i % 2 === 0) {
                checkNumbers += digit * 3;
            } else {
                checkNumbers += digit;
            }
        }
        const remainderNumbers = checkNumbers % 10;
        const checkDigit = remainderNumbers === 0 ? 0 : 10 - remainderNumbers;

        const purchase_invoice = digit_numbers;

        const getProduct = async(type, data) => {
            const get_product = await product_model.findOne({ where:{ product_id: data } });
            if(type == 'product_code') {
                return get_product.product_code;
            } else  if(type == 'product_name') {
                return get_product.product_name;
            } else  if(type == 'product_unit') {
                return get_product.product_unit;
            } else  if(type == 'previous_purchase_price') {
                return get_product.product_purchase_price;
            } else  if(type == 'previous_sales_price') {
                return get_product.product_sales_price;
            } else  if(type == 'previous_stock') {
                return get_product.product_stock_quantity;
            } else  if(type == 'purchase_quantity') {
                return get_product.product_purchase_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_quantity;
            }
        }

        const getProductStock = async(type, branch, product) => {
            const get_product = await product_stock_model.findOne({ where:{ product_stock_branch:branch, product_stock_product:product } });
            if(type == 'purchase_quantity') {
                return get_product.product_stock_purchase_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_in_stock;
            }
        }

        const purchase = await purchase_model.create({
            purchase_company            : purchase_data.purchase_company,
            purchase_branch             : purchase_data.purchase_branch,
            purchase_warehouse          : purchase_data.purchase_warehouse,
            purchase_supplier           : purchase_data.purchase_supplier,
            purchase_date               : purchase_data.purchase_date,
            purchase_invoice            : purchase_invoice,
            purchase_product_amount     : purchase_data.purchase_product_amount,
            purchase_discount_percent   : purchase_data.purchase_discount_percent,
            purchase_discount_amount    : purchase_data.purchase_discount_amount,
            purchase_tax_percent        : purchase_data.purchase_tax_percent,
            purchase_tax_amount         : purchase_data.purchase_tax_amount,
            purchase_vat_percent        : purchase_data.purchase_vat_percent,
            purchase_vat_amount         : purchase_data.purchase_vat_amount,
            purchase_tax_vat_percent    : parseFloat(purchase_data.purchase_tax_percent)+parseFloat(purchase_data.purchase_vat_percent),
            purchase_tax_vat_amount     : parseFloat(purchase_data.purchase_tax_amount)+parseFloat(purchase_data.purchase_vat_amount),
            purchase_total_amount       : purchase_data.purchase_total_amount,
            purchase_adjustment_amount  : purchase_data.purchase_adjustment_amount,
            purchase_payable_amount     : purchase_data.purchase_payable_amount,
            purchase_paid_amount        : purchase_data.purchase_paid_amount,
            purchase_due_amount         : purchase_data.purchase_due_amount,
            purchase_reference_number   : purchase_data.purchase_reference_number,
            purchase_payment_type       : purchase_data.purchase_payment_type,
            purchase_payment_method     : purchase_data.purchase_payment_method,
            purchase_payment_status     : purchase_data.purchase_payment_status,
            purchase_status             : purchase_data.purchase_status,
            purchase_create_by          : user_id,
        });

        if(purchase) {
            const purchaseDetails = await Promise.all(purchase_details_data.map(async (row) => ({
                purchase_details_company            : purchase_data.purchase_company,
                purchase_details_branch             : purchase_data.purchase_branch,
                purchase_details_warehouse          : purchase_data.purchase_warehouse,
                purchase_details_supplier           : purchase_data.purchase_supplier,
                purchase_details_purchase_date      : row.purchase_details_purchase_date,
                purchase_details_purchase           : purchase.purchase_id,
                purchase_details_purchase_invoice   : purchase.purchase_invoice,
                purchase_details_product            : row.purchase_details_product,
                purchase_details_product_code       : row.purchase_details_product_code,
                purchase_details_product_name       : row.purchase_details_product_name,
                purchase_details_product_unit       : row.purchase_details_product_unit,
                purchase_details_previous_purchase_price : await getProduct('previous_purchase_price', row.purchase_details_product),
                purchase_details_previous_stock     : await getProduct('previous_stock', row.purchase_details_product),
                purchase_details_current_stock      : parseFloat(await getProduct('previous_stock', row.purchase_details_product))+parseFloat(row.purchase_details_purchase_quantity),
                purchase_details_unit_price         : row.purchase_details_unit_price,
                purchase_details_purchase_quantity  : row.purchase_details_purchase_quantity,
                purchase_details_product_amount     : row.purchase_details_product_amount,
                purchase_details_discount_percent   : row.purchase_details_discount_percent,
                purchase_details_discount_amount    : row.purchase_details_discount_amount,
                purchase_details_tax_percent        : row.purchase_details_tax_percent,
                purchase_details_tax_amount         : row.purchase_details_tax_amount,
                purchase_details_vat_percent        : row.purchase_details_vat_percent,
                purchase_details_vat_amount         : row.purchase_details_vat_amount,
                purchase_details_tax_vat_percent    : parseFloat(row.purchase_details_tax_percent)+parseFloat(row.purchase_details_vat_percent),
                purchase_details_tax_vat_amount     : parseFloat(row.purchase_details_tax_amount)+parseFloat(row.purchase_details_vat_amount),
                purchase_details_purchase_price     : row.purchase_details_purchase_price,
                purchase_details_purchase_price_different: parseFloat(await getProduct('previous_purchase_price', row.purchase_details_product))-parseFloat(row.purchase_details_purchase_price),
                purchase_details_purchase_amount    : row.purchase_details_purchase_amount,
                purchase_details_status             : row.purchase_details_status,
                purchase_details_create_by          : user_id,
            })));
            const purchase_details = await purchase_details_model.bulkCreate(purchaseDetails);

            const productDataUpdate = await Promise.all(purchase_details_data.map(async (item) => (
                await product_model.update({
                    product_purchase_price          : item.purchase_details_purchase_price,
                    product_purchase_quantity       : parseFloat(await getProduct('purchase_quantity', item.purchase_details_product))+parseFloat(item.purchase_details_purchase_quantity),
                    product_stock_quantity          : parseFloat(await getProduct('stock_quantity', item.purchase_details_product))+parseFloat(item.purchase_details_purchase_quantity),
                },
                {
                    where:{
                        product_id: item.purchase_details_product
                    }
                }),
                await product_stock_model.findOne({
                    where:{
                        product_stock_product       : item.purchase_details_product,
                        product_stock_company       : purchase_data.purchase_company,
                        product_stock_branch        : purchase_data.purchase_branch,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                })?
                await product_stock_model.update({
                    product_stock_purchase_quantity: parseFloat(await getProductStock('purchase_quantity', purchase_data.purchase_branch, item.purchase_details_product))+parseFloat(item.purchase_details_purchase_quantity),
                    product_stock_in_stock: parseFloat(await getProductStock('stock_quantity', purchase_data.purchase_branch, item.purchase_details_product))+parseFloat(item.purchase_details_purchase_quantity)
                },
                {
                    where:{
                        product_stock_product       : item.purchase_details_product,
                        product_stock_company       : purchase_data.purchase_company,
                        product_stock_branch        : purchase_data.purchase_branch,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                }) :
                await product_stock_model.create({
                    product_stock_product           : item.purchase_details_product,
                    product_stock_company           : purchase_data.purchase_company,
                    product_stock_branch            : purchase_data.purchase_branch,
                    product_stock_purchase_quantity : parseFloat(item.purchase_details_purchase_quantity),
                    product_stock_in_stock          : parseFloat(item.purchase_details_purchase_quantity),
                    product_stock_status            : 1,
                    product_stock_delete_status     : 0,
                    product_stock_create_by         : user_id
                })
            )));

            const supplier_data = await supplier_model.findOne({
                where:{
                    supplier_id: purchase_data.purchase_supplier
                }
            });

            const supplierUpdate = await supplier_model.update({
                supplier_purchase: parseFloat(supplier_data.supplier_purchase)+parseFloat(purchase_data.purchase_payable_amount),
                supplier_paid: parseFloat(supplier_data.supplier_paid)+parseFloat(purchase_data.purchase_paid_amount),
                supplier_due: parseFloat(supplier_data.supplier_due)+parseFloat(purchase_data.purchase_due_amount),
            },
            {
                where: {
                    supplier_id:supplier_data.supplier_id
                }
            });

            // Supplier Payment
            if(purchase_data.purchase_paid_amount > 0) {
                const supplier_payment = await supplier_payment_model.create({
                    supplier_payment_date               : purchase_data.purchase_date,
                    supplier_payment_company            : purchase_data.purchase_company,
                    supplier_payment_branch             : purchase_data.purchase_branch,
                    supplier_payment_purchase           : purchase.purchase_id,
                    supplier_payment_purchase_invoice   : purchase.purchase_invoice,
                    supplier_payment_supplier           : purchase_data.purchase_supplier,
                    supplier_payment_payable            : purchase_data.purchase_payable_amount,
                    supplier_payment_paid               : purchase_data.purchase_paid_amount,
                    supplier_payment_due                : purchase_data.purchase_due_amount,
                    supplier_payment_purchase_reference_number   : purchase_data.purchase_reference_number,
                    supplier_payment_purchase_payment_type       : purchase_data.purchase_payment_type,
                    supplier_payment_purchase_payment_method     : purchase_data.purchase_payment_method,
                    supplier_payment_status             : 1,
                    supplier_payment_create_by          : user_id
                });
            };

            const data = await purchase_model.findOne({
                include : [
                    {
                        model: company_model,
                        attributes: ['company_name'],
                        association: purchase_model.hasOne(company_model, {
                            foreignKey : 'company_id',
                            sourceKey : "purchase_company",
                            required:false
                        }),
                    },
                    {
                        model: branch_model,
                        attributes: ['branch_code', 'branch_name'],
                        association: purchase_model.hasOne(branch_model, {
                            foreignKey : 'branch_id',
                            sourceKey : "purchase_branch",
                            required:false
                        }),
                    },
                    {
                        model: warehouse_model,
                        attributes: ['warehouse_code', 'warehouse_name'],
                        association: purchase_model.hasOne(warehouse_model, {
                            foreignKey : 'warehouse_id',
                            sourceKey : "purchase_warehouse",
                            required:false
                        }),
                    },
                    {
                        model: supplier_model,
                        attributes: ['supplier_name'],
                        association: purchase_model.hasOne(supplier_model, {
                            foreignKey : 'supplier_id',
                            sourceKey : "purchase_supplier",
                            required:false
                        }),
                    }
                ],
                where: {
                    purchase_id: purchase.purchase_id
                },
            });

            const getPurchaseDetails = async(purchase_id) => {
                const details_data = await purchase_details_model.findAll({
                    include : [
                        {
                            model: product_model,
                            attributes: ['product_code', 'product_name'],
                            association: purchase_details_model.hasOne(product_model, {
                                foreignKey : 'product_id',
                                sourceKey : "purchase_details_product",
                                required:false
                            }),
                        },
                        {
                            model: product_unit_model,
                            attributes: ['product_unit_code', 'product_unit_name'],
                            association: purchase_details_model.hasOne(product_unit_model, {
                                foreignKey : 'product_unit_id',
                                sourceKey : "purchase_details_product_unit",
                                required:false
                            }),
                        },
                    ],
                    where: {
                        purchase_details_purchase       : purchase_id,
                        purchase_details_status         : 1,
                        purchase_details_delete_status  : 0
                    },
                    order: [
                        ['purchase_details_id', 'ASC']
                    ]
                });
                const purchase_details_data = await Promise.all(details_data.map(async (row) => ({
                    purchase_details_id                         : row.purchase_details_id,
                    purchase_details_purchase                   : row.purchase_details_purchase,
                    purchase_details_product                    : row.purchase_details_product,
                    purchase_details_product_code               : row.product <= 0 ? '' : row.product.product_code,
                    purchase_details_product_name               : row.product <= 0 ? '' : row.product.product_name,
                    purchase_details_product_unit               : row.purchase_details_product_unit,
                    purchase_details_product_unit_code          : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                    purchase_details_product_unit_name          : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                    purchase_details_previous_purchase_price    : row.purchase_details_previous_purchase_price,
                    purchase_details_previous_stock             : row.purchase_details_previous_stock,
                    purchase_details_current_stock              : row.purchase_details_current_stock,
                    purchase_details_unit_price                 : row.purchase_details_unit_price,
                    purchase_details_purchase_quantity          : row.purchase_details_purchase_quantity,
                    purchase_details_product_amount             : row.purchase_details_product_amount,
                    purchase_details_discount_percent           : row.purchase_details_discount_percent,
                    purchase_details_discount_amount            : row.purchase_details_discount_amount,
                    purchase_details_tax_percent                : row.purchase_details_tax_percent,
                    purchase_details_tax_amount                 : row.purchase_details_tax_amount,
                    purchase_details_vat_percent                : row.purchase_details_vat_percent,
                    purchase_details_vat_amount                 : row.purchase_details_vat_amount,
                    purchase_details_tax_vat_percent            : row.purchase_details_tax_vat_percent,
                    purchase_details_tax_vat_amount             : row.purchase_details_tax_vat_amount,
                    purchase_details_purchase_price             : row.purchase_details_purchase_price,
                    purchase_details_purchase_price_different   : row.purchase_details_purchase_price_different,
                    purchase_details_purchase_amount            : row.purchase_details_purchase_amount,
                })));

                return purchase_details_data || [];
            }

            return res.send({
                status: "1",
                message: "Purchase Create Successfully!",
                data: {
                    purchase_id                 : data.purchase_id,
                    purchase_company            : data.purchase_company,
                    purchase_company_name       : data.purchase_company <= 0 ? '' : data.company.company_name,
                    purchase_branch             : data.purchase_branch,
                    purchase_branch_code        : data.purchase_branch <= 0 ? '' : data.branch.branch_code,
                    purchase_branch_name        : data.purchase_branch <= 0 ? '' : data.branch.branch_name,
                    purchase_warehouse          : data.purchase_warehouse,
                    purchase_warehouse_code     : data.purchase_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                    purchase_warehouse_name     : data.purchase_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                    purchase_supplier           : data.purchase_supplier,
                    purchase_supplier_name      : data.purchase_supplier <= 0 ? '' : data.supplier.supplier_name,
                    purchase_date               : data.purchase_date,
                    purchase_invoice            : data.purchase_invoice,
                    purchase_product_amount     : data.purchase_product_amount,
                    purchase_discount_percent   : data.purchase_discount_percent,
                    purchase_discount_amount    : data.purchase_discount_amount,
                    purchase_tax_percent        : data.purchase_tax_percent,
                    purchase_tax_amount         : data.purchase_tax_amount,
                    purchase_vat_percent        : data.purchase_vat_percent,
                    purchase_vat_amount         : data.purchase_vat_amount,
                    purchase_tax_vat_percent    : data.purchase_tax_vat_percent,
                    purchase_tax_vat_amount     : data.purchase_tax_vat_amount,
                    purchase_total_amount       : data.purchase_total_amount,
                    purchase_adjustment_amount  : data.purchase_adjustment_amount,
                    purchase_payable_amount     : data.purchase_payable_amount,
                    purchase_paid_amount        : data.purchase_paid_amount,
                    purchase_due_amount         : data.purchase_due_amount,
                    purchase_reference_number   : data.purchase_reference_number,
                    purchase_payment_type       : data.purchase_payment_type,
                    purchase_payment_method     : data.purchase_payment_method,
                    purchase_payment_status     : data.purchase_payment_status,
                    purchase_status             : data.purchase_status,
                    purchase_details            : await getPurchaseDetails(data.purchase_id)
                }
            });
        }

        return res.send({
            status: "0",
            message: "Purchase Create Error !",
            data: "",
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Purchase Update
exports.purchase_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const purchase = await purchase_model.findOne({
            where:{
                purchase_id: req.params.purchase_id
            }
        });

        if(!purchase) {
            return res.send({
                status: "0",
                message: "Purchase ID Not Found!",
                data: "",
            });
        }

        const purchase_data         = req.body.purchase_data;
        const purchase_details_data = req.body.purchase_details_data;

        const getProduct = async(type, data) => {
            const get_product = await product_model.findOne({ where:{ product_id: data } });
            if(type == 'product_code') {
                return get_product.product_code;
            } else  if(type == 'product_name') {
                return get_product.product_name;
            } else  if(type == 'product_unit') {
                return get_product.product_unit;
            } else  if(type == 'previous_purchase_price') {
                return get_product.product_purchase_price;
            } else  if(type == 'previous_sales_price') {
                return get_product.product_sales_price;
            } else  if(type == 'previous_stock') {
                return get_product.product_stock_quantity;
            } else  if(type == 'purchase_quantity') {
                return get_product.product_purchase_quantity;
            } else  if(type == 'return_quantity') {
                return get_product.product_return_quantity;
            } else  if(type == 'sales_quantity') {
                return get_product.product_sales_quantity;
            } else  if(type == 'sales_return_quantity') {
                return get_product.product_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_quantity;
            }
        }

        const getProductStock = async(type, company, branch, product) => {
            const get_product = await product_stock_model.findOne({ where:{ product_stock_company:company, product_stock_branch:branch, product_stock_product:product } });
            if(type == 'purchase_quantity') {
                return get_product.product_stock_purchase_quantity;
            } else  if(type == 'return_quantity') {
                return get_product.product_stock_return_quantity;
            } else  if(type == 'sales_quantity') {
                return get_product.product_stock_sales_quantity;
            } else  if(type == 'sales_return_quantity') {
                return get_product.product_stock_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_in_stock;
            }
        }
        const purchase_update = await purchase_model.update({
            purchase_company            : purchase_data.purchase_company,
            purchase_branch             : purchase_data.purchase_branch,
            purchase_warehouse          : purchase_data.purchase_warehouse,
            purchase_supplier           : purchase_data.purchase_supplier,
            purchase_date               : purchase_data.purchase_date,
            purchase_product_amount     : purchase_data.purchase_product_amount,
            purchase_discount_percent   : purchase_data.purchase_discount_percent,
            purchase_discount_amount    : purchase_data.purchase_discount_amount,
            purchase_tax_percent        : purchase_data.purchase_tax_percent,
            purchase_tax_amount         : purchase_data.purchase_tax_amount,
            purchase_vat_percent        : purchase_data.purchase_vat_percent,
            purchase_vat_amount         : purchase_data.purchase_vat_amount,
            purchase_tax_vat_percent    : parseFloat(purchase_data.purchase_tax_percent)+parseFloat(purchase_data.purchase_vat_percent),
            purchase_tax_vat_amount     : parseFloat(purchase_data.purchase_tax_amount)+parseFloat(purchase_data.purchase_vat_amount),
            purchase_total_amount       : purchase_data.purchase_total_amount,
            purchase_adjustment_amount  : purchase_data.purchase_adjustment_amount,
            purchase_payable_amount     : purchase_data.purchase_payable_amount,
            purchase_paid_amount        : purchase_data.purchase_paid_amount,
            purchase_due_amount         : purchase_data.purchase_due_amount,
            purchase_reference_number   : purchase_data.purchase_reference_number,
            purchase_payment_type       : purchase_data.purchase_payment_type,
            purchase_payment_method     : purchase_data.purchase_payment_method,
            purchase_payment_status     : purchase_data.purchase_payment_status,
            purchase_status             : purchase_data.purchase_status,
            purchase_update_by          : user_id,
        },
        {
            where:{
                purchase_id: req.params.purchase_id
            }
        });
        if(purchase_update) {
            const purchase_details_delete = await purchase_details_model.destroy({
                where: {
                    purchase_details_purchase: req.params.purchase_id
                }
            });

            const purchaseDetails = await Promise.all(purchase_details_data.map(async (row) => ({
                purchase_details_company            : purchase_data.purchase_company,
                purchase_details_branch             : purchase_data.purchase_branch,
                purchase_details_warehouse          : purchase_data.purchase_warehouse,
                purchase_details_supplier           : purchase_data.purchase_supplier,
                purchase_details_purchase_date      : row.purchase_details_purchase_date,
                purchase_details_purchase           : purchase.purchase_id,
                purchase_details_purchase_invoice   : purchase.purchase_invoice,
                purchase_details_product            : row.purchase_details_product,
                purchase_details_product_code       : row.purchase_details_product_code,
                purchase_details_product_name       : row.purchase_details_product_name,
                purchase_details_product_unit       : row.purchase_details_product_unit,
                purchase_details_previous_purchase_price : await getProduct('previous_purchase_price', row.purchase_details_product),
                purchase_details_previous_stock     : await getProduct('previous_stock', row.purchase_details_product),
                purchase_details_current_stock      : parseFloat(await getProduct('previous_stock', row.purchase_details_product))+parseFloat(row.purchase_details_purchase_quantity),
                purchase_details_unit_price         : row.purchase_details_unit_price,
                purchase_details_purchase_quantity  : row.purchase_details_purchase_quantity,
                purchase_details_product_amount     : row.purchase_details_product_amount,
                purchase_details_discount_percent   : row.purchase_details_discount_percent,
                purchase_details_discount_amount    : row.purchase_details_discount_amount,
                purchase_details_tax_percent        : row.purchase_details_tax_percent,
                purchase_details_tax_amount         : row.purchase_details_tax_amount,
                purchase_details_vat_percent        : row.purchase_details_vat_percent,
                purchase_details_vat_amount         : row.purchase_details_vat_amount,
                purchase_details_tax_vat_percent    : parseFloat(row.purchase_details_tax_percent)+parseFloat(row.purchase_details_vat_percent),
                purchase_details_tax_vat_amount     : parseFloat(row.purchase_details_tax_amount)+parseFloat(row.purchase_details_vat_amount),
                purchase_details_purchase_price     : row.purchase_details_purchase_price,
                purchase_details_purchase_price_different: parseFloat(await getProduct('previous_purchase_price', row.purchase_details_product))-parseFloat(row.purchase_details_purchase_price),
                purchase_details_purchase_amount    : row.purchase_details_purchase_amount,
                purchase_details_status             : row.purchase_details_status,
                purchase_details_create_by          : user_id,
            })));
            const purchase_details = await purchase_details_model.bulkCreate(purchaseDetails);

            const productDataUpdate = await Promise.all(purchase_details_data.map(async (item) => (
                await product_model.update({
                    product_purchase_price          : item.purchase_details_purchase_price,
                    product_purchase_quantity       : (parseFloat(await getProduct('purchase_quantity', item.purchase_details_product))-parseFloat(item.purchase_details_previous_quantity))+parseFloat(item.purchase_details_purchase_quantity),
                    product_stock_quantity          : (
                        ((parseFloat(await getProduct('purchase_quantity', item.purchase_details_product))-parseFloat(item.purchase_details_previous_quantity))+parseFloat(item.purchase_details_purchase_quantity))
                        -(
                            (
                                parseFloat(await getProduct('return_quantity', item.purchase_details_product))
                                +parseFloat(await getProduct('sales_quantity', item.purchase_details_product))
                            )
                            -parseFloat(await getProduct('sales_return_quantity', item.purchase_details_product))
                        )
                    ),
                },
                {
                    where:{
                        product_id: item.purchase_details_product
                    }
                }),
                
                await product_stock_model.update({
                    product_stock_purchase_quantity : (parseFloat(await getProductStock('purchase_quantity', purchase_data.purchase_company, purchase_data.purchase_branch, item.purchase_details_product))-parseFloat(item.purchase_details_previous_quantity))+parseFloat(item.purchase_details_purchase_quantity),
                    product_stock_in_stock          : (
                        ((parseFloat(await getProductStock('purchase_quantity', purchase_data.purchase_company, purchase_data.purchase_branch, item.purchase_details_product))-parseFloat(item.purchase_details_previous_quantity))+parseFloat(item.purchase_details_purchase_quantity))
                        -(
                            (
                                parseFloat(await getProductStock('return_quantity', purchase_data.purchase_company, purchase_data.purchase_branch, item.purchase_details_product))
                                +parseFloat(await getProductStock('sales_quantity', purchase_data.purchase_company, purchase_data.purchase_branch, item.purchase_details_product))
                            )
                            -parseFloat(await getProductStock('sales_return_quantity', purchase_data.purchase_company, purchase_data.purchase_branch, item.purchase_details_product))
                        )
                    )
                },
                {
                    where:{
                        product_stock_product       : item.purchase_details_product,
                        product_stock_company       : purchase_data.purchase_company,
                        product_stock_branch        : purchase_data.purchase_branch,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                })
            )));

            const supplier_data = await supplier_model.findOne({
                where:{
                    supplier_id: purchase_data.purchase_supplier
                }
            });

            const supplierUpdate = await supplier_model.update({
                supplier_purchase: (parseFloat(supplier_data.supplier_purchase)-parseFloat(purchase_data.purchase_previous_payable_amount))+parseFloat(purchase_data.purchase_payable_amount),
                supplier_paid: (parseFloat(supplier_data.supplier_paid)-parseFloat(purchase_data.purchase_previous_paid_amount))+parseFloat(purchase_data.purchase_paid_amount),
                supplier_due: (parseFloat(supplier_data.supplier_due)-parseFloat(purchase_data.purchase_previous_due_amount))+parseFloat(purchase_data.purchase_due_amount),
            },
            {
                where: {
                    supplier_id:supplier_data.supplier_id
                }
            });

            const supplier_payment_delete = await supplier_payment_model.destroy({
                where: {
                    supplier_payment_purchase: req.params.purchase_id
                }
            });

            // Supplier Payment
            if(purchase_data.purchase_paid_amount > 0) {
                const supplier_payment = await supplier_payment_model.create({
                    supplier_payment_date               : purchase_data.purchase_date,
                    supplier_payment_company            : purchase_data.purchase_company,
                    supplier_payment_branch             : purchase_data.purchase_branch,
                    supplier_payment_purchase           : purchase.purchase_id,
                    supplier_payment_purchase_invoice   : purchase.purchase_invoice,
                    supplier_payment_supplier           : purchase_data.purchase_supplier,
                    supplier_payment_payable            : purchase_data.purchase_payable_amount,
                    supplier_payment_paid               : purchase_data.purchase_paid_amount,
                    supplier_payment_due                : purchase_data.purchase_due_amount,
                    supplier_payment_purchase_reference_number   : purchase_data.purchase_reference_number,
                    supplier_payment_purchase_payment_type       : purchase_data.purchase_payment_type,
                    supplier_payment_purchase_payment_method     : purchase_data.purchase_payment_method,
                    supplier_payment_status             : 1,
                    supplier_payment_create_by          : user_id
                });
            };

            const data = await purchase_model.findOne({
                include : [
                    {
                        model: company_model,
                        attributes: ['company_name'],
                        association: purchase_model.hasOne(company_model, {
                            foreignKey : 'company_id',
                            sourceKey : "purchase_company",
                            required:false
                        }),
                    },
                    {
                        model: branch_model,
                        attributes: ['branch_code', 'branch_name'],
                        association: purchase_model.hasOne(branch_model, {
                            foreignKey : 'branch_id',
                            sourceKey : "purchase_branch",
                            required:false
                        }),
                    },
                    {
                        model: warehouse_model,
                        attributes: ['warehouse_code', 'warehouse_name'],
                        association: purchase_model.hasOne(warehouse_model, {
                            foreignKey : 'warehouse_id',
                            sourceKey : "purchase_warehouse",
                            required:false
                        }),
                    },
                    {
                        model: supplier_model,
                        attributes: ['supplier_name'],
                        association: purchase_model.hasOne(supplier_model, {
                            foreignKey : 'supplier_id',
                            sourceKey : "purchase_supplier",
                            required:false
                        }),
                    }
                ],
                where: {
                    purchase_id: req.params.purchase_id
                },
            });

            const getPurchaseDetails = async(purchase_id) => {
                const details_data = await purchase_details_model.findAll({
                    include : [
                        {
                            model: product_model,
                            attributes: ['product_code', 'product_name'],
                            association: purchase_details_model.hasOne(product_model, {
                                foreignKey : 'product_id',
                                sourceKey : "purchase_details_product",
                                required:false
                            }),
                        },
                        {
                            model: product_unit_model,
                            attributes: ['product_unit_code', 'product_unit_name'],
                            association: purchase_details_model.hasOne(product_unit_model, {
                                foreignKey : 'product_unit_id',
                                sourceKey : "purchase_details_product_unit",
                                required:false
                            }),
                        },
                    ],
                    where: {
                        purchase_details_purchase       : purchase_id,
                        purchase_details_status         : 1,
                        purchase_details_delete_status  : 0
                    },
                    order: [
                        ['purchase_details_id', 'ASC']
                    ]
                });
                const purchase_details_data = await Promise.all(details_data.map(async (row) => ({
                    purchase_details_id                         : row.purchase_details_id,
                    purchase_details_purchase                   : row.purchase_details_purchase,
                    purchase_details_product                    : row.purchase_details_product,
                    purchase_details_product_code               : row.product <= 0 ? '' : row.product.product_code,
                    purchase_details_product_name               : row.product <= 0 ? '' : row.product.product_name,
                    purchase_details_product_unit               : row.purchase_details_product_unit,
                    purchase_details_product_unit_code          : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                    purchase_details_product_unit_name          : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                    purchase_details_previous_purchase_price    : row.purchase_details_previous_purchase_price,
                    purchase_details_previous_stock             : row.purchase_details_previous_stock,
                    purchase_details_current_stock              : row.purchase_details_current_stock,
                    purchase_details_unit_price                 : row.purchase_details_unit_price,
                    purchase_details_purchase_quantity          : row.purchase_details_purchase_quantity,
                    purchase_details_product_amount             : row.purchase_details_product_amount,
                    purchase_details_discount_percent           : row.purchase_details_discount_percent,
                    purchase_details_discount_amount            : row.purchase_details_discount_amount,
                    purchase_details_tax_percent                : row.purchase_details_tax_percent,
                    purchase_details_tax_amount                 : row.purchase_details_tax_amount,
                    purchase_details_vat_percent                : row.purchase_details_vat_percent,
                    purchase_details_vat_amount                 : row.purchase_details_vat_amount,
                    purchase_details_tax_vat_percent            : row.purchase_details_tax_vat_percent,
                    purchase_details_tax_vat_amount             : row.purchase_details_tax_vat_amount,
                    purchase_details_purchase_price             : row.purchase_details_purchase_price,
                    purchase_details_purchase_price_different   : row.purchase_details_purchase_price_different,
                    purchase_details_purchase_amount            : row.purchase_details_purchase_amount,
                })));

                return purchase_details_data || [];
            }

            return res.send({
                status: "1",
                message: "Purchase Update Successfully!",
                data: {
                    purchase_id                 : data.purchase_id,
                    purchase_company            : data.purchase_company,
                    purchase_company_name       : data.purchase_company <= 0 ? '' : data.company.company_name,
                    purchase_branch             : data.purchase_branch,
                    purchase_branch_code        : data.purchase_branch <= 0 ? '' : data.branch.branch_code,
                    purchase_branch_name        : data.purchase_branch <= 0 ? '' : data.branch.branch_name,
                    purchase_warehouse          : data.purchase_warehouse,
                    purchase_warehouse_code     : data.purchase_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                    purchase_warehouse_name     : data.purchase_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                    purchase_supplier           : data.purchase_supplier,
                    purchase_supplier_name      : data.purchase_supplier <= 0 ? '' : data.supplier.supplier_name,
                    purchase_date               : data.purchase_date,
                    purchase_invoice            : data.purchase_invoice,
                    purchase_product_amount     : data.purchase_product_amount,
                    purchase_discount_percent   : data.purchase_discount_percent,
                    purchase_discount_amount    : data.purchase_discount_amount,
                    purchase_tax_percent        : data.purchase_tax_percent,
                    purchase_tax_amount         : data.purchase_tax_amount,
                    purchase_vat_percent        : data.purchase_vat_percent,
                    purchase_vat_amount         : data.purchase_vat_amount,
                    purchase_tax_vat_percent    : data.purchase_tax_vat_percent,
                    purchase_tax_vat_amount     : data.purchase_tax_vat_amount,
                    purchase_total_amount       : data.purchase_total_amount,
                    purchase_adjustment_amount  : data.purchase_adjustment_amount,
                    purchase_payable_amount     : data.purchase_payable_amount,
                    purchase_paid_amount        : data.purchase_paid_amount,
                    purchase_due_amount         : data.purchase_due_amount,
                    purchase_reference_number   : data.purchase_reference_number,
                    purchase_payment_type       : data.purchase_payment_type,
                    purchase_payment_method     : data.purchase_payment_method,
                    purchase_payment_status     : data.purchase_payment_status,
                    purchase_status             : data.purchase_status,
                    purchase_details            : await getPurchaseDetails(data.purchase_id)
                }
            });
        }
        return res.send({
            status: "1",
            message: "Purchase Update Error!",
            data: ""
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Purchase Delete
exports.purchase_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const purchase_data = await purchase_model.findOne({
            where:{
                purchase_id: req.params.purchase_id
            }
        });

        if(!purchase_data) {
            return res.send({
                status: "0",
                message: "Purchase ID Not Found!",
                data: "",
            });
        }

        const purchase = await purchase_model.update({
            purchase_status        : 0,
            purchase_delete_status : 1,
            purchase_delete_by     : user_id,
            purchase_delete_at     : new Date(),
        },
        {
            where:{
                purchase_id: req.params.purchase_id
            }
        });

        return res.send({
            status: "1",
            message: "Purchase Delete Successfully!",
            data: ""
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Purchase Return List
exports.purchase_return_list = async (req, res) => {
    try {
        const purchase = await purchase_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_return_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_return_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_return_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_return_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_return_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_return_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    purchase_return_branch: req.query.branch
                }),
                purchase_return_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                purchase_return_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    purchase_return_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        purchase_return_invoice: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        purchase_return_payable_amount:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['purchase_return_date', 'ASC']
            ]
        });

        if(purchase.length > 0) {
            const purchase_return_data = await Promise.all(purchase.map(async (row) => ({
                purchase_return_id                 : row.purchase_return_id,
                purchase_return_company            : row.purchase_return_company,
                purchase_return_company_name       : row.purchase_return_company <= 0 ? '' : row.company.company_name,
                purchase_return_branch             : row.purchase_return_branch,
                purchase_return_branch_code        : row.purchase_return_branch <= 0 ? '' : row.branch.branch_code,
                purchase_return_branch_name        : row.purchase_return_branch <= 0 ? '' : row.branch.branch_name,
                purchase_return_warehouse          : row.purchase_return_warehouse,
                purchase_return_warehouse_code     : row.purchase_return_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_return_warehouse_name     : row.purchase_return_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_return_supplier           : row.purchase_return_supplier,
                purchase_return_supplier_name      : row.purchase_return_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_return_date               : row.purchase_return_date,
                purchase_return_purchase           : row.purchase_return_purchase,
                purchase_return_purchase_invoice   : row.purchase_return_purchase_invoice,
                purchase_return_total_amount       : row.purchase_return_total_amount,
                purchase_return_adjustment_amount  : row.purchase_return_adjustment_amount,
                purchase_return_payable_amount     : row.purchase_return_payable_amount,
                purchase_return_paid_amount        : row.purchase_return_paid_amount,
                purchase_return_due_amount         : row.purchase_return_due_amount,
                purchase_return_reference_number   : row.purchase_return_reference_number,
                purchase_return_payment_type       : row.purchase_return_payment_type,
                purchase_return_payment_method     : row.purchase_return_payment_method,
                purchase_return_payment_status     : row.purchase_return_payment_status,
                purchase_return_status             : row.purchase_return_status,
            })));

            return res.send({
                status: "1",
                message: "Purchase Return Find Successfully!",
                data: purchase_return_data
            });
        }

        return res.send({
            status: "0",
            message: "Purchase Return Not Found !",
            data: [],
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Get Purchase Return
exports.get_purchase_return = async (req, res) => {
    try {
        const data = await purchase_return_model.findOne({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_return_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_return_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_return_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name', 'supplier_contact_person', 'supplier_phone_number'],
                    association: purchase_return_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_return_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_return_id: req.params.purchase_return_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Purchase Return Not Found !",
                data: "",
            });

        }

        const getPurchaseReturnDetails = async(purchase_return_id) => {
            const details_data = await purchase_return_details_model.findAll({
                include : [
                    {
                        model: product_model,
                        attributes: ['product_code', 'product_name'],
                        association: purchase_return_details_model.hasOne(product_model, {
                            foreignKey : 'product_id',
                            sourceKey : "purchase_return_details_product",
                            required:false
                        }),
                    },
                    {
                        model: product_unit_model,
                        attributes: ['product_unit_code', 'product_unit_name'],
                        association: purchase_return_details_model.hasOne(product_unit_model, {
                            foreignKey : 'product_unit_id',
                            sourceKey : "purchase_return_details_product_unit",
                            required:false
                        }),
                    },
                ],
                where: {
                    purchase_return_details_purchase_return: purchase_return_id,
                    purchase_return_details_status         : 1,
                    purchase_return_details_delete_status  : 0
                },
                order: [
                    ['purchase_return_details_id', 'ASC']
                ]
            });
            const purchase_return_details_data = await Promise.all(details_data.map(async (row) => ({
                purchase_return_details_id                      : row.purchase_return_details_id,
                purchase_return_details_purchase_return         : row.purchase_return_details_purchase_return,
                purchase_return_details_purchase                : row.purchase_return_details_purchase,
                purchase_return_details_product                 : row.purchase_return_details_product,
                purchase_return_details_product_code            : row.product <= 0 ? '' : row.product.product_code,
                purchase_return_details_product_name            : row.product <= 0 ? '' : row.product.product_name,
                purchase_return_details_product_unit            : row.purchase_return_details_product_unit,
                purchase_return_details_product_unit_code       : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                purchase_return_details_product_unit_name       : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,

                purchase_return_details_purchase_price          : row.purchase_return_details_purchase_price,
                purchase_return_details_purchase_quantity       : row.purchase_return_details_purchase_quantity,
                purchase_return_details_purchase_amount         : row.purchase_return_details_purchase_amount,
                purchase_return_details_return_price            : row.purchase_return_details_return_price,
                purchase_return_details_return_quantity         : row.purchase_return_details_return_quantity,
                purchase_return_details_return_amount           : row.purchase_return_details_return_amount
            })));

            return purchase_return_details_data || [];
        }

        return res.send({
            status: "1",
            message: "Purchase Return Find Successfully!",
            data: {
                purchase_return_id                 : data.purchase_return_id,
                purchase_return_company            : data.purchase_return_company,
                purchase_return_company_name       : data.purchase_return_company <= 0 ? '' : data.company.company_name,
                purchase_return_branch             : data.purchase_return_branch,
                purchase_return_branch_code        : data.purchase_return_branch <= 0 ? '' : data.branch.branch_code,
                purchase_return_branch_name        : data.purchase_return_branch <= 0 ? '' : data.branch.branch_name,
                purchase_return_warehouse          : data.purchase_return_warehouse,
                purchase_return_warehouse_code     : data.purchase_return_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                purchase_return_warehouse_name     : data.purchase_return_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                purchase_return_supplier           : data.purchase_return_supplier,
                purchase_return_supplier_name      : data.purchase_return_supplier <= 0 ? '' : data.supplier.supplier_name,
                purchase_return_supplier_contact_person : data.purchase_return_supplier <= 0 ? '' : data.supplier.supplier_contact_person,
                purchase_return_supplier_phone      : data.purchase_return_supplier <= 0 ? '' : data.supplier.supplier_phone_number,
                purchase_return_purchase_date      : data.purchase_return_purchase_date,
                purchase_return_date               : data.purchase_return_date,
                purchase_return_purchase           : data.purchase_return_purchase,
                purchase_return_purchase_invoice   : data.purchase_return_purchase_invoice,
                purchase_return_total_amount       : data.purchase_return_total_amount,
                purchase_return_adjustment_amount  : data.purchase_return_adjustment_amount,
                purchase_return_payable_amount     : data.purchase_return_payable_amount,
                purchase_return_paid_amount        : data.purchase_return_paid_amount,
                purchase_return_due_amount         : data.purchase_return_due_amount,
                purchase_return_reference_number   : data.purchase_return_reference_number || '',
                purchase_return_payment_type       : data.purchase_return_payment_type,
                purchase_return_payment_method     : data.purchase_return_payment_method,
                purchase_return_payment_status     : data.purchase_return_payment_status,
                purchase_return_status             : data.purchase_return_status,
                purchase_return_details            : await getPurchaseReturnDetails(data.purchase_return_id)
            }
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data:"",
        });
    }
};

// Purchase Return Create
exports.purchase_return_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const purchase_return_data          = req.body.purchase_return_data;
        const purchase_return_details_data  = req.body.purchase_return_details_data;

        const getProduct = async(type, data) => {
            const get_product = await product_model.findOne({ where:{ product_id: data } });
            if(type == 'product_code') {
                return get_product.product_code;
            } else  if(type == 'product_name') {
                return get_product.product_name;
            } else  if(type == 'product_unit') {
                return get_product.product_unit;
            } else  if(type == 'previous_purchase_price') {
                return get_product.product_purchase_price;
            } else  if(type == 'previous_sales_price') {
                return get_product.product_sales_price;
            } else  if(type == 'previous_stock') {
                return get_product.product_stock_quantity;
            } else  if(type == 'purchase_quantity') {
                return get_product.product_purchase_quantity;
            } else  if(type == 'return_quantity') {
                return get_product.product_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_quantity;
            }
        }

        const getProductStock = async(type, company, branch, product) => {
            const get_product = await product_stock_model.findOne({ where:{ product_stock_company:company, product_stock_branch:branch, product_stock_product:product } });
            if(type == 'purchase_quantity') {
                return get_product.product_stock_purchase_quantity;
            } else if(type == 'return_quantity') {
                return get_product.product_stock_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_in_stock;
            }
        }

        const getPurchaseDetailsData = async(type, company, branch, purchase, product) => {
            const get_product = await purchase_details_model.findOne({where:{ purchase_details_company : company, purchase_details_branch : branch, purchase_details_purchase : purchase, purchase_details_product : product }});
            if(type == 'purchase_quantity') {
                return get_product.purchase_details_purchase_quantity;
            } else if(type == 'return_quantity') {
                return get_product.purchase_details_return_quantity;
            } else  if(type == 'previous_stock') {
                return get_product.purchase_details_previous_stock;
            } else  if(type == 'current_stock') {
                return get_product.purchase_details_current_stock;
            }
        }

        const purchase_return = await purchase_return_model.create({
            purchase_return_company             : purchase_return_data.purchase_return_company,
            purchase_return_branch              : purchase_return_data.purchase_return_branch,
            purchase_return_supplier            : purchase_return_data.purchase_return_supplier,
            purchase_return_warehouse           : purchase_return_data.purchase_return_warehouse,
            purchase_return_purchase            : purchase_return_data.purchase_return_purchase,
            purchase_return_purchase_invoice    : purchase_return_data.purchase_return_purchase_invoice,
            purchase_return_purchase_date       : purchase_return_data.purchase_return_purchase_date,
            purchase_return_date                : purchase_return_data.purchase_return_date,
            purchase_return_total_amount        : purchase_return_data.purchase_return_total_amount,
            purchase_return_adjustment_amount   : purchase_return_data.purchase_return_adjustment_amount,
            purchase_return_payable_amount      : purchase_return_data.purchase_return_payable_amount,
            purchase_return_paid_amount         : purchase_return_data.purchase_return_paid_amount,
            purchase_return_due_amount          : purchase_return_data.purchase_return_due_amount,
            purchase_return_reference_number    : purchase_return_data.purchase_return_reference_number,
            purchase_return_payment_type        : purchase_return_data.purchase_return_payment_type,
            purchase_return_payment_method      : purchase_return_data.purchase_return_payment_method,
            purchase_return_payment_status      : purchase_return_data.purchase_return_payment_status,
            purchase_return_status              : purchase_return_data.purchase_return_status,
            purchase_return_create_by           : user_id,
        });

        if(purchase_return) {
            const purchaseReturnDetails = await Promise.all(purchase_return_details_data.map(async (row) => ({
                purchase_return_details_company             : purchase_return_data.purchase_return_company,
                purchase_return_details_branch              : purchase_return_data.purchase_return_branch,
                purchase_return_details_supplier            : purchase_return_data.purchase_return_supplier,
                purchase_return_details_warehouse           : purchase_return_data.purchase_return_warehouse,
                purchase_return_details_purchase            : purchase_return_data.purchase_return_purchase,
                purchase_return_details_purchase_invoice    : purchase_return_data.purchase_return_purchase_invoice,
                purchase_return_details_purchase_date       : purchase_return_data.purchase_return_purchase_date,
                purchase_return_details_return_date         : purchase_return_data.purchase_return_date,
                purchase_return_details_purchase_return     : purchase_return.purchase_return_id,
                purchase_return_details_product             : row.purchase_return_details_product,
                purchase_return_details_product_code        : row.purchase_return_details_product_code,
                purchase_return_details_product_name        : row.purchase_return_details_product_name,
                purchase_return_details_product_unit        : row.purchase_return_details_product_unit,
                purchase_return_details_purchase_price      : row.purchase_return_details_purchase_price,
                purchase_return_details_purchase_quantity   : row.purchase_return_details_purchase_quantity,
                purchase_return_details_purchase_amount     : row.purchase_return_details_purchase_amount,
                purchase_return_details_return_price        : row.purchase_return_details_return_price,
                purchase_return_details_return_quantity     : row.purchase_return_details_return_quantity,
                purchase_return_details_return_amount       : row.purchase_return_details_return_amount,
                purchase_return_details_status              : purchase_return_data.purchase_return_status,
                purchase_return_details_create_by           : user_id,
            })));
            const purchase_return_details = await purchase_return_details_model.bulkCreate(purchaseReturnDetails);

            const productDataUpdate = await Promise.all(purchase_return_details_data.map(async (item) => (
                await product_model.update({
                    product_return_quantity             : parseFloat(await getProduct('return_quantity', item.purchase_return_details_product))+parseFloat(item.purchase_return_details_return_quantity),
                    product_stock_quantity              : parseFloat(await getProduct('stock_quantity', item.purchase_return_details_product))-parseFloat(item.purchase_return_details_return_quantity),
                },
                {
                    where:{
                        product_id: item.purchase_return_details_product
                    }
                }),
                await purchase_details_model.update({
                    purchase_details_return_quantity    : parseFloat(await getPurchaseDetailsData('return_quantity', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, purchase_return_data.purchase_return_purchase, item.purchase_return_details_product))+parseFloat(item.purchase_return_details_return_quantity),
                    purchase_details_current_stock      : parseFloat(await getPurchaseDetailsData('current_stock', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, purchase_return_data.purchase_return_purchase, item.purchase_return_details_product))-parseFloat(item.purchase_return_details_return_quantity),
                },
                {
                    where:{
                        purchase_details_company        : purchase_return_data.purchase_return_company,
                        purchase_details_branch         : purchase_return_data.purchase_return_branch,
                        purchase_details_purchase       : purchase_return_data.purchase_return_purchase,
                        purchase_details_product        : item.purchase_return_details_product
                    }
                }),
                await product_stock_model.update({
                    product_stock_return_quantity   : parseFloat(await getProductStock('return_quantity', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, item.purchase_return_details_product))+parseFloat(item.purchase_return_details_return_quantity),
                    product_stock_in_stock          : parseFloat(await getProductStock('stock_quantity', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, item.purchase_return_details_product))-parseFloat(item.purchase_return_details_return_quantity)
                },
                {
                    where:{
                        product_stock_company       : purchase_return_data.purchase_return_company,
                        product_stock_branch        : purchase_return_data.purchase_return_branch,
                        product_stock_product       : item.purchase_return_details_product,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                })
            )));

            const supplier_data = await supplier_model.findOne({
                where:{
                    supplier_id: purchase_return_data.purchase_return_supplier
                }
            });

            // Supplier Payment Return
            if(purchase_return_data.purchase_return_payable_amount>0){
                const supplierUpdate = await supplier_model.update({
                    supplier_return         : parseFloat(supplier_data.supplier_return)+parseFloat(purchase_return_data.purchase_return_payable_amount),
                    supplier_return_paid    : parseFloat(supplier_data.supplier_return_paid)+parseFloat(purchase_return_data.purchase_return_paid_amount),
                    supplier_return_due     : parseFloat(supplier_data.supplier_return_due)+parseFloat(purchase_return_data.purchase_return_due_amount),
                },
                {
                    where: {
                        supplier_id:supplier_data.supplier_id
                    }
                });

                const supplier_payment_return = await supplier_payment_return_model.create({
                    supplier_payment_return_date                : purchase_return_data.purchase_return_date,
                    supplier_payment_return_company             : purchase_return_data.purchase_return_company,
                    supplier_payment_return_branch              : purchase_return_data.purchase_return_branch,
                    supplier_payment_return_purchase            : purchase_return_data.purchase_return_purchase,
                    supplier_payment_return_purchase_invoice    : purchase_return_data.purchase_return_purchase_invoice,
                    supplier_payment_return_purchase_return     : purchase_return.purchase_return_id,
                    supplier_payment_return_supplier            : purchase_return_data.purchase_return_supplier,
                    supplier_payment_return_payable             : purchase_return_data.purchase_return_payable_amount,
                    supplier_payment_return_paid                : purchase_return_data.purchase_return_paid_amount,
                    supplier_payment_return_due                 : purchase_return_data.purchase_return_due_amount,
                    supplier_payment_return_type                : 'Return',

                    supplier_payment_return_purchase_reference_number   : purchase_return_data.purchase_return_reference_number,
                    supplier_payment_return_purchase_payment_type       : purchase_return_data.purchase_return_payment_type,
                    supplier_payment_return_purchase_payment_method     : purchase_return_data.purchase_return_payment_method,
                    supplier_payment_return_status              : 1,
                    supplier_payment_return_create_by           : user_id
                });
            };
    
            const data = await purchase_return_model.findOne({
                include : [
                    {
                        model: company_model,
                        attributes: ['company_name'],
                        association: purchase_return_model.hasOne(company_model, {
                            foreignKey : 'company_id',
                            sourceKey : "purchase_return_company",
                            required:false
                        }),
                    },
                    {
                        model: branch_model,
                        attributes: ['branch_code', 'branch_name'],
                        association: purchase_return_model.hasOne(branch_model, {
                            foreignKey : 'branch_id',
                            sourceKey : "purchase_return_branch",
                            required:false
                        }),
                    },
                    {
                        model: warehouse_model,
                        attributes: ['warehouse_code', 'warehouse_name'],
                        association: purchase_return_model.hasOne(warehouse_model, {
                            foreignKey : 'warehouse_id',
                            sourceKey : "purchase_return_warehouse",
                            required:false
                        }),
                    },
                    {
                        model: supplier_model,
                        attributes: ['supplier_name'],
                        association: purchase_return_model.hasOne(supplier_model, {
                            foreignKey : 'supplier_id',
                            sourceKey : "purchase_return_supplier",
                            required:false
                        }),
                    }
                ],
                where: {
                    purchase_return_id: purchase_return.purchase_return_id
                },
            });
    
            const getPurchaseDetails = async(purchase_return_id) => {
                const details_data = await purchase_return_details_model.findAll({
                    include : [
                        {
                            model: product_model,
                            attributes: ['product_code', 'product_name'],
                            association: purchase_return_details_model.hasOne(product_model, {
                                foreignKey : 'product_id',
                                sourceKey : "purchase_return_details_product",
                                required:false
                            }),
                        },
                        {
                            model: product_unit_model,
                            attributes: ['product_unit_code', 'product_unit_name'],
                            association: purchase_return_details_model.hasOne(product_unit_model, {
                                foreignKey : 'product_unit_id',
                                sourceKey : "purchase_return_details_product_unit",
                                required:false
                            }),
                        },
                    ],
                    where: {
                        purchase_return_details_purchase       : purchase_return_id,
                        purchase_return_details_status         : 1,
                        purchase_return_details_delete_status  : 0
                    },
                    order: [
                        ['purchase_return_details_id', 'ASC']
                    ]
                });
                const purchase_return_details_data = await Promise.all(details_data.map(async (row) => ({
                    purchase_return_details_id                  : row.purchase_return_details_id,
                    purchase_return_details_purchase            : row.purchase_return_details_purchase,
                    purchase_return_details_purchase_return     : row.purchase_return_details_purchase_return,
                    purchase_return_details_purchase_date       : row.purchase_return_details_purchase_date,
                    purchase_return_details_return_date         : row.purchase_return_details_return_date,
                    purchase_return_details_product             : row.purchase_return_details_product,
                    purchase_return_details_product_code        : row.product <= 0 ? '' : row.product.product_code,
                    purchase_return_details_product_name        : row.product <= 0 ? '' : row.product.product_name,
                    purchase_return_details_product_unit        : row.purchase_return_details_product_unit,
                    purchase_return_details_product_unit_code   : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                    purchase_return_details_product_unit_name   : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                    purchase_return_details_purchase_price      : row.purchase_return_details_purchase_price,
                    purchase_return_details_purchase_quantity   : row.purchase_return_details_purchase_quantity,
                    purchase_return_details_purchase_amount     : row.purchase_return_details_purchase_amount,
                    purchase_return_details_return_price        : row.purchase_return_details_return_price,
                    purchase_return_details_return_quantity     : row.purchase_return_details_return_quantity,
                    purchase_return_details_return_amount       : row.purchase_return_details_return_amount,
                    purchase_return_details_reference_number    : row.purchase_return_details_reference_number,
                    purchase_return_details_payment_type        : row.purchase_return_details_payment_type,
                    purchase_return_details_payment_method      : row.purchase_return_details_payment_method,
                })));
    
                return purchase_return_details_data || [];
            }
    
            return res.send({
                status: "1",
                message: "Purchase Return Successfully!",
                data: {
                    purchase_return_id                  : data.purchase_return_id,
                    purchase_return_company             : data.purchase_return_company,
                    purchase_return_company_name        : data.purchase_return_company <= 0 ? '' : data.company.company_name,
                    purchase_return_branch              : data.purchase_return_branch,
                    purchase_return_branch_code         : data.purchase_return_branch <= 0 ? '' : data.branch.branch_code,
                    purchase_return_branch_name         : data.purchase_return_branch <= 0 ? '' : data.branch.branch_name,
                    purchase_return_warehouse           : data.purchase_return_warehouse,
                    purchase_return_warehouse_code      : data.purchase_return_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                    purchase_return_warehouse_name      : data.purchase_return_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                    purchase_return_supplier            : data.purchase_return_supplier,
                    purchase_return_supplier_name       : data.purchase_return_supplier <= 0 ? '' : data.supplier.supplier_name,
                    purchase_return_purchase            : data.purchase_return_purchase,
                    purchase_return_purchase_invoice    : data.purchase_return_purchase_invoice,
                    purchase_return_purchase_date       : data.purchase_return_purchase_date,
                    purchase_return_date                : data.purchase_return_date,
                    purchase_return_total_amount        : data.purchase_return_total_amount,
                    purchase_return_adjustment_amount   : data.purchase_return_adjustment_amount,
                    purchase_return_payable_amount      : data.purchase_return_payable_amount,
                    purchase_return_paid_amount         : data.purchase_return_paid_amount,
                    purchase_return_due_amount          : data.purchase_return_due_amount,
                    purchase_return_reference_number    : data.purchase_return_reference_number,
                    purchase_return_payment_type        : data.purchase_return_payment_type,
                    purchase_return_payment_method      : data.purchase_return_payment_method,
                    purchase_return_payment_status      : data.purchase_return_payment_status,
                    purchase_return_status              : data.purchase_return_status,
                    purchase_return_details             : await getPurchaseDetails(data.purchase_return_id),
                }
            });
        }
        return res.send({
            status: "0",
            message: "Purchase Return Error !",
            data: "",
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Purchase Return Update
exports.purchase_return_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const purchase_return = await purchase_return_model.findOne({
            where:{
                purchase_return_id: req.params.purchase_return_id
            }
        });

        if(!purchase_return) {
            return res.send({
                status: "0",
                message: "Purchase Return ID Not Found!",
                data: "",
            });
        }

        const purchase_return_data         = req.body.purchase_return_data;
        const purchase_return_details_data = req.body.purchase_return_details_data;

        const getProduct = async(type, data) => {
            const get_product = await product_model.findOne({ where:{ product_id: data } });
            if(type == 'product_code') {
                return get_product.product_code;
            } else  if(type == 'product_name') {
                return get_product.product_name;
            } else  if(type == 'product_unit') {
                return get_product.product_unit;
            } else  if(type == 'previous_purchase_price') {
                return get_product.product_purchase_price;
            } else  if(type == 'previous_sales_price') {
                return get_product.product_sales_price;
            } else  if(type == 'previous_stock') {
                return get_product.product_stock_quantity;
            } else  if(type == 'purchase_quantity') {
                return get_product.product_purchase_quantity;
            } else  if(type == 'return_quantity') {
                return get_product.product_return_quantity;
            } else  if(type == 'sales_quantity') {
                return get_product.product_sales_quantity;
            } else  if(type == 'sales_return_quantity') {
                return get_product.product_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_quantity;
            }
        }

        const getProductStock = async(type, company, branch, product) => {
            const get_product = await product_stock_model.findOne({ where:{ product_stock_company:company, product_stock_branch:branch, product_stock_product:product } });
            if(type == 'purchase_quantity') {
                return get_product.product_stock_purchase_quantity;
            } else if(type == 'return_quantity') {
                return get_product.product_stock_return_quantity;
            } else if(type == 'sales_quantity') {
                return get_product.product_stock_sales_quantity;
            } else if(type == 'sales_return_quantity') {
                return get_product.product_stock_sales_return_quantity;
            } else  if(type == 'stock_quantity') {
                return get_product.product_stock_in_stock;
            }
        }

        const getPurchaseDetailsData = async(type, company, branch, purchase, product) => {
            const get_product = await purchase_details_model.findOne({where:{ purchase_details_company : company, purchase_details_branch : branch, purchase_details_purchase : purchase, purchase_details_product : product }});
            if(type == 'purchase_quantity') {
                return get_product.purchase_details_purchase_quantity;
            } else if(type == 'return_quantity') {
                return get_product.purchase_details_return_quantity;
            } else  if(type == 'previous_stock') {
                return get_product.purchase_details_previous_stock;
            } else  if(type == 'current_stock') {
                return get_product.purchase_details_current_stock;
            }
        }

        const purchase_return_update = await purchase_return_model.update({
            purchase_return_date                : purchase_return_data.purchase_return_date,
            purchase_return_total_amount        : purchase_return_data.purchase_return_total_amount,
            purchase_return_adjustment_amount   : purchase_return_data.purchase_return_adjustment_amount,
            purchase_return_payable_amount      : purchase_return_data.purchase_return_payable_amount,
            purchase_return_paid_amount         : purchase_return_data.purchase_return_paid_amount,
            purchase_return_due_amount          : purchase_return_data.purchase_return_due_amount,
            purchase_return_reference_number    : purchase_return_data.purchase_return_reference_number,
            purchase_return_payment_type        : purchase_return_data.purchase_return_payment_type,
            purchase_return_payment_method      : purchase_return_data.purchase_return_payment_method,
            purchase_return_payment_status      : purchase_return_data.purchase_return_payment_status,
            purchase_return_status              : purchase_return_data.purchase_return_status,
            purchase_return_create_by           : user_id,
        },
        {
            where: {
                purchase_return_id: req.params.purchase_return_id
            }
        });

        if(purchase_return_update) {
            const purchase_return_details_delete = await purchase_return_details_model.destroy({
                where: {
                    purchase_return_details_purchase_return: req.params.purchase_return_id
                }
            });

            if(purchase_return_details_delete) {
            const purchaseReturnDetails = await Promise.all(purchase_return_details_data.map(async (row) => ({
                purchase_return_details_company             : purchase_return_data.purchase_return_company,
                purchase_return_details_branch              : purchase_return_data.purchase_return_branch,
                purchase_return_details_supplier            : purchase_return_data.purchase_return_supplier,
                purchase_return_details_warehouse           : purchase_return_data.purchase_return_warehouse,
                purchase_return_details_purchase            : purchase_return_data.purchase_return_purchase,
                purchase_return_details_purchase_invoice    : purchase_return_data.purchase_return_purchase_invoice,
                purchase_return_details_purchase_date       : purchase_return_data.purchase_return_purchase_date,
                purchase_return_details_return_date         : purchase_return_data.purchase_return_date,
                purchase_return_details_purchase_return     : purchase_return.purchase_return_id,
                purchase_return_details_product             : row.purchase_return_details_product,
                purchase_return_details_product_code        : row.purchase_return_details_product_code,
                purchase_return_details_product_name        : row.purchase_return_details_product_name,
                purchase_return_details_product_unit        : row.purchase_return_details_product_unit,
                purchase_return_details_purchase_price      : row.purchase_return_details_purchase_price,
                purchase_return_details_purchase_quantity   : row.purchase_return_details_purchase_quantity,
                purchase_return_details_purchase_amount     : row.purchase_return_details_purchase_amount,
                purchase_return_details_return_price        : row.purchase_return_details_return_price,
                purchase_return_details_return_quantity     : row.purchase_return_details_return_quantity,
                purchase_return_details_return_amount       : row.purchase_return_details_return_amount,
                purchase_return_details_status              : purchase_return_data.purchase_return_status,
                purchase_return_details_create_by           : user_id,
            })));

            const purchase_return_details = await purchase_return_details_model.bulkCreate(purchaseReturnDetails);
            }

            const productDataUpdate = await Promise.all(purchase_return_details_data.map(async (item) => (
                await product_model.update({
                    product_return_quantity             : (parseFloat(await getProduct('return_quantity', item.purchase_return_details_product))-parseFloat(item.purchase_return_details_previous_return_quantity))+parseFloat(item.purchase_return_details_return_quantity),
                    product_stock_quantity              : (
                        parseFloat(await getProduct('purchase_quantity', item.purchase_return_details_product))
                        -
                        (
                            (
                                (parseFloat(await getProduct('return_quantity', item.purchase_return_details_product))-parseFloat(item.purchase_return_details_previous_return_quantity))+parseFloat(item.purchase_return_details_return_quantity)
                                +parseFloat(await getProduct('sales_quantity', item.purchase_return_details_product))
                            )-
                            parseFloat(await getProduct('sales_return_quantity', item.purchase_return_details_product))
                        )
                    )
                },
                {
                    where:{
                        product_id: item.purchase_return_details_product
                    }
                }),
                await purchase_details_model.update({
                    purchase_details_return_quantity: (parseFloat(await getPurchaseDetailsData('return_quantity', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, purchase_return_data.purchase_return_purchase, item.purchase_return_details_product))-parseFloat(item.purchase_return_details_previous_return_quantity))+parseFloat(item.purchase_return_details_return_quantity),
                    purchase_details_current_stock: (parseFloat(await getPurchaseDetailsData('current_stock', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, purchase_return_data.purchase_return_purchase, item.purchase_return_details_product))-parseFloat(item.purchase_return_details_previous_return_quantity))+parseFloat(item.purchase_return_details_return_quantity),
                },
                {
                    where:{
                        purchase_details_company        : purchase_return_data.purchase_return_company,
                        purchase_details_branch         : purchase_return_data.purchase_return_branch,
                        purchase_details_purchase       : purchase_return_data.purchase_return_purchase,
                        purchase_details_product        : item.purchase_return_details_product
                    }
                }),
                await product_stock_model.update({
                    product_stock_return_quantity   : (parseFloat(await getProductStock('return_quantity', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, item.purchase_return_details_product))-parseFloat(item.purchase_return_details_previous_return_quantity))+parseFloat(item.purchase_return_details_return_quantity),
                    product_stock_in_stock          : (
                        parseFloat(await getProductStock('purchase_quantity', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, item.purchase_return_details_product))
                        -(
                            (
                                (parseFloat(await getProductStock('return_quantity', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, item.purchase_return_details_product))-parseFloat(item.purchase_return_details_previous_return_quantity))+parseFloat(item.purchase_return_details_return_quantity)
                                +parseFloat(await getProductStock('sales_quantity', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, item.purchase_return_details_product))
                            )-
                            parseFloat(await getProductStock('sales_return_quantity', purchase_return_data.purchase_return_company, purchase_return_data.purchase_return_branch, item.purchase_return_details_product))
                        )
                    )
                },
                {
                    where:{
                        product_stock_company       : purchase_return_data.purchase_return_company,
                        product_stock_branch        : purchase_return_data.purchase_return_branch,
                        product_stock_product       : item.purchase_return_details_product,
                        product_stock_status        : 1,
                        product_stock_delete_status : 0,
                    }
                })
            )));

            const supplier_data = await supplier_model.findOne({
                where:{
                    supplier_id: purchase_return_data.purchase_return_supplier
                }
            });

            const supplierUpdate = await supplier_model.update({
                supplier_return         : (parseFloat(supplier_data.supplier_return)-parseFloat(purchase_return_data.purchase_return_previous_payable_amount))+parseFloat(purchase_return_data.purchase_return_payable_amount),
                supplier_return_paid    : (parseFloat(supplier_data.supplier_return_paid)-parseFloat(purchase_return_data.purchase_return_previous_paid_amount))+parseFloat(purchase_return_data.purchase_return_paid_amount),
                supplier_return_due     : (parseFloat(supplier_data.supplier_return_due)-parseFloat(purchase_return_data.purchase_return_previous_due_amount))+parseFloat(purchase_return_data.purchase_return_due_amount),
            },
            {
                where: {
                    supplier_id:supplier_data.supplier_id
                }
            });

            const supplier_payment_return_delete = await supplier_payment_return_model.destroy({
                where: {
                    supplier_payment_return_purchase_return: req.params.purchase_return_id
                }
            });

            // Supplier Payment Return
            if(purchase_return_data.purchase_return_paid_amount > 0) {
                const supplier_payment_return = await supplier_payment_return_model.create({
                    supplier_payment_return_date                : purchase_return_data.purchase_return_date,
                    supplier_payment_return_company             : purchase_return_data.purchase_return_company,
                    supplier_payment_return_branch              : purchase_return_data.purchase_return_branch,
                    supplier_payment_return_purchase            : purchase_return_data.purchase_return_purchase,
                    supplier_payment_return_purchase_invoice    : purchase_return_data.purchase_return_purchase_invoice,
                    supplier_payment_return_purchase_return     : purchase_return.purchase_return_id,
                    supplier_payment_return_supplier            : purchase_return_data.purchase_return_supplier,
                    supplier_payment_return_payable             : purchase_return_data.purchase_return_payable_amount,
                    supplier_payment_return_paid                : purchase_return_data.purchase_return_paid_amount,
                    supplier_payment_return_due                 : purchase_return_data.purchase_return_due_amount,
                    
                    supplier_payment_return_purchase_reference_number   : purchase_return_data.purchase_return_reference_number,
                    supplier_payment_return_purchase_payment_type       : purchase_return_data.purchase_return_payment_type,
                    supplier_payment_return_purchase_payment_method     : purchase_return_data.purchase_return_payment_method,
                    supplier_payment_return_status              : 1,
                    supplier_payment_return_create_by           : user_id
                });
            };

            const data = await purchase_return_model.findOne({
                include : [
                    {
                        model: company_model,
                        attributes: ['company_name'],
                        association: purchase_return_model.hasOne(company_model, {
                            foreignKey : 'company_id',
                            sourceKey : "purchase_return_company",
                            required:false
                        }),
                    },
                    {
                        model: branch_model,
                        attributes: ['branch_code', 'branch_name'],
                        association: purchase_return_model.hasOne(branch_model, {
                            foreignKey : 'branch_id',
                            sourceKey : "purchase_return_branch",
                            required:false
                        }),
                    },
                    {
                        model: warehouse_model,
                        attributes: ['warehouse_code', 'warehouse_name'],
                        association: purchase_return_model.hasOne(warehouse_model, {
                            foreignKey : 'warehouse_id',
                            sourceKey : "purchase_return_warehouse",
                            required:false
                        }),
                    },
                    {
                        model: supplier_model,
                        attributes: ['supplier_name'],
                        association: purchase_return_model.hasOne(supplier_model, {
                            foreignKey : 'supplier_id',
                            sourceKey : "purchase_return_supplier",
                            required:false
                        }),
                    }
                ],
                where: {
                    purchase_return_id: purchase_return.purchase_return_id
                },
            });

            const getPurchaseDetails = async(purchase_return_id) => {
                const details_data = await purchase_return_details_model.findAll({
                    include : [
                        {
                            model: product_model,
                            attributes: ['product_code', 'product_name'],
                            association: purchase_return_details_model.hasOne(product_model, {
                                foreignKey : 'product_id',
                                sourceKey : "purchase_return_details_product",
                                required:false
                            }),
                        },
                        {
                            model: product_unit_model,
                            attributes: ['product_unit_code', 'product_unit_name'],
                            association: purchase_return_details_model.hasOne(product_unit_model, {
                                foreignKey : 'product_unit_id',
                                sourceKey : "purchase_return_details_product_unit",
                                required:false
                            }),
                        },
                    ],
                    where: {
                        purchase_return_details_purchase       : purchase_return_id,
                        purchase_return_details_status         : 1,
                        purchase_return_details_delete_status  : 0
                    },
                    order: [
                        ['purchase_return_details_id', 'ASC']
                    ]
                });
                const purchase_return_details_data = await Promise.all(details_data.map(async (row) => ({
                    purchase_return_details_id                      : row.purchase_return_details_id,
                    purchase_return_details_purchase                : row.purchase_return_details_purchase,
                    purchase_return_details_purchase_return         : row.purchase_return_details_purchase_return,
                    purchase_return_details_purchase_date           : row.purchase_return_details_purchase_date,
                    purchase_return_details_return_date             : row.purchase_return_details_return_date,
                    purchase_return_details_product                 : row.purchase_return_details_product,
                    purchase_return_details_product_code            : row.product <= 0 ? '' : row.product.product_code,
                    purchase_return_details_product_name            : row.product <= 0 ? '' : row.product.product_name,
                    purchase_return_details_product_unit            : row.purchase_return_details_product_unit,
                    purchase_return_details_product_unit_code       : row.product_unit <= 0 ? '' : row.product_unit.product_unit_code,
                    purchase_return_details_product_unit_name       : row.product_unit <= 0 ? '' : row.product_unit.product_unit_name,
                    purchase_return_details_purchase_price          : row.purchase_return_details_purchase_price,
                    purchase_return_details_purchase_quantity       : row.purchase_return_details_purchase_quantity,
                    purchase_return_details_purchase_amount         : row.purchase_return_details_purchase_amount,
                    purchase_return_details_return_price            : row.purchase_return_details_return_price,
                    purchase_return_details_return_quantity         : row.purchase_return_details_return_quantity,
                    purchase_return_details_return_amount           : row.purchase_return_details_return_amount,
                })));

                return purchase_return_details_data || [];
            }

            return res.send({
                status: "1",
                message: "Purchase Return Successfully!",
                data: {
                    purchase_return_id                  : data.purchase_return_id,
                    purchase_return_company             : data.purchase_return_company,
                    purchase_return_company_name        : data.purchase_return_company <= 0 ? '' : data.company.company_name,
                    purchase_return_branch              : data.purchase_return_branch,
                    purchase_return_branch_code         : data.purchase_return_branch <= 0 ? '' : data.branch.branch_code,
                    purchase_return_branch_name         : data.purchase_return_branch <= 0 ? '' : data.branch.branch_name,
                    purchase_return_warehouse           : data.purchase_return_warehouse,
                    purchase_return_warehouse_code      : data.purchase_return_warehouse <= 0 ? '' : data.warehouse.warehouse_code,
                    purchase_return_warehouse_name      : data.purchase_return_warehouse <= 0 ? '' : data.warehouse.warehouse_name,
                    purchase_return_supplier            : data.purchase_return_supplier,
                    purchase_return_supplier_name       : data.purchase_return_supplier <= 0 ? '' : data.supplier.supplier_name,
                    purchase_return_purchase            : data.purchase_return_purchase,
                    purchase_return_purchase_invoice    : data.purchase_return_purchase_invoice,
                    purchase_return_purchase_date       : data.purchase_return_purchase_date,
                    purchase_return_date                : data.purchase_return_date,
                    purchase_return_total_amount        : data.purchase_return_total_amount,
                    purchase_return_adjustment_amount   : data.purchase_return_adjustment_amount,
                    purchase_return_payable_amount      : data.purchase_return_payable_amount,
                    purchase_return_paid_amount         : data.purchase_return_paid_amount,
                    purchase_return_due_amount          : data.purchase_return_due_amount,
                    purchase_return_reference_number    : data.purchase_return_reference_number,
                    purchase_return_payment_type        : data.purchase_return_payment_type,
                    purchase_return_payment_method      : data.purchase_return_payment_method,
                    purchase_return_payment_status      : data.purchase_return_payment_status,
                    purchase_return_status              : data.purchase_return_status,
                    purchase_return_details             : await getPurchaseDetails(data.purchase_return_id),
                }
            });
        }

        return res.send({
            status: "0",
            message: "Purchase Return Error !",
            data: "",
        });
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Purchase Due List
exports.purchase_due_list = async (req, res) => {
    try {
        const purchase = await purchase_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_company        : req.query.company,
                purchase_branch         : req.query.branch,
                purchase_supplier       : req.query.supplier,
                purchase_delete_status  : 0,
                purchase_status         : 1,
                purchase_payment_status : 'Due'
            },
            order: [
                ['purchase_date', 'ASC']
            ]
        });

        if(purchase.length > 0) {
            const purchase_data = await Promise.all(purchase.map(async (row) => ({
                purchase_id                 : row.purchase_id,
                purchase_company            : row.purchase_company,
                purchase_company_name       : row.purchase_company <= 0 ? '' : row.company.company_name,
                purchase_branch             : row.purchase_branch,
                purchase_branch_code        : row.purchase_branch <= 0 ? '' : row.branch.branch_code,
                purchase_branch_name        : row.purchase_branch <= 0 ? '' : row.branch.branch_name,
                purchase_warehouse          : row.purchase_warehouse,
                purchase_warehouse_code     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_warehouse_name     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_supplier           : row.purchase_supplier,
                purchase_supplier_name      : row.purchase_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_date               : row.purchase_date,
                purchase_invoice            : row.purchase_invoice,
                purchase_product_amount     : row.purchase_product_amount,
                purchase_discount_percent   : row.purchase_discount_percent,
                purchase_discount_amount    : row.purchase_discount_amount,
                purchase_tax_percent        : row.purchase_tax_percent,
                purchase_tax_amount         : row.purchase_tax_amount,
                purchase_vat_percent        : row.purchase_vat_percent,
                purchase_vat_amount         : row.purchase_vat_amount,
                purchase_tax_vat_percent    : row.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : row.purchase_tax_vat_amount,
                purchase_total_amount       : row.purchase_total_amount,
                purchase_adjustment_amount  : row.purchase_adjustment_amount,
                purchase_payable_amount     : row.purchase_payable_amount,
                purchase_paid_amount        : row.purchase_paid_amount,
                purchase_due_amount         : row.purchase_due_amount,
                purchase_reference_number   : row.purchase_reference_number,
                purchase_payment_type       : row.purchase_payment_type,
                purchase_payment_method     : row.purchase_payment_method,
                purchase_payment_status     : row.purchase_payment_status,
                purchase_status             : row.purchase_status,
            })));

            return res.send({
                status: "1",
                message: "Purchase Due Find Successfully!",
                data: purchase_data
            });
        }

        return res.send({
            status: "0",
            message: "Purchase Due Not Found !",
            data: [],
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Purchase Return Due List
exports.purchase_return_due_list = async (req, res) => {
    try {
        const purchase_return = await purchase_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_return_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_return_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_return_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_return_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_return_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_return_company        : req.query.company,
                purchase_return_branch         : req.query.branch,
                purchase_return_supplier       : req.query.supplier,
                purchase_return_delete_status  : 0,
                purchase_return_status         : 1,
                purchase_return_payment_status : 'Due'
            },
            order: [
                ['purchase_return_date', 'ASC']
            ]
        });

        if(purchase_return.length > 0) {
            const purchase_return_data = await Promise.all(purchase_return.map(async (row) => ({
                purchase_return_id                 : row.purchase_return_id,
                purchase_return_company            : row.purchase_return_company,
                purchase_return_company_name       : row.purchase_return_company <= 0 ? '' : row.company.company_name,
                purchase_return_branch             : row.purchase_return_branch,
                purchase_return_branch_code        : row.purchase_return_branch <= 0 ? '' : row.branch.branch_code,
                purchase_return_branch_name        : row.purchase_return_branch <= 0 ? '' : row.branch.branch_name,
                purchase_return_warehouse          : row.purchase_return_warehouse,
                purchase_return_warehouse_code     : row.purchase_return_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_return_warehouse_name     : row.purchase_return_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_return_supplier           : row.purchase_return_supplier,
                purchase_return_supplier_name      : row.purchase_return_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_return_purchase           : row.purchase_return_purchase,
                purchase_return_purchase_invoice   : row.purchase_return_purchase_invoice,
                purchase_return_purchase_date      : row.purchase_return_purchase_date,
                purchase_return_date               : row.purchase_return_date,
                purchase_return_total_amount       : row.purchase_return_total_amount,
                purchase_return_adjustment_amount  : row.purchase_return_adjustment_amount,
                purchase_return_payable_amount     : row.purchase_return_payable_amount,
                purchase_return_paid_amount        : row.purchase_return_paid_amount,
                purchase_return_due_amount         : row.purchase_return_due_amount,
                purchase_return_reference_number   : row.purchase_return_reference_number,
                purchase_return_payment_type       : row.purchase_return_payment_type,
                purchase_return_payment_method     : row.purchase_return_payment_method,
                purchase_return_payment_status     : row.purchase_return_payment_status,
                purchase_return_status             : row.purchase_return_status,
            })));

            return res.send({
                status: "1",
                message: "Purchase Return Due Find Successfully!",
                data: purchase_return_data
            });
        }

        return res.send({
            status: "0",
            message: "Purchase Return Due Not Found !",
            data: [],
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Due Payment Create
exports.due_payment_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const payment_data              = req.body.payment_data;
        const purchase_data             = req.body.purchase_data;
        const supplier_payment_data     = req.body.supplier_payment_data;

        const purchase_update = await Promise.all(purchase_data.map(async(row) => {
            const dataUpdate = await purchase_model.update({
                purchase_paid_amount        : row.purchase_paid_amount,
                purchase_due_amount         : row.purchase_due_amount,
                purchase_reference_number   : row.purchase_reference_number,
                purchase_payment_type       : row.purchase_payment_type,
                purchase_payment_method     : row.purchase_payment_method,
                purchase_payment_status     : row.purchase_payment_status
            },
            {
                where: {
                    purchase_id: row.purchase_id
                }
            });
        }));

        const paymentData = await Promise.all(supplier_payment_data.map(async (row) => ({
            supplier_payment_company                    : row.supplier_payment_company,
            supplier_payment_branch                     : row.supplier_payment_branch,
            supplier_payment_date                       : row.supplier_payment_date,
            supplier_payment_purchase                   : row.supplier_payment_purchase,
            supplier_payment_purchase_invoice           : row.supplier_payment_purchase_invoice,
            supplier_payment_supplier                   : row.supplier_payment_supplier,
            supplier_payment_payable                    : row.supplier_payment_payable,
            supplier_payment_paid                       : row.supplier_payment_paid,
            supplier_payment_due                        : row.supplier_payment_due,
            supplier_payment_type                       : row.supplier_payment_type,
            supplier_payment_purchase_reference_number  : row.supplier_payment_purchase_reference_number,
            supplier_payment_purchase_payment_type      : row.supplier_payment_purchase_payment_type,
            supplier_payment_purchase_payment_method    : row.supplier_payment_purchase_payment_method,
            supplier_payment_status                     : row.supplier_payment_status,
            supplier_payment_create_by                  : user_id,
        })));
        const supplier_payment = await supplier_payment_model.bulkCreate(paymentData);

        const supplier_paid_amount  = supplier_payment_data.reduce((supplier_payment_paid, data) => supplier_payment_paid + parseFloat(data.supplier_payment_paid), 0);
        const supplier_due_amount   = supplier_payment_data.reduce((supplier_payment_due, data) => supplier_payment_due + parseFloat(data.supplier_payment_due), 0);

        const supplier_data = await supplier_model.findOne({
            where:{
                supplier_id: payment_data.supplier
            }
        });
        const supplier_update = await supplier_model.update({
            supplier_paid   : parseFloat(supplier_data.supplier_paid)+parseFloat(supplier_paid_amount),
            supplier_due    : parseFloat(supplier_data.supplier_purchase)-(parseFloat(supplier_data.supplier_paid)+parseFloat(supplier_paid_amount)),
        },
        {
            where: {
                supplier_id:supplier_data.supplier_id
            }
        });

        if(purchase_update && supplier_payment && supplier_update) {
            return res.send({
                status: "1",
                message: "Due Payment Create Successfully!",
                data: ""
            });
        } else {
            return res.send({
                status: "0",
                message: "Due Payment Create Error !",
                data: "",
            });
        }
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Return Due Collection Create
exports.return_due_collection_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const payment_data                     = req.body.payment_data;
        const purchase_return_data             = req.body.purchase_return_data;
        const supplier_payment_return_data     = req.body.supplier_payment_return_data;

        const purchase_return_update = await Promise.all(purchase_return_data.map(async(row) => {
            const dataUpdate = await purchase_return_model.update({
                purchase_return_paid_amount        : row.purchase_return_paid_amount,
                purchase_return_due_amount         : row.purchase_return_due_amount,
                purchase_return_reference_number   : row.purchase_return_reference_number,
                purchase_return_payment_type       : row.purchase_return_payment_type,
                purchase_return_payment_method     : row.purchase_return_payment_method,
                purchase_return_payment_status     : row.purchase_return_payment_status
            },
            {
                where: {
                    purchase_return_id: row.purchase_return_id
                }
            });
        }));

        const paymentData = await Promise.all(supplier_payment_return_data.map(async (row) => ({
            supplier_payment_return_company                    : row.supplier_payment_return_company,
            supplier_payment_return_branch                     : row.supplier_payment_return_branch,
            supplier_payment_return_date                       : row.supplier_payment_return_date,
            supplier_payment_return_purchase                   : row.supplier_payment_return_purchase,
            supplier_payment_return_purchase_invoice           : row.supplier_payment_return_purchase_invoice,
            supplier_payment_return_purchase_return            : row.supplier_payment_return_purchase_return,
            supplier_payment_return_supplier                   : row.supplier_payment_return_supplier,
            supplier_payment_return_payable                    : row.supplier_payment_return_payable,
            supplier_payment_return_paid                       : row.supplier_payment_return_paid,
            supplier_payment_return_due                        : row.supplier_payment_return_due,
            supplier_payment_return_type                       : row.supplier_payment_return_type,
            supplier_payment_return_purchase_reference_number  : row.supplier_payment_return_purchase_return_reference_number,
            supplier_payment_return_purchase_payment_type      : row.supplier_payment_return_purchase_return_payment_type,
            supplier_payment_return_purchase_payment_method    : row.supplier_payment_return_purchase_return_payment_method,
            supplier_payment_return_status                     : row.supplier_payment_return_status,
            supplier_payment_return_create_by                  : user_id,
        })));
        const supplier_payment_return = await supplier_payment_return_model.bulkCreate(paymentData);

        const supplier_paid_amount  = supplier_payment_return_data.reduce((supplier_payment_return_paid, data) => supplier_payment_return_paid + parseFloat(data.supplier_payment_return_paid), 0);
        const supplier_due_amount   = supplier_payment_return_data.reduce((supplier_payment_return_due, data) => supplier_payment_return_due + parseFloat(data.supplier_payment_return_due), 0);

        const supplier_data = await supplier_model.findOne({
            where:{
                supplier_id: payment_data.supplier
            }
        });
        const supplier_update = await supplier_model.update({
            supplier_return_paid   : parseFloat(supplier_data.supplier_return_paid)+parseFloat(supplier_paid_amount),
            supplier_return_due    : parseFloat(supplier_data.supplier_return)-(parseFloat(supplier_data.supplier_return_paid)+parseFloat(supplier_paid_amount)),
        },
        {
            where: {
                supplier_id:supplier_data.supplier_id
            }
        });

        if(purchase_return_update && supplier_payment_return && supplier_update) {
            return res.send({
                status: "1",
                message: "Return Due Collection Successfully!",
                data: ""
            });
        } else {
            return res.send({
                status: "0",
                message: "Return Due Collection Error !",
                data: "",
            });
        }
    } catch (error) {
        res.send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Get Due Payment
exports.get_due_payment = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const purchase_payment = await supplier_payment_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: supplier_payment_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "supplier_payment_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: supplier_payment_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "supplier_payment_branch",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: supplier_payment_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "supplier_payment_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                supplier_payment_company        : req.query.company,
                supplier_payment_branch         : req.query.branch,
                supplier_payment_supplier       : req.query.supplier,
                supplier_payment_date           : req.query.payment_date,
                supplier_payment_type           : 'Due',
                supplier_payment_status         : 1,
                supplier_payment_delete_status  : 0
            },
            order: [
                ['supplier_payment_date', 'ASC']
            ]
        });

        if(purchase_payment.length > 0) {
            const purchase_payment_data = await Promise.all(purchase_payment.map(async (row) => ({
                supplier_payment_id             : row.supplier_payment_id ,
                supplier_payment_company        : row.supplier_payment_company,
                supplier_payment_company_name   : row.supplier_payment_company <= 0 ? '' : row.company.company_name,
                supplier_payment_branch         : row.supplier_payment_branch,
                supplier_payment_branch_code    : row.supplier_payment_branch <= 0 ? '' : row.branch.branch_code,
                supplier_payment_branch_name    : row.supplier_payment_branch <= 0 ? '' : row.branch.branch_name,
                supplier_payment_supplier       : row.supplier_payment_supplier,
                supplier_payment_supplier_name  : row.supplier_payment_supplier <= 0 ? '' : row.supplier.supplier_name,
                supplier_payment_date           : row.supplier_payment_date,
                supplier_payment_purchase       : row.supplier_payment_purchase,
                supplier_payment_purchase_invoice: row.supplier_payment_purchase_invoice,
                supplier_payment_payable        : row.supplier_payment_payable,
                supplier_payment_paid           : row.supplier_payment_paid,
                supplier_payment_due            : row.supplier_payment_due,
                supplier_payment_type           : row.supplier_payment_type,
                supplier_payment_purchase_reference_number  : row.supplier_payment_purchase_reference_number,
                supplier_payment_purchase_payment_type      : row.supplier_payment_purchase_payment_type,
                supplier_payment_purchase_payment_method    : row.supplier_payment_purchase_payment_method,
                supplier_payment_status         : row.supplier_payment_status,
            })));

            return res.send({
                status  : "1",
                message : "Supplier Payment Find Successfully!",
                data    : purchase_payment_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Supplier Payment Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Get Return Due Collection
exports.get_return_due_collection = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const purchase_payment = await supplier_payment_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: supplier_payment_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "supplier_payment_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: supplier_payment_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "supplier_payment_return_branch",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: supplier_payment_return_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "supplier_payment_return_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                supplier_payment_return_company        : req.query.company,
                supplier_payment_return_branch         : req.query.branch,
                supplier_payment_return_supplier       : req.query.supplier,
                supplier_payment_return_date           : req.query.payment_date,
                supplier_payment_return_type           : 'Due',
                supplier_payment_return_status         : 1,
                supplier_payment_return_delete_status  : 0
            },
            order: [
                ['supplier_payment_return_date', 'ASC']
            ]
        });

        if(purchase_payment.length > 0) {
            const purchase_payment_data = await Promise.all(purchase_payment.map(async (row) => ({
                supplier_payment_return_id             : row.supplier_payment_return_id ,
                supplier_payment_return_company        : row.supplier_payment_return_company,
                supplier_payment_return_company_name   : row.supplier_payment_return_company <= 0 ? '' : row.company.company_name,
                supplier_payment_return_branch         : row.supplier_payment_return_branch,
                supplier_payment_return_branch_code    : row.supplier_payment_return_branch <= 0 ? '' : row.branch.branch_code,
                supplier_payment_return_branch_name    : row.supplier_payment_return_branch <= 0 ? '' : row.branch.branch_name,
                supplier_payment_return_supplier       : row.supplier_payment_return_supplier,
                supplier_payment_return_supplier_name  : row.supplier_payment_return_supplier <= 0 ? '' : row.supplier.supplier_name,
                supplier_payment_return_date           : row.supplier_payment_return_date,
                supplier_payment_return_purchase       : row.supplier_payment_return_purchase,
                supplier_payment_return_purchase_invoice: row.supplier_payment_return_purchase_invoice,
                supplier_payment_return_payable        : row.supplier_payment_return_payable,
                supplier_payment_return_paid           : row.supplier_payment_return_paid,
                supplier_payment_return_due            : row.supplier_payment_return_due,
                supplier_payment_return_type           : row.supplier_payment_return_type,
                supplier_payment_return_purchase_reference_number  : row.supplier_payment_return_purchase_reference_number,
                supplier_payment_return_purchase_payment_type      : row.supplier_payment_return_purchase_payment_type,
                supplier_payment_return_purchase_payment_method    : row.supplier_payment_return_purchase_payment_method,
                supplier_payment_return_status         : row.supplier_payment_return_status,
            })));

            return res.send({
                status  : "1",
                message : "Supplier Payment Find Successfully!",
                data    : purchase_payment_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Supplier Payment Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Purchase Report
exports.purchase_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const purchase = await purchase_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_company: req.query.company,
                purchase_branch: req.query.branch,
                ...(req.query.supplier == 'all' ?{}:{
                    purchase_supplier: req.query.supplier
                }),
                purchase_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                purchase_status: req.query.status,
                purchase_delete_status: 0
            },
            order: [
                ['purchase_date', 'ASC']
            ]
        });

        if(purchase.length > 0) {
            const purchase_data = await Promise.all(purchase.map(async (row) => ({
                purchase_id                 : row.purchase_id,
                purchase_company            : row.purchase_company,
                purchase_company_name       : row.purchase_company <= 0 ? '' : row.company.company_name,
                purchase_branch             : row.purchase_branch,
                purchase_branch_code        : row.purchase_branch <= 0 ? '' : row.branch.branch_code,
                purchase_branch_name        : row.purchase_branch <= 0 ? '' : row.branch.branch_name,
                purchase_warehouse          : row.purchase_warehouse,
                purchase_warehouse_code     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_warehouse_name     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_supplier           : row.purchase_supplier,
                purchase_supplier_name      : row.purchase_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_date               : row.purchase_date,
                purchase_invoice            : row.purchase_invoice,
                purchase_product_amount     : row.purchase_product_amount,
                purchase_discount_percent   : row.purchase_discount_percent,
                purchase_discount_amount    : row.purchase_discount_amount,
                purchase_tax_percent        : row.purchase_tax_percent,
                purchase_tax_amount         : row.purchase_tax_amount,
                purchase_vat_percent        : row.purchase_vat_percent,
                purchase_vat_amount         : row.purchase_vat_amount,
                purchase_tax_vat_percent    : row.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : row.purchase_tax_vat_amount,
                purchase_total_amount       : row.purchase_total_amount,
                purchase_adjustment_amount  : row.purchase_adjustment_amount,
                purchase_payable_amount     : row.purchase_payable_amount,
                purchase_paid_amount        : row.purchase_paid_amount,
                purchase_due_amount         : row.purchase_due_amount,
                purchase_reference_number   : row.purchase_reference_number,
                purchase_payment_type       : row.purchase_payment_type,
                purchase_payment_method     : row.purchase_payment_method,
                purchase_payment_status     : row.purchase_payment_status,
                purchase_status             : row.purchase_status,
            })));

            return res.send({
                status  : "1",
                message : "Purchase Find Successfully!",
                data    : purchase_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Purchase Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Purchase Due Report
exports.purchase_due_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const purchase = await purchase_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_company: req.query.company,
                purchase_branch: req.query.branch,
                ...(req.query.supplier == 'all' ?{}:{
                    purchase_supplier: req.query.supplier
                }),
                purchase_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                purchase_payment_status: 'Due',
                purchase_status: req.query.status,
                purchase_delete_status: 0
            },
            order: [
                ['purchase_date', 'ASC']
            ]
        });

        if(purchase.length > 0) {
            const purchase_data = await Promise.all(purchase.map(async (row) => ({
                purchase_id                 : row.purchase_id,
                purchase_company            : row.purchase_company,
                purchase_company_name       : row.purchase_company <= 0 ? '' : row.company.company_name,
                purchase_branch             : row.purchase_branch,
                purchase_branch_code        : row.purchase_branch <= 0 ? '' : row.branch.branch_code,
                purchase_branch_name        : row.purchase_branch <= 0 ? '' : row.branch.branch_name,
                purchase_warehouse          : row.purchase_warehouse,
                purchase_warehouse_code     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_warehouse_name     : row.purchase_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_supplier           : row.purchase_supplier,
                purchase_supplier_name      : row.purchase_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_date               : row.purchase_date,
                purchase_invoice            : row.purchase_invoice,
                purchase_product_amount     : row.purchase_product_amount,
                purchase_discount_percent   : row.purchase_discount_percent,
                purchase_discount_amount    : row.purchase_discount_amount,
                purchase_tax_percent        : row.purchase_tax_percent,
                purchase_tax_amount         : row.purchase_tax_amount,
                purchase_vat_percent        : row.purchase_vat_percent,
                purchase_vat_amount         : row.purchase_vat_amount,
                purchase_tax_vat_percent    : row.purchase_tax_vat_percent,
                purchase_tax_vat_amount     : row.purchase_tax_vat_amount,
                purchase_total_amount       : row.purchase_total_amount,
                purchase_adjustment_amount  : row.purchase_adjustment_amount,
                purchase_payable_amount     : row.purchase_payable_amount,
                purchase_paid_amount        : row.purchase_paid_amount,
                purchase_due_amount         : row.purchase_due_amount,
                purchase_reference_number   : row.purchase_reference_number,
                purchase_payment_type       : row.purchase_payment_type,
                purchase_payment_method     : row.purchase_payment_method,
                purchase_payment_status     : row.purchase_payment_status,
                purchase_status             : row.purchase_status,
            })));

            return res.send({
                status  : "1",
                message : "Purchase Find Successfully!",
                data    : purchase_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Purchase Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Purchase Payment Report
exports.purchase_payment_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const purchase_payment = await supplier_payment_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: supplier_payment_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "supplier_payment_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: supplier_payment_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "supplier_payment_branch",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: supplier_payment_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "supplier_payment_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                supplier_payment_company: req.query.company,
                supplier_payment_branch: req.query.branch,
                ...(req.query.supplier == 'all' ?{}:{
                    supplier_payment_supplier: req.query.supplier
                }),
                ...(req.query.payment_type == 'all' ?{}:{
                    supplier_payment_type: req.query.payment_type
                }),
                supplier_payment_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                supplier_payment_status: req.query.status,
                supplier_payment_delete_status: 0
            },
            order: [
                ['supplier_payment_date', 'ASC']
            ]
        });

        if(purchase_payment.length > 0) {
            const purchase_payment_data = await Promise.all(purchase_payment.map(async (row) => ({
                supplier_payment_id             : row.supplier_payment_id ,
                supplier_payment_company        : row.supplier_payment_company,
                supplier_payment_company_name   : row.supplier_payment_company <= 0 ? '' : row.company.company_name,
                supplier_payment_branch         : row.supplier_payment_branch,
                supplier_payment_branch_code    : row.supplier_payment_branch <= 0 ? '' : row.branch.branch_code,
                supplier_payment_branch_name    : row.supplier_payment_branch <= 0 ? '' : row.branch.branch_name,
                supplier_payment_supplier       : row.supplier_payment_supplier,
                supplier_payment_supplier_name  : row.supplier_payment_supplier <= 0 ? '' : row.supplier.supplier_name,
                supplier_payment_date           : row.supplier_payment_date,
                supplier_payment_purchase       : row.supplier_payment_purchase,
                supplier_payment_purchase_invoice: row.supplier_payment_purchase_invoice,
                supplier_payment_payable        : row.supplier_payment_payable,
                supplier_payment_paid           : row.supplier_payment_paid,
                supplier_payment_due            : row.supplier_payment_due,
                supplier_payment_type           : row.supplier_payment_type,
                supplier_payment_purchase_reference_number  : row.supplier_payment_purchase_reference_number,
                supplier_payment_purchase_payment_type      : row.supplier_payment_purchase_payment_type,
                supplier_payment_purchase_payment_method    : row.supplier_payment_purchase_payment_method,
                supplier_payment_status         : row.supplier_payment_status,
            })));

            return res.send({
                status  : "1",
                message : "Purchase Payment Find Successfully!",
                data    : purchase_payment_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Purchase Payment Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Purchase Return Report
exports.purchase_return_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const purchase_return = await purchase_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: purchase_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "purchase_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: purchase_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "purchase_return_branch",
                        required:false
                    }),
                },
                {
                    model: warehouse_model,
                    attributes: ['warehouse_code', 'warehouse_name'],
                    association: purchase_return_model.hasOne(warehouse_model, {
                        foreignKey : 'warehouse_id',
                        sourceKey : "purchase_return_warehouse",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: purchase_return_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "purchase_return_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                purchase_return_company: req.query.company,
                purchase_return_branch: req.query.branch,
                ...(req.query.supplier == 'all' ?{}:{
                    purchase_return_supplier: req.query.supplier
                }),
                purchase_return_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                purchase_return_status: req.query.status,
                purchase_return_delete_status: 0
            },
            order: [
                ['purchase_return_date', 'ASC']
            ]
        });

        if(purchase_return.length > 0) {
            const purchase_return_data = await Promise.all(purchase_return.map(async (row) => ({
                purchase_return_id                 : row.purchase_return_id,
                purchase_return_company            : row.purchase_return_company,
                purchase_return_company_name       : row.purchase_return_company <= 0 ? '' : row.company.company_name,
                purchase_return_branch             : row.purchase_return_branch,
                purchase_return_branch_code        : row.purchase_return_branch <= 0 ? '' : row.branch.branch_code,
                purchase_return_branch_name        : row.purchase_return_branch <= 0 ? '' : row.branch.branch_name,
                purchase_return_warehouse          : row.purchase_return_warehouse,
                purchase_return_warehouse_code     : row.purchase_return_warehouse <= 0 ? '' : row.warehouse.warehouse_code,
                purchase_return_warehouse_name     : row.purchase_return_warehouse <= 0 ? '' : row.warehouse.warehouse_name,
                purchase_return_supplier           : row.purchase_return_supplier,
                purchase_return_supplier_name      : row.purchase_return_supplier <= 0 ? '' : row.supplier.supplier_name,
                purchase_return_date               : row.purchase_return_date,
                purchase_return_purchase           : row.purchase_return_purchase,
                purchase_return_purchase_invoice   : row.purchase_return_purchase_invoice,
                purchase_return_total_amount       : row.purchase_return_total_amount,
                purchase_return_adjustment_amount  : row.purchase_return_adjustment_amount,
                purchase_return_payable_amount     : row.purchase_return_payable_amount,
                purchase_return_paid_amount        : row.purchase_return_paid_amount,
                purchase_return_due_amount         : row.purchase_return_due_amount,
                purchase_return_reference_number   : row.purchase_return_reference_number,
                purchase_return_payment_type       : row.purchase_return_payment_type,
                purchase_return_payment_method     : row.purchase_return_payment_method,
                purchase_return_payment_status     : row.purchase_return_payment_status,
                purchase_return_status             : row.purchase_return_status,
            })));

            return res.send({
                status  : "1",
                message : "Purchase Return Find Successfully!",
                data    : purchase_return_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Purchase Return Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Return Collection Report
exports.return_collection_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name            : company_info.company_name,
            company_owner_name      : company_info.company_owner_name,
            company_phone           : company_info.company_phone,
            company_email           : company_info.company_email,
            company_website         : company_info.company_website,
            company_address         : company_info.company_address,
            company_opening_date    : company_info.company_opening_date,
            company_picture         : company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code            : branch_info<= 0 ? '':branch_info.branch_code,
            branch_name            : branch_info<= 0 ? '':branch_info.branch_name,
            branch_phone           : branch_info<= 0 ? '':branch_info.branch_phone,
            branch_email           : branch_info<= 0 ? '':branch_info.branch_email,
            branch_address         : branch_info<= 0 ? '':branch_info.branch_address,
            branch_opening_date    : branch_info<= 0 ? '':branch_info.branch_opening_date
        };

        const supplier_info = await supplier_model.findOne({
            where: {
                supplier_id: req.query.supplier || 'all'
            }
        });
        const supplier_data = {
            supplier_name           : supplier_info<= 0 ? 'All':supplier_info.supplier_name,
            supplier_contact_person : supplier_info<= 0 ? '':supplier_info.supplier_contact_person,
            supplier_phone_number   : supplier_info<= 0 ? '':supplier_info.supplier_phone_number,
            supplier_email          : supplier_info<= 0 ? '':supplier_info.supplier_email,
            supplier_address        : supplier_info<= 0 ? '':supplier_info.supplier_address
        };

        const purchase_payment = await supplier_payment_return_model.findAll({
            include : [
                {
                    model: company_model,
                    attributes: ['company_name'],
                    association: supplier_payment_return_model.hasOne(company_model, {
                        foreignKey : 'company_id',
                        sourceKey : "supplier_payment_return_company",
                        required:false
                    }),
                },
                {
                    model: branch_model,
                    attributes: ['branch_code', 'branch_name'],
                    association: supplier_payment_return_model.hasOne(branch_model, {
                        foreignKey : 'branch_id',
                        sourceKey : "supplier_payment_return_branch",
                        required:false
                    }),
                },
                {
                    model: supplier_model,
                    attributes: ['supplier_name'],
                    association: supplier_payment_return_model.hasOne(supplier_model, {
                        foreignKey : 'supplier_id',
                        sourceKey : "supplier_payment_return_supplier",
                        required:false
                    }),
                }
            ],
            where: {
                supplier_payment_return_company: req.query.company,
                supplier_payment_return_branch: req.query.branch,
                ...(req.query.supplier == 'all' ?{}:{
                    supplier_payment_return_supplier: req.query.supplier
                }),
                supplier_payment_return_date: {
                    [Op.between]: [req.query.from_date, req.query.to_date],
                },
                supplier_payment_return_status: req.query.status,
                supplier_payment_return_delete_status: 0
            },
            order: [
                ['supplier_payment_return_date', 'ASC']
            ]
        });

        if(purchase_payment.length > 0) {
            const purchase_payment_data = await Promise.all(purchase_payment.map(async (row) => ({
                supplier_payment_return_id             : row.supplier_payment_return_id ,
                supplier_payment_return_company        : row.supplier_payment_return_company,
                supplier_payment_return_company_name   : row.supplier_payment_return_company <= 0 ? '' : row.company.company_name,
                supplier_payment_return_branch         : row.supplier_payment_return_branch,
                supplier_payment_return_branch_code    : row.supplier_payment_return_branch <= 0 ? '' : row.branch.branch_code,
                supplier_payment_return_branch_name    : row.supplier_payment_return_branch <= 0 ? '' : row.branch.branch_name,
                supplier_payment_return_supplier       : row.supplier_payment_return_supplier,
                supplier_payment_return_supplier_name  : row.supplier_payment_return_supplier <= 0 ? '' : row.supplier.supplier_name,
                supplier_payment_return_date           : row.supplier_payment_return_date,
                supplier_payment_return_purchase       : row.supplier_payment_return_purchase,
                supplier_payment_return_purchase_invoice: row.supplier_payment_return_purchase_invoice,
                supplier_payment_return_payable        : row.supplier_payment_return_payable,
                supplier_payment_return_paid           : row.supplier_payment_return_paid,
                supplier_payment_return_due            : row.supplier_payment_return_due,
                supplier_payment_return_type           : row.supplier_payment_return_type,
                supplier_payment_return_purchase_reference_number  : row.supplier_payment_return_purchase_reference_number,
                supplier_payment_return_purchase_payment_type      : row.supplier_payment_return_purchase_payment_type,
                supplier_payment_return_purchase_payment_method    : row.supplier_payment_return_purchase_payment_method,
                supplier_payment_return_status         : row.supplier_payment_return_status,
            })));

            return res.send({
                status  : "1",
                message : "Return Collection Find Successfully!",
                data    : purchase_payment_data,
                company : company_data,
                branch  : branch_data,
                supplier: supplier_data,
            });
        }

        return res.send({
            status  : "0",
            message : "Return Collection Not Found !",
            data    : [],
            company : '',
            branch  : '',
            supplier: '',
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: [],
        });
    }
};

// Purchase Balance
exports.purchase_balance = async (req, res) => {
    try {
        const company = req.params.company;
        const from_date = new Date();
        const to_date   = new Date();

        const purchase_data = await purchase_model.findOne({
            attributes: [
                
                [sequelize.literal('(SUM(purchase_payable_amount))'),'purchase_amount']
            ],
            where:{
                purchase_company        : company,
                purchase_date           : {[Op.between]: [from_date, to_date]},
                purchase_status         : 1,
                purchase_delete_status  : 0,
            },
            order: [
                ['purchase_date', 'ASC']
            ]
        });
        
        const purchase_payment_data = await supplier_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_paid))'),'paid_amount']
            ],
            where:{
                supplier_payment_company        : company,
                supplier_payment_date           : {[Op.between]: [from_date, to_date]},
                supplier_payment_status         : 1,
                supplier_payment_delete_status  : 0,
                supplier_payment_type  : 'Purchase'
            },
            order: [
                ['supplier_payment_date', 'ASC']
            ]
        });

        const purchase_due_payment_data = await supplier_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_paid))'),'due_payment']
            ],
            where:{
                supplier_payment_company        : company,
                supplier_payment_date           : {[Op.between]: [from_date, to_date]},
                supplier_payment_status         : 1,
                supplier_payment_delete_status  : 0,
                supplier_payment_type  : 'Due'
            },
            order: [
                ['supplier_payment_date', 'ASC']
            ]
        });

        const purchase_return_data = await purchase_return_model.findOne({
            attributes: [
                
                [sequelize.literal('(SUM(purchase_return_payable_amount))'),'purchase_return_amount']
            ],
            where:{
                purchase_return_company        : company,
                purchase_return_date           : {[Op.between]: [from_date, to_date]},
                purchase_return_status         : 1,
                purchase_return_delete_status  : 0,
            },
            order: [
                ['purchase_return_date', 'ASC']
            ]
        });

        const purchase_return_payment_data = await supplier_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_return_paid))'),'return_paid_amount']
            ],
            where:{
                supplier_payment_return_company        : company,
                supplier_payment_return_date           : {[Op.between]: [from_date, to_date]},
                supplier_payment_return_status         : 1,
                supplier_payment_return_delete_status  : 0,
                supplier_payment_return_type  : 'Return'
            },
            order: [
                ['supplier_payment_return_date', 'ASC']
            ]
        });

        const purchase_return_due_payment_data = await supplier_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_return_paid))'),'return_due_payment']
            ],
            where:{
                supplier_payment_return_company        : company,
                supplier_payment_return_date           : {[Op.between]: [from_date, to_date]},
                supplier_payment_return_status         : 1,
                supplier_payment_return_delete_status  : 0,
                supplier_payment_return_type  : 'Due'
            },
            order: [
                ['supplier_payment_return_date', 'ASC']
            ]
        });

        const purchase = {
            purchase_amount             : parseFloat(purchase_data.dataValues.purchase_amount || 0).toFixed(2),
            purchase_paid_amount        : parseFloat(purchase_payment_data.dataValues.paid_amount || 0).toFixed(2),
            purchase_due_amount         : parseFloat(parseFloat(purchase_data.dataValues.purchase_amount || 0)-parseFloat(purchase_payment_data.dataValues.paid_amount || 0)).toFixed(2),
            purchase_due_payment        : parseFloat(purchase_due_payment_data.dataValues.due_payment || 0).toFixed(2),

            purchase_return_amount      : parseFloat(purchase_return_data.dataValues.purchase_return_amount || 0).toFixed(2),
            purchase_return_paid_amount : parseFloat(purchase_return_payment_data.dataValues.return_paid_amount || 0).toFixed(2),
            purchase_return_due_amount  : parseFloat(parseFloat(purchase_return_data.dataValues.purchase_return_amount || 0)-parseFloat(purchase_return_payment_data.dataValues.return_paid_amount || 0)).toFixed(2),
            purchase_return_due_payment : parseFloat(purchase_return_due_payment_data.dataValues.return_due_payment || 0).toFixed(2),
        }

        return res.send({
            status  : "1",
            message : "Purchase Balance Find Successfully !",
            data    : purchase
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};

// Purchase Balance Branch
exports.purchase_balance_branch = async (req, res) => {
    try {
        const company = req.query.company;
        const branch = req.query.branch;
        const from_date = new Date();
        const to_date   = new Date();
        
        const purchase_data = await purchase_model.findOne({
            attributes: [
                
                [sequelize.literal('(SUM(purchase_payable_amount))'),'purchase_amount']
            ],
            where:{
                purchase_company        : company,
                ...(branch == 'all' ?{}:{ purchase_branch : branch}),
                purchase_date           : {[Op.between]: [from_date, to_date]},
                purchase_status         : 1,
                purchase_delete_status  : 0,
            },
            order: [
                ['purchase_date', 'ASC']
            ]
        });
        
        const purchase_payment_data = await supplier_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_paid))'),'paid_amount']
            ],
            where:{
                supplier_payment_company        : company,
                ...(branch == 'all' ?{}:{ supplier_payment_branch : branch}),
                supplier_payment_date           : {[Op.between]: [from_date, to_date]},
                supplier_payment_status         : 1,
                supplier_payment_delete_status  : 0,
                supplier_payment_type  : 'Purchase'
            },
            order: [
                ['supplier_payment_date', 'ASC']
            ]
        });

        const purchase_due_payment_data = await supplier_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_paid))'),'due_payment']
            ],
            where:{
                supplier_payment_company        : company,
                ...(branch == 'all' ?{}:{ supplier_payment_branch : branch}),
                supplier_payment_date           : {[Op.between]: [from_date, to_date]},
                supplier_payment_status         : 1,
                supplier_payment_delete_status  : 0,
                supplier_payment_type  : 'Due'
            },
            order: [
                ['supplier_payment_date', 'ASC']
            ]
        });

        const purchase_return_data = await purchase_return_model.findOne({
            attributes: [
                
                [sequelize.literal('(SUM(purchase_return_payable_amount))'),'purchase_return_amount']
            ],
            where:{
                purchase_return_company        : company,
                ...(branch == 'all' ?{}:{ purchase_return_branch : branch}),
                purchase_return_date           : {[Op.between]: [from_date, to_date]},
                purchase_return_status         : 1,
                purchase_return_delete_status  : 0,
            },
            order: [
                ['purchase_return_date', 'ASC']
            ]
        });

        const purchase_return_payment_data = await supplier_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_return_paid))'),'return_paid_amount']
            ],
            where:{
                supplier_payment_return_company        : company,
                ...(branch == 'all' ?{}:{ supplier_payment_return_branch : branch}),
                supplier_payment_return_date           : {[Op.between]: [from_date, to_date]},
                supplier_payment_return_status         : 1,
                supplier_payment_return_delete_status  : 0,
                supplier_payment_return_type  : 'Return'
            },
            order: [
                ['supplier_payment_return_date', 'ASC']
            ]
        });

        const purchase_return_due_payment_data = await supplier_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_return_paid))'),'return_due_payment']
            ],
            where:{
                supplier_payment_return_company        : company,
                ...(branch == 'all' ?{}:{ supplier_payment_return_branch : branch}),
                supplier_payment_return_date           : {[Op.between]: [from_date, to_date]},
                supplier_payment_return_status         : 1,
                supplier_payment_return_delete_status  : 0,
                supplier_payment_return_type  : 'Due'
            },
            order: [
                ['supplier_payment_return_date', 'ASC']
            ]
        });

        const purchase = {
            purchase_amount             : parseFloat(purchase_data.dataValues.purchase_amount || 0).toFixed(2),
            purchase_paid_amount        : parseFloat(purchase_payment_data.dataValues.paid_amount || 0).toFixed(2),
            purchase_due_amount         : parseFloat(parseFloat(purchase_data.dataValues.purchase_amount || 0)-parseFloat(purchase_payment_data.dataValues.paid_amount || 0)).toFixed(2),
            purchase_due_payment        : parseFloat(purchase_due_payment_data.dataValues.due_payment || 0).toFixed(2),

            purchase_return_amount      : parseFloat(purchase_return_data.dataValues.purchase_return_amount || 0).toFixed(2),
            purchase_return_paid_amount : parseFloat(purchase_return_payment_data.dataValues.return_paid_amount || 0).toFixed(2),
            purchase_return_due_amount  : parseFloat(parseFloat(purchase_return_data.dataValues.purchase_return_amount || 0)-parseFloat(purchase_return_payment_data.dataValues.return_paid_amount || 0)).toFixed(2),
            purchase_return_due_payment : parseFloat(purchase_return_due_payment_data.dataValues.return_due_payment || 0).toFixed(2),
        }

        return res.send({
            status  : "1",
            message : "Purchase Balance Branch Find Successfully !",
            data    : purchase
        });

    } catch (error) {
        res .send(
        {
            status: "0",
            message: error.message,
            data: "",
        });
    }
};