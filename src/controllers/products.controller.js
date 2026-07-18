import ProductService from '../services/products.service.js';

class ProductController {

    // Método para obtener todos los productos
  static async getAll(req, res) {
    try {
      const products = await ProductService.getAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  }

  // Método para obtener un producto por su ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getById(id);
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ statusCode: 404, message: error.message });
    }
  }

    // Método para obtener un producto por su nombre
    static async getByName(req, res) {
    try {
      const { name } = req.params;
      const product = await ProductService.getByName(name);
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ statusCode: 404, message: error.message });
    }
    }

    // Método para crear un producto
  static async create(req, res) {
    try {
      const { name, description, price, stock, category } = req.body;
      const newProduct = await ProductService.create({ name, description, price, stock, category });
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(400).json({ statusCode: 400, message: error.message });
    }
  }

    // Método para actualizar un producto
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedProduct = await ProductService.update(id, req.body);
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(400).json({ statusCode: 400, message: error.message });
    }
  }

    // Método para eliminar un producto
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await ProductService.delete(id);
      res.status(200).json({ message: 'Producto eliminado con éxito.' });
    } catch (error) {
      res.status(400).json({ statusCode: 400, message: error.message });
    }
  }
}

export default ProductController;