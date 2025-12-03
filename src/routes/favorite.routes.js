const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * @route   GET /api/favorites
 * @desc    Récupérer tous les favoris de l'utilisateur
 * @access  Private
 */
router.get("/", favoriteController.getFavorites);

/**
 * @route   GET /api/favorites/check
 * @desc    Vérifier si un vol est dans les favoris
 * @access  Private
 */
router.get("/check", favoriteController.checkFavorite);

/**
 * @route   GET /api/favorites/:id
 * @desc    Récupérer un favori spécifique
 * @access  Private
 */
router.get("/:id", favoriteController.getFavoriteById);

/**
 * @route   POST /api/favorites
 * @desc    Ajouter un vol aux favoris
 * @access  Private
 */
router.post("/", favoriteController.addFavorite);

/**
 * @route   PUT /api/favorites/:id
 * @desc    Mettre à jour un favori (notes)
 * @access  Private
 */
router.put("/:id", favoriteController.updateFavorite);

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Supprimer un favori
 * @access  Private
 */
router.delete("/:id", favoriteController.deleteFavorite);

module.exports = router;
