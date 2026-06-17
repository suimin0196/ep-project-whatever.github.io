const productForm = document.getElementById('productForm');
const nameInput = document.getElementById('nameInput');
const priceInput = document.getElementById('priceInput');
const categoryInput = document.getElementById('categoryInput');
const categorySuggestions = document.getElementById('categorySuggestions');
const availabilityInput = document.getElementById('availabilityInput');
const descriptionInput = document.getElementById('descriptionInput');
const productTableBody = document.getElementById('productTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const availabilityFilter = document.getElementById('availabilityFilter');
const formTitle = document.getElementById('formTitle');
const submitButton = document.getElementById('submitButton');
const cancelButton = document.getElementById('cancelButton');

let products = [];
let editingId = null;
let categories = ['Electronics', 'Home', 'Garden', 'Office', 'Clothing'];
const availabilityOptions = ['In stock', 'Out of stock'];

function loadProducts() {
  const saved = localStorage.getItem('productCatalogItems');
  products = saved ? JSON.parse(saved) : [];
  if (products.length === 0) {
    products = generateRandomProducts(20);
    saveProducts();
  }
  updateCategoryOptions();
}

function saveProducts() {
  localStorage.setItem('productCatalogItems', JSON.stringify(products));
}

function generateRandomProducts(count) {
  const productNames = [
    'Wireless Mouse',
    'Noise-Cancelling Headphones',
    'Smart LED Lamp',
    'Office Chair',
    'Coffee Maker',
    'Travel Backpack',
    'Desk Organizer',
    'Garden Shears',
    'Bluetooth Speaker',
    'Fitness Tracker',
    'Water Bottle',
    'Yoga Mat',
    'LED Desk Lamp',
    'Wireless Charger',
    'Laptop Stand',
    'Scented Candle',
    'Ceramic Mug',
    'Plant Pot',
    'Winter Gloves',
    'Notebook Set'
  ];

  const descriptions = [
    'High quality and reliable for everyday use.',
    'Stylish design with excellent performance.',
    'Perfect for home, office, and travel.',
    'Comfortable, durable, and easy to maintain.',
    'A smart addition to any modern space.',
    'Compact size with powerful features.',
    'Designed for convenience and durability.',
    'Great value and lasting comfort.',
    'A popular choice for daily routines.',
    'Versatile and elegant for any setting.'
  ];

  return Array.from({ length: count }, (_, index) => {
    const name = productNames[index % productNames.length];
    const category = categories[index % categories.length];
    const availability = availabilityOptions[index % availabilityOptions.length];
    const price = (Math.random() * 180 + 10).toFixed(2);
    const description = descriptions[index % descriptions.length];

    return {
      id: `${Date.now()}-${index}`,
      name,
      price: Number(price),
      category,
      availability,
      description,
    };
  });
}

function resetForm() {
  editingId = null;
  productForm.reset();
  formTitle.textContent = 'Add Product';
  submitButton.textContent = 'Save Product';
  cancelButton.classList.add('hidden');
}

function updateCategoryOptions() {
  const currentFilterValue = categoryFilter.value;
  const defaultCategories = ['Electronics', 'Home', 'Garden', 'Office', 'Clothing'];
  const productCategories = products
    .map((product) => product.category.trim())
    .filter(Boolean);

  categories = Array.from(new Set([...defaultCategories, ...productCategories])).sort((a, b) => a.localeCompare(b));

  categoryFilter.innerHTML = '<option value="">All categories</option>' +
    categories.map((category) => `<option value="${category}">${category}</option>`).join('');

  categorySuggestions.innerHTML = categories.map((category) => `<option value="${category}"></option>`).join('');

  if (categories.includes(currentFilterValue)) {
    categoryFilter.value = currentFilterValue;
  } else {
    categoryFilter.value = '';
  }
}

function getFilteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const availability = availabilityFilter.value;

  return products.filter((product) => {
    const matchesSearch = [product.name, product.category, product.description]
      .join(' ')
      .toLowerCase()
      .includes(query);

    const matchesCategory = category ? product.category === category : true;
    const matchesAvailability = availability ? product.availability === availability : true;

    return matchesSearch && matchesCategory && matchesAvailability;
  });
}

function renderProducts() {
  productTableBody.innerHTML = '';
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="6" class="empty-state">No products found.</td>';
    productTableBody.appendChild(emptyRow);
    return;
  }

  filtered.forEach((product) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td><span class="tag ${product.availability === 'In stock' ? 'success' : 'danger'}">${product.availability}</span></td>
      <td>${product.description || '-'}</td>
      <td>
        <div class="action-buttons">
          <button class="edit" data-id="${product.id}">Edit</button>
          <button class="delete" data-id="${product.id}">Delete</button>
        </div>
      </td>
    `;

    productTableBody.appendChild(row);
  });
}

function addProduct(product) {
  products.push(product);
  saveProducts();
  updateCategoryOptions();
  renderProducts();
}

function updateProduct(updated) {
  products = products.map((product) => (product.id === updated.id ? updated : product));
  saveProducts();
  updateCategoryOptions();
  renderProducts();
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  products = products.filter((product) => product.id !== id);
  saveProducts();
  updateCategoryOptions();
  renderProducts();
  if (editingId === id) resetForm();
}

function startEdit(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  editingId = id;
  nameInput.value = product.name;
  priceInput.value = product.price;
  categoryInput.value = product.category;
  availabilityInput.value = product.availability;
  descriptionInput.value = product.description;
  formTitle.textContent = 'Edit Product';
  submitButton.textContent = 'Update Product';
  cancelButton.classList.remove('hidden');
}

productForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newProduct = {
    id: editingId || Date.now().toString(),
    name: nameInput.value.trim(),
    price: Number(priceInput.value),
    category: categoryInput.value.trim() || 'General',
    availability: availabilityInput.value,
    description: descriptionInput.value.trim(),
  };

  if (editingId) {
    updateProduct(newProduct);
  } else {
    addProduct(newProduct);
  }

  resetForm();
});

cancelButton.addEventListener('click', () => {
  resetForm();
});

productTableBody.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  if (button.classList.contains('edit')) {
    startEdit(id);
  } else if (button.classList.contains('delete')) {
    deleteProduct(id);
  }
});

searchInput.addEventListener('input', renderProducts);
categoryFilter.addEventListener('change', renderProducts);
availabilityFilter.addEventListener('change', renderProducts);

loadProducts();
renderProducts();
