import mongoose from "mongoose";

import checkValidationObjectId from '../libraries/checkValidationObjectId.js';

import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';

class TransactionLineService {
  async generateData(req) {
    try {
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

      if(!date) return { status: false, code: 428, message: "DATE_IS_REQUIRED" }
      
      // accountId
      if(!accountId) return { status: false, code: 428, message: "ACCOUNT_IS_REQUIRED" }
      let checkAccountObjId = await checkValidationObjectId(accountId, Account, "ACCOUNT", true);
      if(!checkAccountObjId.status) return checkAccountObjId;
      
      // accountId
      if(!transactionId) return { status: false, code: 428, message: "TRANSACTION_IS_REQUIRED" }
      let checkTransactionObjId = await checkValidationObjectId(transactionId, Transaction, "TRANSACTION", true);
      if(!checkTransactionObjId.status) return checkTransactionObjId;

      // userId
      if(!userId) return { status: false, code: 428, message: "USER_IS_REQUIRED" }
      let checkUserObjId = await checkValidationObjectId(userId, User, "USER");
      if(!checkUserObjId.status) return checkUserObjId;

      let data = {
        accountId,
        date,
        transactionId,
        userId,
      };
      
      // vendorId
      if(vendorId) {
        let checkVendorObjId = await checkValidationObjectId(vendorId, Vendor, "VENDOR");
        if(!checkVendorObjId.status) return checkVendorObjId;

        data['vendorId'] = vendorId;
      }

      data['credit'] = checkAccountObjId.data._doc.account_type == 'expense' ? parseFloat(credit) : 0;
      data['debit'] = checkAccountObjId.data._doc.account_type == 'income' ? parseFloat(debit) : 0;
      if(label) data['label'] = label;

      return { status: true, data };
    } catch (error) {
      if(!error.status) error.status = false;
      if(!error.code) error.code = 500;
      return error;
    }
  }

  async generateQuerySearch(req) {
    try {
      let query = {};
      const {
        accountId,
        credit,
        debit,
        endDate,
        startDate,
        transactionId,
        vendorId,
        state,

        sort,
        page,
        limit,
      } = req.query;

      if(accountId) {
        let checkObjId = await checkValidationObjectId(accountId, Account, "ACCOUNT");
        if(checkObjId.status) query['accountId'] = new mongoose.Types.ObjectId(accountId);
      }

      if(transactionId) {
        let checkObjId = await checkValidationObjectId(transactionId, Transaction, "TRANSACTION");
        if(checkObjId.status) query['transactionId'] = new mongoose.Types.ObjectId(transactionId);
      }
      if(vendorId) {
        let checkObjId = await checkValidationObjectId(vendorId, Vendor, "VENDOR");
        if(checkObjId.status) query['vendorId'] = new mongoose.Types.ObjectId(vendorId);
      }

      if(startDate || endDate) {
        query['transactionId.date'] = {}
        if(startDate != 0) { Object.assign(query['transactionId.date'], { $gte: new Date(startDate*1) }) };
        if(endDate != 0) { Object.assign(query['transactionId.date'], { $lte: new Date(endDate*1) }) };
      }

      if(debit > 0) query['debit'] = { $gte: parseFloat(debit) };
      if(credit > 0) query['credit'] = { $gte: parseFloat(credit) };

      if(state) query['transactionId.state'] = { $eq: state };

      const aggregate = []

      if(sort) {
        if(sort.includes('-')) {
          aggregate.push({ $sort: { [sort.substring(1)]: -1 } })
        } else {
          aggregate.push({ $sort: { [sort]: 1 } })
        }
      }

      aggregate.push({
        $lookup: {
          from: "transactions",
          localField: "transactionId",
          foreignField: "_id",
          as: "transactionId"
        }
      })
      aggregate.push({ $unwind: {"path": '$transactionId', "preserveNullAndEmptyArrays": true} })
      aggregate.push({
        $lookup: {
          from: "accounts",
          localField: "accountId",
          foreignField: "_id",
          as: "accountId"
        }
      })
      aggregate.push({ $unwind: {"path": '$accountId', "preserveNullAndEmptyArrays": true} })
      aggregate.push({
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendorId"
        }
      })
      aggregate.push({ $unwind: {"path": '$vendorId', "preserveNullAndEmptyArrays": true} })
      aggregate.push({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId"
        }
      })
      aggregate.push({ $unwind: {"path": '$userId', "preserveNullAndEmptyArrays": true} })

      aggregate.push( { $match: query } )

      if(limit) {
        const skip = ((Number(page) !== 0 && !isNaN(Number(page))) && (Number(limit) !== 0 && !isNaN(Number(limit)))) ? (Number(page) - 1) * Number(limit) : 0
        aggregate.push({ $skip: skip })
        aggregate.push({ $limit: Number(limit) })
      }

      return { status: true, aggregate };
    } catch (error) {
      if(!error.status) error.status = false;
      if(!error.code) error.code = 500;
      return error;
    }
  }

  async generateQueryGroup(req) {
    try {
      const { group } = req.query;

      const query = [];

      if(group === 'account') {
        query.push(
          {
            $lookup: {
              from: "accounts",
              localField: "accountId",
              foreignField: "_id",
              as: "result"
            }
          },
          {
            $group: { _id: "$result", total: { $sum: 1 } }
          }
        )
      }
      if(group === 'vendor') {
        query.push(
          {
            $lookup: {
              from: "vendors",
              localField: "vendorId",
              foreignField: "_id",
              as: "result"
            }
          },
          {
            $group: { _id: "$result", total: { $sum: 1 } }
          }
        )
      }

      if(query.length == 0) return {status: false, code: 400}

      return { status: true, query }
    } catch (error) {
      if(!error.status) error.status = false;
      if(!error.code) error.code = 500;
      return error;
    }
  }
}

export default new TransactionLineService;