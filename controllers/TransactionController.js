import checkValidationObjectId from '../libraries/checkValidationObjectId.js';

import Transaction from "../models/Transaction.js";

import TransactionService from '../services/TransactionService.js';

class TransactionController {
  async index(req, res) {
    try {
      const query = await TransactionService.generateQuerySearch(req);
      if(!query.status) throw { code: data.code, message: "ERROR_QUERY_SEARCH", data: null, status: false }
      
      let result = Transaction.aggregate(query.aggregate);

      const transactions = await result;
      const total = await Transaction.count(query.aggregate[0]['$match']);

      if(!transactions) { throw { code: 404, message: "TRANSACTION_DATA_NOT_FOUND", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "LIST_TRANSACTION",
        data: transactions,
        total
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }

  async store(req, res) {
    try {
      const data = await TransactionService.generateData(req);
      if (!data.status) throw { code: data.code, message: data.message, data: null, status: false }

      const document = new Transaction(data.data);
      const transaction = await document.save();
      
      if(!transaction) { throw { code: 500, message: "FAILED_CREATE_TRANSACTION", data: null, status: false } }
      return res.status(200).json({
        status: true,
        message: "SUCCESS_CREATE_TRANSACTION",
        data: transaction,
      })
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }

  async show(req, res) {
    try {
      const {id} = req.params
      if(!id) { throw { code: 428, message: "ID_REQUIRED", data: null, status: false } }

      const checkObjId = await checkValidationObjectId(id, Transaction, "TRANSACTION")
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      const transaction = await Transaction.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "accounts",
            localField: "accountId",
            foreignField: "_id",
            as: "accountId"
          }
        },
        { $unwind: {"path": '$accountId', "preserveNullAndEmptyArrays": true} },
        {
          $lookup: {
            from: "vendors",
            localField: "vendorId",
            foreignField: "_id",
            as: "vendorId"
          }
        },
        { $unwind: {"path": '$vendorId', "preserveNullAndEmptyArrays": true} },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId"
          }
        },
        { $unwind: {"path": '$userId', "preserveNullAndEmptyArrays": true} },
      ])

      if(!transaction || !(transaction.length > 0)) { throw { code: 404, message: "TRANSACTION_NOT_FOUND", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "TRANSACTION_FOUND",
        data: transaction[0]
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }

  async update(req, res) {
    try {
      const {id} = req.params
      if(!id) { throw { code: 420, message: "ID_REQUIRED", data: null, status: false } }
      
      const checkObjId = await checkValidationObjectId(id, Transaction, "TRANSACTION")
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      const transaction = await Transaction.findByIdAndUpdate( { _id: id }, req.body, { new: true } )
      if(!transaction) { throw { code: 500, message: "TRANSACTION_UPDATE_FAILED", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "TRANSACTION_UPDATE_SUCCESS",
        data: transaction,
      })
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }

  async destroy(req, res) {
    try {
      const {id} = req.params
      if(!id) { throw { code: 420, message: "ID_REQUIRED", data: null, status: false } }
      
      const checkObjId = await checkValidationObjectId(id, Transaction, "TRANSACTION")
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      const transaction = await Transaction.findOneAndDelete({ _id: id })
      if(!transaction) { throw { code: 500, message: "TRANSACTION_DELETE_FAILED", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "TRANSACTION_DELETE_SUCCESS",
        data: transaction,
      })
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }

  async group(req, res) {
    try {
      const query = await TransactionService.generateQueryGroup(req);
      if(!query.status) throw { code: query.code, message: "ERROR_QUERY_GROUP", data: null, status: false }

      const transactions = await Transaction.aggregate(query.query);

      return res.status(200).json({
        status: true,
        message: "TRANSACTION_GROUP_SUCCESS",
        data: transactions
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
        data: null
      });
    }
  }
}

export default new TransactionController;