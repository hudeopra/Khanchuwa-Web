import mongoose from 'mongoose';

const flavourTagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
}, {
  timestamps: true,
});

const FlavourTag = mongoose.model('FlavourTag', flavourTagSchema);

export default FlavourTag;
