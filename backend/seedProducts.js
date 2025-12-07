const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Sample products for a Kirana store
const sampleProducts = [
    // Dairy & Beverages
    { name: 'Amul Taaza Milk (500ml)', price: 28, category: 'Dairy', stock: 50, minStockLevel: 20, description: 'Fresh homogenized toned milk' },
    { name: 'Amul Butter (100g)', price: 60, category: 'Dairy', stock: 30, minStockLevel: 10, description: 'Utterly butterly delicious' },
    { name: 'Mother Dairy Curd (400g)', price: 35, category: 'Dairy', stock: 25, minStockLevel: 10, description: 'Fresh and creamy curd' },
    { name: 'Britannia Bread (400g)', price: 40, category: 'Bakery', stock: 40, minStockLevel: 15, description: 'Soft white bread' },

    // Staples
    { name: 'Tata Salt (1kg)', price: 22, category: 'Staples', stock: 100, minStockLevel: 30, description: 'Iodized salt' },
    { name: 'Fortune Sunflower Oil (1L)', price: 150, category: 'Staples', stock: 40, minStockLevel: 15, description: 'Refined sunflower oil' },
    { name: 'India Gate Basmati Rice (1kg)', price: 120, category: 'Staples', stock: 60, minStockLevel: 20, description: 'Premium basmati rice' },
    { name: 'Toor Dal (1kg)', price: 140, category: 'Staples', stock: 50, minStockLevel: 20, description: 'Arhar dal' },
    { name: 'Aashirvaad Atta (5kg)', price: 280, category: 'Staples', stock: 35, minStockLevel: 10, description: 'Whole wheat flour' },

    // Snacks & Beverages
    { name: 'Parle-G Biscuits (200g)', price: 25, category: 'Snacks', stock: 80, minStockLevel: 30, description: 'Glucose biscuits' },
    { name: 'Lays Chips (50g)', price: 20, category: 'Snacks', stock: 60, minStockLevel: 25, description: 'Classic salted chips' },
    { name: 'Maggi Noodles (70g)', price: 14, category: 'Snacks', stock: 100, minStockLevel: 40, description: '2-minute noodles' },
    { name: 'Coca Cola (600ml)', price: 40, category: 'Beverages', stock: 45, minStockLevel: 20, description: 'Chilled soft drink' },
    { name: 'Bru Coffee (50g)', price: 95, category: 'Beverages', stock: 30, minStockLevel: 10, description: 'Instant coffee' },
    { name: 'Tata Tea Gold (250g)', price: 150, category: 'Beverages', stock: 40, minStockLevel: 15, description: 'Premium tea leaves' },

    // Personal Care
    { name: 'Colgate Toothpaste (200g)', price: 110, category: 'Personal Care', stock: 35, minStockLevel: 15, description: 'Dental care' },
    { name: 'Lux Soap (125g)', price: 45, category: 'Personal Care', stock: 50, minStockLevel: 20, description: 'Beauty soap' },
    { name: 'Clinic Plus Shampoo (180ml)', price: 95, category: 'Personal Care', stock: 30, minStockLevel: 10, description: 'Hair shampoo' },

    // Household
    { name: 'Vim Bar (200g)', price: 25, category: 'Household', stock: 40, minStockLevel: 15, description: 'Dishwash bar' },
    { name: 'Surf Excel (1kg)', price: 180, category: 'Household', stock: 30, minStockLevel: 10, description: 'Detergent powder' },
    { name: 'Lizol Floor Cleaner (500ml)', price: 110, category: 'Household', stock: 25, minStockLevel: 10, description: 'Disinfectant cleaner' },

    // Spices & Condiments
    { name: 'MDH Chilli Powder (100g)', price: 70, category: 'Spices', stock: 40, minStockLevel: 15, description: 'Red chilli powder' },
    { name: 'Everest Turmeric Powder (100g)', price: 50, category: 'Spices', stock: 40, minStockLevel: 15, description: 'Haldi powder' },
    { name: 'Catch Garam Masala (50g)', price: 45, category: 'Spices', stock: 35, minStockLevel: 15, description: 'Blended spices' },
    { name: 'Kissan Tomato Ketchup (500g)', price: 85, category: 'Condiments', stock: 30, minStockLevel: 10, description: 'Tomato sauce' },
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing products (optional - comment out if you want to keep existing)
        const existingCount = await Product.countDocuments();
        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing products.`);
            console.log('Skipping seed to preserve existing data.');
            console.log('To clear and reseed, delete products manually first.');
            process.exit(0);
        }

        // Insert sample products
        await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully seeded ${sampleProducts.length} products!`);

        // Show summary by category
        const categories = [...new Set(sampleProducts.map(p => p.category))];
        console.log('\n📦 Products by Category:');
        for (const cat of categories) {
            const count = sampleProducts.filter(p => p.category === cat).length;
            console.log(`   ${cat}: ${count} items`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
