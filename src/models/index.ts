import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User = mongoose.model('User', UserSchema);

const ClientSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  endereco: { type: String, required: true },
});

export const Client = mongoose.model('Client', ClientSchema);

const SaleSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  quantidadeAreia: { type: Number, default: 0 },
  valorAreia: { type: Number, default: 0 },
  quantidadeBrita: { type: Number, default: 0 },
  valorBrita: { type: Number, default: 0 },
  valorTotal: { type: Number, required: true },
  pago: { type: Boolean, default: false }, 
  observacao: { type: String },
  dataVenda: { type: Date, default: Date.now } 
});

export const Sale = mongoose.model('Sale', SaleSchema);