require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const Category = require('./models/Category');
const Product = require('./models/Product');
const AdminUser = require('./models/AdminUser');
const Recipe = require('./models/Recipe');

const seedData = async () => {
    try {
        console.log('Env Check MONGODB_URI:', process.env.MONGODB_URI ? 'Defined' : 'UNDEFINED');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding...');

        // 1. Clear existing Data
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Recipe.deleteMany({});

        console.log('Seed: Existing categories, products, and recipes cleared.');

        // 2. Seed Admin User
        const adminEmail = 'admin@neighbourhoodmarket.com';
        const existingAdmin = await AdminUser.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await AdminUser.create({
                email: adminEmail,
                password: hashedPassword,
                role: 'SuperAdmin'
            });
            console.log('Seed: Admin user created.');
        }

        // 3. Seed Categories
        const catDairy = await Category.create({ name: 'Dairy & Eggs', description: 'Fresh milk, eggs, and dairy products.' });
        const catBakery = await Category.create({ name: 'Bakery & Bread', description: 'Fresh baked breads and pastries.' });
        const catProduce = await Category.create({ name: 'Fruits & Vegetables', description: 'Fresh fruits and vegetables.' });
        const catPantry = await Category.create({ name: 'Pantry Staples', description: 'Rice, oil, sugar, spices, and essentials.' });
        const catMeat = await Category.create({ name: 'Meat & Sea', description: 'Fresh meat and seafood.' });
        const catSnacks = await Category.create({ name: 'Snacks & Sweets', description: 'Cookies, chips, and chocolate.' });
        const catHousehold = await Category.create({ name: 'Household', description: 'Batteries, cleaning, and more.' });

        // 4. Seed Products
        const prodData = [
            {
                name: 'Fresh Cow Milk (1L)',
                description: 'Farm fresh cow milk packed with nutrients.',
                basePrice: 65,
                stock: 45,
                category: catDairy._id,
                imageURL: 'images/category_dairy.svg',
                brand: 'Amul',
                isOrganic: true
            },
            {
                name: 'Farm Eggs (Dozen)',
                description: 'Fresh free-range large eggs.',
                basePrice: 85,
                stock: 30,
                category: catDairy._id,
                imageURL: 'images/category_dairy.svg',
                brand: 'Local Farm'
            },
            {
                name: 'Whole Wheat Bread',
                description: 'Soft and healthy whole wheat bread baked daily.',
                basePrice: 45,
                stock: 20,
                category: catBakery._id,
                imageURL: 'images/category_bakery.svg',
                brand: 'Bakers Choice'
            },
            {
                name: 'Red Apples (1kg)',
                description: 'Crisp, sweet and juicy red apples from Kashmir.',
                basePrice: 200,
                stock: 25,
                category: catProduce._id,
                imageURL: 'images/category_produce.svg',
                brand: 'Kashmir Fresh',
                isOrganic: true
            },
            {
                name: 'Basmati Rice (1kg)',
                description: 'Premium long grain basmati rice.',
                basePrice: 150,
                stock: 100,
                category: catPantry._id,
                imageURL: 'images/product_placeholder.svg',
                brand: 'India Gate'
            },
            {
                name: 'Potato Chips',
                description: 'Classic salted potato chips, extra crunchy.',
                basePrice: 3.49,
                stock: 42,
                category: catSnacks._id,
                imageURL: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
                brand: 'CrunchCo'
            },
            {
                name: 'AA Batteries (8pk)',
                description: 'Long-lasting alkaline AA batteries.',
                basePrice: 8.99,
                stock: 15,
                category: catHousehold._id,
                imageURL: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5c?w=400&h=400&fit=crop',
                brand: 'PowerCell'
            },
            {
                name: 'Sparkling Water',
                description: 'Refreshing lime flavored sparkling water.',
                basePrice: 1.29,
                stock: 100,
                category: catProduce._id, // Using produce for now or maybe Beverages? Let's stick to produce if it exists or seed a beverage cat.
                imageURL: 'https://images.unsplash.com/photo-1551731589-23a9d59ca18c?w=400&h=400&fit=crop',
                brand: 'Bubbles'
            }
        ];

        const seededProducts = await Product.insertMany(prodData);
        console.log(`Seed: ${seededProducts.length} Products inserted.`);

        // 5. Seed Recipes
        const milk = seededProducts.find(p => p.name.includes('Milk'));
        const eggs = seededProducts.find(p => p.name.includes('Eggs'));
        const bread = seededProducts.find(p => p.name.includes('Bread'));

        const recipes = [
            {
                title: 'Classic French Toast',
                description: 'A simple and delicious breakfast favorite made with fresh bread, eggs, and milk.',
                prepTime: '15 mins',
                servings: 2,
                imageURL: 'images/recipe_placeholder.svg',
                ingredients: [
                    { name: 'Fresh Milk', amount: '1/2 cup', productId: milk ? milk._id : null },
                    { name: 'Eggs', amount: '2 large', productId: eggs ? eggs._id : null },
                    { name: 'Bread Slices', amount: '4 slices', productId: bread ? bread._id : null },
                    { name: 'Cinnamon', amount: '1 tsp' },
                    { name: 'Maple Syrup', amount: 'for topping' }
                ],
                instructions: [
                    'In a shallow bowl, whisk together eggs, milk, and cinnamon.',
                    'Dip each slice of bread into the egg mixture, soaking both sides.',
                    'Heat a non-stick pan over medium heat with a little butter.',
                    'Cook bread slices until golden brown on both sides.',
                    'Serve warm with maple syrup.'
                ]
            }
        ];

        await Recipe.insertMany(recipes);
        console.log('Seed: Recipes inserted.');

        console.log('Database Seeding Completed Successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedData();
