'use strict';
const cfg=window.OLHAI_CONFIG||{};
const pixelId=String(cfg.metaPixelId||'').trim();
if(/^\d+$/.test(pixelId)){
 (function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
 fbq('init',pixelId);fbq('track','PageView');
}
let groupUrl=null;
try{const u=new URL(cfg.groupUrl);if(u.protocol==='https:'&&u.hostname==='chat.whatsapp.com')groupUrl=u.href}catch{}
document.querySelectorAll('[data-group]').forEach(a=>{
 if(groupUrl)a.href=groupUrl;
 a.addEventListener('click',e=>{
  if(!groupUrl){e.preventDefault();alert('O link do grupo está indisponível no momento.');return;}
  if(typeof fbq==='function'){fbq('trackCustom','ClicouGrupoOfertasDoDia',{source:'botao',destination:'WhatsApp',content_name:'Olhai - Ofertas do Dia'});fbq('track','Lead',{content_name:'Olhai - Ofertas do Dia'});}
 });
});
const images=Array.from({length:9},(_,i)=>`oferta-${String(i+1).padStart(2,'0')}.jpeg`);
const track=document.getElementById('carousel-track');
const viewport=document.getElementById('carousel-viewport');
const dialog=document.getElementById('image-dialog');
const expanded=document.getElementById('expanded-image');
for(let cycle=0;cycle<2;cycle++)for(let i=0;i<images.length;i++){
 const btn=document.createElement('button');btn.type='button';btn.className='offer-card';btn.setAttribute('aria-label',`Ampliar print da oferta ${i+1}`);
 const img=document.createElement('img');img.className='offer-image';img.src=images[i];img.alt=`Print original da oferta ${i+1}`;img.loading=(cycle===0&&i<4)?'eager':'lazy';img.draggable=false;
 btn.append(img);btn.addEventListener('click',()=>{if(suppressClick)return;expanded.src=images[i];dialog.showModal()});track.append(btn);
}
document.getElementById('close-image').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
let offset=0,half=0,dragging=false,startX=0,startOffset=0,lastTime=0,suppressClick=false,pauseUntil=0;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const render=()=>{track.style.transform=`translate3d(${-offset}px,0,0)`};
const normalize=()=>{if(half>0)offset=((offset%half)+half)%half};
const measure=()=>{
 const first=track.children[0],repeat=track.children[images.length];
 if(!first||!repeat)return;
 const measured=repeat.offsetLeft-first.offsetLeft;
 if(measured>0){half=measured;normalize();render()}
};
function frame(time){
 if(lastTime&&!dragging&&!reduced&&time>pauseUntil&&half>0){
  offset+=Math.min(time-lastTime,80)*0.038;normalize();render();
 }
 lastTime=time;requestAnimationFrame(frame);
}
function begin(x){dragging=true;startX=x;startOffset=offset;suppressClick=false;viewport.classList.add('dragging')}
function move(x){if(!dragging)return;const delta=x-startX;if(Math.abs(delta)>7)suppressClick=true;offset=startOffset-delta;normalize();render()}
function release(){if(!dragging)return;dragging=false;viewport.classList.remove('dragging');pauseUntil=performance.now()+900;setTimeout(()=>{suppressClick=false},150)}
// Touch listeners are explicit for iOS Safari and in-app browsers.
viewport.addEventListener('touchstart',e=>{if(e.touches.length===1)begin(e.touches[0].clientX)},{passive:true});
viewport.addEventListener('touchmove',e=>{if(!dragging||e.touches.length!==1)return;const delta=e.touches[0].clientX-startX;if(Math.abs(delta)>8){e.preventDefault();move(e.touches[0].clientX)}},{passive:false});
viewport.addEventListener('touchend',release,{passive:true});
viewport.addEventListener('touchcancel',release,{passive:true});
viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||(e.pointerType==='mouse'&&e.button!==0))return;begin(e.clientX);try{viewport.setPointerCapture(e.pointerId)}catch{}});
viewport.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')move(e.clientX)});
viewport.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')release()});
viewport.addEventListener('pointercancel',e=>{if(e.pointerType!=='touch')release()});
viewport.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();offset+=e.deltaX;normalize();render();pauseUntil=performance.now()+700}},{passive:false});
window.addEventListener('resize',measure);
window.addEventListener('pageshow',()=>{measure();lastTime=0});
window.addEventListener('load',measure);
if('ResizeObserver'in window)new ResizeObserver(measure).observe(viewport);
measure();requestAnimationFrame(frame);
const policies={terms:['Termos de uso','O OLHAI compartilha ofertas e links de lojas terceirizadas. Preços, descontos, frete, estoque e cupons podem mudar. Confira os valores e condições no aplicativo da loja antes de comprar. A participação no grupo é gratuita e alguns links podem gerar comissão de afiliado.'],privacy:['Privacidade','Esta página não solicita cadastro. O Meta Pixel é usado para medir visualizações e cliques no botão do WhatsApp. Um clique não confirma entrada no grupo. Ao abrir o WhatsApp, aplicam-se também as políticas desse serviço.']};
const policyDialog=document.getElementById('policy-dialog');
document.querySelectorAll('[data-policy]').forEach(b=>b.addEventListener('click',()=>{const [title,body]=policies[b.dataset.policy];document.getElementById('policy-title').textContent=title;document.getElementById('policy-text').textContent=body;policyDialog.showModal()}));
document.getElementById('close-policy').addEventListener('click',()=>policyDialog.close());

// Correct Safari/Chrome iOS visual viewport mismatches after pinch zoom or rotation.
(function(){
  let scheduled=false;
  function syncVisibleWidth(){
    scheduled=false;
    const vv=window.visualViewport;
    const layoutWidth=document.documentElement.clientWidth;
    const visibleWidth=vv&&Number.isFinite(vv.width)?vv.width:0;
    const width=Math.max(layoutWidth,visibleWidth);
    if(width>0 && width<10000){
      document.documentElement.style.setProperty('--olhai-visible-width',width+'px');
    }
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(syncVisibleWidth)}
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  window.addEventListener('pageshow',schedule,{passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',schedule,{passive:true});
    window.visualViewport.addEventListener('scroll',schedule,{passive:true});
  }
  schedule();
})();
