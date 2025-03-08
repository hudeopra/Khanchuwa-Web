import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RecipeTag from '../models/recipeTag.model.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_AUTH_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    return addInitialTags();
  })
  .catch((err) => {
    console.error('Connection error:', err);
  });

async function addInitialTags() {
  try {
    const tags = [
      // Flavour tags
      { tagType: 'flavourTag', name: 'Nutmeggy' },
      { tagType: 'flavourTag', name: 'Clovey' },
      { tagType: 'flavourTag', name: 'Coriandery' },
      { tagType: 'flavourTag', name: 'Fennelly' },
      { tagType: 'flavourTag', name: 'Thymey' },
      { tagType: 'flavourTag', name: 'Tarragon' },

      // cuisine tags
      { tagType: 'cuisineTag', name: 'Italian' },
      { tagType: 'cuisineTag', name: 'Mexican' },
      { tagType: 'cuisineTag', name: 'Indian' },
      { tagType: 'cuisineTag', name: 'French' },
      { tagType: 'cuisineTag', name: 'Chinese' },

      // Ingrident tags
      { tagType: 'ingredientTag', name: 'Salt' },
      { tagType: 'ingredientTag', name: 'Pepper' },
      { tagType: 'ingredientTag', name: 'Garlic' },
      { tagType: 'ingredientTag', name: 'Onion' },
      { tagType: 'ingredientTag', name: 'Tomato' },
    ];
    const result = await RecipeTag.insertMany(tags, { ordered: false });
    console.log('Initial tags added:', result);
  } catch (err) {
    console.error('Error adding tags:', err);
  } finally {
    mongoose.connection.close();
  }
}
