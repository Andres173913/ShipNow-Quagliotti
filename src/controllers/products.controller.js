import ProductService from '../services/products.service.js';

class ProductController {

    // Método para obtener todos los productos
    static async getAll(req, res, next) {
        try {
            const products = await ProductService.getAll();
            res.status(200).json({ status: "success", payload: products });
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
}

export default ProductController;