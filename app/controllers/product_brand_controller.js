require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const product_brand_model   = db.product_brand_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Product Brand List
exports.product_brand_list = async (req, res) => {
    try {
        const product_brand = await product_brand_model.findAll({
            where: {
                product_brand_company: req.query.company,
                product_brand_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    product_brand_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        product_brand_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        product_brand_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['product_brand_code', 'ASC']
            ]
        });

        if(product_brand.length > 0) {
            const product_brand_data = await Promise.all(product_brand.map(async (row) => ({
                product_brand_id         : row.product_brand_id ,
                product_brand_company    : row.product_brand_company,
                product_brand_code       : row.product_brand_code,
                product_brand_name       : row.product_brand_name,
                product_brand_status     : row.product_brand_status
            })));

            return res.send({
                status: "1",
                message: "Product Brand Find Successfully!",
                data: product_brand_data
            });
        }

        return res.send({
            status: "0",
            message: "Product Brand Not Found !",
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

// Product Brand List Active
exports.product_brand_list_active = async (req, res) => {
    try {
        const product_brand = await product_brand_model.findAll({
            where: {
                product_brand_company: req.params.company,
                product_brand_status: 1,
                product_brand_delete_status: 0
            },
            order: [
                ['product_brand_code', 'ASC']
            ]
        });

        if(product_brand.length > 0) {
            const product_brand_data = await Promise.all(product_brand.map(async (row) => ({
                product_brand_id          : row.product_brand_id ,
                product_brand_code        : row.product_brand_code,
                product_brand_company     : row.product_brand_company,
                product_brand_name        : row.product_brand_name,
                product_brand_status      : row.product_brand_status
            })));

            return res.send({
                status: "1",
                message: "Product Brand Find Successfully!",
                data: product_brand_data
            });
        }
        return res.send({
            status: "0",
            message: "Product Brand Not Found !",
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

// Get Product Brand
exports.get_product_brand = async (req, res) => {
    try {
        const data = await product_brand_model.findOne({
            where: {
                product_brand_id: req.params.product_brand_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Product Brand Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Product Brand Find Successfully!",
            data: {
                product_brand_id: data.product_brand_id,
                product_brand_code: data.product_brand_code,
                product_brand_company: data.product_brand_company,
                product_brand_name: data.product_brand_name,
                product_brand_status: data.product_brand_status
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

// Product Brand Create
exports.product_brand_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_brand = await product_brand_model.create({
            product_brand_company   : req.body.product_brand_company,
            product_brand_code      : req.body.product_brand_code,
            product_brand_name      : req.body.product_brand_name,
            product_brand_status    : req.body.product_brand_status,
            product_brand_create_by : user_id,
        });

        if(product_brand) {
            const data = await product_brand_model.findOne({
                where: {
                    product_brand_id: product_brand.product_brand_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Brand Create Successfully!",
                data: {
                    product_brand_id: data.product_brand_id,
                    product_brand_company: data.product_brand_company,
                    product_brand_code: data.product_brand_code,
                    product_brand_name: data.product_brand_name,
                    product_brand_status: data.product_brand_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Product Brand Create Error !",
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

// Product Brand Update
exports.product_brand_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_brand_data = await product_brand_model.findOne({
            where:{
                product_brand_id: req.params.product_brand_id
            }
        });

        if(!product_brand_data) {
            return res.send({
                status: "0",
                message: "Product Brand ID Not Found!",
                data: "",
            });
        }
        const product_brand = await product_brand_model.update({
            product_brand_company   : req.body.product_brand_company,
            product_brand_code      : req.body.product_brand_code,
            product_brand_name      : req.body.product_brand_name,
            product_brand_status    : req.body.product_brand_status,
            product_brand_update_by : user_id,
        },
        {
            where:{
                product_brand_id: req.params.product_brand_id
            }
        });
        if(product_brand) {
            const data = await product_brand_model.findOne({
                where: {
                    product_brand_id: req.params.product_brand_id
                },
            });

            return res.send({
                status: "1",
                message: "Product Brand Update Successfully!",
                data: {
                    product_brand_id: data.product_brand_id,
                    product_brand_company: data.product_brand_company,
                    product_brand_code: data.product_brand_code,
                    product_brand_name: data.product_brand_name,
                    product_brand_status: data.product_brand_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Product Brand Update Error!",
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

// Product Brand Delete
exports.product_brand_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const product_brand_data = await product_brand_model.findOne({
            where:{
                product_brand_id: req.params.product_brand_id
            }
        });

        if(!product_brand_data) {
            return res.send({
                status: "0",
                message: "Product Brand ID Not Found!",
                data: "",
            });
        }

        const product_brand = await product_brand_model.update({
            product_brand_status        : 0,
            product_brand_delete_status : 1,
            product_brand_delete_by     : user_id,
            product_brand_delete_at     : new Date(),
        },
        {
            where:{
                product_brand_id: req.params.product_brand_id
            }
        });

        return res.send({
            status: "1",
            message: "Product Brand Delete Successfully!",
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