
import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      className={`bg-surface border border-border rounded-xl p-3 flex flex-col gap-3 transition-all group relative theme-shadow
        ${isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-accent/50 cursor-pointer hover:-translate-y-1'}
      `}
      onClick={() => !isOutOfStock && onAdd(product)}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-background/50">
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-transform duration-300 ${!isOutOfStock && 'group-hover:scale-110'}`}
        />
        {!isOutOfStock && (
            <div className="absolute bottom-2 right-2 bg-accent text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={16} strokeWidth={3} />
            </div>
        )}
        {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider">HABIS</span>
            </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-textMain text-sm truncate">{product.name}</h3>
        <div className="flex justify-between items-end mt-1">
            <p className="text-accent font-bold text-base">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
            <span className={`text-[10px] font-medium ${product.stock < 10 ? 'text-red-500' : 'text-textMuted'}`}>
                Stok: {product.stock}
            </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
