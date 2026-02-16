import { describe, it, expect, beforeEach } from "vitest";

describe("Cart Logic", () => {
  interface CartItem { id: string; name: string; price: number; quantity: number; }

  let cart: CartItem[];

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const existing = cart.find((i) => i.id === item.id);
    if (existing) { existing.quantity += 1; }
    else { cart.push({ ...item, quantity: 1 }); }
  };

  const removeItem = (id: string) => { cart = cart.filter((i) => i.id !== id); };

  const updateQuantity = (id: string, quantity: number) => {
    const item = cart.find((i) => i.id === id);
    if (item && quantity > 0) { item.quantity = quantity; }
    else if (quantity <= 0) { removeItem(id); }
  };

  const totalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  beforeEach(() => { cart = []; });

  it("adiciona item ao carrinho", () => {
    addItem({ id: "1", name: "Tarot Completo", price: 29.9 });
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  it("incrementa quantidade ao adicionar item existente", () => {
    addItem({ id: "1", name: "Tarot Completo", price: 29.9 });
    addItem({ id: "1", name: "Tarot Completo", price: 29.9 });
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it("remove item do carrinho", () => {
    addItem({ id: "1", name: "Tarot", price: 29.9 });
    addItem({ id: "2", name: "Mapa Astral", price: 49.9 });
    removeItem("1");
    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe("2");
  });

  it("atualiza quantidade", () => {
    addItem({ id: "1", name: "Tarot", price: 29.9 });
    updateQuantity("1", 5);
    expect(cart[0].quantity).toBe(5);
  });

  it("remove item quando quantidade é 0", () => {
    addItem({ id: "1", name: "Tarot", price: 29.9 });
    updateQuantity("1", 0);
    expect(cart).toHaveLength(0);
  });

  it("calcula preço total corretamente", () => {
    addItem({ id: "1", name: "Tarot", price: 29.9 });
    addItem({ id: "2", name: "Mapa Astral", price: 49.9 });
    updateQuantity("1", 2);
    expect(totalPrice()).toBeCloseTo(109.7, 1);
  });

  it("calcula total de itens corretamente", () => {
    addItem({ id: "1", name: "Tarot", price: 29.9 });
    addItem({ id: "2", name: "Mapa Astral", price: 49.9 });
    updateQuantity("1", 3);
    expect(totalItems()).toBe(4);
  });

  it("carrinho vazio tem preço zero", () => {
    expect(totalPrice()).toBe(0);
    expect(totalItems()).toBe(0);
  });
});
