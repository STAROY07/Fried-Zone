import os
import glob

# HTML files to update in the project root
files = glob.glob('*.html')

account_icon_replacement = '''            <div class="nav-actions">
                <a href="account.html" class="mobile-account-btn" aria-label="Account">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </a>
                <button class="btn btn-outline nav-cart" id="nav-cart-btn" aria-label="View Cart">'''

bottom_nav_html = '''    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-bottom-nav">
        <a href="menu.html" class="nav-item" id="bottom-nav-menu">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            <span>Menu</span>
        </a>
        <a href="account.html" class="nav-item" id="bottom-nav-account">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>Orders</span>
        </a>
        <a href="offers.html" class="nav-item" id="bottom-nav-offers">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            <span>Offers</span>
        </a>
        <a href="contact.html" class="nav-item" id="bottom-nav-contact">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>Contact</span>
        </a>
    </nav>
</body>'''

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add account btn
    if 'class="mobile-account-btn"' not in content:
        target1 = '            <div class="nav-actions">\n                <button class="btn btn-outline nav-cart" id="nav-cart-btn" aria-label="View Cart">'
        if target1 in content:
            content = content.replace(target1, account_icon_replacement)
        else:
            # Fallback for slight whitespace differences
            target1_alt = '<div class="nav-actions">\\n                <button class="btn btn-outline nav-cart"'
            # Let's just do a string replacement assuming standard spacing,
            # or we can use regex
            import re
            content = re.sub(
                r'<div class="nav-actions">\s*<button class="btn btn-outline nav-cart" id="nav-cart-btn" aria-label="View Cart">',
                account_icon_replacement.strip(), # Might lose exact matched indentation but it's okay
                content,
                count=1
            )

    # 2. Add bottom nav before </body>
    if 'class="mobile-bottom-nav"' not in content:
        content = content.replace('</body>', bottom_nav_html)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Updated {len(files)} HTML files.")

# Update script.js to handle active state
script_addition = """

// Highlight active bottom nav item
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    const navItems = {
        'menu.html': 'bottom-nav-menu',
        'account.html': 'bottom-nav-account',
        'offers.html': 'bottom-nav-offers',
        'contact.html': 'bottom-nav-contact'
    };
    
    if (navItems[page]) {
        const activeNav = document.getElementById(navItems[page]);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }
});
"""

script_file = 'script.js'
if os.path.exists(script_file):
    with open(script_file, 'r', encoding='utf-8') as f:
        script_content = f.read()
        
    if 'bottom-nav-menu' not in script_content:
        with open(script_file, 'w', encoding='utf-8') as f:
            f.write(script_content + script_addition)
        print("Updated script.js")

