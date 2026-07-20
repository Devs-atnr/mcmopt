

function getFocusableElements(container) {
    return Array.from(
        container.querySelectorAll(
            "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object"
        )
    );
}

const trapFocusHandlers = {};
const warningTime = 3000

function trapFocus(container, elementToFocus = container) {
    var elements = getFocusableElements(container);
    var first = elements[0];
    var last = elements[elements.length - 1];

    removeTrapFocus();

    trapFocusHandlers.focusin = (event) => {
        if (
            event.target !== container &&
            event.target !== last &&
            event.target !== first
        )
        return;
        
        document.addEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.focusout = function() {
        document.removeEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.keydown = function(event) {
        if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
        // On the last focusable element and tab forward, focus the first element.
        if (event.target === last && !event.shiftKey) {
        event.preventDefault();
        first.focus();
        }

        //  On the first focusable element and tab backward, focus the last element.
        if (
            (event.target === container || event.target === first) &&
            event.shiftKey
        ) {
            event.preventDefault();
            last.focus();
        }
    };

    document.addEventListener('focusout', trapFocusHandlers.focusout);
    document.addEventListener('focusin', trapFocusHandlers.focusin);

    elementToFocus.focus();
}

function pauseAllMedia() {
    document.querySelectorAll('.js-youtube').forEach((video) => {
        video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    });

    document.querySelectorAll('.js-vimeo').forEach((video) => {
        video.contentWindow.postMessage('{"method":"pause"}', '*');
    });

    document.querySelectorAll('video').forEach((video) => video.pause());
    document.querySelectorAll('product-model').forEach((model) => model.modelViewerUI?.pause());
}

function removeTrapFocus(elementToFocus = null) {
    document.removeEventListener('focusin', trapFocusHandlers.focusin);
    document.removeEventListener('focusout', trapFocusHandlers.focusout);
    document.removeEventListener('keydown', trapFocusHandlers.keydown);

    if (elementToFocus) elementToFocus.focus();
}

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

const serializeForm = form => {
    const obj = {};
    const formData = new FormData(form);
    for (const key of formData.keys()) {
        obj[key] = formData.get(key);
    }

    return JSON.stringify(obj);
};

function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

function fetchConfig(type = 'json') {
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
    };
}

function extractContent(string) {
    var div = document.createElement('div');
    div.innerHTML = string;

    return div.textContent || div.innerText;
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
    window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
    return function() {
        return fn.apply(scope, arguments);
    }
};

Shopify.setSelectorByValue = function(selector, value) {
    for (var i = 0, count = selector.options.length; i < count; i++) {
        var option = selector.options[i];

        if (value == option.value || value == option.innerHTML) {
            selector.selectedIndex = i;
            return i;
        }
    }
};

Shopify.addListener = function(target, eventName, callback) {
    target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
    options = options || {};
    var method = options['method'] || 'post';
    var params = options['parameters'] || {};

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        var hiddenField = document.createElement("input");

        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);
        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
    this.countryEl         = document.getElementById(country_domid);
    this.provinceEl        = document.getElementById(province_domid);
    this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

    Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

    this.initCountry();
    this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
    initCountry: function() {
        var value = this.countryEl.getAttribute('data-default');
        Shopify.setSelectorByValue(this.countryEl, value);
        this.countryHandler();
    },

    initProvince: function() {
        var value = this.provinceEl.getAttribute('data-default');

        if (value && this.provinceEl.options.length > 0) {
            Shopify.setSelectorByValue(this.provinceEl, value);
        }
    },

    countryHandler: function(e) {
        var opt       = this.countryEl.options[this.countryEl.selectedIndex];
        var raw       = opt.getAttribute('data-provinces');
        var provinces = JSON.parse(raw);

        this.clearOptions(this.provinceEl);

        if (provinces && provinces.length == 0) {
            this.provinceContainer.style.display = 'none';
        } else {
            for (var i = 0; i < provinces.length; i++) {
                var opt = document.createElement('option');
                opt.value = provinces[i][0];
                opt.innerHTML = provinces[i][1];
                this.provinceEl.appendChild(opt);
            }

            this.provinceContainer.style.display = "";
        }
    },

    clearOptions: function(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    },

    setOptions: function(selector, values) {
        for (var i = 0, count = values.length; i < values.length; i++) {
            var opt = document.createElement('option');

            opt.value = values[i];
            opt.innerHTML = values[i];
            selector.appendChild(opt);
        }
    }
};

Shopify.formatMoney = function(cents, format) {
    if (typeof cents == 'string') { cents = cents.replace('.',''); }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || this.money_format);

    function defaultOption(opt, def) {
        return (typeof opt == 'undefined' ? def : opt);
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = defaultOption(precision, 2);
        thousands = defaultOption(thousands, ',');
        decimal   = defaultOption(decimal, '.');

        if (isNaN(number) || number == null) { return 0; }

        number = (number/100.0).toFixed(precision);

        var parts   = number.split('.'),
            dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
            cents   = parts[1] ? (decimal + parts[1]) : '';

        return dollars + cents;
    }

    switch(formatString.match(placeholderRegex)[1]) {
        case 'amount':
            value = formatWithDelimiters(cents, 2);
            break;
        case 'amount_no_decimals':
            value = formatWithDelimiters(cents, 0);
            break;
        case 'amount_with_comma_separator':
            value = formatWithDelimiters(cents, 2, '.', ',');
            break;
        case 'amount_no_decimals_with_comma_separator':
            value = formatWithDelimiters(cents, 0, '.', ',');
            break;
    }

    return formatString.replace(placeholderRegex, value);
}

Shopify.getCart = function(callback) {
    $.getJSON('/cart.js', function (cart, textStatus) {
        if ((typeof callback) === 'function') {
            callback(cart);
        } else {
            Shopify.onCartUpdate(cart);
        }
    });
}

Shopify.onCartUpdate = function(cart) {
    alert('There are now ' + cart.item_count + ' items in the cart.');
}

Shopify.changeItem = function(variant_id, quantity, index, callback) {
    getCartUpdate(index, quantity, callback)
}

Shopify.removeItem = function(variant_id, index, callback) {
    getCartUpdate(index, 0, callback)
}

