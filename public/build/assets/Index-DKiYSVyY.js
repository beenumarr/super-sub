import{K as je,r as k,m as P,j as e,L as we}from"./app-Dg7dJj90.js";import{B as O}from"./badge-CF81N4vP.js";import{B as G}from"./button-BaAn0_cA.js";import{C as u,a as S,b as I,d as U,c as b}from"./card-CK-Nc9IF.js";import{C as H}from"./confirm-transaction-modal-CHQR6ltl.js";import{I as q}from"./input-iOlpbtr1.js";import{L as W}from"./label-BGWH4lb6.js";import{T as ke,a as Se,b as Y,c as J}from"./tabs-D2ln6rzZ.js";import{A as Ie}from"./app-layout-CnnRj48M.js";import{V as d}from"./index-C4agftX7.js";import{c as C}from"./createLucideIcon-Sj6adidP.js";import{C as K}from"./credit-card-DozvmYlW.js";import{C as Z}from"./circle-alert-D9KffEwL.js";import{C as Ce}from"./circle-check-DSK1q6nP.js";import{C as Ee}from"./copy-ByU3mpXj.js";/* empty css            */import"./index-BBD8c5lC.js";import"./index-DZZQifJx.js";import"./utils-jAU0Cazi.js";import"./dialog-DLgDd5Wn.js";import"./index-CP0aikDt.js";import"./index-B6_6RmwW.js";import"./index--yaxrsYG.js";import"./x-DFaFMt4l.js";import"./key-round-DOlepp_x.js";import"./loader-circle-rrC2D9oC.js";import"./circle-x-DMqrDd_7.js";import"./index-m3SrQmFL.js";import"./index-D00hWo7f.js";import"./index-CSeFuH-M.js";import"./index-BW7av8Am.js";import"./index-B6K3RT-O.js";import"./wallet-CssAt9oQ.js";import"./zap-CMLWWw4u.js";import"./app-logo-icon-BohPRF31.js";import"./shield-check-DGdcigIp.js";import"./chevron-right-DmjECXI7.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m9 15 2 2 4-4",key:"1grp1n"}]],Ve=C("FileCheck",_e);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["path",{d:"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",key:"1nerag"}],["path",{d:"M14 13.12c0 2.38 0 6.38-1 8.88",key:"o46ks0"}],["path",{d:"M17.29 21.02c.12-.6.43-2.3.5-3.02",key:"ptglia"}],["path",{d:"M2 12a10 10 0 0 1 18-6",key:"ydlgp0"}],["path",{d:"M2 16h.01",key:"1gqxmh"}],["path",{d:"M21.8 16c.2-2 .131-5.354 0-6",key:"drycrb"}],["path",{d:"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",key:"1tidbn"}],["path",{d:"M8.65 22c.21-.66.45-1.32.57-2",key:"13wd9y"}],["path",{d:"M9 6.8a6 6 0 0 1 9 5.2v2",key:"1fr1j5"}]],Q=C("Fingerprint",$e);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Be=[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]],De=C("Printer",Be);function l(c){return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN"}).format(c)}function bt({nin_fee:c,bvn_fee:p,nin_enabled:E,bvn_enabled:_,recent_verifications:V,verification_result:X,app_name:ee,is_sandbox:te}){var A,T,F;const h=je().props,$=ee||((A=h.config)==null?void 0:A.site_name)||h.site_name||"SuperSub";(F=(T=h.auth)==null?void 0:T.user)==null||F.has_pin;const[B,ie]=k.useState("nin"),[i,g]=k.useState(X||null),[D,m]=k.useState({type:"",message:"",title:""}),s=P({nin:"",transaction_pin:""}),r=P({bvn:"",transaction_pin:""}),ae=B==="nin"?c:p,se=a=>{const t=s.data.nin.trim();if(!/^\d{11}$/.test(t)){s.setError("nin","NIN must be exactly 11 digits."),d.error("NIN must be exactly 11 digits.");return}s.clearErrors("nin"),a()},re=a=>{const t=r.data.bvn.trim();if(!/^\d{11}$/.test(t)){r.setError("bvn","BVN must be exactly 11 digits."),d.error("BVN must be exactly 11 digits.");return}r.clearErrors("bvn"),a()},ne=()=>{s.post(route("verification.nin"),{preserveScroll:!0,onSuccess:a=>{const t=a.props.verification_result;t&&(g(t),m({type:"success",title:"Verification Successful!",message:`NIN ${s.data.nin} was verified successfully.`}),d.success("NIN verified successfully!"))},onError:a=>{const t=Object.values(a)[0];m({type:"error",title:"Verification Failed",message:typeof t=="string"?t:"Verification failed."}),d.error(typeof t=="string"?t:"Verification failed.")}})},oe=()=>{r.post(route("verification.bvn"),{preserveScroll:!0,onSuccess:a=>{const t=a.props.verification_result;t&&(g(t),m({type:"success",title:"Verification Successful!",message:`BVN ${r.data.bvn} was verified successfully.`}),d.success("BVN verified successfully!"))},onError:a=>{const t=Object.values(a)[0];m({type:"error",title:"Verification Failed",message:typeof t=="string"?t:"Verification failed."}),d.error(typeof t=="string"?t:"Verification failed.")}})},de=[{label:"Service",value:"National Identity Number (NIN)"},{label:"NIN Number",value:s.data.nin},{label:"Verification Fee",value:l(c)}],le=[{label:"Service",value:"Bank Verification Number (BVN)"},{label:"BVN Number",value:r.data.bvn},{label:"Verification Fee",value:l(p)}],ce=(a,t)=>{a&&(navigator.clipboard.writeText(a),d.success(`${t} copied to clipboard!`))},me=()=>{var L;if(!i)return;const a=i.type==="NIN",t=i.identity||{},N=(t.surname||t.last_name||"").toUpperCase(),y=(t.firstname||t.first_name||"").toUpperCase(),f=(t.middlename||t.middle_name||"").toUpperCase(),pe=[y,f,N].filter(Boolean).join(" ")||[N,y,f].filter(Boolean).join(" ")||"JAAFAR MUHAMMAD",v=t.nin||t.bvn||i.identifier||"",R=i.verified_at?new Date(i.verified_at).toLocaleString("en-US"):new Date().toLocaleString("en-US"),fe=a?"National Identity Number (NIN)":"Bank Verification Number (BVN)",ve=a?"NIMC":"NIBSS",xe=te?"sandbox":"live",ue=i.reference||v,be=(t.gender||"m").toLowerCase(),he=t.birthdate||t.date_of_birth||"N/A",ge=t.residence_lga||t.residence_town||t.lga||"",Ne=t.residence_state||t.state||"",ye=t.self_origin_state||t.origin_state||t.state_of_origin||"",M=t.self_origin_lga||t.origin_lga||t.lga_of_origin||"",z=t.telephoneno||t.phone||t.phone_number1||"";let j="";if(t.photo||t.image){const o=t.photo||t.image;j=`<img src="${String(o).startsWith("data:image")||String(o).startsWith("http")?o:`data:image/jpeg;base64,${o}`}" alt="Photo" style="width: 100%; height: 100%; object-fit: cover; display: block;" />`}else j=`
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; color: #94a3b8;">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span style="font-size: 8px; margin-top: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">PHOTO</span>
                </div>
            `;const n=document.createElement("iframe");n.style.position="fixed",n.style.right="0",n.style.bottom="0",n.style.width="0",n.style.height="0",n.style.border="0",document.body.appendChild(n);const x=(L=n.contentWindow)==null?void 0:L.document;x&&(x.open(),x.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${a?"NIN":"BVN"} Slip - ${v}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 16mm 18mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: 24px 28px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .report-container {
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
        }
        .brand-header {
            font-size: 22px;
            font-weight: 800;
            color: #000000;
            letter-spacing: -0.4px;
            margin-bottom: 12px;
        }
        .header-divider {
            border-bottom: 2.5px solid #000000;
            margin-bottom: 26px;
        }
        .title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 28px;
        }
        .title-h1 {
            font-size: 20px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.3px;
            margin-bottom: 4px;
        }
        .title-subtitle {
            font-size: 11px;
            color: #4b5563;
        }
        .verified-pill {
            border: 1px solid #d1d5db;
            border-radius: 9999px;
            padding: 4px 18px;
            font-size: 11.5px;
            font-weight: 600;
            color: #111827;
            background: #ffffff;
            white-space: nowrap;
        }
        .subject-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 28px;
        }
        .subject-name {
            font-size: 17px;
            font-weight: 800;
            color: #000000;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 8px;
        }
        .subject-doc {
            font-size: 12px;
            color: #111827;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .subject-doc-num {
            font-weight: 700;
        }
        .subject-generated {
            font-size: 11px;
            color: #6b7280;
        }
        .photo-card {
            width: 114px;
            height: 130px;
            border: 1.5px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            background: #f8fafc;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 30px;
        }
        .summary-box {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 10px 14px;
            background: #ffffff;
        }
        .summary-box-label {
            font-size: 9px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .summary-box-value {
            font-size: 12px;
            font-weight: 700;
            color: #111827;
            line-height: 1.35;
        }
        .info-section {
            margin-bottom: 44px;
        }
        .info-title {
            font-size: 14px;
            font-weight: 800;
            color: #111827;
            margin-bottom: 16px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 36px;
            row-gap: 14px;
        }
        .info-cell-label {
            font-size: 9px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 2px;
            letter-spacing: 0.3px;
        }
        .info-cell-value {
            font-size: 12px;
            font-weight: 700;
            color: #111827;
        }
        .report-footer {
            margin-top: 50px;
            padding-top: 14px;
            border-top: 1px solid #f1f5f9;
        }
        .disclaimer-text {
            font-size: 8.5px;
            color: #9ca3af;
            line-height: 1.45;
            margin-bottom: 6px;
        }
        .footer-brand {
            text-align: right;
            font-size: 13px;
            font-weight: 800;
            color: #000000;
            letter-spacing: -0.2px;
            margin-top: 12px;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="brand-header">${$}</div>
        <div class="header-divider"></div>

        <div class="title-row">
            <div>
                <h1 class="title-h1">Identity Verification Report</h1>
                <p class="title-subtitle">Generated for compliance review and operational record keeping.</p>
            </div>
            <div>
                <div class="verified-pill">Verified</div>
            </div>
        </div>

        <div class="subject-row">
            <div>
                <h2 class="subject-name">${pe}</h2>
                <p class="subject-doc">Document: <span class="subject-doc-num">${v}</span></p>
                <p class="subject-generated">Generated: ${R}</p>
            </div>
            <div class="photo-card">
                ${j}
            </div>
        </div>

        <div class="summary-grid">
            <div class="summary-box">
                <div class="summary-box-label">SERVICE</div>
                <div class="summary-box-value">${fe}</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">SOURCE</div>
                <div class="summary-box-value">${ve}</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">ENVIRONMENT</div>
                <div class="summary-box-value">${xe}</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">COUNTRY</div>
                <div class="summary-box-value">NG</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">VERIFICATION DATE</div>
                <div class="summary-box-value">${R}</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">REFERENCE</div>
                <div class="summary-box-value">${ue}</div>
            </div>
        </div>

        <div class="info-section">
            <h3 class="info-title">Verified Information</h3>
            <div class="info-grid">
                <div>
                    <div class="info-cell-label">${a?"NIN":"BVN"}</div>
                    <div class="info-cell-value">${v}</div>
                </div>
                <div>
                    <div class="info-cell-label">GENDER</div>
                    <div class="info-cell-value">${be}</div>
                </div>
                <div>
                    <div class="info-cell-label">SURNAME</div>
                    <div class="info-cell-value">${N||"N/A"}</div>
                </div>
                <div>
                    <div class="info-cell-label">BIRTHDATE</div>
                    <div class="info-cell-value">${he}</div>
                </div>
                <div>
                    <div class="info-cell-label">FIRSTNAME</div>
                    <div class="info-cell-value">${y||"N/A"}</div>
                </div>
                <div>
                    <div class="info-cell-label">RESIDENCE LGA</div>
                    <div class="info-cell-value">${ge||"N/A"}</div>
                </div>
                <div>
                    <div class="info-cell-label">RESIDENCE STATE</div>
                    <div class="info-cell-value">${Ne||"N/A"}</div>
                </div>
                <div>
                    <div class="info-cell-label">SELF ORIGIN STATE</div>
                    <div class="info-cell-value">${ye||"N/A"}</div>
                </div>
                ${f?`
                <div>
                    <div class="info-cell-label">MIDDLENAME</div>
                    <div class="info-cell-value">${f}</div>
                </div>`:""}
                ${M?`
                <div>
                    <div class="info-cell-label">SELF ORIGIN LGA</div>
                    <div class="info-cell-value">${M}</div>
                </div>`:""}
                ${z?`
                <div>
                    <div class="info-cell-label">TELEPHONE</div>
                    <div class="info-cell-value">${z}</div>
                </div>`:""}
            </div>
        </div>

        <div class="report-footer">
            <p class="disclaimer-text">
                Disclaimer: This report is confidential and must be used only for the authorized verification purpose for which the data subject gave consent or another lawful basis applies. Do not resell, republish, or reuse this information for unrelated profiling, marketing, discrimination, or automated decisions without a valid legal basis.
            </p>
            <p class="disclaimer-text">
                Data-protection notice: Handle this report in line with NDPA/NDPC principles including fairness, accountability, purpose limitation, data minimisation, accuracy, confidentiality, secure retention, and respect for data-subject rights.
            </p>
            <div class="footer-brand">${$}</div>
        </div>
    </div>
</body>
</html>`),x.close(),setTimeout(()=>{var o,w;(o=n.contentWindow)==null||o.focus(),(w=n.contentWindow)==null||w.print(),setTimeout(()=>{document.body.removeChild(n)},1500)},300))};return e.jsxs(Ie,{breadcrumbs:[{title:"NIN / BVN Slip",href:"/verification"}],children:[e.jsx(we,{title:"NIN / BVN Slip"}),e.jsx("style",{children:`
                @media print {
                    aside,
                    header,
                    nav,
                    [data-sidebar],
                    .no-print,
                    #verification-form-container,
                    #recent-verifications-container {
                        display: none !important;
                    }
                    body, main {
                        background: #ffffff !important;
                        color: #000000 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
            `}),e.jsx("div",{className:"mx-auto max-w-4xl px-4 py-8 print:p-0 print:m-0 print:max-w-none",children:e.jsxs("div",{className:"grid grid-cols-1 gap-8 lg:grid-cols-12 print:block",children:[e.jsx("div",{id:"verification-form-container",className:"order-1 lg:order-1 lg:col-span-7 print:hidden",children:e.jsxs(u,{className:"border-border/60 shadow-sm",children:[e.jsxs(S,{className:"pb-4",children:[e.jsx(I,{className:"text-lg font-semibold",children:"Generate Identity Slip"}),e.jsx(U,{children:"Select the service type and enter an 11-digit number to query official records and generate your slip."})]}),e.jsx(b,{children:e.jsxs(ke,{defaultValue:"nin",value:B,onValueChange:a=>{ie(a),g(null)},children:[e.jsxs(Se,{className:"grid w-full grid-cols-2 h-auto p-1.5 rounded-xl bg-gray-100 dark:bg-slate-800/80 gap-2 border border-border/40",children:[e.jsxs(Y,{value:"nin",disabled:!E,className:`gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                                                data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-200/80 data-[state=inactive]:shadow-xs data-[state=inactive]:hover:bg-gray-50 data-[state=inactive]:hover:text-gray-900
                                                dark:data-[state=inactive]:bg-slate-900/70 dark:data-[state=inactive]:text-gray-300 dark:data-[state=inactive]:border-slate-700/60 dark:data-[state=inactive]:hover:bg-slate-900 dark:data-[state=inactive]:hover:text-white
                                                data-[state=active]:bg-theme-1 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-theme-1 data-[state=active]:font-semibold
                                                dark:data-[state=active]:bg-theme-1 dark:data-[state=active]:text-white`,children:[e.jsx(Q,{className:"h-4 w-4"}),"NIN Slip"]}),e.jsxs(Y,{value:"bvn",disabled:!_,className:`gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                                                data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-200/80 data-[state=inactive]:shadow-xs data-[state=inactive]:hover:bg-gray-50 data-[state=inactive]:hover:text-gray-900
                                                dark:data-[state=inactive]:bg-slate-900/70 dark:data-[state=inactive]:text-gray-300 dark:data-[state=inactive]:border-slate-700/60 dark:data-[state=inactive]:hover:bg-slate-900 dark:data-[state=inactive]:hover:text-white
                                                data-[state=active]:bg-theme-1 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-theme-1 data-[state=active]:font-semibold
                                                dark:data-[state=active]:bg-theme-1 dark:data-[state=active]:text-white`,children:[e.jsx(K,{className:"h-4 w-4"}),"BVN Slip"]})]}),e.jsxs("div",{className:"my-4 flex items-center justify-between rounded-lg bg-muted/60 p-3 text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Slip Generation Fee:"}),e.jsx(O,{variant:"secondary",className:"text-sm font-semibold",children:l(ae)})]}),e.jsx(J,{value:"nin",className:"space-y-4 pt-2",children:E?e.jsxs("div",{className:"space-y-4 pt-1",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(W,{htmlFor:"nin_input",children:"National Identity Number (NIN)"}),e.jsx(q,{id:"nin_input",type:"text",inputMode:"numeric",maxLength:11,placeholder:"Enter 11-digit NIN",value:s.data.nin,onChange:a=>{s.setData("nin",a.target.value.replace(/\D/g,"")),s.errors.nin&&s.clearErrors("nin")},className:"font-mono text-base tracking-wider",required:!0}),s.errors.nin&&e.jsx("p",{className:"text-xs text-destructive",children:s.errors.nin})]}),e.jsx(H,{title:`Generate NIN Slip (${l(c)})`,status:D,resetStatus:()=>m({type:"",message:"",title:""}),processing:s.processing,message:`Are you sure you want to generate NIN slip for ${s.data.nin} for ${l(c)}?`,handleSubmit:ne,validateForm:se,detailsRows:de,requirePin:!0,onPinChange:a=>s.setData("transaction_pin",a),pinError:s.errors.transaction_pin,errors:s.errors})]}):e.jsxs("div",{className:"flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",children:[e.jsx(Z,{className:"h-5 w-5 shrink-0 text-amber-600"}),e.jsx("span",{children:"NIN Verification is temporarily disabled by the administrator."})]})}),e.jsx(J,{value:"bvn",className:"space-y-4 pt-2",children:_?e.jsxs("div",{className:"space-y-4 pt-1",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(W,{htmlFor:"bvn_input",children:"Bank Verification Number (BVN)"}),e.jsx(q,{id:"bvn_input",type:"text",inputMode:"numeric",maxLength:11,placeholder:"Enter 11-digit BVN",value:r.data.bvn,onChange:a=>{r.setData("bvn",a.target.value.replace(/\D/g,"")),r.errors.bvn&&r.clearErrors("bvn")},className:"font-mono text-base tracking-wider",required:!0}),r.errors.bvn&&e.jsx("p",{className:"text-xs text-destructive",children:r.errors.bvn})]}),e.jsx(H,{title:`Generate BVN Slip (${l(p)})`,status:D,resetStatus:()=>m({type:"",message:"",title:""}),processing:r.processing,message:`Are you sure you want to generate BVN slip for ${r.data.bvn} for ${l(p)}?`,handleSubmit:oe,validateForm:re,detailsRows:le,requirePin:!0,onPinChange:a=>r.setData("transaction_pin",a),pinError:r.errors.transaction_pin,errors:r.errors})]}):e.jsxs("div",{className:"flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",children:[e.jsx(Z,{className:"h-5 w-5 shrink-0 text-amber-600"}),e.jsx("span",{children:"BVN Verification is temporarily disabled by the administrator."})]})})]})})]})}),e.jsx("div",{className:"order-2 lg:order-2 lg:col-span-5 lg:row-span-2",children:e.jsx("div",{className:"lg:sticky lg:top-6",children:i?e.jsxs(u,{className:"border-emerald-500/40 bg-card shadow-md print:border-none print:shadow-none",children:[e.jsxs(S,{className:"border-b border-border/60 pb-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(O,{className:"bg-emerald-600 hover:bg-emerald-600 text-white gap-1",children:[e.jsx(Ce,{className:"h-3.5 w-3.5"}),i.type," SLIP READY"]}),e.jsx("span",{className:"text-xs text-muted-foreground font-mono",children:i.reference})]}),e.jsx(I,{className:"mt-2 text-xl font-bold",children:"Identity Slip Details"}),e.jsx(U,{children:"Official government-verified record"})]}),e.jsxs(b,{className:"space-y-4 pt-4",children:[e.jsxs("div",{className:"rounded-lg bg-emerald-50/60 p-3.5 dark:bg-emerald-950/20",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"Full Name"}),e.jsx("p",{className:"text-lg font-bold text-foreground",children:[i.identity.first_name||i.identity.firstname,i.identity.middle_name||i.identity.middlename,i.identity.last_name||i.identity.surname].filter(Boolean).join(" ")||"Identity Record"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3 text-sm",children:[e.jsxs("div",{className:"rounded-lg bg-muted/40 p-2.5",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"Identifier"}),e.jsx("p",{className:"font-mono font-medium",children:i.identifier})]}),(i.identity.date_of_birth||i.identity.birthdate)&&e.jsxs("div",{className:"rounded-lg bg-muted/40 p-2.5",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"Date of Birth"}),e.jsx("p",{className:"font-medium",children:i.identity.date_of_birth||i.identity.birthdate})]}),i.identity.gender&&e.jsxs("div",{className:"rounded-lg bg-muted/40 p-2.5",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"Gender"}),e.jsx("p",{className:"font-medium capitalize",children:i.identity.gender})]}),(i.identity.phone||i.identity.phone_number1||i.identity.telephoneno)&&e.jsxs("div",{className:"rounded-lg bg-muted/40 p-2.5",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"Phone Number"}),e.jsx("p",{className:"font-medium font-mono",children:i.identity.phone||i.identity.phone_number1||i.identity.telephoneno})]})]}),e.jsxs("div",{className:"flex gap-2 pt-2 print:hidden",children:[e.jsxs(G,{variant:"outline",size:"sm",className:"flex-1 gap-1.5",onClick:()=>{const a=[i.identity.first_name||i.identity.firstname,i.identity.middle_name||i.identity.middlename,i.identity.last_name||i.identity.surname].filter(Boolean).join(" ");ce(`Name: ${a}
${i.type}: ${i.identifier}
DOB: ${i.identity.date_of_birth||i.identity.birthdate||"N/A"}
Ref: ${i.reference}`,"Identity details")},children:[e.jsx(Ee,{className:"h-3.5 w-3.5"}),"Copy Details"]}),e.jsxs(G,{variant:"outline",size:"sm",className:"gap-1.5",onClick:me,children:[e.jsx(De,{className:"h-3.5 w-3.5"}),"Print Slip"]})]})]})]}):e.jsx(u,{className:"border-dashed border-border/70 shadow-none",children:e.jsxs(b,{className:"flex flex-col items-center justify-center py-12 text-center",children:[e.jsx("div",{className:"rounded-full bg-muted p-4",children:e.jsx(Ve,{className:"h-8 w-8 text-muted-foreground"})}),e.jsx("h3",{className:"mt-4 text-base font-semibold",children:"No Verification Result"}),e.jsx("p",{className:"mt-1.5 max-w-xs text-xs text-muted-foreground",children:"Submit an 11-digit NIN or BVN to see real-time identity details and download slips."})]})})})}),e.jsx("div",{id:"recent-verifications-container",className:"order-3 lg:order-3 lg:col-span-7 print:hidden",children:e.jsxs(u,{className:"border-border/60 shadow-sm",children:[e.jsx(S,{className:"pb-3",children:e.jsx(I,{className:"text-base font-semibold",children:"Recent Slips"})}),e.jsx(b,{children:V.length===0?e.jsx("p",{className:"py-6 text-center text-sm text-muted-foreground",children:"No slip history found yet."}):e.jsx("div",{className:"divide-y divide-border/60",children:V.map(a=>e.jsxs("div",{className:"flex items-center justify-between py-3 text-sm",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"rounded-md bg-muted p-2",children:a.type==="NIN_VERIFICATION"?e.jsx(Q,{className:"h-4 w-4 text-emerald-600"}):e.jsx(K,{className:"h-4 w-4 text-blue-600"})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-foreground",children:a.type==="NIN_VERIFICATION"?"NIN Slip":"BVN Slip"}),e.jsx("p",{className:"text-xs text-muted-foreground font-mono",children:a.reference_id})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${a.status==="SUCCESS"?"bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800":"bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"}`,children:a.status}),e.jsx("p",{className:"mt-1 text-xs text-muted-foreground",children:new Date(a.created_at).toLocaleDateString()})]})]},a.id))})})]})})]})})]})}export{bt as default};
