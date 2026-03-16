console.log('Fried Zone Script Loading...');

// Firebase Configuration & Initialization
const firebaseConfig = {
    projectId: "fried-zone",
    databaseURL: "https://fried-zone-default-rtdb.firebaseio.com/"
};
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.database() : null;

/* =========================================
   DEFAULT DATA (Fallback if localStorage is empty)
========================================= */

// --- GLOBAL UTILITIES & SOUND FIX ---
const playNotificationSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
    } catch(e) { console.log('Audio error:', e); }
};

// Unlock Audio Context on first click
document.addEventListener('click', () => {
    const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (tempCtx.state === 'suspended') tempCtx.resume();
}, { once: true });

window.claimOffer = (code) => {
    localStorage.setItem('fz_claimedCoupon', code);
    // showNotification might not be defined globally yet if inside try block, 
    // so we use a simpler alert or wait for DOM load if needed.
    // However, it's better to just set and let the user see it at checkout.
    alert(`Offer Claimed! Code ${code} will be applied at checkout.`);
};

const DEFAULT_MENU = [
    // --- Quick Bites ---
    {
        id: 'm1',
        name: 'Mega Crunch Bucket',
        price: 799,
        category: 'Quick Bites',
        description: '12 pieces of signature hot & crispy chicken, 4 fries, and 4 drinks. Perfect for the squad.',
        image: 'images/hero_chicken_1772210041149.png',
        isFeatured: true,
        badgeText: 'Bestseller',
        inStock: true
    },
    {
        id: 'm2',
        name: 'Double Cheese Lava',
        price: 249,
        category: 'Quick Bites',
        description: 'Two juicy patties, molten lava cheese, jalapeños, and our secret dynamite sauce.',
        image: 'images/burger_1772210149371.png',
        isFeatured: true,
        badgeText: 'Trending',
        inStock: true
    },
    {
        id: 'm3',
        name: 'Peri Peri Wings',
        price: 199,
        category: 'Wings & Chicken',
        description: '8-piece hot and fiery wings tossed in authentic African bird\'s eye chili sauce.',
        image: 'images/hero_chicken_1772210041149.png',
        isFeatured: true,
        badgeText: 'New',
        inStock: true
    },
    {
        id: 'm4',
        name: 'Chicken Burger',
        price: 25,
        category: 'Quick Bites',
        description: 'Crispy fried chicken patty with fresh veggies and our signature sauce in a soft bun.',
        image: 'images/burger_1772210149371.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    },
    {
        id: 'm5',
        name: 'Keema Pav',
        price: 35,
        category: 'Quick Bites',
        description: 'Spiced mutton keema served with soft buttery pav buns. A street food classic.',
        image: 'images/burger_1772210149371.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    },
    {
        id: 'm6',
        name: 'Chicken Samosa',
        price: 15,
        category: 'Quick Bites',
        description: 'Crispy golden samosas stuffed with spiced minced chicken. Perfect for snacking.',
        image: 'images/hero_chicken_1772210041149.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    },
    {
        id: 'm7',
        name: 'Chicken Stick',
        price: 20,
        category: 'Quick Bites',
        description: 'Tender chicken skewers seasoned with our signature spice blend, grilled to perfection.',
        image: 'images/hero_chicken_1772210041149.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    },
    // --- Fries ---
    {
        id: 'm8',
        name: 'French Fries',
        price: 50,
        category: 'Fries',
        description: 'Golden, crispy, and lightly salted fries. A classic side that never disappoints.',
        image: 'images/combo_1772210165761.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    },
    {
        id: 'm9',
        name: 'Peri Peri Fries',
        price: 70,
        category: 'Fries',
        description: 'Crispy fries dusted with our signature peri peri spice mix. Addictively good.',
        image: 'images/combo_1772210165761.png',
        isFeatured: false,
        badgeText: 'Spicy',
        inStock: true
    },
    {
        id: 'm10',
        name: 'Loaded Cheese Fries',
        price: 99,
        category: 'Fries',
        description: 'Crispy fries smothered in warm liquid cheese sauce. Pure comfort food.',
        image: 'images/combo_1772210165761.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    },
    // --- Wings & Chicken ---
    {
        id: 'm11',
        name: 'Classic Chicken Bucket',
        price: 599,
        category: 'Wings & Chicken',
        description: '8 pieces of our signature hot & crispy fried chicken. A timeless classic.',
        image: 'images/hero_chicken_1772210041149.png',
        isFeatured: false,
        badgeText: 'Family Pack',
        inStock: true
    },
    {
        id: 'm12',
        name: 'BBQ Chicken Wings',
        price: 179,
        category: 'Wings & Chicken',
        description: '6-piece smoky BBQ glazed wings, slow-cooked and finished on the grill.',
        image: 'images/hero_chicken_1772210041149.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    },
    // --- Tikka & Specials ---
    {
        id: 'm13',
        name: 'Chicken Tikka',
        price: 149,
        category: 'Tikka & Specials',
        description: 'Tender chicken marinated in yoghurt and spices, chargrilled to smoky perfection.',
        image: 'images/hero_chicken_1772210041149.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    },
    {
        id: 'm14',
        name: 'Family Combo Meal',
        price: 899,
        category: 'Tikka & Specials',
        description: 'Buckets, burgers, and large fries for the whole family. Best value deal.',
        image: 'images/combo_1772210165761.png',
        isFeatured: false,
        badgeText: 'Value',
        inStock: true
    },
    // --- Chana Specials ---
    {
        id: 'm15',
        name: 'Chana Masala',
        price: 60,
        category: 'Chana Specials',
        description: 'Hearty chickpeas in a rich, aromatic tomato-onion-spice gravy. Served with pav.',
        image: 'images/combo_1772210165761.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    },
    {
        id: 'm16',
        name: 'Beverages Combo',
        price: 99,
        category: 'Chana Specials',
        description: 'A refreshing assortment of cold drinks. Choose from cola, lemonade, or lassi.',
        image: 'images/beverages_1772210182225.png',
        isFeatured: false,
        badgeText: '',
        inStock: true
    }
];

// Initialize Menu Data variable
let menuData = [];

/* =========================================
   1. STICKY HEADER
========================================= */
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

/* =========================================
   SHOP STATUS CHECK (LOCAL STORAGE)
========================================= */
const updateShopStatus = (isInitial = false) => {
    const settings = JSON.parse(localStorage.getItem('fz_shopSettings')) || { status: 'open', message: '' };
    console.log('Shop Status:', settings.status);
    
    // Remove existing banner if any
    const oldBanner = document.querySelector('.shop-closed-banner');
    if (oldBanner) oldBanner.remove();
    document.body.classList.remove('shop-closed');

    if (settings.status === 'closed') {
        const banner = document.createElement('div');
        banner.className = 'shop-closed-banner';
        banner.innerHTML = `
            <div class="container">
                <span>🛑 Shop is Currently Closed. ${settings.message || 'We will be back soon!'}</span>
            </div>
        `;
        document.body.prepend(banner);
        document.body.classList.add('shop-closed');
        
        if (isInitial) {
            showNotification('🛑 We are currently CLOSED. Check back later!');
        }
    } else if (isInitial) {
        showNotification('✅ Order Now! Shop is OPEN.');
    }
};



// Listeners moved to end for safety

// Listen for storage changes (for legacy code or menu updates)
window.addEventListener('storage', (e) => {
    if (e.key === 'fz_menuData') {
        menuData = JSON.parse(localStorage.getItem('fz_menuData')) || [];
        renderMenu();
        renderFeaturedItems();
    }
});

/* =========================================
   2. MOBILE MENU TOGGLE
========================================= */
const menuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

    // Close menu when a link is clicked
    const navLinks = document.querySelectorAll('.nav-list a');
    if (menuToggle) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

try {
    /* =========================================
       3. INTERSECTION OBSERVER (SCROLL ANIMATIONS)
    ========================================= */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealElements.forEach(el => observer.observe(el));

    // Fallback: If animations don't trigger (e.g. issues with observer), show them after 1.5s
    setTimeout(() => {
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
            el.classList.add('active');
        });
    }, 1500);

    /* =========================================
       4. DYNAMIC MENU (LOCAL STORAGE)
    ========================================= */
    
    // Predefined category order as requested by user
    const CATEGORY_ORDER = ['Quick Bites', 'Fries', 'Chana Specials', 'Tikka & Specials', 'Wings & Chicken'];
    
    const renderMenu = (filter = 'All') => {
        const menuContainer = document.getElementById('menu-container');
        if (!menuContainer) return;
        menuContainer.innerHTML = '';
        
        if (menuData.length === 0) {
            menuContainer.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--clr-text-muted);">No items found in the menu.</p>';
            return;
        }

        const allCategoriesInData = [...new Set(menuData.map(item => item.category))];
        
        const categories = filter === 'All' 
            ? [
                ...CATEGORY_ORDER.filter(c => allCategoriesInData.includes(c)),
                ...allCategoriesInData.filter(c => !CATEGORY_ORDER.includes(c)).sort()
              ]
            : [filter];

        categories.forEach(cat => {
            const items = menuData.filter(m => m.category === cat);
            if (items.length === 0) return;

            const section = document.createElement('div');
            section.className = 'category-section reveal';
            section.id = `cat-${cat.replace(/\s+/g, '-').toLowerCase()}`;
            
            section.innerHTML = `
                <h3 class="category-header">${cat}</h3>
                <div class="menu-grid"></div>
            `;

            const grid = section.querySelector('.menu-grid');
            
            items.forEach(item => {
                const card = document.createElement('div');
                const isOutOfStock = item.inStock === false;
                card.className = `menu-card ${isOutOfStock ? 'out-of-stock' : ''}`;
                
                card.innerHTML = `
                    <div class="card-img-container">
                        <img src="${item.image}" alt="${item.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80'">
                        ${isOutOfStock ? '<div class="out-of-stock-stripe">OUT OF STOCK</div>' : ''}
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${item.name}</h3>
                        <p class="card-desc">${item.description || `Our signature ${item.name}, prepared fresh and packed with authentic Fried Zone flavor.`}</p>
                        <div class="card-footer">
                            <span class="price">₹${item.price}</span>
                            <button class="btn btn-primary add-to-cart" 
                                    data-id="${item.id}"
                                    ${isOutOfStock ? 'disabled style="background: #95a5a6; cursor: not-allowed;"' : ''}>
                                ${isOutOfStock ? 'Sold Out' : 'Add +'}
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });

            menuContainer.appendChild(section);
        });

        // Re-observe new elements
        const newReveals = document.querySelectorAll('.reveal');
        newReveals.forEach(el => observer.observe(el));

        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                addToCart(id);
                openCart();
            });
        });
    };

    const renderCategories = () => {
        const categoriesContainer = document.getElementById('menu-categories');
        if(!categoriesContainer) return;

        // Get all unique categories from menu data
        const allCategoriesInData = [...new Set(menuData.map(item => item.category))];
        
        // Sort: predefined order first, then any unknown categories alphabetically
        const sortedCategories = [
            ...CATEGORY_ORDER.filter(c => allCategoriesInData.includes(c)),
            ...allCategoriesInData.filter(c => !CATEGORY_ORDER.includes(c)).sort()
        ];
        
        const categories = ['All', ...sortedCategories];
        categoriesContainer.innerHTML = '';
        
        categories.forEach(cat => {
            const btn = document.createElement('div');
            btn.className = `sidebar-link ${cat === 'All' ? 'active' : ''}`;
            btn.textContent = cat === 'All' ? 'All Items' : cat;
            btn.setAttribute('data-filter', cat);
            
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                renderMenu(cat);
            });
            
            categoriesContainer.appendChild(btn);
        });
    };

    /* =========================================
       5. AUTHENTICATION (LOCAL STORAGE)
    ========================================= */
    let currentUser = JSON.parse(localStorage.getItem('fz_currentUser')) || null;
    let cart = JSON.parse(localStorage.getItem('fz_cart')) || [];

    const updateAuthUI = () => {
        const containers = [document.getElementById('auth-container'), document.getElementById('auth-container-mobile')];
        containers.forEach(container => {
            if (container) {
                if (currentUser) {
                    const isAdmin = currentUser.username.toLowerCase().includes('admin');
                    container.innerHTML = `
                        <div class="user-greeting" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                            <span style="color: var(--clr-text); font-weight: bold; font-size: 1rem;">
                                Hi, ${isAdmin ? `<a href="admin.html" title="Go to Admin Panel" style="color: var(--clr-accent); text-decoration: none; border-bottom: 1px dashed var(--clr-accent);">${currentUser.username}</a>` : `<span style="color: var(--clr-accent);">${currentUser.username}</span>`}
                            </span>
                            <button class="btn btn-secondary logout-btn" style="padding: 6px 12px; font-size:0.8rem;">Logout</button>
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <a href="login.html" class="btn btn-secondary nav-login">Login</a>
                        <a href="signup.html" class="btn btn-primary nav-signup">Sign Up</a>
                    `;
                }
            }
        });

        // Attach logout event
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.onclick = () => {
                localStorage.removeItem('fz_currentUser');
                window.location.reload();
            };
        });
    };

    /* =========================================
       6. CART SYSTEM
    ========================================= */
    const cartCountEl = document.getElementById('cart-count');
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    const navCartBtn = document.getElementById('nav-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const codBtn = document.getElementById('cod-btn');

    const saveCart = () => localStorage.setItem('fz_cart', JSON.stringify(cart));

    const updateCartUI = () => {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="color: var(--clr-text-muted); text-align: center; margin-top: 20px;">Your cart is empty.</p>';
        } else {
            cart.forEach(cartItem => {
                const itemData = menuData.find(m => m.id == cartItem.id);
                if (!itemData) return;

                total += itemData.price * cartItem.qty;
                count += cartItem.qty;

                const itemHtml = `
                    <div class="cart-item">
                        <div class="cart-item-details">
                            <h4>${itemData.name}</h4>
                            <p>₹${itemData.price}</p>
                        </div>
                        <div class="cart-item-qty">
                            <button class="qty-btn dec-qty" data-id="${itemData.id}">-</button>
                            <span>${cartItem.qty}</span>
                            <button class="qty-btn inc-qty" data-id="${itemData.id}">+</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }

        if (cartCountEl) cartCountEl.textContent = count;
        if (cartTotalPrice) cartTotalPrice.textContent = `₹${total}`;

        // Attach buttons
        document.querySelectorAll('.inc-qty').forEach(btn => btn.addEventListener('click', (e) => addToCart(e.target.dataset.id)));
        document.querySelectorAll('.dec-qty').forEach(btn => btn.addEventListener('click', (e) => removeFromCart(e.target.dataset.id)));
    };

    const addToCart = (id) => {
        const item = menuData.find(m => m.id == id);
        if (!item) return;

        if (item.inStock === false) {
            alert('Sorry, this item is currently out of stock!');
            return;
        }

        const existing = cart.find(c => c.id == id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id, qty: 1 });
        }
        saveCart();
        updateCartUI();
    };

    const removeFromCart = (id) => {
        const existing = cart.find(c => c.id == id);
        if (existing) {
            existing.qty -= 1;
            if (existing.qty <= 0) {
                cart = cart.filter(c => c.id != id);
            }
        }
        saveCart();
        updateCartUI();
    };

    const openCart = () => {
        if (cartPanel) cartPanel.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('active');
    };

    const closeCart = () => {
        if (cartPanel) cartPanel.classList.remove('open');
        if (cartOverlay) cartOverlay.classList.remove('active');
    };

    if (navCartBtn) navCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    const goToCheckout = () => {
        if (cart.length === 0) return alert('Your cart is empty!');
        const settings = JSON.parse(localStorage.getItem('fz_shopSettings')) || { status: 'open' };
        if (settings.status === 'closed') {
            alert(`Shop is closed. ${settings.message || ''}`);
            return;
        }
        if (!currentUser) {
            alert('Please Login to proceed to checkout!');
            window.location.href = 'login.html';
            return;
        }
        window.location.href = 'checkout.html';
    };

    if (codBtn) codBtn.addEventListener('click', goToCheckout);
    if (checkoutBtn) checkoutBtn.addEventListener('click', goToCheckout);

    /* =========================================
       7. ORDER PLACEMENT (LOCAL STORAGE)
    ========================================= */
    const placeOrder = (method, address, type, paymentId = null, discountApplied = 0) => {
        let total = 0;
        let itemsOrdered = [];
        
        cart.forEach(cartItem => {
            const itemData = menuData.find(m => m.id == cartItem.id);
            if (itemData) {
                total += itemData.price * cartItem.qty;
                itemsOrdered.push({ name: itemData.name, qty: cartItem.qty, price: itemData.price });
            }
        });

        if(itemsOrdered.length > 0) {
            const newOrder = {
                id: Math.floor(10000 + Math.random() * 90000).toString(),
                customer: currentUser ? currentUser.username : 'Guest',
                type: type,
                address: type === 'pickup' ? '🏪 Store Pickup' : address, 
                items: itemsOrdered,
                total: total - discountApplied,
                discount: discountApplied,
                status: 'Preparing',
                method: method,
                paymentId: paymentId,
                date: new Date().toISOString()
            };

            if (db) {
                // Sequential Order ID via Transaction
                db.ref('metadata/lastOrderId').transaction((currentId) => {
                    return (currentId || 1000) + 1;
                }, (error, committed, snapshot) => {
                    if (committed) {
                        const seqId = snapshot.val().toString();
                        newOrder.id = seqId;

                        db.ref('orders/' + seqId).set(newOrder).then(() => {
                            alert(method === 'COD' ? 'Order placed successfully!' : `Payment successful! ID: ${paymentId}`);
                            cart = [];
                            saveCart();
                            window.location.href = 'account.html'; // Redirect to account page to see order
                        }).catch((err) => {
                            console.error("Firebase Order Error: ", err);
                            alert("Order placement failed. Please try again.");
                        });
                    } else {
                        console.error("Transaction failed:", error);
                        // Fallback to random ID if transaction fails
                        db.ref('orders/' + newOrder.id).set(newOrder).then(() => {
                            alert('Order placed (Backup ID)!');
                            cart = [];
                            saveCart();
                            window.location.href = 'account.html';
                        });
                    }
                });
            } else {
                // Fallback to local storage
                const orders = JSON.parse(localStorage.getItem('fz_orders')) || [];
                orders.unshift(newOrder);
                localStorage.setItem('fz_orders', JSON.stringify(orders));
                alert(method === 'COD' ? 'Order placed successfully (Offline Mode)!' : `Payment successful! ID: ${paymentId}`);
                cart = [];
                saveCart();
                window.location.href = 'index.html';
            }
        }
    };

    /* =========================================
       8. CHECKOUT PAGE LOGIC
    ========================================= */
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        const itemsList = document.getElementById('checkout-items-list');
        const totalPriceEl = document.getElementById('checkout-total-price');
        const addressSection = document.getElementById('delivery-address-section');
        const pickupSection = document.getElementById('pickup-info-section');
        const addressTextarea = document.getElementById('delivery-address');
        const typeRadios = document.getElementsByName('orderType');

        let appliedDiscount = 0;
        let originalTotal = 0;

        const renderCheckoutSummary = () => {
            if (cart.length === 0) { window.location.href = 'menu.html'; return; }
            itemsList.innerHTML = '';
            originalTotal = 0;
            cart.forEach(item => {
                const data = menuData.find(m => m.id == item.id);
                if (data) {
                    originalTotal += data.price * item.qty;
                    itemsList.innerHTML += `
                        <div class="checkout-summary-item">
                            <span>${data.name} x ${item.qty}</span>
                            <span>₹${data.price * item.qty}</span>
                        </div>
                    `;
                }
            });
            updateTotalDisplay();
        };

        const updateTotalDisplay = () => {
            const finalTotal = Math.max(0, originalTotal - appliedDiscount);
            if(appliedDiscount > 0) {
                totalPriceEl.innerHTML = `<span style="text-decoration:line-through; font-size: 0.9em; color: gray; margin-right: 10px;">₹${originalTotal}</span> <span class="text-accent">₹${finalTotal}</span>`;
            } else {
                totalPriceEl.innerHTML = `<span class="text-accent">₹${originalTotal}</span>`;
            }
        };

        renderCheckoutSummary();

        // Coupon Logic
        const siteContentConfig = JSON.parse(localStorage.getItem('fz_siteContent')) || {};
        const activeCouponCode = (siteContentConfig.couponCode || 'ZONE20').toUpperCase();
        const activeDiscountPercent = parseInt(siteContentConfig.couponDiscount || '20', 10);

        const applyCouponBtn = document.getElementById('apply-coupon-btn');
        if(applyCouponBtn) {
            applyCouponBtn.addEventListener('click', () => {
                const code = document.getElementById('coupon-code').value.trim().toUpperCase();
                const couponMsg = document.getElementById('coupon-msg');
                if(code === activeCouponCode && activeDiscountPercent > 0) {
                    appliedDiscount = Math.floor(originalTotal * (activeDiscountPercent / 100));
                    couponMsg.style.color = 'green';
                    couponMsg.textContent = `Coupon applied! ${activeDiscountPercent}% off (₹${appliedDiscount} saved).`;
                } else if (code) {
                    appliedDiscount = 0;
                    couponMsg.style.color = 'red';
                    couponMsg.textContent = 'Invalid coupon code.';
                } else {
                    appliedDiscount = 0;
                    couponMsg.textContent = '';
                }
                updateTotalDisplay();
            });

            // Auto-apply claimed coupon
            const claimed = localStorage.getItem('fz_claimedCoupon');
            if (claimed) {
                document.getElementById('coupon-code').value = claimed;
                applyCouponBtn.click();
                localStorage.removeItem('fz_claimedCoupon');
            }
        }

        if (currentUser && currentUser.address) addressTextarea.value = currentUser.address;

        typeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                addressSection.style.display = radio.value === 'delivery' ? 'block' : 'none';
                pickupSection.style.display = radio.value === 'pickup' ? 'block' : 'none';
            });
        });

        document.getElementById('checkout-cod-btn').addEventListener('click', () => {
            const type = document.querySelector('input[name="orderType"]:checked').value;
            let address = '';
            if (type === 'delivery') {
                address = addressTextarea.value.trim();
                if (!address) return alert('Please enter delivery address!');
                
                // Save address if checkbox is checked
                const saveCheckbox = document.getElementById('save-address-checkbox');
                if (saveCheckbox && saveCheckbox.checked) {
                    if (currentUser) {
                        currentUser.address = address;
                        localStorage.setItem('fz_currentUser', JSON.stringify(currentUser));
                    }
                }
            }
            placeOrder('COD', address, type, null, appliedDiscount);
        });

        document.getElementById('checkout-online-btn').addEventListener('click', () => {
            const type = document.querySelector('input[name="orderType"]:checked').value;
            let address = '';
            if (type === 'delivery') {
                address = addressTextarea.value.trim();
                if (!address) return alert('Please enter delivery address!');
                
                // Save address if checkbox is checked
                const saveCheckbox = document.getElementById('save-address-checkbox');
                if (saveCheckbox && saveCheckbox.checked) {
                    if (currentUser) {
                        currentUser.address = address;
                        localStorage.setItem('fz_currentUser', JSON.stringify(currentUser));
                    }
                }
            }

            let totalPrice = 0;
            cart.forEach(item => {
                const data = menuData.find(m => m.id == item.id);
                if (data) totalPrice += data.price * item.qty;
            });
            const finalTotal = Math.max(0, totalPrice - appliedDiscount);


            const options = {
                "key": "rzp_live_SHBTYVWJvAb8WR",
                "amount": finalTotal * 100,
                "currency": "INR",
                "name": "Fried Zone",
                "description": "Premium Food Order",
                "image": "images/logo.jpg",
                "handler": function (response) {
                    placeOrder('ONLINE', address, type, response.razorpay_payment_id, appliedDiscount);
                },
                "prefill": {
                    "name": currentUser.username,
                    "email": currentUser.email || ""
                },
                "theme": { "color": "#E84118" }
            };
            const rzp = new Razorpay(options);
            rzp.open();
        });
    }

    /* =========================================
       9. CONTACT FORM (LOCAL STORAGE)
    ========================================= */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newMessage = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                date: new Date().toISOString()
            };
            const messages = JSON.parse(localStorage.getItem('fz_messages')) || [];
            messages.unshift(newMessage);
            localStorage.setItem('fz_messages', JSON.stringify(messages));
            alert('Thank you! Your message has been sent successfully.');
            contactForm.reset();
        });
    }

    /* =========================================
       10. FEATURED ITEMS
    ========================================= */
    const renderFeaturedItems = () => {
        const container = document.getElementById('featured-items-container');
        if (!container) return;
        
        const featured = menuData.filter(item => item.isFeatured);
        
        container.innerHTML = featured.map(item => `
            <div class="featured-card reveal">
                ${item.badgeText ? `<div class="badge" style="position: absolute; top: 15px; left: 15px; background: var(--clr-primary); color: #fff; padding: 5px 12px; border-radius: 20px; font-weight: 800; font-size: 0.8rem; z-index: 5; box-shadow: 0 4px 10px rgba(230,57,70,0.3); text-transform: uppercase; letter-spacing: 1px;">${item.badgeText}</div>` : ''}
                <div class="featured-img-wrapper">
                    <img src="${item.image}" alt="${item.name}" class="featured-img">
                </div>
                <div class="featured-content">
                    <h3 class="featured-title">${item.name}</h3>
                    <p class="featured-desc">${item.description || `${item.name} with premium bold flavors. A true fan favorite!`}</p>
                    <div class="featured-footer">
                        <span class="featured-price">₹${item.price}</span>
                        <a href="menu.html" class="btn btn-primary">Order Now</a>
                    </div>
                </div>
            </div>
        `).join('');
        
        const newReveals = container.querySelectorAll('.reveal');
        newReveals.forEach(el => observer.observe(el));
    };


    /* =========================================
       11. DYNAMIC SITE CONTENT & REAL-TIME SYNC
    ========================================= */
    const loadPublicSiteContent = () => {
        const defaultContent = {
            heroTitle: 'Experience The<br><span class="text-accent">Ultimate</span> Crunch',
            heroTagline: 'Crispy. Juicy. Irresistible. Premium fast food made with passion and the finest ingredients.',
            contactPhone: '+1 (555) 123-ZONE',
            contactLocation: 'Shop no 001, Royal Paradise, 18.00 M.W D.P. Rd, Badlapur Gaon, Badlapur, Maharashtra 421503',
            contactHours: 'Mon-Sun: 10:00 AM - Midnight',
            offerDetails: 'Get 20% off on all combo meals this weekend. Use code <strong>ZONE20</strong> at checkout.'
        };

        const applyContent = (content) => {
            const updateContent = (id, key) => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = content[key] || defaultContent[key] || '';
            };

            const updateImage = (id, key) => {
                const el = document.getElementById(id);
                if (el && content[key]) el.src = content[key];
                else if (el && defaultContent[key]) el.src = defaultContent[key];
            };

            updateContent('text-hero-title', 'heroTitle');
            updateContent('text-hero-tagline', 'heroTagline');
            updateContent('text-contact-phone', 'contactPhone');
            updateContent('text-contact-location', 'contactLocation');
            updateContent('text-contact-hours', 'contactHours');
            updateContent('text-offer-details', 'offerDetails');

            // Team Content
            updateContent('text-team-owner-name', 'teamOwnerName');
            updateContent('text-team-owner-info', 'teamOwnerInfo');
            updateImage('img-team-owner-photo', 'teamOwnerPhoto');

            updateContent('text-team-helper-name', 'teamHelperName');
            updateContent('text-team-helper-info', 'teamHelperInfo');
            updateImage('img-team-helper-photo', 'teamHelperPhoto');
        };

        // Initial Load from Storage
        const initialContent = JSON.parse(localStorage.getItem('fz_siteContent')) || defaultContent;
        applyContent(initialContent);

        // Real-time Firebase Sync
        if (db) {
            db.ref('siteContent').on('value', (snapshot) => {
                const content = snapshot.val() || defaultContent;
                localStorage.setItem('fz_siteContent', JSON.stringify(content));
                applyContent(content);
            });
        }
    };

    /* =========================================
       12. REAL-TIME ORDER NOTIFICATIONS (FIREBASE)
    ========================================= */
    let lastKnownCustomerOrders = {};
    


    const showNotification = (message) => {
        let container = document.getElementById('fz-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'fz-toast-container';
            container.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px; pointer-events:none;';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.style.cssText = 'background:var(--clr-accent); color:#fff; padding:15px 25px; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.3); transform:translateX(150%); transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-weight:600; font-family:var(--font-main); display:flex; align-items:center; gap:12px; pointer-events:auto;';
        toast.innerHTML = `<span style="font-size:1.5rem">🔔</span> <div>${message}</div>`;
        
        container.appendChild(toast);
        playNotificationSound(); 
        
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);
        setTimeout(() => {
            toast.style.transform = 'translateX(150%)';
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    };

    if (db) {
        db.ref('orders').on('value', (snapshot) => {
            const ordersData = snapshot.val() || {};
            const ordersArray = Object.values(ordersData);
            
            // Only proceed if we have a user to filter for
            if (currentUser) {
                const myOrders = ordersArray.filter(o => o.customer === currentUser.username);
                
                myOrders.forEach(order => {
                    const oldStatus = lastKnownCustomerOrders[order.id];
                    if (oldStatus && oldStatus !== order.status && order.status !== 'Preparing') {
                        showNotification(`Your Order #${order.id} is now: <strong>${order.status}</strong>`);
                    }
                    lastKnownCustomerOrders[order.id] = order.status;
                });

                // If we are on the account page, refresh history
                if (window.location.pathname.includes('account.html')) {
                    renderOrderHistory(myOrders);
                }
            }
        });
    }

    const renderOrderHistory = (userOrders) => {
        const historyContainer = document.getElementById('orders-list-container');
        if (!historyContainer) return;

        if (userOrders.length === 0) {
            historyContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><p style="color: var(--clr-text-muted); margin-bottom: 10px;">You haven\'t placed any orders yet.</p><a href="menu.html" class="btn btn-primary btn-sm">Start Ordering</a></div>';
            return;
        }

        historyContainer.innerHTML = userOrders.reverse().map(order => `
            <div class="order-card" style="margin-bottom: 12px; padding: 15px;">
                <div class="order-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(0,0,0,0.05);">
                    <span class="order-id" style="font-size: 1rem; font-weight: 700;">#${order.id}</span>
                    <span class="order-status status-${order.status.toLowerCase()}" style="font-size: 0.7rem; padding: 3px 10px; border-radius: 15px; text-transform: uppercase; font-weight: 600;">${order.status}</span>
                </div>
                <div class="order-items" style="margin-bottom: 10px; border-bottom: 1px dashed rgba(0,0,0,0.05); padding-bottom: 5px;">
                    ${order.items.map(item => `
                        <div class="order-item-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; font-size: 0.85rem;">
                            <span style="font-weight: 600;">${item.name} x ${item.qty}</span>
                            <span style="color: var(--clr-text-muted);">₹${item.price * item.qty}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 5px;">
                    <div class="order-date" style="font-size: 0.75rem; color: var(--clr-text-muted);">${new Date(order.date).toLocaleDateString()} ${new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div class="order-total" style="font-size: 1.1rem; font-weight: 800; color: var(--clr-primary);">₹${order.total}</div>
                </div>
            </div>
        `).join('');
    };

    const updateAccountCartUI = () => {
        const container = document.getElementById('account-cart-items');
        const footer = document.getElementById('account-cart-footer');
        const totalEl = document.getElementById('account-cart-total');
        if (!container) return;

        container.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--clr-text-muted); padding: 40px;">Your cart is empty.</p>';
            if (footer) footer.style.display = 'none';
            return;
        }

        if (footer) footer.style.display = 'block';

        cart.forEach(cartItem => {
            const item = menuData.find(m => m.id == cartItem.id);
            if (!item) return;
            total += item.price * cartItem.qty;

            container.innerHTML += `
                <div class="cart-item" style="padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <div class="cart-item-details">
                        <h4 style="font-size: 1rem; margin-bottom: 2px;">${item.name}</h4>
                        <p style="color: var(--clr-accent); font-weight: 700; font-size: 0.9rem;">₹${item.price}</p>
                    </div>
                    <div class="cart-item-qty" style="display: flex; align-items: center; gap: 8px;">
                        <button class="qty-btn dec-qty" data-id="${item.id}" style="width: 28px; height: 28px;">-</button>
                        <span style="font-weight: 800; min-width: 25px; text-align: center; font-size: 0.9rem;">${cartItem.qty}</span>
                        <button class="qty-btn inc-qty" data-id="${item.id}" style="width: 28px; height: 28px;">+</button>
                    </div>
                </div>
            `;
        });

        if (totalEl) totalEl.textContent = `₹${total}`;

        // Re-attach listeners specifically for these buttons
        container.querySelectorAll('.inc-qty').forEach(btn => btn.onclick = () => { addToCart(btn.dataset.id); updateAccountCartUI(); });
        container.querySelectorAll('.dec-qty').forEach(btn => btn.onclick = () => { removeFromCart(btn.dataset.id); updateAccountCartUI(); });
    };

    // Initialize UI Logic for Account Page
    if (window.location.pathname.includes('account.html')) {
        if (!currentUser) {
            alert('Please Login to view your account!');
            window.location.href = 'login.html';
        }
        document.getElementById('account-welcome-msg').textContent = `Welcome back, ${currentUser.username}!`;
        updateAccountCartUI();
    }

// Initialize UI
updateAuthUI();
updateCartUI();

// Attach Firebase Listeners (Moved here to ensure all functions are defined first)
if (db) {
    // 1. Shop Status Listener
    db.ref('shopSettings').on('value', (snapshot) => {
        const settings = snapshot.val() || { status: 'open', message: '' };
        localStorage.setItem('fz_shopSettings', JSON.stringify(settings));
        updateShopStatus(false);
    });

    // 2. Menu Data Listener
    db.ref('menuData').on('value', (snapshot) => {
        const data = snapshot.val();
        const rawKeys = data ? Object.keys(data) : [];
        const items = data ? (Array.isArray(data) ? data.filter(Boolean) : Object.values(data).filter(Boolean)) : [];
        
        // Check if data is stored with numeric keys (old array format like 0,1,2...)
        // vs named keys (correct format like m1, m2...)
        const hasNumericKeys = rawKeys.length > 0 && rawKeys.every(k => !isNaN(k));
        
        // Use existing data only if it has enough items AND is in correct named-key format
        if (items.length >= 5 && !hasNumericKeys) {
            menuData = items;
            localStorage.setItem('fz_menuData', JSON.stringify(menuData));
            renderCategories();
            renderMenu();
            renderFeaturedItems();
            if (window.location.pathname.includes('account.html')) {
                updateAccountCartUI();
            }
        } else {
            // DB is empty, few items, or still using old numeric array keys — reseed as named object
            // CRITICAL: Must be {id: item} so db.ref('menuData/m1') paths work in admin buttons
            console.log('Reseeding menu to Firebase with named keys...');
            menuData = DEFAULT_MENU;
            const menuObject = {};
            DEFAULT_MENU.forEach(item => { menuObject[item.id] = item; });
            db.ref('menuData').set(menuObject).then(() => {
                console.log('Menu reseeded successfully!');
                renderCategories();
                renderMenu();
                renderFeaturedItems();
            });
            localStorage.setItem('fz_menuData', JSON.stringify(menuData));
            renderCategories();
            renderMenu();
            renderFeaturedItems();
        }
    });
} else {
    // Fallback if no Firebase
    menuData = JSON.parse(localStorage.getItem('fz_menuData')) || DEFAULT_MENU;
    renderCategories();
    renderMenu();
    renderFeaturedItems();
}
loadPublicSiteContent();
updateShopStatus(true); 

} catch (error) {
    console.error('Fried Zone Script Error:', error);
}