function getCartUpdate(line, quantity, callback) {
    const body = JSON.stringify({
        line,
        quantity,
        sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
    .then((response) => {
        return response.text();
    })
    .then((state) => {
        const parsedState = JSON.parse(state);

        if (parsedState.errors) {
            showWarning('Error : ' + parsedState.errors, warningTime);
            return;
        }

        if ((typeof callback) === 'function') {
            callback(parsedState);
        } else {
            Shopify.onCartUpdate(parsedState);
        }
    })
    .catch((e) => {
        console.error(e);
    })
}

Shopify.addItem = function(variant_id, quantity, $target, callback, input = null) {
    var quantity = quantity || 1;
    let dataForm = 'quantity=' + quantity + '&id=' + variant_id;

    if ($target.closest('form')) {
        const $thisForm = $target.closest('form');
        const $properties = $thisForm.find('[name^="properties"]');
        if ($properties.length) $properties.each((index, element) => {dataForm = `${dataForm}&${$(element).attr('name')}=${$(element).val()}`})
    }

    var params = {
        type: 'POST',
        url: '/cart/add.js',
        data: dataForm,
        dataType: 'json',
        success: function(line_item) {
            if ((typeof callback) === 'function') {
                callback(line_item);
            } else {
                Shopify.onItemAdded(line_item);
            }
        },
        error: function(XMLHttpRequest, textStatus) {
            var message = window.cartStrings.addProductOutQuantity2;
            if (input.length > 0) {
                var maxValue = parseInt(input.attr('data-inventory-quantity'));
                message = getInputMessage(maxValue)
                input.val(maxValue)
            } 
            
            Shopify.onError(XMLHttpRequest, textStatus, message);
            $target.removeClass('is-loading');
        }
    };
    $.ajax(params);
}

Shopify.onItemAdded = function(line_item) {
    alert(line_item.title + ' was added to your shopping cart.');
}

Shopify.onError = function(XMLHttpRequest, textStatus, message) {
    var data = eval('(' + XMLHttpRequest.responseText + ')');
    if (!!data.message) {
        !!data.description ? showWarning(data.description) : showWarning(data.message + ': ' + message, warningTime);
    } else {
        showWarning('Error : ' + message, warningTime);
    }
}

class MenuDrawer extends HTMLElement {
    constructor() {
        super();
        this.mainDetailsToggle = this.querySelector('details');
        const summaryElements = this.querySelectorAll('summary');
        this.addAccessibilityAttributes(summaryElements);

        if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

        this.addEventListener('keyup', this.onKeyUp.bind(this));
        this.addEventListener('focusout', this.onFocusOut.bind(this));
        this.bindEvents();
    }

    bindEvents() {
        this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
        this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
    }

    addAccessibilityAttributes(summaryElements) {
        summaryElements.forEach(element => {
            element.setAttribute('role', 'button');
            element.setAttribute('aria-expanded', false);
            element.setAttribute('aria-controls', element.nextElementSibling.id);
        });
    }

    onKeyUp(event) {
        if(event.code.toUpperCase() !== 'ESCAPE') return;

        const openDetailsElement = event.target.closest('details[open]');
        if(!openDetailsElement) return;

        openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
    }

    onSummaryClick(event) {
        const summaryElement = event.currentTarget;
        const detailsElement = summaryElement.parentNode;
        const isOpen = detailsElement.hasAttribute('open');

        if (detailsElement === this.mainDetailsToggle) {
            if(isOpen) event.preventDefault();
            isOpen ? this.closeMenuDrawer(summaryElement) : this.openMenuDrawer(summaryElement);
        } else {
            trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));

            setTimeout(() => {
                detailsElement.classList.add('menu-opening');
            });
        }
    }

    openMenuDrawer(summaryElement) {
        setTimeout(() => {
            this.mainDetailsToggle.classList.add('menu-opening');
        });
        summaryElement.setAttribute('aria-expanded', true);
        trapFocus(this.mainDetailsToggle, summaryElement);
        document.body.classList.add('overflow-hidden-mobile');
    }

    closeMenuDrawer(event, elementToFocus = false) {
        if (event !== undefined) {
            this.mainDetailsToggle.classList.remove('menu-opening');

            this.mainDetailsToggle.querySelectorAll('details').forEach(details =>  {
                details.removeAttribute('open');
                details.classList.remove('menu-opening');
            });

            this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
            document.body.classList.remove('overflow-hidden-mobile');
            removeTrapFocus(elementToFocus);
            this.closeAnimation(this.mainDetailsToggle);
        }
    }

    onFocusOut(event) {
        setTimeout(() => {
            if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
        });
    }

    onCloseButtonClick(event) {
        const detailsElement = event.currentTarget.closest('details');
        this.closeSubmenu(detailsElement);
    }

    closeSubmenu(detailsElement) {
        detailsElement.classList.remove('menu-opening');
        removeTrapFocus();
        this.closeAnimation(detailsElement);
    }

    closeAnimation(detailsElement) {
        let animationStart;

        const handleAnimation = (time) => {
            if (animationStart === undefined) {
                animationStart = time;
            }

            const elapsedTime = time - animationStart;

            if (elapsedTime < 400) {
                window.requestAnimationFrame(handleAnimation);
            } else {
                detailsElement.removeAttribute('open');

                if (detailsElement.closest('details[open]')) {
                    trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
                }
            }
        }

        window.requestAnimationFrame(handleAnimation);
    }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
    constructor() {
        super();
    }

    openMenuDrawer(summaryElement) {
        this.header = this.header || document.getElementById('shopify-section-header');
        this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
        document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);

        setTimeout(() => {
            this.mainDetailsToggle.classList.add('menu-opening');
        });

        summaryElement.setAttribute('aria-expanded', true);
        trapFocus(this.mainDetailsToggle, summaryElement);
        document.body.classList.add('overflow-hidden-mobile');
    }
}

customElements.define('header-drawer', HeaderDrawer);

class UpdateQuantity extends HTMLElement {
    constructor() {
        super();
        this.input = this.querySelector('input');
        this.changeCart = false;
        this.changeEvent = new Event('change', { bubbles: true })
        this.querySelectorAll('.btn-quantity').forEach(
            (button) => button.addEventListener('click', this.onButtonClick.bind(this))
        );
    }
    
    onButtonClick(event) {
        event.preventDefault();
        const $target = event.target
        let el_input = $target.parentElement.querySelector('.quantity');
        const value = Number(el_input.value);
        const inStockNumber = Number(el_input.dataset.inventoryQuantity);
        const buttonAdd = $target.closest('.product-form')?.querySelector('[data-btn-addtocart]');
        let newVal, checkAvailabel = false;

        const policyArray = document.body.matches('.quickshop-popup-show') ? window[`quick_shop_policy_array_${this.input.dataset.product}`] : window[`cart_selling_array_${this.dataset.product}`],
            currentId = document.body.matches('.quickshop-popup-show') ? this.closest('.productView-options').querySelector('[name="id"]').value : this.input.dataset.cartQuantityId,
            thisVariantStatus = policyArray[currentId];

        buttonAdd?.dataset.available == 'false' || buttonAdd?.dataset.available == undefined ? checkAvailabel = true : checkAvailabel = false;

        if ($target.matches('.plus')) newVal = value + 1;
        else if ($target.matches('.minus')) newVal = value - 1;
        else newVal = value;

        if (newVal < 0 ) newVal = 1;

        if (newVal > inStockNumber && checkAvailabel && thisVariantStatus == 'deny') {
            const message = getInputMessage(inStockNumber);
            showWarning(message, warningTime);
            newVal = inStockNumber
        }

        el_input.value = newVal;

        if (typeof this.changeCart  == 'number') {clearTimeout(this.changeCart)};
        this.changeCart = setTimeout(() => {if ($target.matches('.btn-quantity')) this.input.dispatchEvent(this.changeEvent)}, 350);
    }

    quantityCheckedToBeContinue() {
        const sellingArray = window[`cart_selling_array_${this.dataset.product}`];
        return sellingArray == undefined ? false : sellingArray[this.querySelector('[name="quantity"]').dataset.cartQuantityId] === 'continue'
    }
}

class UpdateQuantityQuickShop extends HTMLElement {
    constructor() {
        super();
        this.input = this.querySelector('input');
        this.changeEvent = new Event('change', { bubbles: true })
        this.querySelectorAll('.btn-quantity').forEach(
            (button) => button.addEventListener('click', this.onChangeQuantity.bind(this))
        );
        this.input.addEventListener('change', this.onChangeQuantity.bind(this))
    }
    
    onChangeQuantity(event) {
        event.preventDefault();
        const target = event.target;
        let el_input = target.parentElement.querySelector('.quantity');
        const value = Number(el_input.value);
        const inStockNumber = Number(el_input.dataset.inventoryQuantity);
        const buttonAdd = target.closest('[data-quickshop]').querySelector('[data-btn-addtocart]');
        let newVal;

        if (target.matches('.plus')) newVal = value + 1;
        else if (target.matches('.minus')) newVal = value - 1;
        else newVal = value;

        if (newVal <= 0) newVal = 1;

        if (newVal > inStockNumber && !buttonAdd.matches('.button--pre-untrack')) {
            const message = getInputMessage(inStockNumber);
            showWarning(message, warningTime);
            newVal = inStockNumber
        }
        
        el_input.value = newVal;
        if (target.matches('.btn-quantity')) this.input.dispatchEvent(this.changeEvent);
        const quickshop = this.closest('[data-quickshop]');
        const realQuantityInput = quickshop.querySelector('form input[type="hidden"]');
        realQuantityInput.setAttribute('value', newVal);
    }
}

class ProductScroller extends HTMLElement {
    constructor() {
        super();    
        this.container = this.querySelector('[data-drag-container]');
        this.dragParent = this.querySelector('[data-drag-parent]');

        this.initDragToScroll();
    }

