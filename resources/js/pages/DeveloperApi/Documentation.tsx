import React, { useState, FC } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"
import { Copy, Check, Code2, Lock, Send, FileJson } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import { endpoints, exampleResponseData, headers, payloadData } from "./mock"

const CodeBlock: FC<{ code: string; language?: string }> = ({ code, language = "json" }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
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

const Documentation: FC = () => {
  const [activeTab, setActiveTab] = useState("data")

  const tabs = [
    {
      title: "Data Purchase",
      tab: "data",
      description: "Buy mobile data for customers",
    },
    {
      title: "Airtime",
      tab: "airtime",
      description: "Purchase airtime for mobile networks",
    },
    {
      title: "Meter Validation",
      tab: "validate_meter",
      description: "Validate electricity meter numbers",
    },
    {
      title: "Bill Payment",
      tab: "bill_payment",
      description: "Process electricity bill payments",
    },
    {
      title: "TV Subscription",
      tab: "tv_subscription",
      description: "Purchase TV subscription plans",
    },
    {
      title: "Exam Pins",
      tab: "exam_pin",
      description: "Purchase exam registration pins",
    },
  ]

  const currentTab = tabs.find((t) => t.tab === activeTab) || tabs[0]

  return (
    <AppLayout>
      <Head title="Developer Api Documentation" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Code2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">API Documentation</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Complete guide to integrating with our VTU API</p>
              </div>
            </div>
          </div>

          {/* Authorization Card */}
          <Card className="mb-8 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-xl">Authentication</CardTitle>
              </div>
              <CardDescription>Include these headers in all API requests</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={String(headers)} language="http" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-1">ℹ️</span>
                <span>Replace the Authorization value with your actual API token from the Developer Dashboard</span>
              </p>
            </CardContent>
          </Card>

          {/* API Endpoints with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-slate-200 dark:border-slate-800 sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="p-0 px-6">
                  <div className="space-y-2 pb-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.tab}
                        onClick={() => setActiveTab(tab.tab)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                          activeTab === tab.tab
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-md"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="font-medium text-sm">{tab.title}</div>
                        <div className={`text-xs mt-1 ${activeTab === tab.tab ? "text-slate-600 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
                          {tab.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-2xl">{currentTab.title}</CardTitle>
                  <CardDescription>{currentTab.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Request Endpoint */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Request Endpoint</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className="bg-emerald-600 dark:bg-emerald-700 text-white font-semibold text-sm">POST</Badge>
                        <code className="text-sm font-mono text-slate-900 dark:text-slate-100 flex-1 min-w-0 break-all">
                          https://api.yoursite.com/api/{endpoints[activeTab as keyof typeof endpoints]}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const endpoint = `https://api.yoursite.com/api/${endpoints[activeTab as keyof typeof endpoints]}`
                            navigator.clipboard.writeText(endpoint)
                            toast.success("Endpoint copied to clipboard!")
                          }}
                          className="shrink-0"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Request Payload */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Request Payload</h3>
                    </div>
                    <CodeBlock code={String(payloadData[activeTab as keyof typeof payloadData])} language="json" />
                  </div>

                  <Separator className="my-6" />

                  {/* Response Example */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Response Example</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-emerald-600 dark:bg-emerald-700 text-white text-xs">200</Badge>
                      <span className="text-sm text-slate-600 dark:text-slate-400">Success Response</span>
                    </div>
                    <CodeBlock code={String(exampleResponseData[activeTab as keyof typeof exampleResponseData])} language="json" />
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
