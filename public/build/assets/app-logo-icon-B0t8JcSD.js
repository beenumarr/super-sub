import{K as i,j as o}from"./app-B9_eMB4g.js";import{c as l}from"./createLucideIcon-DpLtL-Mi.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],d=l("Image",m);function u({className:s="h-10 w-10",alt:a}){const{config:n}=i().props,e=n.site_logo,t=e?`/storage/uploads/${e}?t=${Date.now()}`:null,r=`${s} overflow-hidden rounded-md flex items-center justify-center`;return t?o.jsx("div",{className:r,children:o.jsx("img",{src:t,alt:a??"logo",className:"h-auto max-h-full w-auto max-w-full object-contain",onError:c=>{c.target.style.display="none"}})}):o.jsx("div",{className:r,children:o.jsx(d,{className:"text-sidebar-primary-foreground/70 h-3/4 w-3/4"})})}export{u as A};
