import React, { useState, FC, useEffect } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Copy, Check, Code2, Lock, Send, FileJson, CheckCircle2, ShieldCheck, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import { endpoints, exampleResponseData, headers, httpMethods, payloadData } from "./mock"

const CodeBlock: FC<{ code: string; language?: string }> = ({ code, language = "json" }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-slate-950 dark:bg-slate-900 border border-slate-800">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 dark:bg-slate-800 border-b border-slate-800">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 w-7 p-0 hover:bg-slate-700"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4 text-slate-400" />
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  )
}

interface TabItem {
  title: string
  tab: string
  category: string
  description: string
}

const Documentation: FC = () => {
  const [activeTab, setActiveTab] = useState("user")
  const [apiBaseUrl, setApiBaseUrl] = useState("https://api.yourdomain.com/api/")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiBaseUrl(`${window.location.origin}/api/`)
    }
  }, [])

  const tabs: TabItem[] = [
    // Account
    {
      title: "User Profile & Balance",
      tab: "user",
      category: "Account",
      description: "Check wallet balance and API account details",
    },
    // Data & Airtime
    {
      title: "Mobile Networks",
      tab: "networks",
      category: "Data & Airtime",
      description: "List active mobile networks and network IDs",
    },
    {
      title: "Data Plans",
      tab: "data_plans",
      category: "Data & Airtime",
      description: "List data plans with pricing and plan IDs",
    },
    {
      title: "Buy Data",
      tab: "data",
      category: "Data & Airtime",
      description: "Purchase mobile data for any network",
    },
    {
      title: "Buy Airtime",
      tab: "airtime",
      category: "Data & Airtime",
      description: "Purchase VTU airtime top-up",
    },
    // Cable TV
    {
      title: "Cable TV Plans",
      tab: "cable_plans",
      category: "Cable TV",
      description: "List cable subscription plans and pricing",
    },
    {
      title: "TV Subscription",
      tab: "tv_subscription",
      category: "Cable TV",
      description: "Subscribe DSTV, GOTV, and Startimes smartcards",
    },
    // Electricity
    {
      title: "Electricity Discos",
      tab: "electricity_discos",
      category: "Electricity",
      description: "List available power distribution companies",
    },
    {
      title: "Meter Validation",
      tab: "validate_meter",
      category: "Electricity",
      description: "Validate prepaid or postpaid meter numbers",
    },
    {
      title: "Electricity Bill",
      tab: "bill_payment",
      category: "Electricity",
      description: "Pay electricity bills and receive meter tokens",
    },
    // Education
    {
      title: "Exam Types",
      tab: "exam_types",
      category: "Education",
      description: "List available exam pin types and prices",
    },
    {
      title: "Buy Exam PIN",
      tab: "exam_pin",
      category: "Education",
      description: "Generate WAEC, NECO, and NABTEB pins",
    },
    // Transactions
    {
      title: "Transaction Query",
      tab: "transaction",
      category: "Transactions",
      description: "Query transaction status using reference ID",
    },
    // KYC Verification
    {
      title: "NIN Verification",
      tab: "nin",
      category: "Identity & KYC",
      description: "Verify National Identity Number instantly",
    },
    {
      title: "BVN Verification",
      tab: "bvn",
      category: "Identity & KYC",
      description: "Verify Bank Verification Number securely",
    },
  ]

  const currentTab = tabs.find((t) => t.tab === activeTab) || tabs[0]
  const currentMethod = httpMethods[activeTab] ?? "POST"
  const currentEndpoint = `${apiBaseUrl}${endpoints[activeTab] || ""}`
  const currentPayload = payloadData[activeTab]
  const currentResponse = exampleResponseData[activeTab] || "{}"

  // Group tabs by category
  const categories = Array.from(new Set(tabs.map((t) => t.category)))

  return (
    <AppLayout>
      <Head title="Developer API Documentation" />

      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Code2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Developer API Documentation
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Complete developer guide for integrating VTU, Bill Payments, and KYC into external apps
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 font-mono text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                <Zap className="h-3 w-3 mr-1" /> API v1.0 Live
              </Badge>
            </div>
          </div>

          {/* Authentication Section */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Authentication & Headers</CardTitle>
                    <CardDescription>
                      Authenticate all API requests using your Bearer Token in the HTTP headers
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  Bearer Token
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <CodeBlock code={headers} language="http" />
              <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 p-3.5 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">How to get your API Token:</strong> Navigate to your <strong>Developer API</strong> dashboard on this portal, click <strong>Generate API Token</strong>, and copy your personal token. Keep your token confidential.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-4 sticky top-6">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm max-h-[calc(100vh-100px)] flex flex-col">
                <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Available Services
                  </CardTitle>
                </CardHeader>
                <div className="overflow-y-auto p-3 space-y-4 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {categories.map((category) => (
                    <div key={category} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {category}
                      </div>
                      <div className="space-y-1">
                        {tabs
                          .filter((t) => t.category === category)
                          .map((tab) => {
                            const isCurrent = activeTab === tab.tab
                            const method = httpMethods[tab.tab] ?? "POST"
                            return (
                              <button
                                key={tab.tab}
                                onClick={() => setActiveTab(tab.tab)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between text-xs ${
                                  isCurrent
                                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                }`}
                              >
                                <span className="truncate pr-2">{tab.title}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                    isCurrent
                                      ? "bg-white/20 text-white"
                                      : method === "GET"
                                      ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                      : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                  }`}
                                >
                                  {method}
                                </span>
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {currentTab.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold">{currentTab.title}</CardTitle>
                      <CardDescription className="mt-1">{currentTab.description}</CardDescription>
                    </div>
                    <Badge
                      className={`text-xs px-3 py-1 font-mono uppercase font-bold tracking-wider ${
                        currentMethod === "GET"
                          ? "bg-blue-600 dark:bg-blue-600 text-white"
                          : "bg-emerald-600 dark:bg-emerald-600 text-white"
                      }`}
                    >
                      {currentMethod}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Endpoint URL Box */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5" />
                      Endpoint URL
                    </label>
                    <div className="flex items-center gap-2 bg-slate-900 text-slate-100 rounded-lg p-2.5 border border-slate-800">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                          currentMethod === "GET" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {currentMethod}
                      </span>
                      <code className="font-mono text-xs sm:text-sm flex-1 truncate select-all">
                        {currentEndpoint}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(currentEndpoint)
                          toast.success("Endpoint URL copied!")
                        }}
                        className="h-8 px-2.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Request Payload / Query Params */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileJson className="h-3.5 w-3.5 text-purple-500" />
                      {currentMethod === "GET" ? "Request Parameters" : "JSON Request Body"}
                    </label>

                    {currentPayload ? (
                      <CodeBlock code={currentPayload} language="json" />
                    ) : (
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        No body parameters required for this endpoint. Send HTTP GET with Authorization header.
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Response Example */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileJson className="h-3.5 w-3.5 text-emerald-500" />
                        Example JSON Response
                      </label>
                      <Badge variant="outline" className="text-[11px] font-mono border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                        HTTP 200 OK
                      </Badge>
                    </div>
                    <CodeBlock code={currentResponse} language="json" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default Documentation
