import puppeteer from 'puppeteer-core';
import { executablePath } from 'puppeteer';

import Document from "../models/Document.js";
import TransactionLine from "../models/TransactionLine.js";

import TransactionLineService from '../services/TransactionLineService.js';

import { fDate } from '../libraries/formatTime.js';
import { fCurrency } from '../libraries/formatNumber.js';

class PDFController {
  async export(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const filename = `${fDate(startDate*1)}-${fDate(endDate*1)}.pdf`
      let html = '';

      const query = await TransactionLineService.generateQuerySearch(req);
      if(!query.status) throw { code: query.code, message: "ERROR_QUERY_SEARCH", data: null, status: false }

      let result = TransactionLine.aggregate(query.aggregate);

      const lines = await result;
      if(lines.length > 0) {
        html += `
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Bootstrap demo</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            </head>
            <body>
              <h1 class="text-center">DAFTAR TRANSAKSI</h1>
              <h4 class="text-center">${fDate(startDate*1)} sampai ${fDate(endDate*1)}</h4>
        `;
      }

      let currentDate = '';
      let number = 0;
      let income = 0;
      let expense = 0;
      let first = true;
      lines.map((line) => {
        if(currentDate !== fDate(line.date)) {
          if(!first) {
            html += `
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="4">Total</th>
                    <td>${fCurrency(income)}</td>
                    <td>${fCurrency(expense)}</td>
                  </tr>
                  <tr>
                    <th colspan="4">Margin</th>
                    <td colspan="2">${fCurrency(income-expense)}</td>
                  </tr>
                </tfoot>
              </table>
            `;
          }

          number = 0;
          income = 0;
          expense = 0;
          currentDate = fDate(line.date);

          html += `
          <table class="mt-4 table table-striped table-bordered table-sm">
            <thead>
              <tr>
                <th class="text-center" colspan="6">${fDate(line.date*1)}</th>
              </tr>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Label</th>
                <th scope="col">Akun</th>
                <th scope="col">Vendor</th>
                <th scope="col">Income</th>
                <th scope="col">Expense</th>
              </tr>
            </thead>
            <tbody>
          `;

          first = false;
        }
        number += 1
        income += line.debit;
        expense += line.credit;

        html += `
          <tr>
            <td class="fs-6">${number}</td>
            <td class="fs-6">${line.label}</td>
            <td class="fs-6">${line.accountId?.name || ''}</td>
            <td class="fs-6">${line.vendorId?.name || ''}</td>
            <td class="fs-6">${fCurrency(line.debit)}</td>
            <td class="fs-6">${fCurrency(line.credit)}</td>
          </tr>
        `;
      });
      html += `
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="4">Total</th>
                  <td>${fCurrency(income)}</td>
                  <td>${fCurrency(expense)}</td>
                </tr>
                <tr>
                  <th colspan="4">Margin</th>
                  <td colspan="2">${fCurrency(income-expense)}</td>
                </tr>
              </tfoot>
            </table>
          </body>
        </html>
      `;

      const browser = await puppeteer.launch({ 
        executablePath: executablePath(),
        ignoreDefaultArgs: ['--disable-extensions'], 
      });
      const page = await browser.newPage();

      await page.setContent(html);
      await page.pdf({ path: `exports/${filename}`, format : 'A4', margin : {top: '10mm', right: '10mm', bottom: '10mm', left: '10mm'} });
      await browser.close();
      
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