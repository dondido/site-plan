import{Drag}from"./gestures.js";import{setTransform}from"./utils.js";let plan,modalTemplate,drag,$scene;const handleJson=e=>e.json(),handleText=e=>e.text(),$port=document.querySelector(".port"),$view=document.querySelector(".view"),$zoomSlider=document.querySelector(".zoom-slider"),$zoomControl=document.querySelector(".zoom-control"),$modal=document.querySelector(".modal"),$modalBody=document.querySelector(".modal-body"),setModalTemplate=e=>modalTemplate=e,interpolate=(e,[t,o])=>e.replace(new RegExp(t.toUpperCase(),"g"),o),setDragGesture=()=>{},zoom=()=>{$view.dataset.z=1+$zoomSlider.value/plan.zoomRatio,$zoomControl.dataset.z=+$zoomSlider.value+100,$view.style.setProperty("--rz",$view.dataset.sx/$view.dataset.z),setTransform($view)},wheel=({deltaY:e})=>{$zoomSlider.value=+$zoomSlider.value+(e>0?-4:4),zoom()},init=()=>{setScale(),drag.attach()},reset=()=>{$view.dataset.x=$view.dataset.y=$zoomSlider.value=0,zoom()},setScale=()=>{if(void 0===$view.dataset.sx){const{width:e,height:t}=$scene.getBoundingClientRect(),o=Math.min(window.innerWidth/e,window.innerHeight/t);$view.dataset.sy=o,$view.dataset.sx=o,setTransform($view)}},modalPromise=fetch("modal.html").then(handleText).then(setModalTemplate),clickBuilding=(e,t)=>{const{buildingSelector:o=".building",buildings:l,palettes:n,stages:a}=plan,i=l[(document.elementsFromPoint(e,t).find(e=>["A","BUTTON"].includes(e.tagName)||e.matches(o))||{}).id];if(i){const{state:e}=i;i.homestyle=n[e],i.stage=a[e]||e,$modalBody.innerHTML=Object.entries(i).reduce(interpolate,modalTemplate),$modal.classList.add("opened")}},insertView=e=>{const{buildingSelector:t=".building",buildings:o,palettes:l,stages:n}=plan;$view.innerHTML=e,$scene=$view.firstElementChild,drag=new Drag({$zoomSlider:$zoomSlider,zoom:zoom,clickBuilding:clickBuilding}),setScale(),drag.attach();Array.from($scene.querySelectorAll(t)).forEach(e=>{const{state:t}=o[e.id];e.classList.add("building"),e.setAttribute("style","fill: "+l[t])}),$zoomSlider.oninput=zoom,$port.onwheel=wheel},handlePlan=e=>(plan=e,document.querySelector(".plan-name").textContent=plan.name,fetch("floors/plan.svg").then(handleText).then(insertView),e),planPromise=fetch("plan.json").then(handleJson).then(handlePlan);document.querySelector(".modal-close-button").onclick=()=>$modal.classList.remove("opened"),document.querySelector(".print-button").onclick=()=>window.print(),document.querySelector(".reset-button").onclick=reset;export default()=>({planPromise:planPromise});