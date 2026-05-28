import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Truck, Store, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { generateOrderId, buildOrderMessage, openWhatsApp } from '@/lib/whatsapp';
import { useToast } from '@/hooks/use-toast';

const CartDrawer = () => {
  const { items, isOpen, orderType, toggleCart, removeItem, updateQuantity, setOrderType, total, clearCart } =
    useCartStore();
  const { toast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const handleSubmit = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({ title: 'Faltan datos', description: 'Por favor completa tu nombre y teléfono', variant: 'destructive' });
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast({ title: 'Dirección requerida', description: 'Ingresa tu dirección para el delivery', variant: 'destructive' });
      return;
    }
    if (items.length === 0) {
      toast({ title: 'Carrito vacío', description: 'Agrega productos antes de ordenar', variant: 'destructive' });
      return;
    }

    const orderId = generateOrderId();
    const message = buildOrderMessage({
      orderId,
      items,
      total: total(),
      orderType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
    });

    openWhatsApp(message);
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    toggleCart();
    toast({ title: '¡Pedido enviado! 🎉', description: `Tu orden ${orderId} fue enviada por WhatsApp` });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={toggleCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-2xl font-display text-gradient flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" /> Tu Pedido
              </h2>
              <button onClick={toggleCart} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order type */}
            <div className="flex gap-3 p-5 border-b border-border">
              <button
                onClick={() => setOrderType('pickup')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                  orderType === 'pickup'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Store className="w-4 h-4" /> Recoger
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                  orderType === 'delivery'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Truck className="w-4 h-4" /> Delivery
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">Tu carrito está vacío 🛒</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-secondary text-sm font-display">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-muted hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form and total */}
            <div className="border-t border-border p-5 space-y-3">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Tu teléfono"
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {orderType === 'delivery' && (
                <input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Dirección de entrega"
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Total:</span>
                <span className="text-3xl font-display text-secondary">${total().toFixed(2)} CUP</span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-accent text-accent-foreground font-display text-xl tracking-wider rounded-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >
                Enviar por WhatsApp 📱
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