    initDragToScroll() {
        const isOverflowing = (wrapper) => {
            return wrapper.clientWidth < wrapper.scrollWidth
        }
        let containerOverflowing = isOverflowing(this.container)

        if (containerOverflowing) {
            this.dragToScroll(this.container)
            return 
        }
        this.dragToScroll(this.dragParent)
    }   
    
    dragToScroll(slider) {
        let mouseDown = false;
        let start;
        let scrollLeft;
        let inactiveTimeout;

        slider.addEventListener('mousedown', (e) => {
            const target = e.target 

            mouseDown = true;
            start = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseup', () => {
            mouseDown = false;

            clearTimeout(inactiveTimeout)
            inactiveTimeout = setTimeout(() => {
                slider.classList.remove('active');
            }, 150)
        });

        slider.addEventListener('mousemove', (e) => {
            if(!mouseDown) return;
            e.preventDefault();

            if (!slider.classList.contains('active')) {
                slider.classList.add('active');
            }

            const x = e.pageX - slider.offsetLeft;
            const walk = (x - start) * 1; 
            slider.scrollLeft = scrollLeft - walk;
        });

        slider.addEventListener('mouseleave', () => {
            mouseDown = false;

            clearTimeout(inactiveTimeout)
            inactiveTimeout = setTimeout(() => {
                slider.classList.remove('active');
            }, 150)
        });
    }
}

class ImageToFlip extends HTMLElement {
    constructor() {
        super() 

        this.imageContainer = this; 
        this.initObserver();
    }   

    initObserver() {
        this.observer = new IntersectionObserver((entries, observer) => {
            const imageRef = entries[0]

            if (imageRef.isIntersecting) {
                imageRef.target.classList.add('show')
                observer.unobserve(imageRef.target)
            }

        }, 
        {
            threshold: 0.4 
        });
        
        this.observer.observe(this.imageContainer);
    }
}

window.addEventListener('load', () => {
    customElements.define('cart-update-quantity', UpdateQuantity);
    customElements.define('quickshop-update-quantity', UpdateQuantityQuickShop);
    customElements.define('product-scroller', ProductScroller);
    // customElements.define('image-to-flip', ImageToFlip);
})

function showWarning(content, time = null) {
    if (window.warningTimeout) {
        clearTimeout(window.warningTimeout);
    }
    const warningPopupContent = document.getElementById('halo-warning-popup').querySelector('[data-halo-warning-content]')
    warningPopupContent.textContent = content
    document.body.classList.add('has-warning')

    if (time) {
        window.warningTimeout = setTimeout(() => {
            document.body.classList.remove('has-warning')
        }, time)
    }
}

function getInputMessage(maxValue) {
    var message = window.cartStrings.addProductOutQuantity.replace('[maxQuantity]', maxValue);
    return message
}

class FadeInComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.initObserver();
    }

    initObserver() {
        const handler = (entries, observer) => {
            if (entries[0].isIntersecting) {
                this.classList.add('fade-in');

                observer.unobserve(this);
            }
        }

        const options = {
            threshold: 0.7
        }

        this.observer = new IntersectionObserver(handler, options); 
        this.observer.observe(this);
    }
}

window.addEventListener('load', () => {
    customElements.define('fade-in-component', FadeInComponent);
    this.loadScrolling();
})

window.onscroll = () => {this.loadScrolling()};

function loadScrolling() {
    document.querySelectorAll('[data-scrolling]').forEach(element => {element.dataset.scrolling == 'vertical' ? this.scrollVertical(element) : this.scrollHorizontal(element)})
}

function scrollVertical(element) {
    const $thisItem = element.closest('.special-banner__item') || element,
        top = $thisItem.getBoundingClientRect().top,
        height = $thisItem.getBoundingClientRect().height,
        wdHeight = window.innerHeight,
        coefficient = element.scrollHeight/height,
        redundant = height >= wdHeight ? 0 : (wdHeight - height)/2;

    if (top - redundant < 0 && top > height*-1) this.scrollTop(element, (top*-1 + redundant)*coefficient)
    else if (top - redundant >= 0) this.scrollTop(element, 0)
    else this.scrollTop(element, element.scrollHeight)
}

function scrollTop(element, scope) {
    element.scrollTo({top: scope, behavior: "smooth"})
}

function scrollHorizontal(element) {
    const $thisFirst = element.querySelector('.scrolling-text__list--1'),
        $thisSecond = element.querySelector('.scrolling-text__list--2');

    if (!$thisFirst) return;
  
    const top = element.getBoundingClientRect().top,
        height = element.getBoundingClientRect().height,
        wdHeight = window.innerHeight,
        scrollWidth = $thisFirst.scrollWidth > window.innerWidth ? $thisFirst.scrollWidth - window.innerWidth : 0,
        contentHeight = $thisFirst.getBoundingClientRect().height*2,
        redundant = height >= wdHeight ? 0 : (wdHeight - height)/2,
        coefficient = scrollWidth/(height/2 + redundant - contentHeight);
    
    let scope = (top*-1 + redundant)*coefficient,
        scope2 = (height/2 - contentHeight + redundant)*coefficient - scope;
    
    if (top - redundant < 0 && top - contentHeight > height*-1/2) {scope = scope*-1; scope2 = scope2*-1}
    else if (top - redundant >= 0) {scope = 0; scope2 = scrollWidth*-1}
    else {scope = scrollWidth*-1; scope2 = 0}
    $thisFirst.scrollWidth <= window.innerWidth ? $thisSecond.style.justifyContent = 'flex-end' : this.translateX($thisFirst, $thisSecond, scope, scope2);
}

function translateX($thisFirst, $thisSecond, scope, scope2) {
    $thisFirst.style.transform = `translateX(${scope}px)`;
    $thisSecond.style.transform = `translateX(${(scope2)}px)`;
}

class SmoothScrollMenu {
    constructor(selector) {
        this.menuItems = document.querySelectorAll(selector);
        this.attachEvents();
        this.hideMenuItemsWithoutSection();
    }

