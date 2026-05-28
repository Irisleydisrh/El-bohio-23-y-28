import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore, type CartItem } from "./cartStore";

describe("useCartStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({ items: [], isOpen: false, orderType: "pickup" });
  });

  describe("addItem", () => {
    it("adds new item to empty cart", () => {
      const store = useCartStore.getState();
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });

      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0]).toEqual({
        id: "1",
        name: "Hamburguesa",
        price: 15000,
        quantity: 1,
      });
    });

    it("increments quantity when adding existing item", () => {
      const store = useCartStore.getState();
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });

      expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    it("can add multiple different items", () => {
      const store = useCartStore.getState();
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });
      store.addItem({ id: "2", name: "Papas", price: 5000 });

      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe("removeItem", () => {
    it("removes item by id", () => {
      const store = useCartStore.getState();
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });
      store.addItem({ id: "2", name: "Papas", price: 5000 });
      store.removeItem("1");

      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].id).toBe("2");
    });
  });

  describe("updateQuantity", () => {
    it("updates quantity of item", () => {
      const store = useCartStore.getState();
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });
      store.updateQuantity("1", 5);

      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("removes item when quantity set to 0", () => {
      const store = useCartStore.getState();
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });
      store.updateQuantity("1", 0);

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    it("removes all items", () => {
      const store = useCartStore.getState();
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });
      store.addItem({ id: "2", name: "Papas", price: 5000 });
      store.clearCart();

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("toggleCart", () => {
    it("toggles isOpen state", () => {
      const store = useCartStore.getState();

      expect(useCartStore.getState().isOpen).toBe(false);

      store.toggleCart();
      expect(useCartStore.getState().isOpen).toBe(true);

      store.toggleCart();
      expect(useCartStore.getState().isOpen).toBe(false);
    });
  });

  describe("setOrderType", () => {
    it("sets order type to delivery", () => {
      const store = useCartStore.getState();
      store.setOrderType("delivery");

      expect(useCartStore.getState().orderType).toBe("delivery");
    });

    it("sets order type to pickup", () => {
      const store = useCartStore.getState();
      store.setOrderType("delivery");
      store.setOrderType("pickup");

      expect(useCartStore.getState().orderType).toBe("pickup");
    });
  });

  describe("total", () => {
    it("calculates total correctly", () => {
      const store = useCartStore.getState();
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 }); // qty 2
      store.addItem({ id: "2", name: "Papas", price: 5000 });

      expect(store.total()).toBe(35000); // (15000*2) + 5000
    });

    it("returns 0 for empty cart", () => {
      expect(useCartStore.getState().total()).toBe(0);
    });
  });

  describe("itemCount", () => {
    it("counts total items including quantities", () => {
      const store = useCartStore.getState();
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 });
      store.addItem({ id: "1", name: "Hamburguesa", price: 15000 }); // qty 2
      store.addItem({ id: "2", name: "Papas", price: 5000 });

      expect(store.itemCount()).toBe(3);
    });
  });
});