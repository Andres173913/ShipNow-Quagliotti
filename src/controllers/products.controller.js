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

    // Método para obtener un producto por su nombre
    static async getByName(req, res, next) {
        try {
            const { name } = req.params;
            const product = await ProductService.getByName(name);
            res.status(200).json({ status: "success", payload: product });
        } catch (error) {
            next(error);
        }
    }

    // Método para crear un producto
    static async create(req, res, next) {
        try {
            const { name, description, price, stock, category } = req.body;
            const newProduct = await ProductService.create({ name, description, price, stock, category });
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