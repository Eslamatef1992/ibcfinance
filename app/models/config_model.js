const db                    = require("../models");
const bcrypt                = require("bcryptjs");

const user_model            = db.user_model;
const user_group_model      = db.user_group_model
const system_model          = db.system_model;
const accounts_type_model   = db.accounts_type_model;
const voucher_type_model    = db.voucher_type_model;
const company_package_model = db.company_package_model;
const status_model          = db.status_model;

db.sequelize.sync().then(() => {initial()});

async function initial () {
    const user_check = await user_model.findOne();
    if(!user_check) {
        await user_model.create({
            user_name       : 'Super Admin',
            username_id_number  : "1",
            username        : "sadmin",
            password        : bcrypt.hashSync('123456', 10),
            password_show   : '123456',
            user_designation: 'Super Admin',
            user_phone      : '',
            user_email      : '',
            user_address    : '',
            user_company    : '0',
            user_branch     : '0',
            user_user_group : '1',
            user_status     : '1',
            user_language   : 'en',
            user_theme      : 'blue',
        })
    }
    
    const user_group_check = await user_group_model.findOne();
    if(!user_group_check) {
        await user_group_model.bulkCreate([
            {
                user_group_code: 'Super Admin',
                user_group_name: 'Super Admin',
                user_group_status: '1',
            },
            {
                user_group_code: 'Admin',
                user_group_name: 'Admin',
                user_group_status: '1',
            },
            {
                user_group_code: 'Company Admin',
                user_group_name: 'Company Admin',
                user_group_status: '1',
            },
            {
                user_group_code: 'Branch Manager',
                user_group_name: 'Branch Manager',
                user_group_status: '1',
            },
            {
                user_group_code: 'Sales & Purchase',
                user_group_name: 'Sales & Purchase',
                user_group_status: '1',
            },
            {
                user_group_code: 'Sales',
                user_group_name: 'Sales',
                user_group_status: '1',
            },
            {
                user_group_code: 'Purchase',
                user_group_name: 'Purchase',
                user_group_status: '1',
            },
            {
                user_group_code: 'Accounts',
                user_group_name: 'Accounts',
                user_group_status: '1',
            }
        ])
    }

    const system_check = await system_model.findOne();
    if(!system_check) {
        await system_model.create({
            system_title    : "SS Inventory Manager (SIM)",
            system_name     : "SS Inventory Manager",
            system_address  : "",
            system_phone    : "",
            system_email    : "",
            system_website  : "",
            system_picture  : 'assets/images/logo/logo.png',
        })
    }

    const accounts_type_check = await accounts_type_model.findOne();
    if(!accounts_type_check) {
        await accounts_type_model.bulkCreate([
            {
                accounts_type_id        : '10000000',
                accounts_type_code      : '10000000',
                accounts_type_name      : 'Assets',
                accounts_type_status    : '1',
            },
            {
                accounts_type_id        : '20000000',
                accounts_type_code      : '20000000',
                accounts_type_name      : 'Funds & Liabilities',
                accounts_type_status    : '1',
            },
            {
                accounts_type_id        : '30000000',
                accounts_type_code      : '30000000',
                accounts_type_name      : 'Income / Revenue',
                accounts_type_status    : '1',
            },
            {
                accounts_type_id        : '40000000',
                accounts_type_code      : '40000000',
                accounts_type_name      : 'Expenditure',
                accounts_type_status    : '1',
            }
        ])
    }

    const voucher_type_check = await voucher_type_model.findOne();
    if(!voucher_type_check) {
        await voucher_type_model.bulkCreate([
            {
                voucher_type_code      : 'RV',
                voucher_type_name      : 'Receipt Voucher',
                voucher_type_status    : '1',
            },
            {
                voucher_type_code      : 'PV',
                voucher_type_name      : 'Payment Voucher',
                voucher_type_status    : '1',
            },
            {
                voucher_type_code      : 'JV',
                voucher_type_name      : 'Journal Voucher',
                voucher_type_status    : '1',
            },
            {
                voucher_type_code      : 'CV',
                voucher_type_name      : 'Contra Voucher',
                voucher_type_status    : '1',
            }
        ])
    }

    const company_package_check = await company_package_model.findOne();
    if(!company_package_check) {
        await company_package_model.create({
            company_package_code: 'Free',
            company_package_name: 'Free',
            company_package_status: '1',
        })
    }

    const status_check = await status_model.findOne();
    if(!status_check) {
        await status_model.bulkCreate([
            {
            status_id: '0',
            status_code: 'I',
            status_name: 'Inactive',
            status_status: '1',
            },
            {
            status_id: '1',
            status_code: 'A',
            status_name: 'Active',
            status_status: '1',
            }
        ])
    }
}

module.exports = db;