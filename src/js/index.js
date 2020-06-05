import { Drag } from './gestures.js';
import { setTransform } from './utils.js';

let plan, modalTemplate, optionTemplate, drag, $scene, $activeOption;
const handleJson = response => response.json();
const handleText = response => response.text();
const $port = document.querySelector('.port');
const $view = document.querySelector('.view');
const $zoomSlider = document.querySelector('.zoom-slider');
const $zoomControl = document.querySelector('.zoom-control');
const $modal = document.querySelector('.modal');
const $modalBody = document.querySelector('.modal-body');
const $optionPanel = document.querySelector('.options-panel');
const $optionsButton = document.querySelector('.options-button');
const setModalTemplate = template => modalTemplate = template;
const setOptionTemplate = template => optionTemplate = template;
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
    const { buildingSelector = '.building', buildings, palettes, stages } = plan;
    const matchBuilding = $node => ['A', 'BUTTON'].includes($node.tagName) || $node.matches(buildingSelector);
    const ref = buildings[(document.elementsFromPoint(x, y).find(matchBuilding) || {}).id];
    if(ref) {
        const { state } = ref;
        ref.homestyle = palettes[state];
        ref.stage = stages[state] || state;
        $modalBody.innerHTML = Object.entries(ref).reduce(interpolate, modalTemplate);
        $modal.classList.add('opened');
    }
};
const insertView = (text) => {
    const { buildingSelector = '.building', buildings, palettes, stages } = plan;
    console.log(333, text)
    const setState = $building => {
        const { state } = buildings[$building.id];
        $building.classList.add('building');
        $building.setAttribute('style', `fill: ${palettes[state]}`);
    };
    
    $view.innerHTML = text;
    $scene = $view.firstElementChild;
    drag = new Drag({ $zoomSlider, zoom, clickBuilding });
    init();
    const $buildings = Array.from($scene.querySelectorAll(buildingSelector));
    $buildings.forEach(setState);
    $optionPanel.innerHTML = Object.entries(stages).reduce((sum, [key, value]) =>
        `${sum}${[['guid', key], ['stage', value], ['homestyle', palettes[key]]].reduce(interpolate, optionTemplate)}`, '');
    Array.from($optionPanel.querySelectorAll('.button-switch')).forEach(($button) => {
        $button.onclick = ({ target }) => {
            const { id } = target;
            const setActiveState = $building => {
                const fill = buildings[$building.id].state === id ? palettes[id] : 'rgba(255, 255, 255, .3)';
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
                $buildings.forEach(setState);
            }
        };
    });
    $zoomSlider.oninput = zoom;
    $port.onwheel = wheel;
};
const handlePlan = (raw) => {
    plan = raw;
    document.querySelector('.plan-name').textContent = plan.name;
};
const sitePromise = fetch('floors/plan.svg')
    .then(handleText);
const optionPromise = fetch('option.html')
    .then(handleText)
    .then(setOptionTemplate);
const modalPromise = fetch('modal.html')
    .then(handleText)
    .then(setModalTemplate);
const planPromise = fetch('plan.json')
    .then(handleJson)
    .then(handlePlan);

Promise.all([sitePromise, planPromise, optionPromise, modalPromise])
    .then(([site]) => insertView(site));

$optionsButton.onclick = () => $optionPanel.toggleAttribute('hidden');
document.querySelector('.modal-close-button').onclick = () => $modal.classList.remove('opened');
document.querySelector('.print-button').onclick = () => window.print();
document.querySelector('.reset-button').onclick = reset;

export default () => ({ planPromise });
