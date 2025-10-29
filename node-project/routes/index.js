const express = require('express');
const path = require('path');
const router = express.Router();

// Rota raiz
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;