function addGlobalListener(top, selector, type, handler) {
    const add = (top) => {
        const func = function (event) {
            let closest = event.target.closest(selector);
            if (closest && this.contains(closest)) {
                handler.call(closest, event);
            }
        }

        top.addEventListener(type, func);
    }

    if (typeof top === 'string') {
        document.querySelectorAll(top).forEach(add);
    } else {
        add(top);
    }
}

function switchActive(li) {
    const closest = li.closest('ul.switch');
    if (!closest) {
        return;
    }

    const selector = closest.getAttribute('data-selector');
    let items;
    if (!selector) {
        items = Array.from(closest.children);
    } else {
        items = document.querySelectorAll(`${selector} > li`);
    }

    items.forEach((x) => {
        if (x !== li) {
            x.classList.remove("switch-active");
        }
    })
    li.classList.add("switch-active");
}

function regAutoSwitch() {
    addGlobalListener('html', 'ul.switch > li', 'click', function (event) {
        switchActive(this);
    });
}