    attachEvents() {
        this.menuItems.forEach(item => {
            const anchor = item.querySelector('a');
            if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href') !== "#") {
                anchor.addEventListener('click', event => this.handleMenuItemClick(event, anchor));
            }
        });
    }

    handleMenuItemClick(event, anchor) {
        event.preventDefault();

        var targetHref = anchor.getAttribute('href');
        var shouldScroll = true;
        const location = window.location.pathname + window.location.hash;

        if (targetHref.includes('/') && location !== targetHref) {
            window.location.href = targetHref;
            shouldScroll = false;
        }

        if (shouldScroll) {
            var targetElement = document.getElementById(anchor.getAttribute('href').split('#')[1]);
            if (targetElement) {
                this.scrollToSection(targetElement);
            }
        }
    }

    scrollToSection(element) {
        this.smoothScrollTo(element);
    }

    smoothScrollTo(element) {
        window.scrollTo({
            behavior: 'smooth',
            top: element.offsetTop
        });
    }

    hideMenuItemsWithoutSection() {
        this.menuItems.forEach(item => {
            const anchor = item.querySelector('a');
            const hash = anchor.getAttribute('href').split('#')[1];
            if (hash !== undefined && hash !== '' && !document.getElementById(hash)) {
                item.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new SmoothScrollMenu('.header__inline-menu .menu-lv-1');
    customElements.define('details-disclosure', DetailsDisclosure);
});

class DetailsDisclosure extends HTMLElement {
    constructor() {
        super();
        this.mainDetailsToggle = this.querySelector('details');

        this.addEventListener('keyup', this.onKeyUp);
        this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    }

    onKeyUp(event) {
        if (event.code.toUpperCase() !== 'ESCAPE') return;

        const openDetailsElement = event.target.closest('details[open]');
        if (!openDetailsElement) return;

        const summaryElement = openDetailsElement.querySelector('summary');
        openDetailsElement.removeAttribute('open');
        summaryElement.focus();
    }

    onFocusOut() {
        setTimeout(() => {
            if (!this.contains(document.activeElement)) this.close();
        })
    }

    close() {
        this.mainDetailsToggle.removeAttribute('open')
    }
}

class AccountIcon extends HTMLElement {
  constructor() {
    super();

    this.icon = this.querySelector('.icon');
  }

  connectedCallback() {
    document.addEventListener('storefront:signincompleted', this.handleStorefrontSignInCompleted.bind(this));
  }

  handleStorefrontSignInCompleted(event) {
    if (event?.detail?.avatar) {
      this.icon?.replaceWith(event.detail.avatar.cloneNode());
    }
  }
}

customElements.define('account-icon', AccountIcon);

class PositiveVibesComponent extends HTMLElement {
    constructor() {
        super();
        this.productPositiveVibes();
    }

    productPositiveVibes() {
        const parent = this.querySelector('.text-vibes');
        const children = this.querySelectorAll('.text-vibes--child');
        let currentIndex = 0;

        if (children.length > 1) {
            const newDiv = document.createElement("div");
            newDiv.classList.add("text-vibes--child");
            newDiv.innerHTML = children[0].innerHTML;
            parent.appendChild(newDiv);
            
            const childrens = parent.querySelectorAll('.text-vibes--child');
            setInterval(() => {
                const height = childrens[currentIndex].offsetHeight;
                childrens.forEach((child, index) => {
                    parent.style.cssText = `transform: translateY(${height * -currentIndex}px); transition: all .5s ease;`;
                    if (currentIndex == 0) {
                        parent.style.cssText = `transform: translateY(${height * -currentIndex}px); transition: none;`;
                    }
                });
                currentIndex = (currentIndex + 1) % childrens.length;
                this.heightPositive();
            }, 3000);
        }
    }

    heightPositive() {
        const parent = this.querySelector('.text-vibes');
        const childrens = this.querySelectorAll('.text-vibes--child');
        
        let maxHeight = 0;
        childrens.forEach(child => {
            maxHeight = Math.max(maxHeight, child.querySelector('p').offsetHeight);
        });

        this.style.minHeight = maxHeight + 'px';

        childrens.forEach(child => {
            child.style.minHeight = `${maxHeight}px`;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    customElements.define('positive-vibes', PositiveVibesComponent);
})

function checkTransparentHeader() {
    allowTransparent();

    if (Shopify.designMode) {
        document.addEventListener("shopify:section:load", allowTransparent);
        document.addEventListener("shopify:section:unload", allowTransparent);
        document.addEventListener("shopify:section:reorder", allowTransparent);
    }
}

function allowTransparent() {
    if (document.querySelector(".shopify-section:first-child [allow-transparent-header]")) {
        return;
    } else {
        document.querySelector("body").removeAttribute("allow-transparency");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    checkTransparentHeader();
});

const PUB_SUB_EVENTS = {
    cartUpdate: 'cart-update',
    quantityUpdate: 'quantity-update',
    optionValueSelectionChange: 'option-value-selection-change',
    variantChange: 'variant-change',
    cartError: 'cart-error',
};

let subscribers = {};

function subscribe(eventName, callback) {
    if (subscribers[eventName] === undefined) {
        subscribers[eventName] = [];
    }

    subscribers[eventName] = [...subscribers[eventName], callback];

    return function unsubscribe() {
        subscribers[eventName] = subscribers[eventName].filter((cb) => {
            return cb !== callback;
        });
    };
}

function publish(eventName, data) {
    if (subscribers[eventName]) {
        subscribers[eventName].forEach((callback) => {
            callback(data);
        });
    }
}

class BulkAdd extends HTMLElement {
    constructor() {
        super();
        this.queue = [];
        this.requestStarted = false;
        this.ids = [];
    }

    startQueue(id, quantity) {
        this.queue.push({ id, quantity });
        const interval = setInterval(() => {
            if (this.queue.length > 0) {
                if (!this.requestStarted) {
                    this.sendRequest(this.queue);
                }
            } else {
                clearInterval(interval);
            }
        }, 250);
    }

    sendRequest(queue) {
        this.requestStarted = true;
        const items = {};
        queue.forEach((queueItem) => {
            items[parseInt(queueItem.id)] = queueItem.quantity;
        });
        this.queue = this.queue.filter((queueElement) => !queue.includes(queueElement));
        const quickBulkElement = this.closest('quick-order-list') || this.closest('quick-add-bulk');
        quickBulkElement.updateMultipleQty(items);
    }

    resetQuantityInput(id) {
        const input = this.querySelector(`#Quantity-${id}`);
        input.value = input.getAttribute('value');
        this.isEnterPressed = false;
    }

    setValidity(event, index, message) {
        event.target.setCustomValidity(message);
        event.target.reportValidity();
        this.resetQuantityInput(index);
        event.target.select();
    }

    validateQuantity(event) {
        const inputValue = parseInt(event.target.value);
        const index = event.target.dataset.index;

        if (inputValue < event.target.dataset.min) {
            this.setValidity(event, index, window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min));
        } else if (inputValue > parseInt(event.target.max)) {
            this.setValidity(event, index, window.quickOrderListStrings.max_error.replace('[max]', event.target.max));
        } else if (inputValue % parseInt(event.target.step) != 0) {
            this.setValidity(event, index, window.quickOrderListStrings.step_error.replace('[step]', event.target.step));
        } else {
            event.target.setCustomValidity('');
            event.target.reportValidity();
            this.startQueue(index, inputValue);
        }
    }

    getSectionsUrl() {
        if (window.pageNumber) {
            return `${window.location.pathname}?page=${window.pageNumber}`;
        } else {
            return `${window.location.pathname}`;
        }
    }

    getSectionInnerHTML(html, selector) {
        return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
    }
}

if (!customElements.get('bulk-add')) {
    customElements.define('bulk-add', BulkAdd);
}



/* Walaa 1-8-2025 */ 


// Walaa 10-14-2024 mobile menu



// wishlist 
// window.addEventListener('scroll', function() {
//     // Get the target section element you're targeting
//     let targetSection = document.querySelector('#shopify-section-template--23597726335261__custom_banner_bXCtJU');
//     if (!targetSection) return; // Add null check
    
//     // Get the position of the section relative to the viewport
//     let sectionPosition = targetSection.getBoundingClientRect();

//     // Get all the SVG path elements you want to change
//     let svgPaths = document.querySelectorAll('svg.icon.icon-wishlist.w-h- path');
//     if (svgPaths.length === 0) return; // Add empty NodeList check

//     // Check if any part of the section is in view (top or bottom of the section is inside the viewport)
//     if (sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0) {
//         // Section is in view, change the stroke color to white for each targeted SVG path
//         svgPaths.forEach(function(path) {
//             path.style.stroke = '#fff';
//         });
//     } else {
//         // Section is out of view, revert the stroke color to black for each targeted SVG path
//         svgPaths.forEach(function(path) {
//             path.style.stroke = 'black';
//         });
//     }
// });
// login 



// Walaa 10-27-2024- sort toolbar in collection page add and remove border if it open 

document.addEventListener("DOMContentLoaded", function() {
    const labelTab = document.querySelector('.label-tab.hidden-on-mobile[data-toggle="dropdown"]');

    if (labelTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === "attributes" && mutation.attributeName === "aria-expanded") {
                    const isExpanded = labelTab.getAttribute("aria-expanded") === "true";
                    const targetParent = document.querySelector('.toolbar-item.toolbar-sort.clearfix');
                    if (isExpanded && targetParent) {
                        targetParent.classList.add("dropdown-open");
                    } else if (targetParent) {
                        targetParent.classList.remove("dropdown-open");
                    }
                }
            });
        });

        // Configuration of the observer:
        const config = { attributes: true, attributeFilter: ["aria-expanded"] };

        // Start observing the target node for configured mutations
        observer.observe(labelTab, config);
    } else {
        console.error('The specific label tab element was not found.');
    }
});


/////



// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with the class 'menu-level-2'
    const menus = document.querySelectorAll('.menu-level-2');

    // Function to toggle classes based on scroll position for each menu
    function toggleMenuClasses() {
        menus.forEach(menu => {
            if (window.scrollY > 0) {
                menu.classList.add('not-top-page');
                menu.classList.remove('top-page');
            } else {
                menu.classList.add('top-page');
                menu.classList.remove('not-top-page');
            }
        });
    }

    // Attach the function to the scroll event
    window.addEventListener('scroll', toggleMenuClasses);

    // Initial check in case the page is already scrolled
    toggleMenuClasses();
});


