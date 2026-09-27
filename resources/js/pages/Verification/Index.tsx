import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmTransactionModal from '@/components/shared/confirm-transaction-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Copy,
    CreditCard,
    FileCheck,
    Fingerprint,
    Printer,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface StatusState {
    type: '' | 'error' | 'success';
    message: string;
    title: string;
}

interface VerificationResult {
    type: 'NIN' | 'BVN';
    identifier: string;
    reference: string;
    verified_at: string;
    identity: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        date_of_birth?: string;
        gender?: string;
        phone?: string;
        bvn?: string;
        nin?: string;
        [key: string]: any;
    };
}

interface VerificationTransaction {
    id: number;
    reference_id: string;
    type: string;
    amount: string | number;
    status: string;
    created_at: string;
    metadata?: {
        beneficiary?: string;
        verification_status?: string;
    };
}

interface Props {
    nin_fee: number;
    bvn_fee: number;
    nin_enabled: boolean;
    bvn_enabled: boolean;
    recent_verifications: VerificationTransaction[];
    verification_result?: VerificationResult | null;
    flash_error?: string | null;
    app_name?: string;
    is_sandbox?: boolean;
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

export default function VerificationIndex({
    nin_fee,
    bvn_fee,
    nin_enabled,
    bvn_enabled,
    recent_verifications,
    verification_result: serverResult,
    app_name,
    is_sandbox,
}: Props) {
    const pageProps = usePage().props as any;
    const resolvedAppName = app_name || pageProps.config?.site_name || pageProps.site_name || 'SuperSub';
    const hasPin = pageProps.auth?.user?.has_pin ?? false;

    const [activeTab, setActiveTab] = useState<'nin' | 'bvn'>('nin');
    const [result, setResult] = useState<VerificationResult | null>(serverResult || null);
    const [status, setStatus] = useState<StatusState>({
        type: '',
        message: '',
        title: '',
    });

    // NIN Form
    const ninForm = useForm<{
        nin: string;
        transaction_pin: string;
        [key: string]: any;
    }>({
        nin: '',
        transaction_pin: '',
    });

    // BVN Form
    const bvnForm = useForm<{
        bvn: string;
        transaction_pin: string;
        [key: string]: any;
    }>({
        bvn: '',
        transaction_pin: '',
    });

    const currentFee = activeTab === 'nin' ? nin_fee : bvn_fee;

    const validateNinForm = (handleValidated: () => void) => {
        const value = ninForm.data.nin.trim();
        if (!/^\d{11}$/.test(value)) {
            ninForm.setError('nin', 'NIN must be exactly 11 digits.');
            toast.error('NIN must be exactly 11 digits.');
            return;
        }
        ninForm.clearErrors('nin');
        handleValidated();
    };

    const validateBvnForm = (handleValidated: () => void) => {
        const value = bvnForm.data.bvn.trim();
        if (!/^\d{11}$/.test(value)) {
            bvnForm.setError('bvn', 'BVN must be exactly 11 digits.');
            toast.error('BVN must be exactly 11 digits.');
            return;
        }
        bvnForm.clearErrors('bvn');
        handleValidated();
    };

    const submitNin = () => {
        ninForm.post(route('verification.nin'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const flashResult = (page.props as any).verification_result;
                if (flashResult) {
                    setResult(flashResult);
                    setStatus({
                        type: 'success',
                        title: 'Verification Successful!',
                        message: `NIN ${ninForm.data.nin} was verified successfully.`,
                    });
                    toast.success('NIN verified successfully!');
                }
            },
            onError: (errs) => {
                const firstError = Object.values(errs)[0];
                setStatus({
                    type: 'error',
                    title: 'Verification Failed',
                    message: typeof firstError === 'string' ? firstError : 'Verification failed.',
                });
                toast.error(typeof firstError === 'string' ? firstError : 'Verification failed.');
            },
        });
    };

