export const setTransform=t=>{const{sx:s=1,sy:a=1,x:e=0,y:r=0,z:o=1,r:n=0}=t.dataset;t.style.transform=`translate(${e}px, ${r}px) scale(${s*o}, ${a*o}) rotate(${n}deg)`};