document.addEventListener('DOMContentLoaded', () => {
    // Select all elements with the class 'menu-level-2'
    const menus = document.querySelectorAll('.shopify-section-header-sticky:not(.sticky-search-menu-custom-open)');

    // Function to toggle classes based on scroll position for each menu
    function toggleMenuClasses() {
        menus.forEach(menu => {
            if (window.scrollY > 0) {
                menu.classList.add('menu.not-top-page');
                menu.classList.remove('menu.top-page');
            } else {
                menu.classList.add('menu.top-page');
                menu.classList.remove('menu.not-top-page');
            }
        });
    }

    // Attach the function to the scroll event
    window.addEventListener('scroll', toggleMenuClasses);

    // Initial check in case the page is already scrolled
    toggleMenuClasses();
});


// when click on wishlist show preloading screen 

document.addEventListener('DOMContentLoaded', function() {
    const wishlistButtons = document.querySelectorAll('.icon-wishlist');
    const preloadScreen = document.querySelector('.preload-screen');

    if (wishlistButtons.length > 0 && preloadScreen) { // Null and length check
        // Loop through each wishlist button and add the click event listener
        wishlistButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                // Show the preloading screen with !important
                preloadScreen.style.setProperty('opacity', '1', 'important');
                preloadScreen.style.setProperty('visibility', 'visible', 'important');

                // Hide the preloading screen after 1 second
                setTimeout(function() {
                    preloadScreen.style.setProperty('opacity', '0', 'important');
                    preloadScreen.style.setProperty('visibility', 'hidden', 'important');
                }, 300); // 300ms = 0.3 seconds
            });
        });
    }
});

// Walaa Product page hide Size 



// Walaa 11-3-2024 JavaScript to remove 'menu_open' class from <body> when elements with class 'halo-sidebar-close' are clicked
document.addEventListener('DOMContentLoaded', function() {
    // Select all elements with the class 'halo-sidebar-close'
    const closeButtons = document.querySelectorAll('.halo-sidebar-close');

    // Function to remove 'menu_open' class from <body>
    function closeMenu() {
        document.body.classList.remove('menu_open');
    }

    // Attach the closeMenu function as a click event listener to each close button
    closeButtons.forEach(button => button.addEventListener('click', closeMenu));
});
// JavaScript to manage sidebar behavior on clicks
document.addEventListener('DOMContentLoaded', function() {
    // Select the filter icon to add the 'open-mobile-sidebar' class
    const filterIcon = document.querySelector('.toolbar .toolbar-item .toolbar-icon.icon-filter');

    // Select all elements with the class 'halo-sidebar-close' to remove the 'open-mobile-sidebar' class
    const closeButtons = document.querySelectorAll('.halo-sidebar-close');

    // Function to add 'open-mobile-sidebar' class to <body>
    function openSidebar() {
        document.body.classList.add('open-mobile-sidebar');
    }

    // Function to remove 'open-mobile-sidebar' class from <body>
    function closeSidebar() {
        document.body.classList.remove('open-mobile-sidebar');
    }

    // Attach the openSidebar function as a click event listener to the filter icon
    if (filterIcon) { // Check if the element exists
        filterIcon.addEventListener('click', openSidebar);
    }

    // Attach the closeSidebar function as a click event listener to each close button
    closeButtons.forEach(button => button.addEventListener('click', closeSidebar));
});





/////



document.addEventListener('DOMContentLoaded', function() {
    const submenuLevel2Items = document.querySelectorAll('.menu-level-2');
    let closeTimer;

    submenuLevel2Items.forEach(submenu => {
        // Show level-2 submenu on hover over its parent (-1 item)
        submenu.parentElement.addEventListener('mouseenter', function() {
            clearTimeout(closeTimer); // Clear any pending close action
            submenu.classList.add('show');
        });

        // Keep level-2 submenu open if hovering over level-2 or level-3
        submenu.addEventListener('mouseenter', function() {
            clearTimeout(closeTimer); // Clear close action if re-entered
            submenu.classList.add('show');
        });

        // Detect when leaving level-2 and level-3 entirely, with a small delay
        submenu.addEventListener('mouseleave', function() {
            closeTimer = setTimeout(() => {
                submenu.classList.remove('show');
            }, 800); // Delay close slightly to allow for moving back to level-2
        });
    });
});





document.addEventListener("DOMContentLoaded", function () {
  // Initialize the menu state (closed)
  const toggleButtons = document.querySelectorAll(".toggle-button");

  toggleButtons.forEach((button) => {
    const level3Menu = button.nextElementSibling;

    // Initially, ensure that the submenu is hidden
    if (level3Menu && level3Menu.classList.contains("level-3-menu")) {
      level3Menu.style.display = "none"; // Hide initially
      button.setAttribute("aria-expanded", "false"); // Set aria-expanded to false
    }

    // Toggle functionality on button click
    button.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent default behavior
      e.stopPropagation(); // Prevent hover conflict

      // Find sibling level-3-menu
      const level3Menu = this.nextElementSibling;

      if (level3Menu && level3Menu.classList.contains("level-3-menu")) {
        // Check if the menu is open or closed
        const isExpanded = this.getAttribute("aria-expanded") === "true";

        // Toggle the 'open' class to show/hide the menu
        level3Menu.style.display = isExpanded ? "none" : "block"; // Toggle visibility

        // Update aria-expanded based on the new state
        this.setAttribute("aria-expanded", isExpanded ? "false" : "true");

        // Debugging logs
        console.log("Toggle button clicked.");
        console.log("aria-expanded:", this.getAttribute("aria-expanded"));
        console.log("Menu visibility:", level3Menu.style.display);
      } else {
        console.error("No level-3-menu found.");
      }
    });
  });

  // Hover functionality for submenu items
  const submenuItems = document.querySelectorAll(".submenu-item.has-children");

  submenuItems.forEach((item) => {
    const level3Menu = item.querySelector(".level-3-menu");
    const button = item.querySelector(".toggle-button");

    item.addEventListener("mouseenter", function () {
      if (level3Menu && level3Menu.style.display !== "block") {
        level3Menu.style.display = "block"; // Show on hover
        // Update aria-expanded to true on hover
        if (button) {
          button.setAttribute("aria-expanded", "true");
        }
      }
    });

    item.addEventListener("mouseleave", function () {
      if (level3Menu && level3Menu.style.display !== "none") {
        level3Menu.style.display = "none"; // Hide on mouse leave
        // Update aria-expanded to false when hover leaves
        if (button) {
          button.setAttribute("aria-expanded", "false");
        }
      }
    });
  });
});




// product page -hide only 1 swatch 
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.lv-option-group').forEach(group => {
    const swatches = group.querySelectorAll('.lv-option-wrapper');
    if (swatches.length <= 1) {
      group.style.display = 'none'; // Hide if only 1 swatch
    }
  });
});





// product page - remove 1 size 
document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.product-form__input--dropdown .select__select');

    dropdowns.forEach((dropdown) => {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const options = dropdown.querySelectorAll('option');
                    const dropdownContainer = dropdown.closest('.form__select.select');

                    if (options.length === 1) {
                        if (dropdownContainer) {
                            dropdownContainer.remove();
                        }
                    }
                    observer.disconnect(); // Stop observing after the change
                }
            }
        });

        // Start observing the <select> element for changes
        observer.observe(dropdown, { childList: true });
    });
});

// product page - show size label 
document.addEventListener('DOMContentLoaded', function() {
    const sizeDropdown = document.getElementById('size-dropdown');
    const sizeLabel = document.querySelector('label[for="size-dropdown"]');

    function updateLabel() {
        if (sizeDropdown.selectedOptions.length > 0) {
            const selectedSize = sizeDropdown.selectedOptions[0].text;
            sizeLabel.textContent = 'Size: ' + selectedSize;
        } else {
            sizeLabel.textContent = 'Size:';
        }
    }

    function waitForOptions() {
        if (sizeDropdown.options.length > 0) {
            updateLabel(); // Update as soon as there are options
            sizeDropdown.addEventListener('change', updateLabel);
        } else {
            setTimeout(waitForOptions, 100); // Check every 100ms
        }
    }

    waitForOptions(); // Start the check/wait loop
});


