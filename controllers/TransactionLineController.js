import mongoose from 'mongoose';
import checkValidationObjectId from '../libraries/checkValidationObjectId.js';

import Account from "../models/Account.js";
import TransactionLine from "../models/TransactionLine.js";

import TransactionLineService from '../services/TransactionLineService.js';

class TransactionController {
  async index(req, res) {
    try {
      const query = await TransactionLineService.generateQuerySearch(req);
      if(!query.status) throw { code: query.code, message: "Query Pencarian Eror!", data: null, status: false }
      let result = TransactionLine.aggregate(query.aggregate);

      const lines = await result;
      const total = await TransactionLine.countDocuments(query.aggregate.at(-1)['$match']);

      if(!lines) { throw { code: 404, message: "TRANSACTION_LINE_DATA_NOT_FOUND", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "LIST_TRANSACTION_LINE",
        data: lines,
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
      const data = await TransactionLineService.generateData(req);
      if (!data.status) throw { code: data.code, message: data.message, data: null, status: false }

      const document = new TransactionLine(data.data);
      const line = await document.save();
      
      if(!line) { throw { code: 500, message: "Gagal menambahkan baris Transaksi", data: null, status: false } }
      return res.status(200).json({
        status: true,
        message: "Berhasil menambahkan baris Transaksi",
        data: line,
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

      const checkObjId = await checkValidationObjectId(id, TransactionLine, "TRANSACTION_LINE")
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      const line = await TransactionLine.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "transactions",
            localField: "transactionId",
            foreignField: "_id",
            as: "transactionId"
          }
        },
        { $unwind: {"path": '$transactionId', "preserveNullAndEmptyArrays": true} },
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

      if(!line || !(line.length > 0)) { throw { code: 404, message: "TRANSACTION_LINE_NOT_FOUND", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "TRANSACTION_FOUND",
        data: line
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
      
      const checkObjId = await checkValidationObjectId(id, TransactionLine, "TRANSACTION_LINE", true)
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      
      const { 
        accountId,
        credit,
        date,
        debit,
        label,
        transactionId,
        userId,
        vendorId,
      } = req.body;
      
      const checkAccountObjId = await checkValidationObjectId(accountId, Account, "ACCOUNT", true);
      if(!checkAccountObjId.status) return checkAccountObjId;

      const data = {
        accountId,
        credit: checkAccountObjId.data.account_type === 'expense' ? parseFloat(credit) : 0,
        date,
        debit: checkAccountObjId.data.account_type === 'income' ? parseFloat(debit) : 0,
        label,
        transactionId,
        userId,
        vendorId: vendorId !== "" ? vendorId : null,
      }

      const line = await TransactionLine.findByIdAndUpdate( { _id: id }, data, { new: true } )
      if(!line) { throw { code: 500, message: "Gagal mengubah baris data Transaksi!", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "Berhasil mengubah baris data Transaksi!",
        data: line,
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
      
      const checkObjId = await checkValidationObjectId(id, TransactionLine, "TRANSACTION_LINE")
      if(!checkObjId.status) return res.status(checkObjId.code).json({
        status: false,
        message: checkObjId.message,
        data: null
      });

      const line = await TransactionLine.findOneAndDelete({ _id: id })
      if(!line) { throw { code: 500, message: "Gagal menghapus baris data Transaksi!", data: null, status: false } }

      return res.status(200).json({
        status: true,
        message: "Berhasil menghapus baris data Transaksi!",
        data: line,
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
      const query = await TransactionLineService.generateQueryGroup(req);
      if(!query.status) throw { code: query.code, message: "ERROR_QUERY_GROUP", data: null, status: false }

      const line = await TransactionLine.aggregate(query.query);

      return res.status(200).json({
        status: true,
        message: "TRANSACTION_GROUP_SUCCESS",
        data: line
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