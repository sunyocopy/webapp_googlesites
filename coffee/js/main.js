// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

async function initializeApp() {
  // Show loading animation
  showLoadingAnimation();

  // Load menu data first
  await loadMenuData();

  // Initialize app components
  loadMenu();
  setupEventListeners();
  setupOrderTypeSelection();
  setupMobileMenu();
  setupSmoothScrolling();
}

// Load and display menu
function loadMenu(category = 'all') {
  const menuGrid = document.getElementById('menuGrid');
  if (!menuGrid) return;

  const items = getMenuByCategory(category);

  menuGrid.innerHTML = items.map(item => createMenuItemHTML(item)).join('');

  // Add fade-in animation
  menuGrid.classList.add('fade-in');
}

// Create HTML for menu item
function createMenuItemHTML(item) {
  const optionsHTML = createOptionsHTML(item.options);

  return `
        <div class="menu-item" data-category="${item.category}">
            <div class="menu-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOEI0NTEzIiBmb250LXNpemU9IjQ4Ij7imJXvuI88L3RleHQ+Cjwvc3ZnPg=='; this.alt='ไม่สามารถโหลดรูปภาพได้';">
            </div>
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="menu-item-price">฿${item.price}</div>
                <div class="menu-item-options" id="options-${item.id}">
                    ${optionsHTML}
                </div>
                <button class="add-to-cart" onclick="addToCartFromMenu(${item.id})">
                    เพิ่มลงตะกร้า
                </button>
            </div>
        </div>
    `;
}

// Create options HTML for menu item
function createOptionsHTML(options) {
  if (!options) return '';

  let html = '';

  for (const [key, values] of Object.entries(options)) {
    if (Array.isArray(values)) {
      const label = getOptionLabel(key);
      html += `
                <div class="option-group">
                    <label>${label}:</label>
                    <select name="${key}">
                        ${values.map(value => `<option value="${value}">${value}</option>`).join('')}
                    </select>
                </div>
            `;
    }
  }

  return html;
}

// Get option label in Thai
function getOptionLabel(key) {
  const labels = {
    size: 'ขนาด',
    sweetness: 'ความหวาน',
    intensity: 'ความเข้มข้น',
    hot: 'อุณหภูมิ',
    milk: 'ประเภทนม',
    pearls: 'ไข่มุก',
    topping: 'ท็อปปิ้ง',
    serving: 'เสิร์ฟ',
    filling: 'ไส้',
    flavor: 'รสชาติ',
    quantity: 'จำนวน'
  };
  return labels[key] || key;
}

// Add item to cart from menu
function addToCartFromMenu(itemId) {
  const optionsContainer = document.getElementById(`options-${itemId}`);
  const options = {};

  if (optionsContainer) {
    const selects = optionsContainer.querySelectorAll('select');
    selects.forEach(select => {
      options[select.name] = select.value;
    });
  }

  cart.addItem(itemId, options);
}

// Setup event listeners
function setupEventListeners() {
  // Menu category buttons
  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active button
      categoryButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Load menu for selected category
      const category = this.dataset.category;
      loadMenu(category);
    });
  });

  // Modal close events
  window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Form submissions
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      processPayment();
    });
  }
}

// Setup order type selection
function setupOrderTypeSelection() {
  const orderOptions = document.querySelectorAll('.order-option');
  orderOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Update active option
      orderOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');

      // Update cart order type
      const orderType = this.dataset.type;
      cart.setOrderType(orderType);

      // Show feedback
      const optionName = orderType === 'pickup' ? 'รับที่ร้าน' : 'จัดส่ง';
      showNotification(`เลือก ${optionName} แล้ว`);
    });
  });
}

// Setup mobile menu
function setupMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking on nav links
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

// Setup smooth scrolling
function setupSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80; // Account for fixed header
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Helper functions for navigation
function scrollToMenu() {
  const menuSection = document.getElementById('menu');
  if (menuSection) {
    const offsetTop = menuSection.offsetTop - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}

function scrollToAbout() {
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    const offsetTop = aboutSection.offsetTop - 80;
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    });
  }
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';

  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 3000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Search functionality
