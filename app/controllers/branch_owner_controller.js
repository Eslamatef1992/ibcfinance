require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("../models");
const config = require("../config/config");

const branch_owner_model = db.branch_owner_model;
const user_model = db.user_model;

const Op = db.Sequelize.Op;
let user_id;

// Branch Owner List
exports.branch_owner_list = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    jwt.verify(token, config.secret, (err, decoded) => {
      req.user_id = decoded.user_id;
      user_id = req.user_id;
    });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {
      delete_status: 0,
    };

    // Add status filter if provided
    if (req.query.status && req.query.status !== "all") {
      whereConditions.status = req.query.status;
    }

    // Add search filter if provided
    if (req.query.search && req.query.search.length > 0) {
      whereConditions.name = { [Op.like]: `%${req.query.search}%` };
    }

    // Get total count for pagination
    const totalCount = await branch_owner_model.count({
      where: whereConditions,
    });

    // Get data with pagination
    const data = await branch_owner_model.findAll({
      where: whereConditions,
      limit: limit,
      offset: offset,
      order: [["branch_owner_id", "DESC"]],
    });

    if (data.length > 0) {
      const ownerData = data.map((row) => ({
        branch_owner_id: row.branch_owner_id,
        name: row.name,
        status: row.status,
        create_at: row.create_at,
        update_at: row.update_at,
      }));

      return res.send({
        status: "1",
        message: "Branch Owner Data Found Successfully!",
        data: ownerData,
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    }

    return res.send({
      status: "0",
      message: "Branch Owner Data Not Found!",
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.send({
      status: "0",
      message: error.message,
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: 10,
      },
    });
  }
};

// Get Branch Owner
exports.get_branch_owner = async (req, res) => {
  try {
    const data = await branch_owner_model.findOne({
      where: {
        branch_owner_id: req.params.owner_id,
        delete_status: 0,
      },
    });

    if (!data) {
      return res.send({
        status: "0",
        message: "Branch Owner Data Not Found!",
        data: "",
      });
    }

    return res.send({
      status: "1",
      message: "Branch Owner Data Found Successfully!",
      data: {
        branch_owner_id: data.branch_owner_id,
        name: data.name,
        status: data.status,
        create_at: data.create_at,
        update_at: data.update_at,
      },
    });
  } catch (error) {
    res.send({
      status: "0",
      message: error.message,
      data: "",
    });
  }
};

// Branch Owner Create
exports.branch_owner_create = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    jwt.verify(token, config.secret, (err, decoded) => {
      req.user_id = decoded.user_id;
      user_id = req.user_id;
    });

    const data = await branch_owner_model.create({
      name: req.body.name,
      status: req.body.status || 1,
      create_by: user_id,
    });

    if (!data) {
      return res.send({
        status: "0",
        message: "Branch Owner Create Failed!",
        data: "",
      });
    }

    return res.send({
      status: "1",
      message: "Branch Owner Created Successfully!",
      data: "",
    });
  } catch (error) {
    res.send({
      status: "0",
      message: error.message,
      data: "",
    });
  }
};

// Branch Owner Update
exports.branch_owner_update = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    jwt.verify(token, config.secret, (err, decoded) => {
      req.user_id = decoded.user_id;
      user_id = req.user_id;
    });

    const data = await branch_owner_model.update(
      {
        name: req.body.name,
        status: req.body.status,
        update_by: user_id,
      },
      {
        where: {
          branch_owner_id: req.params.owner_id,
        },
      }
    );

    if (data[0] === 0) {
      return res.send({
        status: "0",
        message: "Branch Owner Update Failed!",
        data: "",
      });
    }

    return res.send({
      status: "1",
      message: "Branch Owner Updated Successfully!",
      data: "",
    });
  } catch (error) {
    res.send({
      status: "0",
      message: error.message,
      data: "",
    });
  }
};

exports.branch_owner_delete = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    jwt.verify(token, config.secret, (err, decoded) => {
      req.user_id = decoded.user_id;
      user_id = req.user_id;
    });

    const data = await branch_owner_model.update(
      {
        delete_status: 1,
        delete_by: user_id,
        delete_at: new Date(),
      },
      {
        where: {
          branch_owner_id: req.params.owner_id,
        },
      }
    );

    if (data[0] === 0) {
      return res.send({
        status: "0",
        message: "Branch Owner Delete Failed!",
        data: "",
      });
    }

    return res.send({
      status: "1",
      message: "Branch Owner Deleted Successfully!",
      data: "",
    });
  } catch (error) {
    res.send({
      status: "0",
      message: error.message,
      data: "",
    });
  }
};

exports.get_branches_by_owner = async (req, res) => {
  try {
    const owner_id = req.params.owner_id;

    const branches = await db.branch_model.findAll({
      attributes: ["branch_id", "branch_name"],
      where: {
        project_owner: owner_id,
        branch_delete_status: 0,
      },
      order: [["branch_name", "ASC"]],
    });

    if (branches.length > 0) {
      return res.send({
        status: "1",
        message: "Branches Found Successfully!",
        data: branches,
      });
    }

    return res.send({
      status: "0",
      message: "No Branches Found for this Owner!",
      data: [],
    });
  } catch (error) {
    res.send({
      status: "0",
      message: error.message,
      data: [],
    });
  }
};
