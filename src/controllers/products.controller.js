import ProductService from '../services/products.service.js';

class ProductController {

    // Método para obtener productos con paginación y filtros
    static async getAll(req, res, next) {
        try {
            const { page, limit, category, search, minPrice, maxPrice, sort } = req.query || {};
            const products = await ProductService.getAll({ page, limit, category, search, minPrice, maxPrice, sort });

            res.status(200).json({
                status: "success",
                payload: products,
                page: products.page,
                limit: products.limit,
                totalDocs: products.totalDocs,
                totalPages: products.totalPages,
                hasNextPage: products.hasNextPage,
                hasPrevPage: products.hasPrevPage
            });
        } catch (error) {
            next(error);
        }
    }

    // Método para obtener un producto por su ID
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await ProductService.getById(id);
            res.status(200).json({ status: "success", payload: product });
        } catch (error) {
            next(error);
        }
    }

    // Método para obtener un producto por su título
    static async getByTitle(req, res, next) {
        try {
            const { title } = req.params;
            const product = await ProductService.getByTitle(title);
            res.status(200).json({ status: "success", payload: product });
        } catch (error) {
            next(error);
        }
    }

    // Método para crear un producto
    static async create(req, res, next) {
        try {
            const { title, description, price, stock, category, code } = req.body;
            const newProduct = await ProductService.create({ title, description, price, stock, category, code });
            res.status(201).json({ status: "success", payload: newProduct });
        } catch (error) {
            next(error);
        }
    }

    // Método para actualizar un producto
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedProduct = await ProductService.update(id, req.body);
            res.status(200).json({ status: "success", payload: updatedProduct });
        } catch (error) {
            next(error);
        }
    }

    // Método para eliminar un producto
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            await ProductService.delete(id);
            res.status(200).json({ status: "success", message: 'Producto eliminado con éxito.' });
        } catch (error) {
            next(error);
        }
    }

    // Método para agregar la imagen procesada por Multer al array thumbnails del producto
    static async addThumbnail(req, res, next) {
        try {
            const { id } = req.params;
            const file = req.file;

            const updatedProduct = await ProductService.addThumbnail(id, file);

            res.status(200).json({
                status: "success",
                message: "Imagen agregada correctamente al producto",
                payload: updatedProduct
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ProductController;