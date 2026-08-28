import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { before, afterEach, after } from 'mocha';

process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });
dotenv.config();

before(async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('Falta la MONGO_URI para ejecutar los test');
    }

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    const promises = Object.values(collections).map(collection => collection.deleteMany({}));
    await Promise.all(promises);
});

after(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
});