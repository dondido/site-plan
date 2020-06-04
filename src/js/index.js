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


/* const selectFloor = ({ target }, collapse) => {
    collapse || $floorSelector.classList.toggle('expand');
    if (target.classList.contains('selected') === false && target.isSameNode($floorSelector) === false) {
        const id = `#${target.dataset.ref}`;
        const $summary = document.querySelector(`[data-id=${target.dataset.ref}]`);
        const $highlightSummary = document.querySelector('.highlight-summary');
        $selectedFloorOption.classList.remove('selected');
        $selectedFloorOption = target;
        target.classList.add('selected');
        $dirty.appendChild($floor);
        $floor = $dirty.querySelector(id) || $pristine.querySelector(id).cloneNode(true);
        $scene.appendChild($floor);
        $highlightSummary && $highlightSummary.classList.remove('highlight-summary');
        $summary && $summary.classList.add('highlight-summary');
        restore();
    }
}; */
const setDragGesture = () => {
    //$measure.checked = false;
    //drag.attach();
    //$ruler.classList.remove('apply');
};
/* const toggleMeasure = () => {
    if($measure.checked) {
        measure.attach();
    }
    else {
        setDragGesture();
    }
}; */
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
/*const revertView = () => {
    $view.dataset.sx *= -1;
    setTransform($view);
};
const interpolateForeign = ($text) => {
    const { sx = 1, r = 0 } = $text.dataset;
    $text.dataset.sx = sx * -1;
    $text.dataset.r = r * -1;
    setTransform($text);
};
/*const mirror = (e) => {
    if ($reverse.checked && $floor.dataset.reversed !== 'true') {
        const $texts = $floor.querySelectorAll('text');
        const interpolate = ($text, idx) => {
            const $target = $texts[idx];
            if($target.dataset.flip === undefined) {
                const transform = $text.getAttribute('transform');
                const matrix = /\(([^)]+)\)/.exec(transform)[1].split(' ');
                $target.dataset.transform = transform;
                matrix[0] = -1;
                matrix[4] = $text.getBoundingClientRect().right;
                $target.dataset.flip = `matrix(${matrix.join()})`;  
            }
            $target.setAttribute('transform', $target.dataset.flip);
        };
        $floor.dataset.reversed = true;
        $mirror.appendChild($pristine);
        $pristine.querySelectorAll(`#${$floor.id} text`).forEach(interpolate);
        $floor.querySelectorAll('.text-field').forEach(interpolateForeign);
        $pristine.remove();
        e && revertView();
    }
    else if($reverse.checked === false && $floor.dataset.reversed === 'true') {
        const interpolate = $text => $text.setAttribute('transform', $text.dataset.transform);
        $floor.dataset.reversed = false;
        $floor.querySelectorAll('text').forEach(interpolate);
        $floor.querySelectorAll('.text-field').forEach(interpolateForeign);
        e && revertView();
    }
};*/
const init = () => {
    setScale();
    drag.attach();
};
/* const restore = () => {
    $zoomSlider.value = 0;
    setDragGesture();
    mirror();
    zoom();
    init();
}; */
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
/* const setFloor = ({name, id, options}, idx) => {
    const $floorOption = document.createElement('li');
    const $g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const ref = `floor-${id}`;
    const hideViewOptions = ({ id }) => $pristine.appendChild(document.getElementById(id));
    $g.setAttribute('id', ref);
    $g.appendChild(document.getElementById(id));
    options && options.forEach(hideViewOptions);
    $g.insertAdjacentHTML('beforeend', '<foreignObject data-drag-area=".view"></foreignObject>');
    $floorOption.textContent = name;
    $floorOption.className = 'floor-option';
    floorOptions.push($floorOption);
    $pristine.appendChild($g);
    if(idx === 0) {
        $floor = $g.cloneNode(true);
        $floorOption.classList.add('selected');
        $scene.appendChild($floor)
    }
    $floorOption.dataset.ref = ref;
    $floorSelector.appendChild($floorOption);
}; */
const optionPromise = fetch('option.html')
    .then(handleText)
    .then(setOptionTemplate);
const modalPromise = fetch('modal.html')
    .then(handleText)
    .then(setModalTemplate);
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
    /* const buildingIds = Array.from($scene.querySelectorAll('[id^=building]'), ({ id }) => id);
    const matchBuilding = ({ id }) => id.startsWith('building');
    $scene.onclick = e => {
        const buildingId = (document.elementsFromPoint(e.clientX, e.clientY).find(matchBuilding) || {}).id;
        //console.log(333, buildingId, buildingIds, document.elementsFromPoint(e.clientX, e.clientY).find(({ id }) => id.startsWith('building')));
    };
     */
    /* Array.from($scene.querySelectorAll('[id^=building]')).forEach($building => {
        console.log(887, $building);
        $building.classList.add('building-cta');
        $building.onclick = e => {
            console.log(888, e)
        }
    }); */
    /*measure = new Measure({ $scene, $view, $zoomSlider, $ruler, $foots, plan });
    
    $selectedFloorOption = floorOptions[0];
    $floorSelector.onclick = selectFloor;*/
    $zoomSlider.oninput = zoom;
    $port.onwheel = wheel;
};
const handlePlan = (raw) => {
    plan = raw;
    document.querySelector('.plan-name').textContent = plan.name;
    fetch('floors/plan.svg')
        .then(handleText)
        .then(insertView);
    return raw;
};
/* const addText = () => {
    const $text = document.createElement('pre');
    $text.textContent = 'Add Text';
    $text.className = 'draggable text-field';
    $text.dataset.x = $scene.width.baseVal.value / 2;
    $text.dataset.y = $scene.height.baseVal.value / 2;
    $text.dataset.sx = Math.sign($view.dataset.sx);
    $floor.querySelector('foreignObject').appendChild($text);
    document.body.dispatchEvent(new CustomEvent('focus-text', { detail: { $text } }));
    setTransform($text);
}; */
const planPromise = fetch('plan.json')
    .then(handleJson)
    .then(handlePlan);

$optionsButton.onclick = () => $optionPanel.toggleAttribute('hidden');
document.querySelector('.modal-close-button').onclick = () => $modal.classList.remove('opened');
document.querySelector('.print-button').onclick = () => window.print();
document.querySelector('.reset-button').onclick = reset;
//document.querySelector('.text-button').onclick = addText;

//$reverse.onchange = mirror;
//$measure.onchange = toggleMeasure;
//window.onresize = resize;

export default () => ({ planPromise });
