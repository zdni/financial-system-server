import express from "express";

// controllers
import AccountController from '../controllers/AccountController.js';
import AuthController from '../controllers/AuthController.js';
import DocumentController from '../controllers/DocumentController.js';
import PDFController from '../controllers/PDFController.js';
import TransactionController from '../controllers/TransactionController.js';
import TransactionLineController from '../controllers/TransactionLineController.js';
import UserController from '../controllers/UserController.js';
import VendorController from '../controllers/VendorController.js';
import XlsxController from '../controllers/XlsxController.js';
// middlewares
import auth from '../middlewares/auth.js';

const router = express.Router();


// ############################ routers ############################
// accounts
router.get('/accounts', AccountController.index);
router.post('/accounts', auth(), AccountController.store);
router.get('/accounts/:id', AccountController.show);
router.put('/accounts/:id', auth(), AccountController.update);
router.delete('/accounts/:id', auth(), AccountController.destroy);
// auth
router.post('/auth/login', AuthController.login);
router.post('/auth/refresh-token', AuthController.refreshToken);
// transactions
router.get('/transactions', auth(), TransactionController.index);
router.post('/transactions', auth(), TransactionController.store);
router.get('/transactions/:id', auth(), TransactionController.show);
router.put('/transactions/:id', auth(), TransactionController.update);
// router.delete('/transactions/:id', auth(), TransactionController.destroy);
// transaction lines
router.get('/transaction/lines', auth(), TransactionLineController.index);
router.post('/transaction/lines', auth(), TransactionLineController.store);
router.get('/transaction/lines/:id', auth(), TransactionLineController.show);
router.put('/transaction/lines/:id', auth(), TransactionLineController.update);
router.delete('/transaction/lines/:id', auth(), TransactionLineController.destroy);
// users
router.get('/user', auth(), UserController.userFromToken);
router.get('/users', auth(), UserController.index);
router.get('/users/:id', auth(), UserController.show);
router.post('/users', auth(), UserController.store);
router.put('/users/:id', auth(), UserController.update);
router.put('/users/reset-password/:id', auth(), UserController.resetPassword);
router.put('/users/change-password/:id', auth(), UserController.changePassword);
router.delete('/users/:id', auth(), UserController.destroy);
// vendors
router.get('/vendors', auth(), VendorController.index);
router.post('/vendors', auth(), VendorController.store);
router.get('/vendors/:id', auth(), VendorController.show);
router.put('/vendors/:id', auth(), VendorController.update);
router.delete('/vendors/:id', auth(), VendorController.destroy);
// file
router.get('/documents', DocumentController.index);
router.post('/documents', auth(), DocumentController.store);
router.delete('/documents/:id', auth(), DocumentController.destroy);
// export
router.get('/transactions/export/xlsx', auth(), XlsxController.export);
router.get('/transactions/export/pdf', PDFController.export);

// server
router.get('/', function(req, res) {
  try {
    return res.status(200).json({ status: true, message: 'CONNECTED' });
  } catch (error) {
    return res.status(500).json({ status: false, message: 'NOT CONNECTED' });
  }
});

export default router;