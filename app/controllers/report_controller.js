require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models");
const config = require("../config/config");
const otp_generator = require("otp-generator");
const nodemailer = require("nodemailer");

const company_model = db.company_model;
const branch_model = db.branch_model;
const chart_of_accounts_model = db.chart_of_accounts_model;
const purchase_model = db.purchase_model;
const purchase_return_model = db.purchase_return_model;
const sales_model = db.sales_model;
const sales_return_model = db.sales_return_model;
const supplier_model = db.supplier_model;
const customer_model = db.customer_model;
const supplier_payment_model = db.supplier_payment_model;
const customer_payment_model = db.customer_payment_model;
const supplier_payment_return_model = db.supplier_payment_return_model;
const customer_payment_return_model = db.customer_payment_return_model;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
let user_id;

// Summary Report
exports.summary_report = async (req, res) => {
    try {
        const company_info = await company_model.findOne({
            where: {
                company_id: req.query.company
            }
        });
        const company_data = {
            company_name: company_info.company_name,
            company_owner_name: company_info.company_owner_name,
            company_phone: company_info.company_phone,
            company_email: company_info.company_email,
            company_website: company_info.company_website,
            company_address: company_info.company_address,
            company_opening_date: company_info.company_opening_date,
            company_picture: company_info.company_picture === null ? '' : `${process.env.BASE_URL}/${company_info.company_picture}`,
        };

        const branch_info = await branch_model.findOne({
            where: {
                branch_id: req.query.branch || 'all'
            }
        });
        const branch_data = {
            branch_code: branch_info <= 0 ? '' : branch_info.branch_code,
            branch_name: branch_info <= 0 ? '' : branch_info.branch_name,
            branch_phone: branch_info <= 0 ? '' : branch_info.branch_phone,
            branch_email: branch_info <= 0 ? '' : branch_info.branch_email,
            branch_address: branch_info <= 0 ? '' : branch_info.branch_address,
            branch_opening_date: branch_info <= 0 ? '' : branch_info.branch_opening_date,
            project_owner: branch_info <= 0 ? '' : branch_info.project_owner,
            type_of_work: branch_info <= 0 ? '' : branch_info.type_of_work,
            contract_value: branch_info <= 0 ? '' : branch_info.contract_value,
            milestore: branch_info <= 0 ? '' : branch_info.milestore,
            commencement_date: branch_info <= 0 ? '' : branch_info.commencement_date,
            handing_over_date: branch_info <= 0 ? '' : branch_info.handing_over_date,
            percentage_of_claiming_invoice: branch_info <= 0 ? '' : branch_info.percentage_of_claiming_invoice,
            attachment: branch_info <= 0 ? '' : branch_info.attachment,
            attach_quotation_and_invoice: branch_info <= 0 ? '' : branch_info.attach_quotation_and_invoice,
        };

        const purchase_data = await purchase_model.findOne({
            attributes: [

                [sequelize.literal('(SUM(purchase_payable_amount))'), 'purchase_amount']
            ],
            where: {
                purchase_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { purchase_branch: req.query.branch }),
                purchase_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                purchase_status: 1,
                purchase_delete_status: 0,
            },
            order: [
                ['purchase_date', 'ASC']
            ]
        });

        const purchase_payment_data = await supplier_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_paid))'), 'paid_amount']
            ],
            where: {
                supplier_payment_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { supplier_payment_branch: req.query.branch }),
                supplier_payment_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                supplier_payment_status: 1,
                supplier_payment_delete_status: 0,
                supplier_payment_type: 'Purchase'
            },
            order: [
                ['supplier_payment_date', 'ASC']
            ]
        });

        const purchase_due_payment_data = await supplier_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_paid))'), 'due_payment']
            ],
            where: {
                supplier_payment_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { supplier_payment_branch: req.query.branch }),
                supplier_payment_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                supplier_payment_status: 1,
                supplier_payment_delete_status: 0,
                supplier_payment_type: 'Due'
            },
            order: [
                ['supplier_payment_date', 'ASC']
            ]
        });

        const purchase_return_data = await purchase_return_model.findOne({
            attributes: [

                [sequelize.literal('(SUM(purchase_return_payable_amount))'), 'purchase_return_amount']
            ],
            where: {
                purchase_return_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { purchase_return_branch: req.query.branch }),
                purchase_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                purchase_return_status: 1,
                purchase_return_delete_status: 0,
            },
            order: [
                ['purchase_return_date', 'ASC']
            ]
        });

        const purchase_return_payment_data = await supplier_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_return_paid))'), 'return_paid_amount']
            ],
            where: {
                supplier_payment_return_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { supplier_payment_return_branch: req.query.branch }),
                supplier_payment_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                supplier_payment_return_status: 1,
                supplier_payment_return_delete_status: 0,
                supplier_payment_return_type: 'Return'
            },
            order: [
                ['supplier_payment_return_date', 'ASC']
            ]
        });

        const purchase_return_due_payment_data = await supplier_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(supplier_payment_return_paid))'), 'return_due_payment']
            ],
            where: {
                supplier_payment_return_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { supplier_payment_return_branch: req.query.branch }),
                supplier_payment_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                supplier_payment_return_status: 1,
                supplier_payment_return_delete_status: 0,
                supplier_payment_return_type: 'Due'
            },
            order: [
                ['supplier_payment_return_date', 'ASC']
            ]
        });

        const sales_data = await sales_model.findOne({
            attributes: [

                [sequelize.literal('(SUM(sales_payable_amount))'), 'sales_amount']
            ],
            where: {
                sales_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { sales_branch: req.query.branch }),
                sales_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                sales_status: 1,
                sales_delete_status: 0,
            },
            order: [
                ['sales_date', 'ASC']
            ]
        });

        const sales_payment_data = await customer_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_paid))'), 'paid_amount']
            ],
            where: {
                customer_payment_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { customer_payment_branch: req.query.branch }),
                customer_payment_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                customer_payment_status: 1,
                customer_payment_delete_status: 0,
                customer_payment_type: 'Sales'
            },
            order: [
                ['customer_payment_date', 'ASC']
            ]
        });

        const sales_due_payment_data = await customer_payment_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_paid))'), 'due_payment']
            ],
            where: {
                customer_payment_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { customer_payment_branch: req.query.branch }),
                customer_payment_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                customer_payment_status: 1,
                customer_payment_delete_status: 0,
                customer_payment_type: 'Due'
            },
            order: [
                ['customer_payment_date', 'ASC']
            ]
        });

        const sales_return_data = await sales_return_model.findOne({
            attributes: [

                [sequelize.literal('(SUM(sales_return_payable_amount))'), 'sales_return_amount']
            ],
            where: {
                sales_return_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { sales_return_branch: req.query.branch }),
                sales_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                sales_return_status: 1,
                sales_return_delete_status: 0,
            },
            order: [
                ['sales_return_date', 'ASC']
            ]
        });

        const sales_return_payment_data = await customer_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_return_paid))'), 'return_paid_amount']
            ],
            where: {
                customer_payment_return_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { customer_payment_return_branch: req.query.branch }),
                customer_payment_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                customer_payment_return_status: 1,
                customer_payment_return_delete_status: 0,
                customer_payment_return_type: 'Return'
            },
            order: [
                ['customer_payment_return_date', 'ASC']
            ]
        });

        const sales_return_due_payment_data = await customer_payment_return_model.findOne({
            attributes: [
                [sequelize.literal('(SUM(customer_payment_return_paid))'), 'return_due_payment']
            ],
            where: {
                customer_payment_return_company: req.query.company,
                ...(req.query.branch == 'all' ? {} : { customer_payment_return_branch: req.query.branch }),
                customer_payment_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                customer_payment_return_status: 1,
                customer_payment_return_delete_status: 0,
                customer_payment_return_type: 'Due'
            },
            order: [
                ['customer_payment_return_date', 'ASC']
            ]
        });

        const purchase = {
            purchase_amount: parseFloat(purchase_data.dataValues.purchase_amount || 0).toFixed(2),
            purchase_paid_amount: parseFloat(purchase_payment_data.dataValues.paid_amount || 0).toFixed(2),
            purchase_due_amount: parseFloat(parseFloat(purchase_data.dataValues.purchase_amount || 0) - parseFloat(purchase_payment_data.dataValues.paid_amount || 0)).toFixed(2),
            purchase_due_payment: parseFloat(purchase_due_payment_data.dataValues.due_payment || 0).toFixed(2),

            purchase_return_amount: parseFloat(purchase_return_data.dataValues.purchase_return_amount || 0).toFixed(2),
            purchase_return_paid_amount: parseFloat(purchase_return_payment_data.dataValues.return_paid_amount || 0).toFixed(2),
            purchase_return_due_amount: parseFloat(parseFloat(purchase_return_data.dataValues.purchase_return_amount || 0) - parseFloat(purchase_return_payment_data.dataValues.return_paid_amount || 0)).toFixed(2),
            purchase_return_due_payment: parseFloat(purchase_return_due_payment_data.dataValues.return_due_payment || 0).toFixed(2),
        }

        const sales = {
            sales_amount: parseFloat(sales_data.dataValues.sales_amount || 0).toFixed(2),
            sales_paid_amount: parseFloat(sales_payment_data.dataValues.paid_amount || 0).toFixed(2),
            sales_due_amount: parseFloat(parseFloat(sales_data.dataValues.sales_amount || 0) - parseFloat(sales_payment_data.dataValues.paid_amount || 0)).toFixed(2),
            sales_due_payment: parseFloat(sales_due_payment_data.dataValues.due_payment || 0).toFixed(2),

            sales_return_amount: parseFloat(sales_return_data.dataValues.sales_return_amount || 0).toFixed(2),
            sales_return_paid_amount: parseFloat(sales_return_payment_data.dataValues.return_paid_amount || 0).toFixed(2),
            sales_return_due_amount: parseFloat(parseFloat(sales_return_data.dataValues.sales_return_amount || 0) - parseFloat(sales_return_payment_data.dataValues.return_paid_amount || 0)).toFixed(2),
            sales_return_due_payment: parseFloat(sales_return_due_payment_data.dataValues.return_due_payment || 0).toFixed(2),
        }

        const getReceiptAmount = async (type) => {
            let data = 0;
            if (type == 'cash') {
                const cash_bank_data = await chart_of_accounts_model.findOne({
                    where: {
                        chart_of_accounts_company: req.query.company,
                        chart_of_accounts_accounts_link: 'cash_in_hand',
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0
                    }
                });
                data = cash_bank_data.chart_of_accounts_id;
            } else if (type == 'bank') {
                const cash_bank_data = await chart_of_accounts_model.findOne({
                    where: {
                        chart_of_accounts_company: req.query.company,
                        chart_of_accounts_accounts_link: 'cash_at_bank',
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0
                    }
                });
                data = cash_bank_data.chart_of_accounts_id;
            }

            const sales_payment_data = await customer_payment_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(customer_payment_paid))'), 'paid_amount']
                ],
                where: {
                    customer_payment_company: req.query.company,
                    ...(req.query.branch == 'all' ? {} : { customer_payment_branch: req.query.branch }),
                    customer_payment_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                    customer_payment_status: 1,
                    customer_payment_delete_status: 0,
                    customer_payment_sales_payment_type: data,
                    customer_payment_type: 'Sales'
                },
                order: [
                    ['customer_payment_date', 'ASC']
                ]
            });

            const sales_due_payment_data = await customer_payment_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(customer_payment_paid))'), 'due_payment']
                ],
                where: {
                    customer_payment_company: req.query.company,
                    ...(req.query.branch == 'all' ? {} : { customer_payment_branch: req.query.branch }),
                    customer_payment_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                    customer_payment_status: 1,
                    customer_payment_delete_status: 0,
                    customer_payment_sales_payment_type: data,
                    customer_payment_type: 'Due'
                },
                order: [
                    ['customer_payment_date', 'ASC']
                ]
            });

            const purchase_return_payment_data = await supplier_payment_return_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(supplier_payment_return_paid))'), 'return_paid_amount']
                ],
                where: {
                    supplier_payment_return_company: req.query.company,
                    ...(req.query.branch == 'all' ? {} : { supplier_payment_return_branch: req.query.branch }),
                    supplier_payment_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                    supplier_payment_return_status: 1,
                    supplier_payment_return_delete_status: 0,
                    supplier_payment_return_purchase_payment_type: data,
                    supplier_payment_return_type: 'Return'
                },
                order: [
                    ['supplier_payment_return_date', 'ASC']
                ]
            });

            const purchase_return_due_payment_data = await supplier_payment_return_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(supplier_payment_return_paid))'), 'return_due_payment']
                ],
                where: {
                    supplier_payment_return_company: req.query.company,
                    ...(req.query.branch == 'all' ? {} : { supplier_payment_return_branch: req.query.branch }),
                    supplier_payment_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                    supplier_payment_return_status: 1,
                    supplier_payment_return_delete_status: 0,
                    supplier_payment_return_purchase_payment_type: data,
                    supplier_payment_return_type: 'Due'
                },
                order: [
                    ['supplier_payment_return_date', 'ASC']
                ]
            });

            const return_Data = parseFloat(
                parseFloat(sales_payment_data.dataValues.paid_amount || 0)
                + parseFloat(sales_due_payment_data.dataValues.due_payment || 0)
                + parseFloat(purchase_return_payment_data.dataValues.return_paid_amount || 0)
                + parseFloat(purchase_return_due_payment_data.dataValues.return_due_payment || 0)
            ).toFixed(2);

            return return_Data;
        }

        const getPaymentAmount = async (type) => {
            let data = 0;
            if (type == 'cash') {
                const cash_bank_data = await chart_of_accounts_model.findOne({
                    where: {
                        chart_of_accounts_company: req.query.company,
                        chart_of_accounts_accounts_link: 'cash_in_hand',
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0
                    }
                });
                data = cash_bank_data.chart_of_accounts_id;
            } else if (type == 'bank') {
                const cash_bank_data = await chart_of_accounts_model.findOne({
                    where: {
                        chart_of_accounts_company: req.query.company,
                        chart_of_accounts_accounts_link: 'cash_at_bank',
                        chart_of_accounts_status: 1,
                        chart_of_accounts_delete_status: 0
                    }
                });
                data = cash_bank_data.chart_of_accounts_id;
            }

            const purchase_payment_data = await supplier_payment_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(supplier_payment_paid))'), 'paid_amount']
                ],
                where: {
                    supplier_payment_company: req.query.company,
                    ...(req.query.branch == 'all' ? {} : { supplier_payment_branch: req.query.branch }),
                    supplier_payment_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                    supplier_payment_status: 1,
                    supplier_payment_delete_status: 0,
                    supplier_payment_purchase_payment_type: data,
                    supplier_payment_type: 'Purchase'
                },
                order: [
                    ['supplier_payment_date', 'ASC']
                ]
            });

            const purchase_due_payment_data = await supplier_payment_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(supplier_payment_paid))'), 'due_payment']
                ],
                where: {
                    supplier_payment_company: req.query.company,
                    ...(req.query.branch == 'all' ? {} : { supplier_payment_branch: req.query.branch }),
                    supplier_payment_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                    supplier_payment_status: 1,
                    supplier_payment_delete_status: 0,
                    supplier_payment_purchase_payment_type: data,
                    supplier_payment_type: 'Due'
                },
                order: [
                    ['supplier_payment_date', 'ASC']
                ]
            });

            const sales_return_payment_data = await customer_payment_return_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(customer_payment_return_paid))'), 'return_paid_amount']
                ],
                where: {
                    customer_payment_return_company: req.query.company,
                    ...(req.query.branch == 'all' ? {} : { customer_payment_return_branch: req.query.branch }),
                    customer_payment_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                    customer_payment_return_status: 1,
                    customer_payment_return_delete_status: 0,
                    customer_payment_return_sales_payment_type: data,
                    customer_payment_return_type: 'Return'
                },
                order: [
                    ['customer_payment_return_date', 'ASC']
                ]
            });

            const sales_return_due_payment_data = await customer_payment_return_model.findOne({
                attributes: [
                    [sequelize.literal('(SUM(customer_payment_return_paid))'), 'return_due_payment']
                ],
                where: {
                    customer_payment_return_company: req.query.company,
                    ...(req.query.branch == 'all' ? {} : { customer_payment_return_branch: req.query.branch }),
                    customer_payment_return_date: { [Op.between]: [req.query.from_date, req.query.to_date] },
                    customer_payment_return_status: 1,
                    customer_payment_return_delete_status: 0,
                    customer_payment_return_sales_payment_type: data,
                    customer_payment_return_type: 'Due'
                },
                order: [
                    ['customer_payment_return_date', 'ASC']
                ]
            });

            const return_Data = parseFloat(
                parseFloat(purchase_payment_data.dataValues.paid_amount || 0)
                + parseFloat(purchase_due_payment_data.dataValues.due_payment || 0)
                + parseFloat(sales_return_payment_data.dataValues.return_paid_amount || 0)
                + parseFloat(sales_return_due_payment_data.dataValues.return_due_payment || 0)
            ).toFixed(2);

            return return_Data;
        }

        const cash_receipt = parseFloat(
            await getReceiptAmount('cash')
        ).toFixed(2);

        const bank_receipt = parseFloat(
            await getReceiptAmount('bank')
        ).toFixed(2);

        const cash_payment = parseFloat(
            await getPaymentAmount('cash')
        ).toFixed(2);
        const bank_payment = parseFloat(
            await getPaymentAmount('bank')
        ).toFixed(2);

        const receipt_payment = {
            receipt: {
                cash: cash_receipt,
                bank: bank_receipt
            },
            payment: {
                cash: cash_payment,
                bank: bank_payment
            }
        }
        const receipt_payment_amount = {
            total_receipt_amount: parseFloat(parseFloat(cash_receipt) + parseFloat(bank_receipt)).toFixed(2),
            total_payment_amount: parseFloat(parseFloat(cash_payment) + parseFloat(bank_payment)).toFixed(2),
        }

        const cash_bank_need = parseFloat(
            (parseFloat(cash_payment) + parseFloat(bank_payment))
            -
            (parseFloat(cash_receipt) + parseFloat(bank_receipt))
        ).toFixed(2);

        const fund_need = {
            cash: parseFloat(cash_bank_need >= 0 ? cash_bank_need : 0).toFixed(2),
            bank: parseFloat(0).toFixed(2),
        }

        return res.send({
            status: "1",
            message: "Summary Report Find Successfully!",
            data: {
                purchase: purchase,
                sales: sales,
                receipt_payment: receipt_payment,
                receipt_payment_amount: receipt_payment_amount,
                fund_need: fund_need,
            },
            company: company_data,
            branch: branch_data
        });

    } catch (error) {
        res.send(
            {
                status: "0",
                message: error.message,
                data: {
                    purchase: '',
                    sales: '',
                    receipt_payment: '',
                    receipt_payment_amount: '',
                },
                company: '',
                branch: '',
            });
    }
};