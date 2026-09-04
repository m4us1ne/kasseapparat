import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ConfigContext } from "@core/config/context/ConfigContext";
import { AppConfig } from "@core/config/types/config.types";
import { createMockProduct } from "../../../../api/schemas.mocks";
import { Product as ProductType } from "../../../../api/schemas";
import Product from "./Product";

const mockConfig = {
  version: "1.0.0",
  apiHost: "http://localhost:3001",
  apiBaseUrl: "http://localhost:3001/api/v3",
  websocketHost: "ws://localhost:3001",
  websocketBaseUrl: "ws://localhost:3001/api/v3",
  locale: "en",
  currencyCode: "EUR",
  currencyLocale: "de-DE",
  currency: new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }),
  currencyOptions: {},
  dateLocale: "de-DE",
  dateOptions: {},
  vatRates: [],
  paymentMethods: [],
  sumupEnabled: false,
  authMode: "proxy",
} satisfies AppConfig;

const renderProduct = (product: ProductType) => {
  const addToCart = vi.fn();
  const addProductInterest = vi.fn().mockResolvedValue(undefined);

  render(
    <ConfigContext value={mockConfig}>
      <Product
        product={product}
        addToCart={addToCart}
        hasListItem={() => false}
        quantityByProductInCart={() => 0}
        addProductInterest={addProductInterest}
      />
    </ConfigContext>,
  );

  return { addToCart, addProductInterest };
};

describe("Product", () => {
  it("shows the remaining count on its own for tracked stock", () => {
    const product = createMockProduct({
      soldOut: false,
      guestlists: null,
      totalStock: 20,
      unitsSold: 5,
    });

    renderProduct(product);

    expect(screen.getByText("15")).toBeInTheDocument();
    // The total is deliberately not shown — the counter only cares what is left.
    expect(screen.queryByText("15 / 20")).not.toBeInTheDocument();
  });

  it("leaves untracked products available however many are sold", async () => {
    // totalStock === 0 is how tickets are modelled: no stock tracking at all.
    // availableStock goes negative here and must not read as "none left".
    const product = createMockProduct({
      soldOut: false,
      guestlists: null,
      totalStock: 0,
      unitsSold: 11,
    });

    const { addToCart } = renderProduct(product);

    expect(screen.queryByText(/Sold Out/)).not.toBeInTheDocument();
    expect(screen.queryByText("-11")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId(`product-card-${product.id}`));

    expect(addToCart).toHaveBeenCalledWith(product, 1, null);
  });

  it("hides the stock figure for effectively unlimited stock", () => {
    const product = createMockProduct({
      soldOut: false,
      guestlists: null,
      totalStock: 1000,
      unitsSold: 0,
    });

    renderProduct(product);

    expect(screen.queryByText("1000")).not.toBeInTheDocument();
  });

  it("treats a product with nothing left as sold out", async () => {
    const product = createMockProduct({
      soldOut: false,
      guestlists: null,
      totalStock: 10,
      unitsSold: 10,
      soldOutRequestCount: 3,
    });

    const { addToCart } = renderProduct(product);

    expect(screen.getByText(/Sold Out/)).toBeInTheDocument();

    await userEvent.click(screen.getByTestId(`product-card-${product.id}`));

    expect(screen.getByText("Register interest")).toBeInTheDocument();
    expect(addToCart).not.toHaveBeenCalled();
  });

  it("adds an available product to the cart", async () => {
    const product = createMockProduct({
      soldOut: false,
      guestlists: null,
      totalStock: 10,
      unitsSold: 0,
    });

    const { addToCart } = renderProduct(product);

    expect(screen.queryByText(/Sold Out/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId(`product-card-${product.id}`));

    expect(addToCart).toHaveBeenCalledWith(product, 1, null);
  });
});