// START: HP 
// Listen to scroll events on the window
// window.addEventListener('scroll', function() {
//     // Select the target section by its unique ID
//     // const targetSection = document.querySelector('div#shopify-section-template--24154842890525__custom_banner_bXCtJU');
//         const targetSection = document.querySelector('div#shopify-section-template--24290171945245__collection_carousal_hp_cBkLqV');

//     // Exit function if the target section does not exist
//     if (!targetSection) return;
    
//     // Get the position of the target section relative to the viewport
//     const sectionPosition = targetSection.getBoundingClientRect();
    
//     // Select SVG paths within the header icon and wishlist icon
// const headerIcons = document.querySelectorAll(
//     'details-modal.header__iconItem.header__search.header__search-custom svg path, ' +  // targets paths within a specific nested structure in a details-modal element
//     'a.header__icon.header__icon--account.link.link--text.text-center svg path, ' +  // targets paths within an anchor element with multiple specific classes
//     'svg.header-cart-icon path, '+ 'svg.logo-1 path,'+'summary.header__icon.header__icon--search.header__icon--summary.link.link--text.focus-inset.modal__toggle svg,'+'svg.logo1-svg path'  // targets paths within an svg element with a specific class
// );

//     const wishlistIcons = document.querySelectorAll('svg.icon.icon-wishlist');

//     // Check if the target section is visible within the viewport
//     if (sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0) {
//         // If visible, change the fill of the header icons to white and adjust the wishlist icons
//         headerIcons.forEach(icon => icon.style.fill = '#fff');
//         wishlistIcons.forEach(icon => {
//             icon.style.fill = 'none'; // Remove fill
//             icon.style.stroke = '#fff'; // Set stroke to white
//         });
//     } else {
//         // If not visible, revert the styles to the default
//         headerIcons.forEach(icon => icon.style.fill = 'black'); // Assuming black is the default
//         wishlistIcons.forEach(icon => {
//             icon.style.fill = ''; // Revert to default fill
//             icon.style.stroke = 'black'; // Assuming black is the default stroke
//         });
//     }
// });
// // change toggle color 
// // Listen to scroll events on the window
// window.addEventListener('scroll', function() {
//     // Select the target section by its unique ID
//     const targetSection = document.querySelector('div#shopify-section-template--24290171945245__collection_carousal_hp_cBkLqV');
    
//     // Exit function if the target section does not exist
//     if (!targetSection) return;
    
//     // Get the position of the target section relative to the viewport
//     const sectionPosition = targetSection.getBoundingClientRect();
    
//     // Get all elements with the class .mobileMenu-toggle__Icon
//     const mobileMenuIcons = document.querySelectorAll('.mobileMenu-toggle__Icon');

//     // Check if the target section is within the viewport
//     if (sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0) {
//         // If visible, add the class to change the background color to white
//         mobileMenuIcons.forEach(icon => {
//             icon.classList.add('white-background');
//         });
//     } else {
//         // If not visible, remove the class to revert the background color
//         mobileMenuIcons.forEach(icon => {
//             icon.classList.remove('white-background');
//         });
//     }
// });

// // Listen to scroll events on the window
// window.addEventListener('scroll', function() {
//     // Select the target section by its unique ID
//     const targetSection = document.querySelector('div#shopify-section-template--24290171945245__collection_carousal_hp_cBkLqV');
    
//     // Exit function if the target section does not exist
//     if (!targetSection) return;
    
//     // Get the position of the target section relative to the viewport
//     const sectionPosition = targetSection.getBoundingClientRect();
    
//     // Select all anchor tags within elements with class 'menu-item'
//     const menuItems = document.querySelectorAll('.menu-item > a, '+ '.ly-inner-text,'+'.header-navigation .header__icon--cart .cart-count-bubble,'+'.header-nav-hamburger .header__icon--wishlist .wishlist-count-bubble' );

//     // Check if the target section is visible within the viewport
//     if (sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0) {
//         // If visible, change the text color of all selected anchor tags to white
//         menuItems.forEach(item => item.style.color = '#fff');
//     } else {
//         // If not visible, revert the text color of all selected anchor tags to black
//         menuItems.forEach(item => item.style.color = '#000'); // Assuming black is the default
//     }
// });


// GROK 
window.addEventListener('scroll', function() {
    // Select both sections
    const targetSections = document.querySelectorAll(
        '.template-index .collection-carousel, ' +
         'div#shopify-section-template--24290171945245__custom_banner_bXCtJU'

    );
    
    let isActiveSection = false;
    
    // Check each section to see if it's active (scrolled into view)
    targetSections.forEach(section => {
        const sectionPosition = section.getBoundingClientRect();
        if (sectionPosition.top <= 0 && sectionPosition.bottom > 0) {
            isActiveSection = true;
        }
    });
    
    // Header and wishlist icons logic
    const headerIcons = document.querySelectorAll(
        '.template-index details-modal.header__iconItem.header__search.header__search-custom svg path, ' +
        '.template-index a.header__icon.header__icon--account.link.link--text.text-center svg path, ' +
        '.template-index svg.header-cart-icon path, svg.logo-1 path, ' +
        '.template-index summary.header__icon.header__icon--search.header__icon--summary.link.link--text.focus-inset.modal__toggle svg, ' +
        '.template-index svg.logo1-svg path'
    );
    const wishlistIcons = document.querySelectorAll('svg.icon.icon-wishlist');

    // Mobile menu toggle logic
    const mobileMenuIcons = document.querySelectorAll('.template-index .mobileMenu-toggle__Icon');

    // Menu items logic
    const menuItems = document.querySelectorAll(
        '.template-index .menu-item > a, .ly-inner-text, ' +
        '.template-index .header-mobile--transparent .cart-count-bubble .text, ' +
        '.template-index .wishlist-count-bubble span.text'
    );
    
    if (isActiveSection) {
        // Apply changes
        headerIcons.forEach(icon => icon.style.fill = '#000');
        wishlistIcons.forEach(icon => {
            icon.style.fill = 'none';
            icon.style.stroke = '#000';
        });
        mobileMenuIcons.forEach(icon => icon.classList.add('white-background'));
        menuItems.forEach(item => item.style.color = '#000');
    } else {
        // Reset to default styles
        headerIcons.forEach(icon => icon.style.removeProperty('fill'));
        wishlistIcons.forEach(icon => {
            icon.style.removeProperty('fill');
            icon.style.removeProperty('stroke');
        });
        mobileMenuIcons.forEach(icon => icon.classList.remove('white-background'));
        menuItems.forEach(item => item.style.removeProperty('color'));
    }
  
});

// END GROK 

// mobile icons color 

//GPT




// mobile logo 
// window.addEventListener('scroll', function() {
//     // Get the target section element you're targeting
//     let targetSection = document.querySelector('#shopify-section-template--23597726335261__custom_banner_bXCtJU');
//     if (!targetSection) return; // Add null check
    
//     // Get the position of the section relative to the viewport
//     let sectionPosition = targetSection.getBoundingClientRect();

//     // Get all the anchor tags inside .menu--1
//     // let logoPaths = document.querySelectorAll('.section-header-mobile.scrolled-past-header .header-mobile--transparent .logo1-svg,'+'.wishlist-count-bubble,'+' .cart-count-bubble ');
//       let logoPaths = document.querySelectorAll('.section-header-mobile.scrolled-past-header .header-mobile--transparent .logo1-svg');
//     if (logoPaths.length === 0) return; // Add empty NodeList check

