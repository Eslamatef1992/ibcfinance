require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models");
const config = require("../config/config");
const otp_generator = require("otp-generator");
const nodemailer = require("nodemailer");

const product_model = db.product_model;
const product_category_model = db.product_category_model;
const product_brand_model = db.product_brand_model;
const product_type_model = db.product_type_model;
const product_unit_model = db.product_unit_model;
const company_model = db.company_model;
const branch_model = db.branch_model;
const Op = db.Sequelize.Op;
let user_id;

// Product List
exports.product_list = async (req, res) => {
    try {
        const product = await product_model.findAll({
            include: [
                {
                    model: product_category_model,
                    attributes: ['product_category_code', 'product_category_name'],
                    association: product_model.hasOne(product_category_model, {
                        foreignKey: 'product_category_id',
                        sourceKey: "product_product_category",
                        required: false
                    })
                },
                {
                    model: product_brand_model,
                    attributes: ['product_brand_code', 'product_brand_name'],
                    association: product_model.hasOne(product_brand_model, {
                        foreignKey: 'product_brand_id',
                        sourceKey: "product_product_brand",
                        required: false
                    })
                },
                {
                    model: product_type_model,
                    attributes: ['product_type_code', 'product_type_name'],
                    association: product_model.hasOne(product_type_model, {
                        foreignKey: 'product_type_id',
                        sourceKey: "product_product_type",
                        required: false
                    })
                },
                {
                    model: product_unit_model,
                    attributes: ['product_unit_code', 'product_unit_name'],
                    association: product_model.hasOne(product_unit_model, {
                        foreignKey: 'product_unit_id',
                        sourceKey: "product_product_unit",
                        required: false
                    })
                }
            ],
            where: {
                product_company: req.query.company,
                product_delete_status: 0,
                ...(req.query.status == 'all' ? {} : {
                    product_status: req.query.status
                }),
                ...(req.query.search.length > 0 ? {
                    [Op.or]: [
                        {
                            product_code: { [Op.like]: `%${req.query.search}%` }
                        },
                        {
                            product_name: { [Op.like]: `%${req.query.search}%` }
                        }
                    ]
                } : {})
            },
            order: [
                ['product_code', 'ASC']
            ]
        });

        if (product.length > 0) {
            const product_data = await Promise.all(product.map(async (row) => ({
                product_id: row.product_id,
                product_company: row.product_company,
                product_code: row.product_code,
                product_barcode: row.product_barcode,
                product_model: row.product_model,
                product_name: row.product_name,
                product_description: row.product_description,
                product_category: row.product_product_category,
                product_category_code: row.product_category !== null || 0 ? row.product_category.product_category_code : '',
                product_category_name: row.product_category !== null || 0 ? row.product_category.product_category_name : '',
                product_brand: row.product_product_brand,
                product_brand_code: row.product_brand !== null || 0 ? row.product_brand.product_brand_code : '',
                product_brand_name: row.product_brand !== null || 0 ? row.product_brand.product_brand_name : '',
                product_type: row.product_product_type,
                product_type_code: row.product_type !== null || 0 ? row.product_type.product_type_code : '',
                product_type_name: row.product_type !== null || 0 ? row.product_type.product_type_name : '',
                product_unit: row.product_product_unit,
                product_unit_code: row.product_unit !== null || 0 ? row.product_unit.product_unit_code : '',
                product_unit_name: row.product_unit !== null || 0 ? row.product_unit.product_unit_name : '',
                product_unit_price: row.product_unit_price,
                product_purchase_price: row.product_purchase_price,
                product_sales_price: row.product_sales_price,
                product_purchase_discount: row.product_purchase_discount,
                product_sales_discount: row.product_sales_discount,
                product_purchase_tax: row.product_purchase_tax,
                product_sales_tax: row.product_sales_tax,
                product_purchase_vat: row.product_purchase_vat,
                product_sales_vat: row.product_sales_vat,
                product_purchase_quantity: row.product_purchase_quantity,
                product_return_quantity: row.product_return_quantity,
                product_sales_quantity: row.product_sales_quantity,
                product_sales_return_quantity: row.product_sales_return_quantity,
                product_stock_quantity: row.product_stock_quantity,
                product_picture: row.product_picture === null ? '' : `${process.env.BASE_URL}/${row.product_picture}`,
                product_status: row.product_status
            })));

            return res.send({
                status: "1",
                message: "Product Find Successfully!",
                data: product_data
            });
        }

        return res.send({
            status: "0",
            message: "Product Not Found !",
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

// Product List Active
exports.product_list_active = async (req, res) => {
    try {
        const product = await product_model.findAll({
            include: [
                {
                    model: product_category_model,
                    attributes: ['product_category_code', 'product_category_name'],
                    association: product_model.hasOne(product_category_model, {
                        foreignKey: 'product_category_id',
                        sourceKey: "product_product_category",
                        required: false
                    })
                },
                {
                    model: product_brand_model,
                    attributes: ['product_brand_code', 'product_brand_name'],
                    association: product_model.hasOne(product_brand_model, {
                        foreignKey: 'product_brand_id',
                        sourceKey: "product_product_brand",
                        required: false
                    })
                },
                {
                    model: product_type_model,
                    attributes: ['product_type_code', 'product_type_name'],
                    association: product_model.hasOne(product_type_model, {
                        foreignKey: 'product_type_id',
                        sourceKey: "product_product_type",
                        required: false
                    })
                },
                {
                    model: product_unit_model,
                    attributes: ['product_unit_code', 'product_unit_name'],
                    association: product_model.hasOne(product_unit_model, {
                        foreignKey: 'product_unit_id',
                        sourceKey: "product_product_unit",
                        required: false
                    })
                }
            ],
            where: {
                product_company: req.params.company,
                product_status: 1,
                product_delete_status: 0
            },
            order: [
                ['product_code', 'ASC']
            ]
        });

        if (product.length > 0) {
            const product_data = await Promise.all(product.map(async (row) => ({
                product_id: row.product_id,
                product_company: row.product_company,
                product_code: row.product_code,
                product_barcode: row.product_barcode,
                product_model: row.product_model,
                product_name: row.product_name,
                product_description: row.product_description,
                product_category: row.product_product_category,
                product_category_code: row.product_category !== null || 0 ? row.product_category.product_category_code : '',
                product_category_name: row.product_category !== null || 0 ? row.product_category.product_category_name : '',
                product_brand: row.product_product_brand,
                product_brand_code: row.product_brand !== null || 0 ? row.product_brand.product_brand_code : '',
                product_brand_name: row.product_brand !== null || 0 ? row.product_brand.product_brand_name : '',
                product_type: row.product_product_type,
                product_type_code: row.product_type !== null || 0 ? row.product_type.product_type_code : '',
                product_type_name: row.product_type !== null || 0 ? row.product_type.product_type_name : '',
                product_unit: row.product_product_unit,
                product_unit_code: row.product_unit !== null || 0 ? row.product_unit.product_unit_code : '',
                product_unit_name: row.product_unit !== null || 0 ? row.product_unit.product_unit_name : '',
                product_unit_price: row.product_unit_price,
                product_purchase_price: row.product_purchase_price,
                product_sales_price: row.product_sales_price,
                product_purchase_discount: row.product_purchase_discount,
                product_sales_discount: row.product_sales_discount,
                product_purchase_tax: row.product_purchase_tax,
                product_sales_tax: row.product_sales_tax,
                product_purchase_vat: row.product_purchase_vat,
                product_sales_vat: row.product_sales_vat,
                product_purchase_quantity: row.product_purchase_quantity,
                product_return_quantity: row.product_return_quantity,
                product_sales_quantity: row.product_sales_quantity,
                product_sales_return_quantity: row.product_sales_return_quantity,
                product_stock_quantity: row.product_stock_quantity,
                product_picture: row.product_picture === null ? '' : `${process.env.BASE_URL}/${row.product_picture}`,
                product_status: row.product_status
            })));

            return res.send({
                status: "1",
                message: "Product Find Successfully!",
                data: product_data
            });
        }
        return res.send({
            status: "0",
            message: "Product Not Found !",
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

// Product Search
exports.product_search = async (req, res) => {
    try {
        const product = await product_model.findAll({
            include: [
                {
                    model: product_category_model,
                    attributes: ['product_category_code', 'product_category_name'],
                    association: product_model.hasOne(product_category_model, {
                        foreignKey: 'product_category_id',
                        sourceKey: "product_product_category",
                        required: false
                    })
                },
                {
                    model: product_brand_model,
                    attributes: ['product_brand_code', 'product_brand_name'],
                    association: product_model.hasOne(product_brand_model, {
                        foreignKey: 'product_brand_id',
                        sourceKey: "product_product_brand",
                        required: false
                    })
                },
                {
                    model: product_type_model,
                    attributes: ['product_type_code', 'product_type_name'],
                    association: product_model.hasOne(product_type_model, {
                        foreignKey: 'product_type_id',
                        sourceKey: "product_product_type",
                        required: false
                    })
                },
                {
                    model: product_unit_model,
                    attributes: ['product_unit_code', 'product_unit_name'],
                    association: product_model.hasOne(product_unit_model, {
                        foreignKey: 'product_unit_id',
                        sourceKey: "product_product_unit",
                        required: false
                    })
                }
            ],
            where: {
                product_company: req.query.company,
                product_status: 1,
                product_delete_status: 0,
                ...(req.query.search.length > 0 ? {
                    [Op.or]: [
                        {
                            product_code: { [Op.like]: `%${req.query.search}%` }
                        },
                        {
                            product_name: { [Op.like]: `%${req.query.search}%` }
                        }
                    ]
                } : {})
            },
            order: [
                ['product_code', 'ASC']
            ]
        });

        if (product.length > 0) {
            const product_data = await Promise.all(product.map(async (row) => ({
                product_id: row.product_id,
                product_company: row.product_company,
                product_code: row.product_code,
                product_barcode: row.product_barcode,
                product_model: row.product_model,
                product_name: row.product_name,
                product_description: row.product_description,
                product_category: row.product_product_category,
                product_category_code: row.product_category !== null || 0 ? row.product_category.product_category_code : '',
                product_category_name: row.product_category !== null || 0 ? row.product_category.product_category_name : '',
                product_brand: row.product_product_brand,
                product_brand_code: row.product_brand !== null || 0 ? row.product_brand.product_brand_code : '',
                product_brand_name: row.product_brand !== null || 0 ? row.product_brand.product_brand_name : '',
                product_type: row.product_product_type,
                product_type_code: row.product_type !== null || 0 ? row.product_type.product_type_code : '',
                product_type_name: row.product_type !== null || 0 ? row.product_type.product_type_name : '',
                product_unit: row.product_product_unit,
                product_unit_code: row.product_unit !== null || 0 ? row.product_unit.product_unit_code : '',
                product_unit_name: row.product_unit !== null || 0 ? row.product_unit.product_unit_name : '',
                product_unit_price: row.product_unit_price,
                product_purchase_price: row.product_purchase_price,
                product_sales_price: row.product_sales_price,
                product_purchase_discount: row.product_purchase_discount,
                product_sales_discount: row.product_sales_discount,
                product_purchase_tax: row.product_purchase_tax,
                product_sales_tax: row.product_sales_tax,
                product_purchase_vat: row.product_purchase_vat,
                product_sales_vat: row.product_sales_vat,
                product_purchase_quantity: row.product_purchase_quantity,
                product_return_quantity: row.product_return_quantity,
                product_sales_return_quantity: row.product_sales_return_quantity,
                product_sales_quantity: row.product_sales_quantity,
                product_stock_quantity: row.product_stock_quantity,
                product_picture: row.product_picture === null ? '' : `${process.env.BASE_URL}/${row.product_picture}`,
                product_status: row.product_status
            })));

            return res.send({
                status: "1",
                message: "Product Find Successfully!",
                data: product_data
            });
        }
        return res.send({
            status: "0",
            message: "Product Not Found !",
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

// Get Product
exports.get_product = async (req, res) => {
    try {
        const data = await product_model.findOne({
            include: [
                {
                    model: product_category_model,
                    attributes: ['product_category_code', 'product_category_name'],
                    association: product_model.hasOne(product_category_model, {
                        foreignKey: 'product_category_id',
                        sourceKey: "product_product_category",
                        required: false
                    })
                },
                {
                    model: product_brand_model,
                    attributes: ['product_brand_code', 'product_brand_name'],
                    association: product_model.hasOne(product_brand_model, {
                        foreignKey: 'product_brand_id',
                        sourceKey: "product_product_brand",
                        required: false
                    })
                },
                {
                    model: product_type_model,
                    attributes: ['product_type_code', 'product_type_name'],
                    association: product_model.hasOne(product_type_model, {
                        foreignKey: 'product_type_id',
                        sourceKey: "product_product_type",
                        required: false
                    })
                },
                {
                    model: product_unit_model,
                    attributes: ['product_unit_code', 'product_unit_name'],
                    association: product_model.hasOne(product_unit_model, {
                        foreignKey: 'product_unit_id',
                        sourceKey: "product_product_unit",
                        required: false
                    })
                }
            ],
            where: {
                product_id: req.params.product_id
            },
        });

        if (!data) {
            return res.send({
                status: "0",
                message: "Product Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Product Find Successfully!",
            data: {
                product_id: data.product_id,
                product_company: data.product_company,
                product_code: data.product_code,
                product_barcode: data.product_barcode,
                product_model: data.product_model,
                product_name: data.product_name,
                product_description: data.product_description,
                product_category: data.product_product_category,
                product_category_code: data.product_category !== null || 0 ? data.product_category.product_category_code : '',
                product_category_name: data.product_category !== null || 0 ? data.product_category.product_category_name : '',
                product_brand: data.product_product_brand,
                product_brand_code: data.product_brand !== null || 0 ? data.product_brand.product_brand_code : '',
                product_brand_name: data.product_brand !== null || 0 ? data.product_brand.product_brand_name : '',
                product_type: data.product_product_type,
                product_type_code: data.product_type !== null || 0 ? data.product_type.product_type_code : '',
                product_type_name: data.product_type !== null || 0 ? data.product_type.product_type_name : '',
                product_unit: data.product_product_unit,
                product_unit_code: data.product_unit !== null || 0 ? data.product_unit.product_unit_code : '',
                product_unit_name: data.product_unit !== null || 0 ? data.product_unit.product_unit_name : '',
                product_unit_price: data.product_unit_price,
                product_purchase_price: data.product_purchase_price,
                product_sales_price: data.product_sales_price,
                product_purchase_discount: data.product_purchase_discount,
                product_sales_discount: data.product_sales_discount,
                product_purchase_tax: data.product_purchase_tax,
                product_sales_tax: data.product_sales_tax,
                product_purchase_vat: data.product_purchase_vat,
                product_sales_vat: data.product_sales_vat,
                product_purchase_quantity: data.product_purchase_quantity,
                product_return_quantity: data.product_return_quantity,
                product_sales_quantity: data.product_sales_quantity,
                product_sales_quantity: data.product_sales_return_quantity,
                product_stock_quantity: data.product_stock_quantity,
                product_picture: data.product_picture === null ? '' : `${process.env.BASE_URL}/${data.product_picture}`,
                product_status: data.product_status
            }
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

// Product Create
exports.product_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let product_check_data = await product_model.findOne({
            where: {
                product_code: req.body.product_code
            }
        });

        if (product_check_data) {
            return res.send({
                status: "0",
                message: "Product Code Exist!",
                data: '',
            });
        }

        let product_picture;
        if (req.file == undefined) {
            product_picture = "assets/images/products/product-icon.png";
        } else {
            product_picture = "assets/images/products/" + req.file.filename;
        }

        const product = await product_model.create({
            product_company: req.body.product_company,
            product_code: req.body.product_code,
            product_barcode: req.body.product_code,
            product_name: req.body.product_name,
            product_model: req.body.product_model,
            product_description: req.body.product_description,
            product_product_category: req.body.product_category,
            product_product_brand: req.body.product_brand,
            product_product_type: req.body.product_type,
            product_product_unit: req.body.product_unit,
            product_unit_price: req.body.product_unit_price,
            product_purchase_price: req.body.product_purchase_price,
            product_sales_price: req.body.product_sales_price,
            product_purchase_discount: req.body.product_purchase_discount,
            product_sales_discount: req.body.product_sales_discount,
            product_purchase_tax: req.body.product_purchase_tax,
            product_sales_tax: req.body.product_sales_tax,
            product_purchase_vat: req.body.product_purchase_vat,
            product_sales_vat: req.body.product_sales_vat,
            product_picture: product_picture,
            product_status: req.body.product_status,
            product_create_by: user_id,
        });

        if (product) {
            const data = await product_model.findOne({
                include: [
                    {
                        model: product_category_model,
                        attributes: ['product_category_code', 'product_category_name'],
                        association: product_model.hasOne(product_category_model, {
                            foreignKey: 'product_category_id',
                            sourceKey: "product_product_category",
                            required: false
                        })
                    },
                    {
                        model: product_brand_model,
                        attributes: ['product_brand_code', 'product_brand_name'],
                        association: product_model.hasOne(product_brand_model, {
                            foreignKey: 'product_brand_id',
                            sourceKey: "product_product_brand",
                            required: false
                        })
                    },
                    {
                        model: product_type_model,
                        attributes: ['product_type_code', 'product_type_name'],
                        association: product_model.hasOne(product_type_model, {
                            foreignKey: 'product_type_id',
                            sourceKey: "product_product_type",
                            required: false
                        })
                    },
                    {
                        model: product_unit_model,
                        attributes: ['product_unit_code', 'product_unit_name'],
                        association: product_model.hasOne(product_unit_model, {
                            foreignKey: 'product_unit_id',
                            sourceKey: "product_product_unit",
                            required: false
                        })
                    }
                ],
                where: {
                    product_id: product.product_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Create Successfully!",
                data: {
                    product_id: data.product_id,
                    product_company: data.product_company,
                    product_code: data.product_code,
                    product_barcode: data.product_barcode,
                    product_model: data.product_model,
                    product_name: data.product_name,
                    product_description: data.product_description,
                    product_category: data.product_product_category,
                    product_category_code: data.product_category !== null || 0 ? data.product_category.product_category_code : '',
                    product_category_name: data.product_category !== null || 0 ? data.product_category.product_category_name : '',
                    product_brand: data.product_product_brand,
                    product_brand_code: data.product_brand !== null || 0 ? data.product_brand.product_brand_code : '',
                    product_brand_name: data.product_brand !== null || 0 ? data.product_brand.product_brand_name : '',
                    product_type: data.product_product_type,
                    product_type_code: data.product_type !== null || 0 ? data.product_type.product_type_code : '',
                    product_type_name: data.product_type !== null || 0 ? data.product_type.product_type_name : '',
                    product_unit: data.product_product_unit,
                    product_unit_code: data.product_unit !== null || 0 ? data.product_unit.product_unit_code : '',
                    product_unit_name: data.product_unit !== null || 0 ? data.product_unit.product_unit_name : '',
                    product_unit_price: data.product_unit_price,
                    product_purchase_price: data.product_purchase_price,
                    product_sales_price: data.product_sales_price,
                    product_purchase_discount: data.product_purchase_discount,
                    product_sales_discount: data.product_sales_discount,
                    product_purchase_tax: data.product_purchase_tax,
                    product_sales_tax: data.product_sales_tax,
                    product_purchase_vat: data.product_purchase_vat,
                    product_sales_vat: data.product_sales_vat,
                    product_purchase_quantity: data.product_purchase_quantity,
                    product_return_quantity: data.product_return_quantity,
                    product_sales_quantity: data.product_sales_quantity,
                    product_sales_quantity: data.product_sales_return_quantity,
                    product_stock_quantity: data.product_stock_quantity,
                    product_picture: data.product_picture === null ? '' : `${process.env.BASE_URL}/${data.product_picture}`,
                    product_status: data.product_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Product Create Error !",
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

// Product Update
exports.product_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        let product_check_data = await product_model.findOne({
            where: {
                product_code: req.body.product_code,
                [Op.not]: [
                    { product_id: req.params.product_id }
                ]
            }
        });

        if (product_check_data) {
            return res.send({
                status: "0",
                message: "Product Code Exist!",
                data: '',
            });
        }

        let product_picture;
        if (req.file == undefined) {
            product_picture = req.body.product_picture_old;
        } else {
            product_picture = "assets/images/products/" + req.file.filename;
        }

        const product_data = await product_model.findOne({
            where: {
                product_id: req.params.product_id
            }
        });

        if (!product_data) {
            return res.send({
                status: "0",
                message: "Product ID Not Found!",
                data: "",
            });
        }
        const product = await product_model.update({
            product_company: req.body.product_company,
            product_code: req.body.product_code,
            product_barcode: req.body.product_code,
            product_name: req.body.product_name,
            product_model: req.body.product_model,
            product_description: req.body.product_description,
            product_product_category: req.body.product_category,
            product_product_brand: req.body.product_brand,
            product_product_type: req.body.product_type,
            product_product_unit: req.body.product_unit,
            product_unit_price: req.body.product_unit_price,
            product_purchase_price: req.body.product_purchase_price,
            product_sales_price: req.body.product_sales_price,
            product_purchase_discount: req.body.product_purchase_discount,
            product_sales_discount: req.body.product_sales_discount,
            product_purchase_tax: req.body.product_purchase_tax,
            product_sales_tax: req.body.product_sales_tax,
            product_purchase_vat: req.body.product_purchase_vat,
            product_sales_vat: req.body.product_sales_vat,
            product_purchase_quantity: req.body.product_purchase_quantity,
            product_sales_quantity: req.body.product_sales_quantity,
            product_stock_quantity: req.body.product_stock_quantity,
            product_picture: product_picture,
            product_status: req.body.product_status,
            product_update_by: user_id,
        },
            {
                where: {
                    product_id: req.params.product_id
                }
            });
        if (product) {
            const data = await product_model.findOne({
                include: [
                    {
                        model: product_category_model,
                        attributes: ['product_category_code', 'product_category_name'],
                        association: product_model.hasOne(product_category_model, {
                            foreignKey: 'product_category_id',
                            sourceKey: "product_product_category",
                            required: false
                        })
                    },
                    {
                        model: product_brand_model,
                        attributes: ['product_brand_code', 'product_brand_name'],
                        association: product_model.hasOne(product_brand_model, {
                            foreignKey: 'product_brand_id',
                            sourceKey: "product_product_brand",
                            required: false
                        })
                    },
                    {
                        model: product_type_model,
                        attributes: ['product_type_code', 'product_type_name'],
                        association: product_model.hasOne(product_type_model, {
                            foreignKey: 'product_type_id',
                            sourceKey: "product_product_type",
                            required: false
                        })
                    },
                    {
                        model: product_unit_model,
                        attributes: ['product_unit_code', 'product_unit_name'],
                        association: product_model.hasOne(product_unit_model, {
                            foreignKey: 'product_unit_id',
                            sourceKey: "product_product_unit",
                            required: false
                        })
                    }
                ],
                where: {
                    product_id: req.params.product_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Update Successfully!",
                data: {
                    product_id: data.product_id,
                    product_company: data.product_company,
                    product_code: data.product_code,
                    product_barcode: data.product_barcode,
                    product_model: data.product_model,
                    product_name: data.product_name,
                    product_description: data.product_description,
                    product_category: data.product_product_category,
                    product_category_code: data.product_category !== null || 0 ? data.product_category.product_category_code : '',
                    product_category_name: data.product_category !== null || 0 ? data.product_category.product_category_name : '',
                    product_brand: data.product_product_brand,
                    product_brand_code: data.product_brand !== null || 0 ? data.product_brand.product_brand_code : '',
                    product_brand_name: data.product_brand !== null || 0 ? data.product_brand.product_brand_name : '',
                    product_type: data.product_product_type,
                    product_type_code: data.product_type !== null || 0 ? data.product_type.product_type_code : '',
                    product_type_name: data.product_type !== null || 0 ? data.product_type.product_type_name : '',
                    product_unit: data.product_product_unit,
                    product_unit_code: data.product_unit !== null || 0 ? data.product_unit.product_unit_code : '',
                    product_unit_name: data.product_unit !== null || 0 ? data.product_unit.product_unit_name : '',
                    product_unit_price: data.product_unit_price,
                    product_purchase_price: data.product_purchase_price,
                    product_sales_price: data.product_sales_price,
                    product_purchase_discount: data.product_purchase_discount,
                    product_sales_discount: data.product_sales_discount,
                    product_purchase_tax: data.product_purchase_tax,
                    product_sales_tax: data.product_sales_tax,
                    product_purchase_vat: data.product_purchase_vat,
                    product_sales_vat: data.product_sales_vat,
                    product_purchase_quantity: data.product_purchase_quantity,
                    product_return_quantity: data.product_return_quantity,
                    product_sales_quantity: data.product_sales_quantity,
                    product_sales_quantity: data.product_sales_return_quantity,
                    product_stock_quantity: data.product_stock_quantity,
                    product_picture: data.product_picture === null ? '' : `${process.env.BASE_URL}/${data.product_picture}`,
                    product_status: data.product_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Product Update Error!",
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

// Product Delete
exports.product_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_data = await product_model.findOne({
            where: {
                product_id: req.params.product_id
            }
        });

        if (!product_data) {
            return res.send({
                status: "0",
                message: "Product ID Not Found!",
                data: "",
            });
        }

        const product = await product_model.update({
            product_status: 0,
            product_delete_status: 1,
            product_delete_by: user_id,
            product_delete_at: new Date(),
        },
            {
                where: {
                    product_id: req.params.product_id
                }
            });

        return res.send({
            status: "1",
            message: "Product Delete Successfully!",
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

// Product Report
exports.product_report = async (req, res) => {
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

        const category_info = await product_category_model.findOne({
            where: {
                product_category_id: req.query.category
            }
        });
        const category_data = {
            product_category_code: req.query.category == 'all' ? '' : category_info.product_category_code,
            product_category_name: req.query.category == 'all' ? 'All' : category_info.product_category_name
        };

        const brand_info = await product_brand_model.findOne({
            where: {
                product_brand_id: req.query.brand
            }
        });

        const brand_data = {
            product_brand_code: req.query.brand == 'all' ? '' : brand_info.product_brand_code,
            product_brand_name: req.query.brand == 'all' ? 'All' : brand_info.product_brand_name,
        };

        const type_info = await product_type_model.findOne({
            where: {
                product_type_id: req.query.type
            }
        });

        type_data = {
            product_type_code: req.query.type == 'all' ? '' : type_info.product_type_code,
            product_type_name: req.query.type == 'all' ? 'All' : type_info.product_type_name,
        };

        const product = await product_model.findAll({
            include: [
                {
                    model: product_category_model,
                    attributes: ['product_category_code', 'product_category_name'],
                    association: product_model.hasOne(product_category_model, {
                        foreignKey: 'product_category_id',
                        sourceKey: "product_product_category",
                        required: false
                    })
                },
                {
                    model: product_brand_model,
                    attributes: ['product_brand_code', 'product_brand_name'],
                    association: product_model.hasOne(product_brand_model, {
                        foreignKey: 'product_brand_id',
                        sourceKey: "product_product_brand",
                        required: false
                    })
                },
                {
                    model: product_type_model,
                    attributes: ['product_type_code', 'product_type_name'],
                    association: product_model.hasOne(product_type_model, {
                        foreignKey: 'product_type_id',
                        sourceKey: "product_product_type",
                        required: false
                    })
                },
                {
                    model: product_unit_model,
                    attributes: ['product_unit_code', 'product_unit_name'],
                    association: product_model.hasOne(product_unit_model, {
                        foreignKey: 'product_unit_id',
                        sourceKey: "product_product_unit",
                        required: false
                    })
                }
            ],
            where: {
                product_company: req.query.company,
                ...(req.query.category == 'all' ? {} : {
                    product_product_category: req.query.category
                }), ...(req.query.brand == 'all' ? {} : {
                    product_product_brand: req.query.brand
                }), ...(req.query.type == 'all' ? {} : {
                    product_product_type: req.query.type
                }),
                product_status: req.query.status,
                product_delete_status: 0,
            },
            order: [
                ['product_name', 'ASC']
            ]
        });

        if (product.length > 0) {
            const product_data = await Promise.all(product.map(async (row) => ({
                product_id: row.product_id,
                product_company: row.product_company,
                product_code: row.product_code,
                product_barcode: row.product_barcode,
                product_model: row.product_model,
                product_name: row.product_name,
                product_description: row.product_description,
                product_category: row.product_product_category,
                product_category_code: row.product_category !== null || 0 ? row.product_category.product_category_code : '',
                product_category_name: row.product_category !== null || 0 ? row.product_category.product_category_name : '',
                product_brand: row.product_product_brand,
                product_brand_code: row.product_brand !== null || 0 ? row.product_brand.product_brand_code : '',
                product_brand_name: row.product_brand !== null || 0 ? row.product_brand.product_brand_name : '',
                product_type: row.product_product_type,
                product_type_code: row.product_type !== null || 0 ? row.product_type.product_type_code : '',
                product_type_name: row.product_type !== null || 0 ? row.product_type.product_type_name : '',
                product_unit: row.product_product_unit,
                product_unit_code: row.product_unit !== null || 0 ? row.product_unit.product_unit_code : '',
                product_unit_name: row.product_unit !== null || 0 ? row.product_unit.product_unit_name : '',
                product_unit_price: row.product_unit_price,
                product_purchase_price: row.product_purchase_price,
                product_sales_price: row.product_sales_price,
                product_purchase_discount: row.product_purchase_discount,
                product_sales_discount: row.product_sales_discount,
                product_purchase_tax: row.product_purchase_tax,
                product_sales_tax: row.product_sales_tax,
                product_purchase_vat: row.product_purchase_vat,
                product_sales_vat: row.product_sales_vat,
                product_purchase_quantity: row.product_purchase_quantity,
                product_return_quantity: row.product_return_quantity,
                product_sales_quantity: row.product_sales_quantity,
                product_sales_return_quantity: row.product_sales_return_quantity,
                product_stock_quantity: row.product_stock_quantity,
                product_picture: row.product_picture === null ? '' : `${process.env.BASE_URL}/${row.product_picture}`,
                product_status: row.product_status
            })));

            return res.send({
                status: "1",
                message: "Product Find Successfully!",
                data: product_data,
                company: company_data,
                branch: branch_data,
                category_data: category_data,
                brand_data: brand_data,
                type_data: type_data
            });
        }

        return res.send({
            status: "0",
            message: "Product Not Found !",
            data: [],
            company: '',
            branch: '',
            category_data: '',
            brand_data: '',
            type_data: ''
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