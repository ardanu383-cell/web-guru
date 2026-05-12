const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { auth, guruOnly } = require('../middleware/auth');

// Publik
router.get('/', menuController.getMenus);
router.get('/pages', menuController.getPages);
router.get('/pages/:slug', menuController.getPageBySlug);

// Admin
router.get('/admin/all', auth, guruOnly, menuController.getAllMenus);
router.post('/', auth, guruOnly, menuController.createMenu);
router.put('/:id', auth, guruOnly, menuController.updateMenu);
router.delete('/:id', auth, guruOnly, menuController.deleteMenu);
router.post('/pages', auth, guruOnly, menuController.createPage);
router.put('/pages/:id', auth, guruOnly, menuController.updatePage);
router.delete('/pages/:id', auth, guruOnly, menuController.deletePage);
module.exports = router;
