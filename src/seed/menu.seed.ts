import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MenuItem } from '../models';
import { MENU_CATEGORIES } from '../utils/constants';

dotenv.config();

const menuItems = [
  // Main Course
  {
    itemNumber: 1,
    name: 'Jollof Rice with Chicken',
    description: 'Smoky Nigerian jollof rice served with grilled chicken',
    price: 3500,
    category: MENU_CATEGORIES.MAIN_COURSE,
    available: true,
  },
  {
    itemNumber: 2,
    name: 'Fried Rice with Turkey',
    description: 'Savory fried rice with vegetables and turkey',
    price: 4000,
    category: MENU_CATEGORIES.MAIN_COURSE,
    available: true,
  },
  {
    itemNumber: 3,
    name: 'Pounded Yam with Egusi',
    description: 'Soft pounded yam with rich egusi soup and assorted meat',
    price: 4500,
    category: MENU_CATEGORIES.MAIN_COURSE,
    available: true,
  },
  {
    itemNumber: 4,
    name: 'Spaghetti Bolognese',
    description: 'Italian pasta with rich minced meat sauce',
    price: 3000,
    category: MENU_CATEGORIES.MAIN_COURSE,
    available: true,
  },
  {
    itemNumber: 5,
    name: 'Grilled Fish with Plantain',
    description: 'Fresh grilled tilapia with fried plantain and sauce',
    price: 5000,
    category: MENU_CATEGORIES.MAIN_COURSE,
    available: true,
  },
  {
    itemNumber: 6,
    name: 'Amala with Ewedu',
    description: 'Traditional amala with ewedu and gbegiri soup',
    price: 3500,
    category: MENU_CATEGORIES.MAIN_COURSE,
    available: true,
  },

  // Sides
  {
    itemNumber: 7,
    name: 'Moi Moi',
    description: 'Steamed bean pudding with fish',
    price: 800,
    category: MENU_CATEGORIES.SIDES,
    available: true,
  },
  {
    itemNumber: 8,
    name: 'Fried Plantain (Dodo)',
    description: 'Sweet fried ripe plantain',
    price: 500,
    category: MENU_CATEGORIES.SIDES,
    available: true,
  },
  {
    itemNumber: 9,
    name: 'Coleslaw',
    description: 'Fresh vegetable coleslaw',
    price: 400,
    category: MENU_CATEGORIES.SIDES,
    available: true,
  },
  {
    itemNumber: 10,
    name: 'Pepper Soup',
    description: 'Spicy goat meat pepper soup',
    price: 1500,
    category: MENU_CATEGORIES.SIDES,
    available: true,
  },

  // Drinks
  {
    itemNumber: 11,
    name: 'Chapman',
    description: 'Nigerian cocktail mocktail with fruits',
    price: 1200,
    category: MENU_CATEGORIES.DRINKS,
    available: true,
  },
  {
    itemNumber: 12,
    name: 'Zobo',
    description: 'Chilled hibiscus drink with ginger',
    price: 500,
    category: MENU_CATEGORIES.DRINKS,
    available: true,
  },
  {
    itemNumber: 13,
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 800,
    category: MENU_CATEGORIES.DRINKS,
    available: true,
  },
  {
    itemNumber: 14,
    name: 'Bottled Water',
    description: 'Premium bottled water (75cl)',
    price: 200,
    category: MENU_CATEGORIES.DRINKS,
    available: true,
  },
  {
    itemNumber: 15,
    name: 'Soft Drinks',
    description: 'Coca-Cola, Fanta, or Sprite',
    price: 350,
    category: MENU_CATEGORIES.DRINKS,
    available: true,
  },

  // Desserts
  {
    itemNumber: 16,
    name: 'Puff Puff',
    description: 'Sweet Nigerian doughnut balls',
    price: 500,
    category: MENU_CATEGORIES.DESSERTS,
    available: true,
  },
  {
    itemNumber: 17,
    name: 'Chin Chin',
    description: 'Crunchy fried pastry snack',
    price: 400,
    category: MENU_CATEGORIES.DESSERTS,
    available: true,
  },
  {
    itemNumber: 18,
    name: 'Ice Cream',
    description: 'Vanilla ice cream with chocolate topping',
    price: 1000,
    category: MENU_CATEGORIES.DESSERTS,
    available: true,
  },
];

async function seedMenu() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-chatbot';

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing menu items...');
    await MenuItem.deleteMany({});

    console.log('🌱 Seeding menu items...');
    await MenuItem.insertMany(menuItems);

    console.log(`✅ Successfully seeded ${menuItems.length} menu items!`);

    // Display seeded items
    console.log('\n📋 Menu Items:');
    console.log('─'.repeat(50));

    for (const item of menuItems) {
      console.log(`${item.itemNumber}. ${item.name} - ₦${item.price.toLocaleString()}`);
    }

    console.log('─'.repeat(50));

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seed
seedMenu();
