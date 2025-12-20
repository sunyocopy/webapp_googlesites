// Menu Data Manager
let menuData = {};

// Load menu data from JSON file
async function loadMenuData() {
  try {
    const response = await fetch('data/menu.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    menuData = await response.json();
    console.log('Menu data loaded successfully');
    return menuData;
  } catch (error) {
    console.error('Error loading menu data:', error);
    // Fallback to empty data structure
    menuData = {
      coffee: [],
      tea: [],
      smoothie: [],
      dessert: []
    };
    return menuData;
  }
}

// Get all menu items
function getAllMenuItems() {
  return [
    ...menuData.coffee,
    ...menuData.tea,
    ...menuData.smoothie,
    ...menuData.dessert
  ];
}

// Get menu items by category
function getMenuByCategory(category) {
  if (category === 'all') {
    return getAllMenuItems();
  }
  return menuData[category] || [];
}

// Get single menu item by id
function getMenuItemById(id) {
  const allItems = getAllMenuItems();
  return allItems.find(item => item.id === parseInt(id));
}

// Get price with size adjustment
function getPriceWithSize(basePrice, size) {
  const sizeMultipliers = {
    'S': 1,
    'M': 1.2,
    'L': 1.4
  };
  return Math.round(basePrice * (sizeMultipliers[size] || 1));
}
