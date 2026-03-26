import { Drag } from './gestures.js';
import { setTransform } from './utils.js';

let plan, modalTemplate, drag, $scene, $activeOption;
const handleJson = response => response.json();
const handleText = response => response.text();
const $port = document.querySelector('.port');
const $view = document.querySelector('.view');
const $zoomSlider = document.querySelector('.zoom-slider');
const $zoomControl = document.querySelector('.zoom-control');
const $modal = document.querySelector('.modal');
const $modalBody = document.querySelector('.modal-body');
const $menu = document.querySelector('.menu');
const $optionPalettePanel = $menu.querySelector('.options-panel');
const $optionModelPanel = $menu.querySelector('.options-model');
const $optionsButton = document.querySelector('.options-button');
const setModalTemplate = template => modalTemplate = template;
const interpolate = (acc, [key, value]) => acc.replace(new RegExp(key.toUpperCase(), 'g'), value);
const zoom = () => {
    $view.dataset.z = 1 + $zoomSlider.value / plan.zoomRatio;
    $zoomControl.dataset.z = + $zoomSlider.value + 100;
    $view.style.setProperty('--rz', $view.dataset.sx / $view.dataset.z);
    setTransform($view);
};
const wheel = ({deltaY}) => {
    $zoomSlider.value = + $zoomSlider.value + (deltaY > 0 ? -4 : 4);
    zoom();
};
const init = () => {
    setScale();
    drag.attach();
};
const reset = () => {
    $view.dataset.x = $view.dataset.y = $zoomSlider.value = 0;
    zoom();
    if (plan.resetFilters) {
        // reset model active
        if (plan.model?.inputType === 'radio') {
            const $targetModelToUncheck = $optionModelPanel.querySelector('input:checked');
            if ($targetModelToUncheck) $targetModelToUncheck.checked = false;
        }
        // reset palette active
        if (plan.palettes.inputType === 'radio') {
            const $targetPaletteToUncheck = $optionPalettePanel.querySelector('input:checked');
            if ($targetPaletteToUncheck) $targetPaletteToUncheck.checked = false;
            const palette = plan.palettes.items.find(({ active }) => active);
            if (palette) {
                const $targetToActivate = $optionPalettePanel.querySelector(`input[value=${palette.key || '""'}]`);
                if ($targetToActivate) {
                    $targetToActivate.click();
                }
            }
        }
    }
};
const setScale = () => {
    if($view.dataset.sx === undefined) {
        const { width, height } = $scene.getBoundingClientRect();
        const s = Math.min(window.innerWidth / width, window.innerHeight / height);
        $view.dataset.sy = s;
        $view.dataset.sx = s;
        setTransform($view);
    }
};
const clickBuilding = (x, y) => {
    const { buildings, palettes } = plan;
    const $targetNodes = document.elementsFromPoint(x, y);
    const matchBuilding = buiding => $targetNodes.some($node => buiding.selector === $node.id);
    const building = buildings.find(matchBuilding);
    if(building) {
        const { state, src, url } = building;
        if (!url) return;
        if (!src) {
            return window.open(url);
        }
        const palette = palettes.items.find(({ key }) => key === state);
        if(palette) {
            building.homestyle = palette.color;
            building.stage = palette.name;
            $modalBody.innerHTML = Object.entries(building).reduce(interpolate, modalTemplate);
            $modal.showModal();
        }
    }
};
const insertView = async (text) => {
    const { buildings, palettes, model } = plan;
    const getColor = state => {
        const palette = palettes.items.find(({ key }) => key === state);
        return palette?.buildingColor || palette?.color || '';
    };
    const setState = ({ selector, state, name }) => {
        const $building = $scene.getElementById(selector);
        $building.classList.add('building');
        const color = getColor(state);
        if (color !== 'transparent') {
            $building.setAttribute('style', `fill: ${color}`);
        }
        if (name) {
            const svgTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            svgTitle.textContent = name;
            $building.appendChild(svgTitle);
        }
        return $building;
    };
    $view.innerHTML = text;
    $scene = $view.firstElementChild;
    drag = new Drag({ $zoomSlider, zoom, clickBuilding });
    init();
    
    $zoomSlider.oninput = zoom;
    $port.onwheel = wheel;
    const $buildings = buildings.map(setState);
    const inputTypes = model?.inputType
        ? [...new Set([model.inputType, palettes.inputType])].map(inputType => fetch(`option-${inputType}.html`).then(handleText))
        : [fetch(`option-${palettes.inputType}.html`).then(handleText)];
    const [modelListItemTemplate, paletteListItemTemplate = modelListItemTemplate] = await Promise.all(inputTypes);

    const selectRadioPalette = (modelValue, paletteValue) => {
        const setActiveState = $building => {
            const building = buildings.find(({ selector }) => selector === $building.id);
            if ([building.state, '', undefined].includes(paletteValue) && [building.model, '', undefined].includes(modelValue)) {
                $building.classList.add('building');
                const color = getColor(building.state);
                if (color === 'transparent') {
                    $building.removeAttribute('style');
                } else {
                    $building.setAttribute('style', `fill: ${color}`);
                }
                return;
            }
            $building.classList.remove('building');
            $building.setAttribute('style', 'fill: rgba(0, 0, 0, .6)');
        };
        $buildings.forEach(setActiveState);
    }
    if (model?.inputType === 'radio') {
        $optionModelPanel.innerHTML = model.items.reduce((sum, { key, name, active, color }) =>
            `${sum}${[['guid', key ?? ''], ['LABEL', name], ['name', 'model'], ['CHECKED', active ? 'checked' : ''], ['homestyle', color]].reduce(interpolate, modelListItemTemplate)}`, '');
        $optionModelPanel.onclick = ({ target }) => {
            if (target.matches('input')) {
                selectRadioPalette(target.value, $optionPalettePanel.querySelector('input:checked')?.value);
            }
        };
    }
    
    if (palettes.inputType === 'radio') {
        $optionPalettePanel.innerHTML = palettes.items.reduce((sum, { key, name, color, active }) =>
            `${sum}${[['guid', key], ['LABEL', name], ['name', 'palette'], ['CHECKED', active ? 'checked' : ''], ['homestyle', color]].reduce(interpolate, paletteListItemTemplate)}`, '');
        selectRadioPalette($optionModelPanel.querySelector('input:checked')?.value, $optionPalettePanel.querySelector('input:checked')?.value);
        $optionPalettePanel.onclick = ({ target }) => {
            if (target.matches('input')) {
                selectRadioPalette($optionModelPanel.querySelector('input:checked')?.value, target.value);
            }
        };
    } else {
        $optionPalettePanel.innerHTML = palettes.items.reduce((sum, { key, name, color }) =>
            `${sum}${[['guid', key], ['stage', name], ['homestyle', color]].reduce(interpolate, paletteListItemTemplate)}`, '');
        $optionPalettePanel.querySelectorAll('.button-switch').forEach(($button) => {
            $button.onclick = ({ target }) => {
                const { id } = target;
                const setActiveState = $building => {
                    const buildingIndex = buildings.findIndex(({ selector }) => selector === $building.id);
                    const fill = buildings[buildingIndex].state === id ? getColor(id) : 'rgba(255, 255, 255, .3)';
                    $building.setAttribute('style', `fill: ${fill}`);
                };
                if ($activeOption && $activeOption.isSameNode(target) === false) {
                    $activeOption.setAttribute('aria-checked', false);
                }
                const checked = target.getAttribute('aria-checked') === 'false';
                target.setAttribute('aria-checked', checked);
                if(checked) {
                    $buildings.forEach(setActiveState);
                    $activeOption = target;
                }
                else {
                    buildings.forEach(setState);
                }
            };
        });
    }
    
    
};
const handlePlan = (raw) => {
    plan = raw;
    document.body.classList.add(location.pathname.split('/').at(-2));
    if (plan.name.includes('.')) {
        const $img = document.createElement('img');
        $img.src = plan.name;
        $img.alt = 'Logo';
        $img.classList.add('plan-logo');
        return document.querySelector('.plan-name').appendChild($img);
    }
    document.querySelector('.plan-name').textContent = plan.name;
};
const sitePromise = fetch('plan.svg')
    .then(handleText);

const modalPromise = fetch('modal.html')
    .then(handleText)
    .then(setModalTemplate);
const planPromise = fetch('plan.json')
    .then(handleJson)
    .then(handlePlan);

Promise.all([sitePromise, planPromise, modalPromise])
    .then(([site]) => insertView(site));

$optionsButton.onclick = () => $menu.toggleAttribute('hidden');
document.querySelector('.print-button').onclick = () => window.print();
document.querySelector('.reset-button').onclick = reset;

export default () => ({ planPromise });
