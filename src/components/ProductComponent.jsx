import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

function ProductComponent() {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
}

export default ProductComponent;