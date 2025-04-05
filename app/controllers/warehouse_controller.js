require("dotenv").config();
const jwt                   = require("jsonwebtoken");
const bcrypt                = require("bcryptjs");
const db                    = require("../models");
const config                = require("../config/config");
const otp_generator         = require("otp-generator");
const nodemailer            = require("nodemailer");

const warehouse_model   = db.warehouse_model;
const Op                    = db.Sequelize.Op;
let user_id;

// Warehouse List
exports.warehouse_list = async (req, res) => {
    try {
        const warehouse = await warehouse_model.findAll({
            where: {
                warehouse_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    warehouse_branch: req.query.branch
                }),
                warehouse_delete_status: 0,
                ...(req.query.status == 'all' ?{}:{
                    warehouse_status: req.query.status
                }),
                ...(req.query.search.length > 0?{
                    [Op.or]: [
                    {
                        warehouse_code: {[Op.like]: `%${req.query.search}%`}
                    },
                    {
                        warehouse_name:{[Op.like]: `%${req.query.search}%`}
                    }
                ]
                }:{})
            },
            order: [
                ['warehouse_code', 'ASC']
            ]
        });

        if(warehouse.length > 0) {
            const warehouse_data = await Promise.all(warehouse.map(async (row) => ({
                warehouse_id         : row.warehouse_id ,
                warehouse_company    : row.warehouse_company,
                warehouse_branch     : row.warehouse_branch,
                warehouse_code       : row.warehouse_code,
                warehouse_name       : row.warehouse_name,
                warehouse_status     : row.warehouse_status
            })));

            return res.send({
                status: "1",
                message: "Warehouse Find Successfully!",
                data: warehouse_data
            });
        }

        return res.send({
            status: "0",
            message: "Warehouse Not Found !",
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

// Warehouse List Active
exports.warehouse_list_active = async (req, res) => {
    try {
        const warehouse = await warehouse_model.findAll({
            where: {
                warehouse_company: req.query.company,
                ...(req.query.branch == 'all' ?{}:{
                    warehouse_branch: req.query.branch
                }),
                warehouse_status: 1,
                warehouse_delete_status: 0
            },
            order: [
                ['warehouse_code', 'ASC']
            ]
        });

        if(warehouse.length > 0) {
            const warehouse_data = await Promise.all(warehouse.map(async (row) => ({
                warehouse_id          : row.warehouse_id ,
                warehouse_code        : row.warehouse_code,
                warehouse_company     : row.warehouse_company,
                warehouse_branch      : row.warehouse_branch,
                warehouse_name        : row.warehouse_name,
                warehouse_status      : row.warehouse_status
            })));

            return res.send({
                status: "1",
                message: "Warehouse Find Successfully!",
                data: warehouse_data
            });
        }
        return res.send({
            status: "0",
            message: "Warehouse Not Found !",
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

// Get Warehouse
exports.get_warehouse = async (req, res) => {
    try {
        const data = await warehouse_model.findOne({
            where: {
                warehouse_id: req.params.warehouse_id
            },
        });

        if(!data) {
            return res.send({
                status: "0",
                message: "Warehouse Not Found !",
                data: "",
            });

        }

        return res.send({
            status: "1",
            message: "Warehouse Find Successfully!",
            data: {
                warehouse_id: data.warehouse_id,
                warehouse_code: data.warehouse_code,
                warehouse_company: data.warehouse_company,
                warehouse_branch: data.warehouse_branch,
                warehouse_name: data.warehouse_name,
                warehouse_status: data.warehouse_status
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

// Warehouse Create
exports.warehouse_create = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const warehouse = await warehouse_model.create({
            warehouse_company   : req.body.warehouse_company,
            warehouse_branch    : req.body.warehouse_branch,
            warehouse_code      : req.body.warehouse_code,
            warehouse_name      : req.body.warehouse_name,
            warehouse_status    : req.body.warehouse_status,
            warehouse_create_by : user_id,
        });

        if(warehouse) {
            const data = await warehouse_model.findOne({
                where: {
                    warehouse_id: warehouse.warehouse_id
                },
            });

            return res.send({
                status: "1",
                message: "Warehouse Create Successfully!",
                data: {
                    warehouse_id: data.warehouse_id,
                    warehouse_company: data.warehouse_company,
                    warehouse_branch: data.warehouse_branch,
                    warehouse_code: data.warehouse_code,
                    warehouse_name: data.warehouse_name,
                    warehouse_status: data.warehouse_status
                }
            });
        }

        return res.send({
            status: "0",
            message: "Warehouse Create Error !",
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

// Warehouse Update
exports.warehouse_update = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const warehouse_data = await warehouse_model.findOne({
            where:{
                warehouse_id: req.params.warehouse_id
            }
        });

        if(!warehouse_data) {
            return res.send({
                status: "0",
                message: "Warehouse ID Not Found!",
                data: "",
            });
        }
        const warehouse = await warehouse_model.update({
            warehouse_company   : req.body.warehouse_company,
            warehouse_branch   : req.body.warehouse_branch,
            warehouse_code      : req.body.warehouse_code,
            warehouse_name      : req.body.warehouse_name,
            warehouse_status    : req.body.warehouse_status,
            warehouse_update_by : user_id,
        },
        {
            where:{
                warehouse_id: req.params.warehouse_id
            }
        });
        if(warehouse) {
            const data = await warehouse_model.findOne({
                where: {
                    warehouse_id: req.params.warehouse_id
                },
            });

            return res.send({
                status: "1",
                message: "Warehouse Update Successfully!",
                data: {
                    warehouse_id: data.warehouse_id,
                    warehouse_company: data.warehouse_company,
                    warehouse_branch: data.warehouse_branch,
                    warehouse_code: data.warehouse_code,
                    warehouse_name: data.warehouse_name,
                    warehouse_status: data.warehouse_status
                }
            });
        }
        return res.send({
            status: "1",
            message: "Warehouse Update Error!",
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

// Warehouse Delete
exports.warehouse_delete = async (req, res) => {
    try {
        const token = req.headers["x-access-token"];
        jwt.verify(token, config.secret, (err, decoded) => {
            req.user_id = decoded.user_id;
            user_id = req.user_id;
        });

        const warehouse_data = await warehouse_model.findOne({
            where:{
                warehouse_id: req.params.warehouse_id
            }
        });

        if(!warehouse_data) {
            return res.send({
                status: "0",
                message: "Warehouse ID Not Found!",
                data: "",
            });
        }

        const warehouse = await warehouse_model.update({
            warehouse_status        : 0,
            warehouse_delete_status : 1,
            warehouse_delete_by     : user_id,
            warehouse_delete_at     : new Date(),
        },
        {
            where:{
                warehouse_id: req.params.warehouse_id
            }
        });

        return res.send({
            status: "1",
            message: "Warehouse Delete Successfully!",
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