//     // Check if any part of the section is in view (top or bottom of the section is inside the viewport)
//     if (sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0) {
//         // Section is in view, change the color of all the anchors to white
//         logoPaths.forEach(function(logoPath) {
//             logoPath.style.color = '#fff'; // You should use `color` for text, not `fill`
//         });
//     } else {
//         // Section is out of view, revert the color of all the anchors to black
//         logoPaths.forEach(function(logoPath) {
//             logoPath.style.color = 'black'; // Revert back to black
//         });
//     }
// });
  
// document.addEventListener('DOMContentLoaded', function() {
//     window.addEventListener('scroll', function() {
//         // Get the target section element you're targeting
//         let targetSection = document.querySelector('#shopify-section-template--23597726335261__custom_banner_bXCtJU');
//         if (!targetSection) {
//             console.log('Target section not found');
//             return;
//         }

//         // Get the position of the section relative to the viewport
//         let sectionPosition = targetSection.getBoundingClientRect();
//         console.log('Section top:', sectionPosition.top, 'Window height:', window.innerHeight);

//         // Get all the elements for wishlist and cart count bubbles
//         let wishlistTexts = document.querySelectorAll('.wishlist-count-bubble span.text');
//         let cartTexts = document.querySelectorAll('.cart-count-bubble .text');
//         console.log('Found wishlist texts:', wishlistTexts.length, 'Found cart texts:', cartTexts.length);

//         // Check if any part of the section is in view
//         if (sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0) {
//             console.log('Section is in view');
//             // Add the class 'change-counter-color'
//             wishlistTexts.forEach(function(text) {
//                 text.classList.add('change-counter-color');
//             });
//             cartTexts.forEach(function(text) {
//                 text.classList.add('change-counter-color');
//             });
//         } else {
//             console.log('Section is out of view');
//             // Remove the class 'change-counter-color'
//             wishlistTexts.forEach(function(text) {
//                 text.classList.remove('change-counter-color');
//             });
//             cartTexts.forEach(function(text) {
//                 text.classList.remove('change-counter-color');
//             });
//         }
//     });
// });


//2-24-2025
// window.addEventListener('scroll', function() {
//     // Get the target section element you're targeting
//     let targetSection = document.querySelector('#shopify-section-template--23597726335261__custom_banner_bXCtJU');
//     if (!targetSection) return; // Add null check

//     // Get the position of the section relative to the viewport
//     let sectionPosition = targetSection.getBoundingClientRect();

//     // Get all the elements for wishlist and cart count bubbles
//     let wishlistTexts = document.querySelectorAll('.wishlist-count-bubble span.text');
//     let cartTexts = document.querySelectorAll('.cart-count-bubble .text');
//     if (wishlistTexts.length === 0 && cartTexts.length === 0) return; // Add empty NodeList check

//     // Check if any part of the section is in view (top or bottom of the section is inside the viewport)
//     if (sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0) {
//         // Section is in view, change the color of wishlist and cart count texts to white
//         wishlistTexts.forEach(function(text) {
//             text.style.color = '#fff'; // Change to white
//         });
//         cartTexts.forEach(function(text) {
//             text.style.color = '#fff'; // Change to white
//         });
//     } else {
//         // Section is out of view, revert the color of wishlist and cart count texts to black
//         wishlistTexts.forEach(function(text) {
//             text.style.color = ''; // Revert back to black
//         });
//         cartTexts.forEach(function(text) {
//             text.style.color = ''; // Revert back to black
//         });
//     }
// });


// Mobile toggle icons
// window.addEventListener('scroll', function() {
//     // Get the target section element you're targeting
//     let targetSection = document.querySelector('#shopify-section-template--23597726335261__custom_banner_bXCtJU');
//     if (!targetSection) return; // Add null check
    
//     // Get the position of the section relative to the viewport
//     let sectionPosition = targetSection.getBoundingClientRect();

//     // Get all the elements with the class .mobileMenu-toggle__Icon
//     let toggleIcons = document.querySelectorAll('.mobileMenu-toggle__Icon, .mobileMenu-toggle__Icon:before, .mobileMenu-toggle__Icon:after');
//     if (toggleIcons.length === 0) return; // Add empty NodeList check

//     // Check if any part of the section is in view (top or bottom of the section is inside the viewport)
//     if (sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0) {
//         // Section is in view, add a class to change the color to white
//         toggleIcons.forEach(function(toggleIcon) {
//             toggleIcon.style.backgroundColor = '#fff'; // For the main element
//             toggleIcon.classList.add('in-view'); // Add class for pseudo-elements
//         });
//     } else {
//         // Section is out of view, revert the color to black
//         toggleIcons.forEach(function(toggleIcon) {
//             toggleIcon.style.backgroundColor = 'black'; // For the main element
//             toggleIcon.classList.remove('in-view'); // Remove class for pseudo-elements
//         });
//     }
// });




// 1-19-2025 product page + - in product details 

document.addEventListener("DOMContentLoaded", function () {
    const toggleLinks = document.querySelectorAll('.toggleLink'); // Select all toggleLink elements

    if (toggleLinks.length === 0) {
        console.error("No toggle links found!");
        return;
    }

    toggleLinks.forEach(function (toggleLink) {
        const parentTab = toggleLink.closest('.tab-content'); // Get the parent tab
        const toggleContent = document.querySelector(toggleLink.getAttribute('href')); // Target content using href

        const updateSvg = function () {
            const isOpen = parentTab.classList.contains('is-active');
            const svgElement = toggleLink.querySelector('.icon-dropdown svg');

            if (svgElement) {
                if (isOpen) {
                    svgElement.setAttribute('viewBox', '0 0 15 2');
                    svgElement.innerHTML = '<path d="M0.5 0H14.5V2H0.5V0Z" fill="#222222"/>';
                } else {
                    svgElement.setAttribute('viewBox', '0 0 12 12');
                    svgElement.innerHTML = '<path d="M6.40924 5.57615L11.0761 5.57615L11.0761 6.90928L6.40924 6.90928L6.40924 11.5762H5.07611L5.07611 6.90928L0.409204 6.90928L0.409204 5.57615L5.07611 5.57615L5.07611 0.909242H6.40924L6.40924 5.57615Z" fill="#222222"></path>';
                }
            } else {
                console.error("SVG element not found in toggle link!");
            }
        };

        // Ensure initial state matches
        if (parentTab.classList.contains('is-active')) {
            toggleContent.style.display = 'block';
        } else {
            toggleContent.style.display = 'none';
        }

        // Initial update for SVG
        updateSvg();

        // Add event listener to toggle link
        toggleLink.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default anchor behavior

            const isActive = parentTab.classList.contains('is-active');

            // Toggle the is-active class on the parent tab
            parentTab.classList.toggle('is-active', !isActive);

            // Toggle content visibility
            if (isActive) {
                toggleContent.style.display = 'none';
            } else {
                toggleContent.style.display = 'block';
            }

            // Update the SVG based on new state
            updateSvg();
        });
    });
});


// END
//2-25-2025
// // Listen to scroll events on the window
// window.addEventListener('scroll', function () {
//   // Select the target section by its unique ID
//   const targetSection = document.querySelector('div#shopify-section-template--24290171945245__collection_carousal_hp_cBkLqV');

//   // Exit function if the target section does not exist
//   if (!targetSection) return;

//   // Get the position of the target section relative to the viewport
//   const sectionPosition = targetSection.getBoundingClientRect();

//   // Select the text elements inside wishlist and cart bubbles
//   const wishlistText = document.querySelectorAll('.wishlist-count-bubble span.text');
//   const cartText = document.querySelectorAll('.cart-count-bubble span.text');

//   // Check if the target section is visible within the viewport
//   if (sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0) {
//     // If visible, change the color of the wishlist and cart text to white
//     wishlistText.forEach(text => text.style.color = '#fff');
//     cartText.forEach(text => text.style.color = '#fff');
//   } else {
//     // If not visible, revert the color of the wishlist and cart text to black
//     wishlistText.forEach(text => text.style.color = '#000');
//     cartText.forEach(text => text.style.color = '#000');
//   }
// });





// hardcoding the filters 
// document.addEventListener("DOMContentLoaded", function() {
//   // Values to display (exact match of checkbox 'value' attributes)
//   const allowedValues = ["Lauretos", "Leather", "Visetos"];

