// Shopping Cart Management
class ShoppingCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
    this.orderType = localStorage.getItem('orderType') || 'pickup';
    this.updateCartUI();
  }

  // Add item to cart
  addItem(itemId, options = {}) {
    const menuItem = getMenuItemById(itemId);
    if (!menuItem) return;

    // Calculate price based on size
    const size = options.size || 'M';
    const price = getPriceWithSize(menuItem.price, size);

    // Create cart item
    const cartItem = {
      id: Date.now(), // Unique cart item ID
      menuId: itemId,
      name: menuItem.name,
      price: price,
      quantity: 1,
      options: options,
      image: menuItem.image
    };

    // Check if same item with same options exists
    const existingItemIndex = this.items.findIndex(item =>
      item.menuId === itemId &&
      JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItemIndex > -1) {
      this.items[existingItemIndex].quantity += 1;
    } else {
      this.items.push(cartItem);
    }

    this.saveCart();
    this.updateCartUI();
    this.showAddToCartFeedback(menuItem.name);
  }

  // Remove item from cart
  removeItem(cartItemId) {
    this.items = this.items.filter(item => item.id !== cartItemId);
    this.saveCart();
    this.updateCartUI();
  }

  // Update item quantity
  updateQuantity(cartItemId, newQuantity) {
    const item = this.items.find(item => item.id === cartItemId);
    if (item) {
      if (newQuantity <= 0) {
        this.removeItem(cartItemId);
      } else {
        item.quantity = newQuantity;
        this.saveCart();
        this.updateCartUI();
      }
    }
  }

  // Get cart total
  getTotal() {
    const subtotal = this.items.reduce((total, item) =>
      total + (item.price * item.quantity), 0
    );

    const deliveryFee = this.orderType === 'delivery' ? 30 : 0;
    return {
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: subtotal + deliveryFee
    };
  }

  // Get cart item count
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Set order type
  setOrderType(type) {
    this.orderType = type;
    localStorage.setItem('orderType', type);
    this.updateCartUI();
  }

  // Clear cart
  clear() {
    this.items = [];
    this.saveCart();
    this.updateCartUI();
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  // Update cart UI
  updateCartUI() {
    this.updateCartCount();
    this.updateCartModal();
    this.updateDeliveryFeeDisplay();
  }

  // Update cart count badge
  updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const count = this.getItemCount();
      cartCount.textContent = count;
      cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // Update cart modal content
  updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (!cartItems) return;

    if (this.items.length === 0) {
      cartItems.innerHTML = '<p class="text-center" style="padding: 2rem; color: #666;">ตะกร้าของคุณว่างเปล่า</p>';
    } else {
      cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="cart-item-placeholder" style="display: none;">☕</div>
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${this.formatOptions(item.options)}</p>
                        <p>฿${item.price}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="remove-btn" onclick="cart.removeItem(${item.id})">ลบ</button>
                    </div>
                </div>
            `).join('');
    }

    const totals = this.getTotal();
    if (subtotalEl) subtotalEl.textContent = `฿${totals.subtotal}`;
    if (totalEl) totalEl.textContent = `฿${totals.total}`;
  }

  // Update delivery fee display
  updateDeliveryFeeDisplay() {
    const deliveryFeeEl = document.getElementById('deliveryFee');
    if (deliveryFeeEl) {
      deliveryFeeEl.style.display = this.orderType === 'delivery' ? 'flex' : 'none';
    }
  }

  // Format options for display
  formatOptions(options) {
    const formatted = [];
    for (const [key, value] of Object.entries(options)) {
      if (value) {
        formatted.push(value);
      }
    }
    return formatted.join(', ') || 'ปกติ';
  }

  // Show add to cart feedback
  showAddToCartFeedback(itemName) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 3000;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
    notification.textContent = `เพิ่ม "${itemName}" ลงในตะกร้าแล้ว`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Get items for checkout
  getCheckoutItems() {
    return this.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      options: this.formatOptions(item.options),
      total: item.price * item.quantity
    }));
  }
}

// Create global cart instance
const cart = new ShoppingCart();

// Cart-related functions
function toggleCart() {
  const modal = document.getElementById('cartModal');
  if (modal.style.display === 'block') {
    modal.style.display = 'none';
  } else {
    modal.style.display = 'block';
    cart.updateCartModal();
  }
}

function proceedToCheckout() {
  if (cart.items.length === 0) {
    alert('กรุณาเลือกสินค้าก่อนทำการสั่งซื้อ');
    return;
  }

  toggleCart();
  showCheckout();
}

function showCheckout() {
  const modal = document.getElementById('checkoutModal');
  const deliveryAddress = document.getElementById('deliveryAddress');
  const checkoutItems = document.getElementById('checkoutItems');
  const checkoutTotal = document.getElementById('checkoutTotal');

  // Show/hide delivery address based on order type
  if (deliveryAddress) {
    deliveryAddress.style.display = cart.orderType === 'delivery' ? 'block' : 'none';
    const addressField = deliveryAddress.querySelector('textarea');
    if (addressField) {
      addressField.required = cart.orderType === 'delivery';
    }
  }

  // Update checkout items
  if (checkoutItems) {
    const items = cart.getCheckoutItems();
    checkoutItems.innerHTML = items.map(item => `
            <div class="checkout-item">
                <span>${item.name} x${item.quantity}</span>
                <span>฿${item.total}</span>
            </div>
        `).join('');
  }

  // Update total
  if (checkoutTotal) {
    const totals = cart.getTotal();
    checkoutTotal.textContent = `฿${totals.total}`;
  }

  modal.style.display = 'block';
}

function closeCheckout() {
  document.getElementById('checkoutModal').style.display = 'none';
}

function processPayment() {
  const form = document.getElementById('checkoutForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const customerName = document.getElementById('customerName').value;
  const customerPhone = document.getElementById('customerPhone').value;
  const address = document.getElementById('address').value;
  const notes = document.getElementById('notes').value;

  if (!customerName || !customerPhone) {
    alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
    return;
  }

  if (cart.orderType === 'delivery' && !address) {
    alert('กรุณากรอกที่อยู่สำหรับการจัดส่ง');
    return;
  }

  // Store order data
  const orderData = {
    items: cart.getCheckoutItems(),
    customer: {
      name: customerName,
      phone: customerPhone,
      address: address,
      notes: notes
    },
    orderType: cart.orderType,
    totals: cart.getTotal(),
    timestamp: new Date().toISOString()
  };

  localStorage.setItem('currentOrder', JSON.stringify(orderData));

  closeCheckout();
  showPayment();
}

function showPayment() {
  const modal = document.getElementById('paymentModal');
  const paymentAmount = document.getElementById('paymentAmount');

  const totals = cart.getTotal();
  if (paymentAmount) {
    paymentAmount.textContent = `฿${totals.total}`;
  }

  modal.style.display = 'block';

  // Simulate payment processing
  setTimeout(() => {
    const paymentStatus = modal.querySelector('.payment-status p');
    if (paymentStatus) {
      paymentStatus.innerHTML = 'กรุณายืนยันการชำระเงิน <i class="fas fa-check-circle" style="color: #28a745;"></i>';
    }
  }, 3000);
}

function cancelPayment() {
  document.getElementById('paymentModal').style.display = 'none';
}

function confirmPayment() {
  // Simulate successful payment
  alert('ชำระเงินสำเร็จ! คำสั่งซื้อของคุณได้รับการยืนยันแล้ว');

  // Clear cart and close modals
  cart.clear();
  document.getElementById('paymentModal').style.display = 'none';

  // In a real application, you would send the order to a server here
  localStorage.removeItem('currentOrder');

  // Show success message or redirect
  showOrderSuccess();
}

function showOrderSuccess() {
  const successMsg = document.createElement('div');
  successMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        text-align: center;
        z-index: 4000;
        max-width: 400px;
    `;

  successMsg.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 4rem; color: #28a745; margin-bottom: 1rem;"></i>
        <h2 style="color: #8B4513; margin-bottom: 1rem;">สั่งซื้อสำเร็จ!</h2>
        <p style="margin-bottom: 1.5rem;">ขอบคุณที่ใช้บริการ คำสั่งซื้อของคุณกำลังเตรียม</p>
        <button class="btn btn-primary" onclick="this.parentElement.remove()">ตกลง</button>
    `;

  document.body.appendChild(successMsg);

  setTimeout(() => {
    if (successMsg.parentElement) {
      successMsg.remove();
    }
  }, 5000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
