import Product from './Product'

export default function ProductList ({ products, addToCart, currency }) {
  return (
      <div className="w-full">
        {products.map(product => (
          <Product key={product.id} product={product} addToCart={addToCart} currency={currency} />
        ))}
      </div>
  )
}