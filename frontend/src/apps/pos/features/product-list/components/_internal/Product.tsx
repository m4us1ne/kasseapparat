import React, { useState } from "react";
import { Badge, Card } from "flowbite-react";
import { HiShoppingCart, HiUserAdd, HiOutlineThumbUp } from "react-icons/hi";
import { useConfig } from "@core/config/hooks/useConfig";
import GuestlistModal from "../../../guestlist/components/GuestlistModal";
import Button from "../../../../components/Button";
import ProductInterestModal from "./ProductInterestModal";
import {
  Product as ProductType,
  Guest as GuestType,
} from "../../../../api/schemas";

interface ProductProps {
  product: ProductType;
  addToCart: (
    product: ProductType,
    quantity: number,
    listItem: GuestType | null,
  ) => void;
  hasListItem: (guest: GuestType) => boolean;
  quantityByProductInCart: (product: ProductType) => number;
  addProductInterest: (product: ProductType) => Promise<void>;
}

const Product: React.FC<ProductProps> = ({
  product,
  addToCart,
  hasListItem,
  quantityByProductInCart,
  addProductInterest,
}) => {
  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const [isPIModalOpen, setIsPIModalOpen] = useState(false);
  const { currency } = useConfig();

  const availableStock =
    product.totalStock - product.unitsSold - quantityByProductInCart(product);
  const hasGuestlist = product.guestlists && product.guestlists.length > 0;
  // totalStock === 0 means the product is not stock-tracked at all (tickets),
  // so its availableStock runs negative and must not be read as "none left".
  const tracksStock = product.totalStock > 0;
  // Tracked products with a very large allowance are effectively unlimited;
  // showing a running count for those is just noise.
  const showStockCount = tracksStock && product.totalStock < 1000;
  // For a tracked product, nothing left is sold out as far as the counter cares.
  const isUnavailable = product.soldOut || (tracksStock && availableStock <= 0);

  const getActionButton = () => {
    if (isUnavailable) {
      return (
        <Button aria-label={"Register interest in " + product.name}>
          <HiOutlineThumbUp className="h-5 w-5" />
        </Button>
      );
    } else if (hasGuestlist) {
      return (
        <Button aria-label={"Show guestlist for " + product.name}>
          <HiUserAdd className="h-5 w-5" />
        </Button>
      );
    } else {
      return (
        <Button
          aria-label={
            "Add " +
            product.name +
            " for " +
            currency.format(product.grossPrice.toNumber()) +
            " to cart"
          }
        >
          <HiShoppingCart className="h-5 w-5" />
        </Button>
      );
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isUnavailable) {
      setIsPIModalOpen(true);
    } else if (hasGuestlist) {
      setIsGuestListModalOpen(true);
    } else {
      addToCart(product, 1, null);
    }
  };

  const compactCardTheme = {
    root: {
      children: "flex h-full flex-col justify-center gap-2 p-4",
    },
  };

  return (
    <>
      <Card
        theme={compactCardTheme}
        data-testid={"product-card-" + product.id}
        className="w-[22%] flex flex-col mb-5 mr-5 relative cursor-pointer"
        onClick={handleCardClick}
      >
        {isUnavailable && (
          <Badge className="absolute top-2 right-2" color="gray">
            Sold Out ({product.soldOutRequestCount})
          </Badge>
        )}

        <div className="flex items-center justify-between mt-auto">
          <h5
            className={`text-1xl text-left text-balance font-bold tracking-tight ${
              isUnavailable
                ? "text-gray-400"
                : "text-gray-900 dark:text-gray-200"
            }`}
          >
            {product.name}
          </h5>

          {!isUnavailable && showStockCount && (
            <div className="text-1xl text-left text-balance font-bold tracking-tight text-gray-900 dark:text-gray-200">
              {availableStock}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <p
            className={`text-2xl font-bold ${
              isUnavailable ? "text-gray-400" : "text-gray-900 dark:text-white"
            }`}
          >
            {currency.format(product.grossPrice.toNumber())}
          </p>

          <div className="flex">{getActionButton()}</div>
        </div>
      </Card>

      {product.wrapAfter && <div className="w-full"></div>}

      {!isUnavailable && hasGuestlist && (
        <GuestlistModal
          isOpen={isGuestListModalOpen}
          onClose={() => setIsGuestListModalOpen(false)}
          product={product}
          addToCart={addToCart}
          hasListItem={hasListItem}
        />
      )}

      {isUnavailable && (
        <ProductInterestModal
          show={isPIModalOpen}
          onClose={() => setIsPIModalOpen(false)}
          product={product}
          addProductInterest={addProductInterest}
        />
      )}
    </>
  );
};

export default Product;
