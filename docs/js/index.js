import{Drag}from"./gestures.js";import{setTransform}from"./utils.js";let plan,modalTemplate,optionTemplate,drag,$scene,$activeOption;const handleJson=e=>e.json(),handleText=e=>e.text(),$port=document.querySelector(".port"),$view=document.querySelector(".view"),$zoomSlider=document.querySelector(".zoom-slider"),$zoomControl=document.querySelector(".zoom-control"),$modal=document.querySelector(".modal"),$modalBody=document.querySelector(".modal-body"),$optionPanel=document.querySelector(".options-panel"),$optionsButton=document.querySelector(".options-button"),setModalTemplate=e=>modalTemplate=e,setOptionTemplate=e=>optionTemplate=e,interpolate=(e,[t,o])=>e.replace(new RegExp(t.toUpperCase(),"g"),o),zoom=()=>{$view.dataset.z=1+$zoomSlider.value/plan.zoomRatio,$zoomControl.dataset.z=+$zoomSlider.value+100,$view.style.setProperty("--rz",$view.dataset.sx/$view.dataset.z),setTransform($view)},wheel=({deltaY:e})=>{$zoomSlider.value=+$zoomSlider.value+(e>0?-4:4),zoom()},init=()=>{setScale(),drag.attach()},reset=()=>{$view.dataset.x=$view.dataset.y=$zoomSlider.value=0,zoom()},setScale=()=>{if(void 0===$view.dataset.sx){const{width:e,height:t}=$scene.getBoundingClientRect(),o=Math.min(window.innerWidth/e,window.innerHeight/t);$view.dataset.sy=o,$view.dataset.sx=o,setTransform($view)}},clickBuilding=(e,t)=>{const{buildingSelector:o=".building",buildings:n,palettes:i,stages:l}=plan,a=n[(document.elementsFromPoint(e,t).find(e=>["A","BUTTON"].includes(e.tagName)||e.matches(o))||{}).id];if(a){const{state:e}=a;a.homestyle=i[e],a.stage=l[e]||e,$modalBody.innerHTML=Object.entries(a).reduce(interpolate,modalTemplate),$modal.classList.add("opened")}},insertView=e=>{const{buildingSelector:t=".building",buildings:o,palettes:n,stages:i}=plan;console.log(333,e);const l=e=>{const{state:t}=o[e.id];e.classList.add("building"),e.setAttribute("style","fill: "+n[t])};$view.innerHTML=e,$scene=$view.firstElementChild,drag=new Drag({$zoomSlider:$zoomSlider,zoom:zoom,clickBuilding:clickBuilding}),setScale(),drag.attach();const a=Array.from($scene.querySelectorAll(t));a.forEach(l),$optionPanel.innerHTML=Object.entries(i).reduce((e,[t,o])=>`${e}${[["guid",t],["stage",o],["homestyle",n[t]]].reduce(interpolate,optionTemplate)}`,""),Array.from($optionPanel.querySelectorAll(".button-switch")).forEach(e=>{e.onclick=({target:e})=>{const{id:t}=e,i=e=>{const i=o[e.id].state===t?n[t]:"rgba(255, 255, 255, .3)";e.setAttribute("style","fill: "+i)};$activeOption&&!1===$activeOption.isSameNode(e)&&$activeOption.setAttribute("aria-checked",!1);const r="false"===e.getAttribute("aria-checked");e.setAttribute("aria-checked",r),r?(a.forEach(i),$activeOption=e):a.forEach(l)}}),$zoomSlider.oninput=zoom,$port.onwheel=wheel},handlePlan=e=>{plan=e,document.querySelector(".plan-name").textContent=plan.name},sitePromise=fetch("floors/plan.svg").then(handleText),optionPromise=fetch("option.html").then(handleText).then(setOptionTemplate),modalPromise=fetch("modal.html").then(handleText).then(setModalTemplate),planPromise=fetch("plan.json").then(handleJson).then(handlePlan);Promise.all([sitePromise,planPromise,optionPromise,modalPromise]).then(([e])=>insertView(e)),$optionsButton.onclick=()=>$optionPanel.toggleAttribute("hidden"),document.querySelector(".modal-close-button").onclick=()=>$modal.classList.remove("opened"),document.querySelector(".print-button").onclick=()=>window.print(),document.querySelector(".reset-button").onclick=reset;export default()=>({planPromise:planPromise});