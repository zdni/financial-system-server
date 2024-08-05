import { writeFileSync } from "node:fs";
import { Workbook } from "xlsx-kaku";

import Document from "../models/Document.js";
import TransactionLine from "../models/TransactionLine.js";

import TransactionLineService from '../services/TransactionLineService.js';

import { fDate } from '../libraries/formatTime.js';

class XlsxController {
  async export(req, res) {
    try {
      const query = await TransactionLineService.generateQuerySearch(req);
      if(!query.status) throw { code: query.code, message: "ERROR_QUERY_SEARCH", data: null, status: false }
      let result = TransactionLine.aggregate(query.aggregate);

      const lines = await result;
      const wb = new Workbook();
      const ws = wb.addWorksheet("TRANSAKSI");
      
      
      const { startDate, endDate } = req.query;
      ws.setCell(0, 0, { type: "string", value: "DAFTAR TRANSAKSI", style: { alignment: {horizontal: "center", vertical: "center"} } });
      ws.setMergeCell({ ref: "A1:F2" });
      ws.setCell(2, 0, { type: "string", value:  `${fDate(startDate*1)} sampai ${fDate(endDate*1)}`, style: { alignment: {horizontal: "center", vertical: "center"} } });
      ws.setMergeCell({ ref: "A3:F3" });
      ws.setMergeCell({ ref: "A4:F6" });

      let row = 3
      let currentDate = '';
      let number = 0;
      let income = 0;
      let expense = 0;
      let margin = 0;
      lines.map((line) => {
        if(currentDate !== fDate(line.date)) {
          if(row !== 3) {
            row += 1;
            ws.setCell(row, 0, { type: "string", value: "Total" });
            ws.setMergeCell({ ref: `A${row+1}:D${row+1}` })
            ws.setCell(row, 4, { type: "number", value: income, style: { alignment: {horizontal: "right", vertical: "center"} } });
            ws.setCell(row, 5, { type: "number", value: expense, style: { alignment: {horizontal: "right", vertical: "center"} } });
            
            margin = income-expense;
            row += 1;
            ws.setCell(row, 0, { type: "string", value: "Margin" });
            ws.setMergeCell({ ref: `A${row+1}:D${row+1}` });
            ws.setCell(row, 4, { type: "number", value: margin, style: { alignment: {horizontal: "right", vertical: "center"} } });
            ws.setMergeCell({ ref: `E${row+1}:F${row+1}` });
          }
          number = 0;
          income = 0;
          expense = 0;
          row += 3;
          ws.setMergeCell({ ref: `A${row-1}:F${row}` })
          currentDate = fDate(line.date);

          ws.setCell(row, 0, { type: "string", value: `${fDate(line.date*1)}`, style: { alignment: {horizontal: "center", vertical: "center"} } });
          ws.setMergeCell({ ref: `A${row+1}:F${row+1}` })
          
          row += 1
          ws.setCell(row, 0, { type: "string", value: "#" });
          ws.setCell(row, 1, { type: "string", value: "Label" });
          ws.setCell(row, 2, { type: "string", value: "Akun" });
          ws.setCell(row, 3, { type: "string", value: "Vendor" });
          ws.setCell(row, 4, { type: "string", value: "Income", style: { alignment: {horizontal: "right", vertical: "center"} } });
          ws.setCell(row, 5, { type: "string", value: "Expense", style: { alignment: {horizontal: "right", vertical: "center"} } });
        }
        number += 1;
        row += 1;

        income += line.debit;
        expense += line.credit;
        
        ws.setCell(row, 0, { type: "number", value: number });
        ws.setCell(row, 1, { type: "string", value: line.label });
        ws.setCell(row, 2, { type: "string", value: line.accountId?.name || '' });
        ws.setCell(row, 3, { type: "string", value: line.vendorId?.name || '' });
        ws.setCell(row, 4, { type: "number", value: line.debit, style: { alignment: {horizontal: "right", vertical: "center"} } });
        ws.setCell(row, 5, { type: "number", value: line.credit, style: { alignment: {horizontal: "right", vertical: "center"} } });
      })

      row += 1;
      ws.setCell(row, 0, { type: "string", value: "Total" });
      ws.setMergeCell({ ref: `A${row+1}:D${row+1}` })
      ws.setCell(row, 4, { type: "number", value: income, style: { alignment: {horizontal: "right", vertical: "center"} } });
      ws.setCell(row, 5, { type: "number", value: expense, style: { alignment: {horizontal: "right", vertical: "center"} } });
            
      margin = income-expense;
      row += 1;
      ws.setCell(row, 0, { type: "string", value: "Margin" });
      ws.setMergeCell({ ref: `A${row+1}:D${row+1}` });
      ws.setCell(row, 4, { type: "number", value: margin, style: { alignment: {horizontal: "right", vertical: "center"} } });
      ws.setMergeCell({ ref: `E${row+1}:F${row+1}` });

      const xlsx = wb.generateXlsxSync();
      const filename = `${fDate(startDate*1)}-${fDate(endDate*1)}.xlsx`
      writeFileSync(`exports/${filename}`, xlsx);

      const data = new Document({ name: filename, document_type: 'excel' });
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

export default new XlsxController;