//   function filterMaterialValues() {
//     // Target ONLY the Material filter group
//     const materialGroup = document.querySelector('.sidebarBlock.Material');
//     if (!materialGroup) return;

//     // Hide all items in Material group EXCEPT allowed values
//     const filterItems = materialGroup.querySelectorAll('.list-menu__item');
//     filterItems.forEach(item => {
//       const checkbox = item.querySelector('input[type="checkbox"]');
//       if (checkbox && allowedValues.includes(checkbox.value)) {
//         item.style.display = 'block'; // Show allowed items
//       } else {
//         item.style.display = 'none'; // Hide other Material items
//       }
//     });

//     // Keep the Material group itself visible
//     materialGroup.style.display = 'block';
//   }

//   // Run on initial load
//   filterMaterialValues();

//   // Re-run when filters update (for dynamic apps)
//   const observer = new MutationObserver(filterMaterialValues);
//   observer.observe(document.body, { childList: true, subtree: true });
// });
//walaa

// Function to modify filters
function modifyFilters() {
    // Handle the hiding of unwanted material filter items
    const materialFilter = document.querySelector('.sidebarBlock.js-filter.sidebarBlock-collapse.Material');
    if (materialFilter) {
        const listItems = materialFilter.querySelectorAll('.facets__list .facets__item');
        listItems.forEach(item => {
            const input = item.querySelector('input[type="checkbox"]');
            if (input && !input.value.includes("Material-")) {
                item.style.display = 'none';
            }
        });
    } else {
        console.warn('Material filter not found!');
    }

    // Removing 'Material-' prefix from labels
    const labels = document.querySelectorAll('.facet-checkbox.form-label--checkbox');
    labels.forEach(label => {
        const originalText = label.textContent.trim();
        if (originalText.startsWith('Material-')) {
            const countSpan = label.querySelector('.count');
            let labelText = originalText;
            if (countSpan) {
                labelText = originalText.replace(countSpan.textContent, '').trim();
            }
            const updatedText = labelText.replace(/^Material-/, '').trim();
            label.innerHTML = `${updatedText} ${countSpan ? `<span class="count">${countSpan.textContent}</span>` : ''}`;
        }
    });
}

// Function to set up and start the mutation observer
function setUpObserver() {
    // Ensure the body element is present
    if (document.body) {
        // Set up the observer to monitor changes to the DOM
        const observer = new MutationObserver((mutations) => {
            modifyFilters(); // Call the modifyFilters function on any DOM change
        });

        // Start observing for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true, // observe attribute changes too, might be needed depending on your case
        });

        // Run initially in case the page loads before the observer is active
        modifyFilters();
    } else {
        // Try setting up the observer after a delay if the body isn't available immediately
        window.setTimeout(setUpObserver, 50);
    }
}

// Wait for the DOM to load before setting up the observer
document.addEventListener('DOMContentLoaded', setUpObserver);


//end 
// // filter in collection page 2 codes
// document.addEventListener('DOMContentLoaded', () => {
//     // Target the Material filter specifically
//     const materialFilter = document.querySelector('.sidebarBlock.js-filter.sidebarBlock-collapse.Material');
    
//     if (materialFilter) {
//         const listItems = materialFilter.querySelectorAll('.facets__list .facets__item');
        
//         listItems.forEach(item => {
//             const input = item.querySelector('input[type="checkbox"]');
//             // Check if the input value contains "Material-"
//             if (input && !input.value.includes("Material-")) {
//                 // Hide the list item if "Material-" is not in the value
//                 item.style.display = 'none';
//             }
//         });
//     } else {
//         console.warn('Material filter not found!');
//     }
// });

// // remove Material- from filter 

// document.addEventListener('DOMContentLoaded', function () {
//     // Select all labels with the specific classes
//     const labels = document.querySelectorAll('.facet-checkbox.form-label--checkbox');
//     console.log("Labels found:", labels.length);

//     labels.forEach(label => {
//         // Log the original text for debugging
//         const originalText = label.textContent.trim();
//         console.log("Original label text:", originalText);

//         // Ensure we have the expected text pattern
//         if (originalText.startsWith('Material-')) {
//             // Try to get the count span if present
//             const countSpan = label.querySelector('.count');
            
//             // Isolate label text without the count span
//             let labelText = originalText;
//             if (countSpan) {
//                 labelText = originalText.replace(countSpan.textContent, '').trim();
//             }
//             console.log("Label text without count:", labelText);

//             // Remove the "Material-" prefix using regex
//             const updatedText = labelText.replace(/^Material-/, '').trim();
//             console.log("Updated label text:", updatedText);

//             // Update the label's HTML while preserving the count span if it exists
//             label.innerHTML = `${updatedText} ${countSpan ? `<span class="count">${countSpan.textContent}</span>` : ''}`;
//         }
//     });
// });


// product page - adding space after and befor '|'
document.addEventListener('DOMContentLoaded', () => {
  // Select all elements with the specified class
  document.querySelectorAll('.lv-option-label__selected').forEach(element => {
    // Replace '|' with ' | ' and update the element's innerHTML
    element.innerHTML = element.innerHTML.replace(/\|/g, ' | ');
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver(mutations => {
    const button = document.querySelector('.btn.ks-chart-modal-button.sizing-chart-modal-button');
    
    if (button) {
      observer.disconnect(); // Stop observing once the button is found
      console.log('Button found! Adding event listener.');

      button.addEventListener('click', () => {
        const dropdown = document.getElementById('size-dropdown-sizeGuide');
        const table = document.querySelector('.ks-table');

        if (!dropdown) {
          console.error('Dropdown not found!');
          return;
        }

        if (!table) {
          console.error('Table not found!');
          return;
        }

        dropdown.addEventListener('change', () => {
          const columnIndex = parseInt(dropdown.value);
          const rows = table.querySelectorAll('tr');

          if (isNaN(columnIndex) || columnIndex < 0) {
            console.error('Invalid column index selected:', dropdown.value);
            return;
          }

          console.log('Selected size:', dropdown.options[dropdown.selectedIndex].text);

          // Remove existing highlights
          rows.forEach(row => {
            Array.from(row.children).forEach(cell => {
              cell.classList.remove('highlight');
            });
          });

          // Highlight and scroll to the selected column
          rows.forEach(row => {
            const cell = row.children[columnIndex];
            if (cell) {
              cell.classList.add('highlight');

              // Scroll horizontally to the selected column
              cell.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'  // Ensures horizontal centering
              });
            }
          });
        });
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});


  // Test function
  function myFunction() {
    alert("Hello clicked");
  }
document.addEventListener("DOMContentLoaded", function() {
  const table = document.querySelector('.ks-table'); // Select the main table element

  if (!table) return; // Exit if the table is not found (e.g., if it's not rendered yet)

  table.addEventListener('mouseenter', function(event) {
    const target = event.target;

    // Check if the hovered element is a 'td' and contains the 'highlight' class
    if (target.tagName === 'TD' && target.classList.contains('highlight')) {
      // Add red background color to the hovered cell
      target.style.backgroundColor = '#816f49'; 
      // Add 'target-size' class to the hovered cell
      target.classList.add('target-size');
    }
  }, true); // Use capturing phase to listen on parent and propagate downwards

  table.addEventListener('mouseleave', function(event) {
    const target = event.target;

    // Check if the mouse leaves a 'td' and it has the 'highlight' class
    if (target.tagName === 'TD' && target.classList.contains('highlight')) {
      // Reset the background color to the default
      target.style.backgroundColor = ''; 
      // Remove the 'target-size' class from the hovered cell
      target.classList.remove('target-size');
    }
  }, true); // Use capturing phase 
});

//Walaa 2-26-2025 1:40 PM -  Lowercase the categories bar in the collection page 
document.addEventListener('DOMContentLoaded', function() {
  var elements = document.querySelectorAll('.current-child-caregory-breadcrumb, .children-caregory-breadcrumb');
  elements.forEach(function(element) {
    var words = element.innerText.split(' ');
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].substr(1).toLowerCase();
    }
    element.innerText = words.join(' ');
  });
});
