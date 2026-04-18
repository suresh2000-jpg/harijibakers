// ========== STATE MANAGEMENT ==========
        let products = JSON.parse(localStorage.getItem('bakeryProducts')) || [
            {
                id: 1,
                name: 'Chocolate Cake',
                price: 300,
                description: 'Rich, moist chocolate cake perfect for celebrations',
                emoji: '🍰',
                image: null
            },
            {
                id: 2,
                name: 'Vanilla Cupcakes',
                price: 150,
                description: 'Soft vanilla cupcakes with cream frosting (pack of 6)',
                emoji: '🧁',
                image: null
            },
            {
                id: 3,
                name: 'Croissants',
                price: 80,
                description: 'Buttery French croissants, fresh daily',
                emoji: '🥐',
                image: null
            }
        ];

        let cart = JSON.parse(localStorage.getItem('bakeryCart')) || [];
        let orders = JSON.parse(localStorage.getItem('bakeryOrders')) || [];

        const OWNER_PHONE = '+918950050763'; // Change this to your actual WhatsApp number
        const OWNER_EMAIL = 'suresh2000kumae@gmail.com'; // For email confirmation
        
        // Admin credentials - CHANGE THESE!
        const ADMIN_USERNAME = 'admin';
        const ADMIN_PASSWORD = 'admin@123';
        let isAdminLoggedIn = false;

        // ========== INITIALIZATION ==========
        function init() {
            // Check if admin is logged in from previous session
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                isAdminLoggedIn = true;
            }
            
            renderProducts();
            updateCartUI();
            renderAdminProductsList();
        }

        // ========== SECTION NAVIGATION ==========
        function showSection(sectionId) {
            // Check admin access
            if (sectionId === 'admin' && !isAdminLoggedIn) {
                document.getElementById('loginModal').classList.add('active');
                return;
            }
            
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(sectionId).style.display = 'block';
            window.scrollTo(0, 0);
        }

        // ========== PRODUCTS MANAGEMENT ==========
        function renderProducts() {
            const productsList = document.getElementById('productsList');
            productsList.innerHTML = products.map(product => `
                <div class="product-card">
                    <div class="product-image" style="background-image: url('${product.image || ''}'); background-size: cover; background-position: center;">
                        ${!product.image ? product.emoji : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-description">${product.description}</div>
                        <div class="product-footer">
                            <div class="product-price">₹${product.price}</div>
                        </div>
                        <div class="quantity-control" style="margin-bottom: 1rem;">
                            <button onclick="decreaseQuantity('qty-${product.id}')">−</button>
                            <input type="number" id="qty-${product.id}" value="1" min="1" readonly>
                            <button onclick="increaseQuantity('qty-${product.id}')">+</button>
                        </div>
                        <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart 🛒</button>
                    </div>
                </div>
            `).join('');
        }

        function addProduct() {
            const name = document.getElementById('adminName').value.trim();
            const price = parseFloat(document.getElementById('adminPrice').value);
            const description = document.getElementById('adminDescription').value.trim();
            const emoji = document.getElementById('adminEmoji').value.trim() || '🍰';
            const imageInput = document.getElementById('adminImage');

            if (!name || !price || !description) {
                showAlert('admin', 'Please fill all fields', 'error');
                return;
            }

            // Handle image upload
            let imageData = null;
            if (imageInput.files && imageInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imageData = e.target.result;
                    
                    const newProduct = {
                        id: Math.max(...products.map(p => p.id), 0) + 1,
                        name,
                        price,
                        description,
                        emoji,
                        image: imageData
                    };

                    products.push(newProduct);
                    saveProducts();
                    renderProducts();
                    renderAdminProductsList();
                    showAlert('admin', 'Product added successfully! ✅', 'success');

                    // Clear form
                    document.getElementById('adminName').value = '';
                    document.getElementById('adminPrice').value = '';
                    document.getElementById('adminDescription').value = '';
                    document.getElementById('adminEmoji').value = '🍰';
                    document.getElementById('adminImage').value = '';
                    document.getElementById('imagePreview').style.display = 'none';
                };
                reader.readAsDataURL(imageInput.files[0]);
            } else {
                const newProduct = {
                    id: Math.max(...products.map(p => p.id), 0) + 1,
                    name,
                    price,
                    description,
                    emoji,
                    image: null
                };

                products.push(newProduct);
                saveProducts();
                renderProducts();
                renderAdminProductsList();
                showAlert('admin', 'Product added successfully! ✅', 'success');

                // Clear form
                document.getElementById('adminName').value = '';
                document.getElementById('adminPrice').value = '';
                document.getElementById('adminDescription').value = '';
                document.getElementById('adminEmoji').value = '🍰';
                document.getElementById('adminImage').value = '';
                document.getElementById('imagePreview').style.display = 'none';
            }
        }

        function deleteProduct(productId) {
            if (confirm('Are you sure you want to delete this product?')) {
                products = products.filter(p => p.id !== productId);
                saveProducts();
                renderProducts();
                renderAdminProductsList();
                showAlert('admin', 'Product deleted! ✅', 'success');
            }
        }

        function renderAdminProductsList() {
            const adminProductsList = document.getElementById('adminProductsList');
            if (products.length === 0) {
                adminProductsList.innerHTML = '<div class="empty-state">No products yet. Add your first product!</div>';
                return;
            }

            adminProductsList.innerHTML = products.map(product => `
                <li class="product-list-item">
                    ${product.image ? `<img src="${product.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 1rem;">` : ''}
                    <div class="product-list-item-info">
                        <h3>${product.emoji} ${product.name}</h3>
                        <p>Price: ₹${product.price}</p>
                        <p>${product.description}</p>
                    </div>
                    <div class="product-list-actions">
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </li>
            `).join('');
        }

        // ========== IMAGE PREVIEW ==========
        function previewImage() {
            const input = document.getElementById('adminImage');
            const preview = document.getElementById('imagePreview');
            
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // ========== ADMIN LOGIN ==========
        function openLoginModal() {
            document.getElementById('loginModal').classList.add('active');
        }

        function closeLoginModal() {
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
        }

        function submitLogin(event) {
            event.preventDefault();
            
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                isAdminLoggedIn = true;
                localStorage.setItem('adminToken', 'authenticated');
                closeLoginModal();
                updateAdminUI();
                showSection('admin');
                showAlert('admin', '✅ Login successful! Welcome Admin', 'success');
            } else {
                showAlert('loginModal', '❌ Invalid username or password', 'error');
            }
        }

        function logoutAdmin() {
            isAdminLoggedIn = false;
            localStorage.removeItem('adminToken');
            updateAdminUI();
            showSection('shop');
            showAlert('shop', '✅ Logged out successfully', 'success');
        }

        // ========== CART MANAGEMENT ==========
        function addToCart(productId) {
            const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
            const product = products.find(p => p.id === productId);

            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    ...product,
                    quantity
                });
            }

            saveCart();
            updateCartUI();
            document.getElementById(`qty-${productId}`).value = 1;
            showAlert('shop', `${product.name} added to cart! 🎉`, 'success');
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            saveCart();
            updateCartUI();
        }

        function updateQuantity(productId, newQuantity) {
            newQuantity = parseInt(newQuantity);
            if (newQuantity < 1) {
                removeFromCart(productId);
                return;
            }

            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
                saveCart();
                updateCartUI();
            }
        }

        function updateCartUI() {
            const cartCount = document.getElementById('cartCount');
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

            const cartItems = document.getElementById('cartItems');
            const emptyMessage = document.getElementById('emptyCartMessage');
            const cartSummary = document.getElementById('cartSummarySection');

            if (cart.length === 0) {
                cartItems.innerHTML = '';
                emptyMessage.style.display = 'block';
                cartSummary.style.display = 'none';
                return;
            }

            emptyMessage.style.display = 'none';
            cartSummary.style.display = 'block';

            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.emoji} ${item.name}</div>
                        <div class="cart-item-price">₹${item.price} × ${item.quantity}</div>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div style="font-weight: bold; min-width: 60px;">₹${item.price * item.quantity}</div>
                        <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)" style="width: 50px; padding: 0.5rem;">
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            `).join('');

            document.getElementById('subtotal').textContent = subtotal;
            document.getElementById('total').textContent = subtotal;
            document.getElementById('orderTotal').textContent = subtotal;
        }

        function increaseQuantity(inputId) {
            const input = document.getElementById(inputId);
            input.value = parseInt(input.value) + 1;
        }

        function decreaseQuantity(inputId) {
            const input = document.getElementById(inputId);
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
            }
        }

        // ========== ORDER MANAGEMENT ==========
        function showOrderForm() {
            document.getElementById('orderModal').classList.add('active');
        }

        function closeOrderForm() {
            document.getElementById('orderModal').classList.remove('active');
        }

        function submitOrder(event) {
            event.preventDefault();

            const orderName = document.getElementById('orderName').value;
            const orderPhone = document.getElementById('orderPhone').value;
            const orderAddress = document.getElementById('orderAddress').value;
            const orderDate = document.getElementById('orderDate').value;
            const orderNotes = document.getElementById('orderNotes').value;
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const orderId = 'ORD-' + Date.now();

            const order = {
                id: orderId,
                customerName: orderName,
                customerPhone: orderPhone,
                address: orderAddress,
                deliveryDate: orderDate,
                notes: orderNotes,
                items: cart,
                total: total,
                timestamp: new Date().toLocaleString('en-IN')
            };

            orders.push(order);
            saveOrders();

            // Send order to owner via WhatsApp
            sendOrderToOwner(order);

            // Send confirmation to customer
            sendCustomerConfirmation(order);

            // Show success modal
            document.getElementById('orderId').textContent = orderId;
            document.getElementById('orderModal').classList.remove('active');
            document.getElementById('successModal').classList.add('active');

            // Clear cart
            cart = [];
            saveCart();
            updateCartUI();

            // Reset form
            event.target.reset();
        }

        function closeSuccessModal() {
            document.getElementById('successModal').classList.remove('active');
            showSection('shop');
        }

        function sendOrderToOwner(order) {
            // Format order details
            const itemsList = order.items
                .map(item => `${item.emoji} ${item.name} (₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity})`)
                .join('%0A');

            const message = encodeURIComponent(
                `🎉 NEW ORDER RECEIVED!\n\n` +
                `📋 Order ID: ${order.id}\n` +
                `👤 Customer: ${order.customerName}\n` +
                `📞 Phone: ${order.customerPhone}\n` +
                `📍 Address: ${order.address}\n` +
                `📅 Delivery Date: ${order.deliveryDate}\n` +
                `\n🛍️ ITEMS:\n${itemsList}\n` +
                `\n💰 Total: ₹${order.total}\n` +
                `📝 Notes: ${order.notes || 'None'}\n` +
                `⏰ Order Time: ${order.timestamp}`
            );

            // Open WhatsApp with pre-filled message
            const whatsappURL = `https://api.whatsapp.com/send?phone=${OWNER_PHONE.replace(/[^0-9]/g, '')}&text=${message}`;
            window.open(whatsappURL, '_blank');

            console.log('Order sent to owner via WhatsApp');
        }

        function sendCustomerConfirmation(order) {
            // This shows a confirmation to the customer
            const confirmationMessage = `
Order Confirmation - ${order.id}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Delivery Date: ${order.deliveryDate}
Total: ₹${order.total}

Items:
${order.items.map(item => `- ${item.emoji} ${item.name} (₹${item.price} × ${item.quantity})`).join('\n')}

The bakery owner will contact you shortly to confirm the order details.
            `;

            console.log('Customer Confirmation:', confirmationMessage);
            // In a real app, you would send this via email or SMS
        }

        // ========== UTILITY FUNCTIONS ==========
        function saveProducts() {
            localStorage.setItem('bakeryProducts', JSON.stringify(products));
        }

        function saveCart() {
            localStorage.setItem('bakeryCart', JSON.stringify(cart));
        }

        function saveOrders() {
            localStorage.setItem('bakeryOrders', JSON.stringify(orders));
        }

        function showAlert(sectionId, message, type = 'success') {
            // Create alert element
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type}`;
            alertDiv.textContent = message;

            const section = document.getElementById(sectionId);
            const existingAlert = section.querySelector('.alert');
            if (existingAlert) {
                existingAlert.remove();
            }

            section.insertBefore(alertDiv, section.firstChild);

            // Auto remove alert
            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        }

        // ========== INITIALIZE ON PAGE LOAD ==========
        window.addEventListener('DOMContentLoaded', function() {
            init();
            updateAdminUIState();
        });

        // ========== UPDATE ADMIN UI STATE ==========
        function updateAdminUIState() {
            const adminNavBtn = document.getElementById('adminNavBtn');
            const logoutBtn = document.getElementById('logoutBtn');
            
            if (isAdminLoggedIn) {
                adminNavBtn.style.display = 'none';
                logoutBtn.style.display = 'block';
            } else {
                adminNavBtn.style.display = 'block';
                logoutBtn.style.display = 'none';
            }
        }

        // Call after login/logout
        function updateAdminUI() {
            updateAdminUIState();
        }