function searchMenu(query) {
  if (!query) {
    loadMenu();
    return;
  }

  const allItems = getAllMenuItems();
  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const menuGrid = document.getElementById('menuGrid');
  if (menuGrid) {
    if (filteredItems.length === 0) {
      menuGrid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1; padding: 2rem;">ไม่พบสินค้าที่ค้นหา</p>';
    } else {
      menuGrid.innerHTML = filteredItems.map(item => createMenuItemHTML(item)).join('');
    }
  }
}

// Filter menu by price range
function filterByPrice(minPrice, maxPrice) {
  const allItems = getAllMenuItems();
  const filteredItems = allItems.filter(item =>
    item.price >= minPrice && item.price <= maxPrice
  );

  const menuGrid = document.getElementById('menuGrid');
  if (menuGrid) {
    menuGrid.innerHTML = filteredItems.map(item => createMenuItemHTML(item)).join('');
  }
}

// Sort menu items
function sortMenu(sortBy) {
  const allItems = getAllMenuItems();
  let sortedItems = [...allItems];

  switch (sortBy) {
    case 'price-low':
      sortedItems.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sortedItems.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sortedItems.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  const menuGrid = document.getElementById('menuGrid');
  if (menuGrid) {
    menuGrid.innerHTML = sortedItems.map(item => createMenuItemHTML(item)).join('');
  }
}

// Handle window resize
window.addEventListener('resize', function() {
  // Close mobile menu if window is resized to desktop
  if (window.innerWidth > 768) {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  }
});

// Handle scroll for header effect
window.addEventListener('scroll', function() {
  const header = document.querySelector('.header');
  if (header) {
    if (window.scrollY > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.backdropFilter = 'blur(10px)';
    } else {
      header.style.background = '#fff';
      header.style.backdropFilter = 'none';
    }
  }
});

// Loading animation for menu items
function showLoadingAnimation() {
  const menuGrid = document.getElementById('menuGrid');
  if (menuGrid) {
    menuGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #8B4513;"></i>
                <p style="margin-top: 1rem; color: #666;">กำลังโหลดเมนู...</p>
            </div>
        `;
  }
}

// Error handling
window.addEventListener('error', function(e) {
  console.error('JavaScript Error:', e.error);
  showNotification('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error');
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful');
      })
      .catch(function(err) {
        console.log('ServiceWorker registration failed');
      });
  });
}

// Initialize Google Maps (if needed for advanced features)
function initializeMap() {
  const mapElement = document.getElementById('map');
  if (mapElement && window.google) {
    // Advanced Google Maps integration can be added here
    // For now, we're using iframe which works well
    console.log('Map element found, using iframe implementation');
  }
}

// Handle map loading errors
function handleMapError() {
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.innerHTML = `
            <div class="map-placeholder">
                <i class="fas fa-map-marker-alt"></i>
                <p>ไม่สามารถโหลดแผนที่ได้</p>
                <p style="font-size: 0.9rem; color: #999;">123 ถนนกาแฟ แขวงเครื่องดื่ม เขตร้านอาหาร กรุงเทพฯ 10110</p>
            </div>
        `;
  }
}

// Add map loading error handler
window.addEventListener('load', function() {
  const iframe = document.querySelector('.contact-map iframe');
  if (iframe) {
    iframe.addEventListener('error', handleMapError);

    // Check if iframe loaded successfully after 5 seconds
    setTimeout(() => {
      if (!iframe.contentDocument && !iframe.contentWindow) {
        console.warn('Map iframe may not have loaded properly');
      }
    }, 5000);
  }
});

// Export functions for global access
window.CoffeeHouseApp = {
  loadMenu,
  searchMenu,
  filterByPrice,
  sortMenu,
  scrollToMenu,
  scrollToAbout,
  showNotification,
  initializeMap,
  handleMapError
};