    const submitBvn = () => {
        bvnForm.post(route('verification.bvn'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const flashResult = (page.props as any).verification_result;
                if (flashResult) {
                    setResult(flashResult);
                    setStatus({
                        type: 'success',
                        title: 'Verification Successful!',
                        message: `BVN ${bvnForm.data.bvn} was verified successfully.`,
                    });
                    toast.success('BVN verified successfully!');
                }
            },
            onError: (errs) => {
                const firstError = Object.values(errs)[0];
                setStatus({
                    type: 'error',
                    title: 'Verification Failed',
                    message: typeof firstError === 'string' ? firstError : 'Verification failed.',
                });
                toast.error(typeof firstError === 'string' ? firstError : 'Verification failed.');
            },
        });
    };

    const ninConfirmationDetails = [
        { label: 'Service', value: 'National Identity Number (NIN)' },
        { label: 'NIN Number', value: ninForm.data.nin },
        { label: 'Verification Fee', value: formatCurrency(nin_fee) },
    ];

    const bvnConfirmationDetails = [
        { label: 'Service', value: 'Bank Verification Number (BVN)' },
        { label: 'BVN Number', value: bvnForm.data.bvn },
        { label: 'Verification Fee', value: formatCurrency(bvn_fee) },
    ];

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const handlePrint = () => {
        if (!result) return;

        const isNin = result.type === 'NIN';
        const idData = result.identity || {};

        const surname = (idData.surname || idData.last_name || '').toUpperCase();
        const firstname = (idData.firstname || idData.first_name || '').toUpperCase();
        const middlename = (idData.middlename || idData.middle_name || '').toUpperCase();

        const fullName = [firstname, middlename, surname].filter(Boolean).join(' ') 
            || [surname, firstname, middlename].filter(Boolean).join(' ') 
            || 'JAAFAR MUHAMMAD';

        const documentNumber = idData.nin || idData.bvn || result.identifier || '';
        const generatedDate = result.verified_at 
            ? new Date(result.verified_at).toLocaleString('en-US') 
            : new Date().toLocaleString('en-US');
        
        const serviceName = isNin ? 'National Identity Number (NIN)' : 'Bank Verification Number (BVN)';
        const sourceName = isNin ? 'NIMC' : 'NIBSS';
        const environment = is_sandbox ? 'sandbox' : 'live';
        const reference = result.reference || documentNumber;

        const gender = (idData.gender || 'm').toLowerCase();
        const dob = idData.birthdate || idData.date_of_birth || 'N/A';
        const residenceLga = idData.residence_lga || idData.residence_town || idData.lga || '';
        const residenceState = idData.residence_state || idData.state || '';
        const originState = idData.self_origin_state || idData.origin_state || idData.state_of_origin || '';
        const originLga = idData.self_origin_lga || idData.origin_lga || idData.lga_of_origin || '';
        const phone = idData.telephoneno || idData.phone || idData.phone_number1 || '';

        // Photo handling (supports base64, URL, or clean portrait silhouette)
        let photoHtml = '';
        if (idData.photo || idData.image) {
            const rawPhoto = idData.photo || idData.image;
            const photoSrc = String(rawPhoto).startsWith('data:image') || String(rawPhoto).startsWith('http')
                ? rawPhoto
                : `data:image/jpeg;base64,${rawPhoto}`;
            photoHtml = `<img src="${photoSrc}" alt="Photo" style="width: 100%; height: 100%; object-fit: cover; display: block;" />`;
        } else {
            photoHtml = `
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; color: #94a3b8;">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    <span style="font-size: 8px; margin-top: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">PHOTO</span>
                </div>
            `;
        }

        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentWindow?.document;
        if (!frameDoc) return;

        frameDoc.open();
        frameDoc.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${isNin ? 'NIN' : 'BVN'} Slip - ${documentNumber}</title>
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
        <div class="brand-header">${resolvedAppName}</div>
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
                <h2 class="subject-name">${fullName}</h2>
                <p class="subject-doc">Document: <span class="subject-doc-num">${documentNumber}</span></p>
                <p class="subject-generated">Generated: ${generatedDate}</p>
            </div>
            <div class="photo-card">
                ${photoHtml}
            </div>
        </div>

        <div class="summary-grid">
            <div class="summary-box">
                <div class="summary-box-label">SERVICE</div>
                <div class="summary-box-value">${serviceName}</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">SOURCE</div>
                <div class="summary-box-value">${sourceName}</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">ENVIRONMENT</div>
                <div class="summary-box-value">${environment}</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">COUNTRY</div>
                <div class="summary-box-value">NG</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">VERIFICATION DATE</div>
                <div class="summary-box-value">${generatedDate}</div>
            </div>
            <div class="summary-box">
                <div class="summary-box-label">REFERENCE</div>
                <div class="summary-box-value">${reference}</div>
            </div>
        </div>

        <div class="info-section">
            <h3 class="info-title">Verified Information</h3>
            <div class="info-grid">
                <div>
                    <div class="info-cell-label">${isNin ? 'NIN' : 'BVN'}</div>
                    <div class="info-cell-value">${documentNumber}</div>
                </div>
                <div>
                    <div class="info-cell-label">GENDER</div>
                    <div class="info-cell-value">${gender}</div>
                </div>
                <div>
                    <div class="info-cell-label">SURNAME</div>
                    <div class="info-cell-value">${surname || 'N/A'}</div>
                </div>
                <div>
                    <div class="info-cell-label">BIRTHDATE</div>
                    <div class="info-cell-value">${dob}</div>
                </div>
                <div>
                    <div class="info-cell-label">FIRSTNAME</div>
                    <div class="info-cell-value">${firstname || 'N/A'}</div>
                </div>
                <div>
                    <div class="info-cell-label">RESIDENCE LGA</div>
                    <div class="info-cell-value">${residenceLga || 'N/A'}</div>
                </div>
                <div>
                    <div class="info-cell-label">RESIDENCE STATE</div>
                    <div class="info-cell-value">${residenceState || 'N/A'}</div>
                </div>
                <div>
                    <div class="info-cell-label">SELF ORIGIN STATE</div>
                    <div class="info-cell-value">${originState || 'N/A'}</div>
                </div>
                ${middlename ? `
                <div>
                    <div class="info-cell-label">MIDDLENAME</div>
                    <div class="info-cell-value">${middlename}</div>
                </div>` : ''}
                ${originLga ? `
                <div>
                    <div class="info-cell-label">SELF ORIGIN LGA</div>
                    <div class="info-cell-value">${originLga}</div>
                </div>` : ''}
                ${phone ? `
                <div>
                    <div class="info-cell-label">TELEPHONE</div>
                    <div class="info-cell-value">${phone}</div>
                </div>` : ''}
            </div>
        </div>

        <div class="report-footer">
            <p class="disclaimer-text">
                Disclaimer: This report is confidential and must be used only for the authorized verification purpose for which the data subject gave consent or another lawful basis applies. Do not resell, republish, or reuse this information for unrelated profiling, marketing, discrimination, or automated decisions without a valid legal basis.
            </p>
            <p class="disclaimer-text">
                Data-protection notice: Handle this report in line with NDPA/NDPC principles including fairness, accountability, purpose limitation, data minimisation, accuracy, confidentiality, secure retention, and respect for data-subject rights.
            </p>
            <div class="footer-brand">${resolvedAppName}</div>
        </div>
    </div>
</body>
</html>`);
        frameDoc.close();

        setTimeout(() => {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(printFrame);
            }, 1500);
        }, 300);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'NIN / BVN Slip', href: '/verification' }]}>
            <Head title="NIN / BVN Slip" />

            <style>{`
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
            `}</style>

            <div className="mx-auto max-w-4xl px-4 py-8 print:p-0 print:m-0 print:max-w-none">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 print:block">
                    {/* Item 1: Verification Form (order-1 on mobile, lg:col-span-7 on desktop) */}
                    <div id="verification-form-container" className="order-1 lg:order-1 lg:col-span-7 print:hidden">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold">Generate Identity Slip</CardTitle>
                                <CardDescription>
                                    Select the service type and enter an 11-digit number to query official records and generate your slip.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs
                                    defaultValue="nin"
                                    value={activeTab}
                                    onValueChange={(val) => {
                                        setActiveTab(val as 'nin' | 'bvn');
                                        setResult(null);
                                    }}
                                >
                                    <TabsList className="grid w-full grid-cols-2 h-auto p-1.5 rounded-xl bg-gray-100 dark:bg-slate-800/80 gap-2 border border-border/40">
                                        <TabsTrigger
                                            value="nin"
                                            disabled={!nin_enabled}
                                            className="gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                                                data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-200/80 data-[state=inactive]:shadow-xs data-[state=inactive]:hover:bg-gray-50 data-[state=inactive]:hover:text-gray-900
                                                dark:data-[state=inactive]:bg-slate-900/70 dark:data-[state=inactive]:text-gray-300 dark:data-[state=inactive]:border-slate-700/60 dark:data-[state=inactive]:hover:bg-slate-900 dark:data-[state=inactive]:hover:text-white
                                                data-[state=active]:bg-theme-1 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-theme-1 data-[state=active]:font-semibold
                                                dark:data-[state=active]:bg-theme-1 dark:data-[state=active]:text-white"
                                        >
                                            <Fingerprint className="h-4 w-4" />
                                            NIN Slip
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="bvn"
                                            disabled={!bvn_enabled}
                                            className="gap-2 py-2.5 rounded-lg text-sm font-medium transition-all
                                                data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:border data-[state=inactive]:border-gray-200/80 data-[state=inactive]:shadow-xs data-[state=inactive]:hover:bg-gray-50 data-[state=inactive]:hover:text-gray-900
                                                dark:data-[state=inactive]:bg-slate-900/70 dark:data-[state=inactive]:text-gray-300 dark:data-[state=inactive]:border-slate-700/60 dark:data-[state=inactive]:hover:bg-slate-900 dark:data-[state=inactive]:hover:text-white
                                                data-[state=active]:bg-theme-1 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-theme-1 data-[state=active]:font-semibold
                                                dark:data-[state=active]:bg-theme-1 dark:data-[state=active]:text-white"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            BVN Slip
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Fee Notice */}
                                    <div className="my-4 flex items-center justify-between rounded-lg bg-muted/60 p-3 text-sm">
                                        <span className="text-muted-foreground">Slip Generation Fee:</span>
                                        <Badge variant="secondary" className="text-sm font-semibold">
                                            {formatCurrency(currentFee)}
                                        </Badge>
                                    </div>

                                    {/* NIN Tab */}
                                    <TabsContent value="nin" className="space-y-4 pt-2">
                                        {!nin_enabled ? (
                                             <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                                                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                                                <span>NIN Verification is temporarily disabled by the administrator.</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pt-1">
                                                <div className="space-y-2">
                                                    <Label htmlFor="nin_input">National Identity Number (NIN)</Label>
                                                    <Input
                                                        id="nin_input"
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={11}
                                                        placeholder="Enter 11-digit NIN"
                                                        value={ninForm.data.nin}
                                                        onChange={(e) => {
                                                            ninForm.setData('nin', e.target.value.replace(/\D/g, ''));
                                                            if (ninForm.errors.nin) ninForm.clearErrors('nin');
                                                        }}
                                                        className="font-mono text-base tracking-wider"
                                                        required
                                                    />
                                                    {ninForm.errors.nin && (
                                                        <p className="text-xs text-destructive">{ninForm.errors.nin}</p>
                                                    )}
                                                </div>

                                                <ConfirmTransactionModal
                                                    title={`Generate NIN Slip (${formatCurrency(nin_fee)})`}
                                                    status={status}
                                                    resetStatus={() => setStatus({ type: '', message: '', title: '' })}
                                                    processing={ninForm.processing}
                                                    message={`Are you sure you want to generate NIN slip for ${ninForm.data.nin} for ${formatCurrency(nin_fee)}?`}
                                                    handleSubmit={submitNin}
                                                    validateForm={validateNinForm}
                                                    detailsRows={ninConfirmationDetails}
                                                    requirePin
                                                    onPinChange={(pin) => ninForm.setData('transaction_pin', pin)}
                                                    pinError={ninForm.errors.transaction_pin}
                                                    errors={ninForm.errors}
                                                />
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* BVN Tab */}
                                    <TabsContent value="bvn" className="space-y-4 pt-2">
                                        {!bvn_enabled ? (
                                            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                                                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                                                <span>BVN Verification is temporarily disabled by the administrator.</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 pt-1">
                                                <div className="space-y-2">
                                                    <Label htmlFor="bvn_input">Bank Verification Number (BVN)</Label>
                                                    <Input
                                                        id="bvn_input"
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={11}
                                                        placeholder="Enter 11-digit BVN"
                                                        value={bvnForm.data.bvn}
                                                        onChange={(e) => {
                                                            bvnForm.setData('bvn', e.target.value.replace(/\D/g, ''));
                                                            if (bvnForm.errors.bvn) bvnForm.clearErrors('bvn');
                                                        }}
                                                        className="font-mono text-base tracking-wider"
                                                        required
                                                    />
                                                    {bvnForm.errors.bvn && (
                                                        <p className="text-xs text-destructive">{bvnForm.errors.bvn}</p>
                                                    )}
                                                </div>

                                                <ConfirmTransactionModal
                                                    title={`Generate BVN Slip (${formatCurrency(bvn_fee)})`}
                                                    status={status}
                                                    resetStatus={() => setStatus({ type: '', message: '', title: '' })}
                                                    processing={bvnForm.processing}
                                                    message={`Are you sure you want to generate BVN slip for ${bvnForm.data.bvn} for ${formatCurrency(bvn_fee)}?`}
                                                    handleSubmit={submitBvn}
                                                    validateForm={validateBvnForm}
                                                    detailsRows={bvnConfirmationDetails}
                                                    requirePin
                                                    onPinChange={(pin) => bvnForm.setData('transaction_pin', pin)}
                                                    pinError={bvnForm.errors.transaction_pin}
                                                    errors={bvnForm.errors}
                                                />
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Item 2: Verification Result (order-2 on mobile so it is on top of Recent Verifications, lg:col-span-5 on desktop) */}
                    <div className="order-2 lg:order-2 lg:col-span-5 lg:row-span-2">
                        <div className="lg:sticky lg:top-6">
                            {result ? (
                                <Card className="border-emerald-500/40 bg-card shadow-md print:border-none print:shadow-none">
                                    <CardHeader className="border-b border-border/60 pb-4">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {result.type} SLIP READY
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-mono">{result.reference}</span>
                                        </div>
                                        <CardTitle className="mt-2 text-xl font-bold">Identity Slip Details</CardTitle>
                                        <CardDescription>Official government-verified record</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4">
                                        {/* Name banner */}
                                        <div className="rounded-lg bg-emerald-50/60 p-3.5 dark:bg-emerald-950/20">
                                            <span className="text-xs text-muted-foreground">Full Name</span>
                                            <p className="text-lg font-bold text-foreground">
                                                {[
                                                    result.identity.first_name || result.identity.firstname,
                                                    result.identity.middle_name || result.identity.middlename,
                                                    result.identity.last_name || result.identity.surname,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ') || 'Identity Record'}
                                            </p>
                                        </div>

                                        {/* Metadata Details Grid */}
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-lg bg-muted/40 p-2.5">
                                                <span className="text-xs text-muted-foreground">Identifier</span>
                                                <p className="font-mono font-medium">{result.identifier}</p>
                                            </div>
                                            {(result.identity.date_of_birth || result.identity.birthdate) && (
                                                <div className="rounded-lg bg-muted/40 p-2.5">
                                                    <span className="text-xs text-muted-foreground">Date of Birth</span>
                                                    <p className="font-medium">{result.identity.date_of_birth || result.identity.birthdate}</p>
                                                </div>
                                            )}
                                            {result.identity.gender && (
                                                <div className="rounded-lg bg-muted/40 p-2.5">
                                                    <span className="text-xs text-muted-foreground">Gender</span>
                                                    <p className="font-medium capitalize">{result.identity.gender}</p>
                                                </div>
                                            )}
                                            {(result.identity.phone || result.identity.phone_number1 || result.identity.telephoneno) && (
                                                <div className="rounded-lg bg-muted/40 p-2.5">
                                                    <span className="text-xs text-muted-foreground">Phone Number</span>
                                                    <p className="font-medium font-mono">{result.identity.phone || result.identity.phone_number1 || result.identity.telephoneno}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2 pt-2 print:hidden">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 gap-1.5"
                                                onClick={() => {
                                                    const fullName = [
                                                        result.identity.first_name || result.identity.firstname,
                                                        result.identity.middle_name || result.identity.middlename,
                                                        result.identity.last_name || result.identity.surname,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ');
                                                    copyToClipboard(
                                                        `Name: ${fullName}\n${result.type}: ${result.identifier}\nDOB: ${result.identity.date_of_birth || result.identity.birthdate || 'N/A'}\nRef: ${result.reference}`,
                                                        'Identity details'
                                                    );
                                                }}
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                                Copy Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5"
                                                onClick={handlePrint}
                                            >
                                                <Printer className="h-3.5 w-3.5" />
                                                Print Slip
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-dashed border-border/70 shadow-none">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-muted p-4">
                                            <FileCheck className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="mt-4 text-base font-semibold">No Verification Result</h3>
                                        <p className="mt-1.5 max-w-xs text-xs text-muted-foreground">
                                            Submit an 11-digit NIN or BVN to see real-time identity details and download slips.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Item 3: Recent Verifications Card (order-3 on mobile below Result, lg:col-span-7 on desktop) */}
                    <div id="recent-verifications-container" className="order-3 lg:order-3 lg:col-span-7 print:hidden">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Recent Slips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recent_verifications.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        No slip history found yet.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-border/60">
                                        {recent_verifications.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-md bg-muted p-2">
                                                        {item.type === 'NIN_VERIFICATION' ? (
                                                            <Fingerprint className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <CreditCard className="h-4 w-4 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {item.type === 'NIN_VERIFICATION' ? 'NIN Slip' : 'BVN Slip'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {item.reference_id}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${
                                                            item.status === 'SUCCESS'
                                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                                                : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                                                        }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
