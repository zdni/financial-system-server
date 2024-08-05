import Document from "../models/Document.js";
import TransactionLine from "../models/TransactionLine.js";

import TransactionLineService from '../services/TransactionLineService.js';

import { fDate } from '../libraries/formatTime.js';

class PDFController {
  async export(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const query = await TransactionLineService.generateQuerySearch(req);
      if(!query.status) throw { code: query.code, message: "ERROR_QUERY_SEARCH", data: null, status: false }

      let result = TransactionLine.aggregate(query.aggregate);

      const lines = await result;

      const filename = `${fDate(startDate*1)}-${fDate(endDate*1)}.pdf`
      // writeFileSync(`exports/${filename}`, pdf);

      const data = new Document({ name: filename, document_type: 'pdf' });
      const document = await data.save();

      if(!document) { throw { code: 500, message: "Export File Gagal!", data: null, status: false } }
      return res.status(200).json({
        status: true,
        message: "SUCCESS_EXPORT",
      });
    } catch (error) {
      if(!error.code) { error.code = 500 }
      return res.status(error.code).json({
        status: false,
        message: error.message,
      });
    }
  }
}

export default new PDFController;