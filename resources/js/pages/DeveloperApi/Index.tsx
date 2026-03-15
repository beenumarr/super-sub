import React, { useState, ReactNode } from "react"
import AppLayout from "@/layouts/app-layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Network {
  id: number | string
  name: string
}

interface Plan {
  id: number | string
  size?: string
  volume?: string
  amount: string | number
  package_name?: string
  validity?: string
  name?: string
  active?: boolean
  data_plans?: Plan[]
}

interface PageProps {
  [key: string]: any
  api_token?: string
  disco_list?: Plan[]
  data_plans?: Record<string, Plan[]>
  mobile_networks?: Network[]
  cable_networks?: Network[]
  cable_plans?: Record<string, Plan[]>
}

export default function Index(props: any): ReactNode {
  const {
    api_token = "",
    disco_list = [],
    data_plans = {},
    mobile_networks = [],
    cable_networks = [],
    cable_plans = {},
  } = usePage<PageProps>().props as PageProps

  const [networkSelected, setNetworkSelected] = useState("MTN")
  const [cableNetworkSelected, setCableNetworkSelected] = useState("DSTV")
  const { post, processing } = useForm({
    email: props.auth.email,
  })

  const handleCopyToken = () => {
    if (api_token) {
      navigator.clipboard.writeText(api_token)
      toast.success("Token copied to clipboard!")
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    post(route("developer.generate-api-token"), {
      onSuccess: () => {
        toast.success("Token Generated Successfully!")
      },
      onError: (errors: any) => {
        Object.values(errors)
          .flat()
          .forEach((err: any) => toast.error(err as string))
      },
    })
  }

  return (
    <AppLayout>
      <Head title="Developer Api" />

      <div className="m-5">
        <form
          onSubmit={submit}
          className="border max-w-lg rounded-md p-3 flex justify-center"
        >
          <div className="flex w-full flex-col">
            <label htmlFor="api-token" className="font-medium self-center">
              API Token
            </label>

            <div className="p-4 w-full items-center flex rounded-md my-2 bg-gray-100 dark:bg-gray-800 border">
              <span className="w-full overflow-x-hidden font-mono text-sm text-gray-700 dark:text-gray-300 mr-4 truncate">
                {api_token ?? "No token available. Please generate new token"}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCopyToken}
                disabled={!api_token}
                className="ml-auto flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please note that when generating a new token, the existing token
              will no longer work!
            </p>

            <div className="flex w-full justify-end">
              <Button
                type="submit"
                disabled={processing}
                className="w-32"
              >
                {processing ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </form>

        <div className="text-base pt-4 mt-6 text-gray-700 dark:text-gray-300 mb-4">
          Visit our{" "}
          <Link
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            href="/developer/api-documentation"
          >
            API Documentation
          </Link>{" "}
          to access and explore our comprehensive documentation.
        </div>

        <div className="text-xl pt-2 font-semibold border-b mt-6 text-gray-700 dark:text-gray-300 mb-4 pb-2">
          Services and Products IDs
        </div>

        <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
          Below, you'll find information about unique identification codes or
          numbers assigned to our services and products such as plan id, network
          id.
        </p>

        <h2 className="font-semibold text-xl underline my-6 text-gray-700 dark:text-gray-300">
          Data Plans
        </h2>

        <div className="flex space-x-2 shadow-sm bg-gray-100 dark:bg-gray-800 w-full border-b rounded-t-md overflow-x-auto">
          {(mobile_networks || []).map((network: Network) => (
            <button
              key={network.id}
              className={`font-medium hover:font-bold text-lg px-6 py-3 rounded-t-md whitespace-nowrap transition-colors ${
                networkSelected === network.name
                  ? "bg-gray-500 dark:bg-gray-600 text-white shadow-md"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => setNetworkSelected(network.name)}
            >
              {network.name}
            </button>
          ))}
        </div>

        <div className="border border-t-0 p-4 rounded-b-md dark:border-gray-700">
          <h3 className="text-lg pt-2 font-medium mt-2 text-gray-700 dark:text-gray-300 mb-4">
            Network ID:{" "}
            {
              (mobile_networks || []).find((net: Network) => net.name === networkSelected)
                ?.id
            }
          </h3>
          {(data_plans[networkSelected] || []).map((dataType: Plan) => (
            <div key={dataType.id}>
              <h4 className="text-lg pt-4 font-semibold underline mt-4 text-gray-700 dark:text-gray-300 mb-4">
                {dataType.name}
              </h4>

              <PlanTable plans={dataType.data_plans ?? []} />
            </div>
          ))}
        </div>

        <h2 className="font-semibold text-xl underline my-6 text-gray-700 dark:text-gray-300">
          Cable Plans
        </h2>

        <div className="flex space-x-2 shadow-sm bg-gray-100 dark:bg-gray-800 w-full border-b rounded-t-md overflow-x-auto">
          {(cable_networks || []).map((network: Network) => (
            <button
              key={network.id}
              className={`font-medium hover:font-bold text-lg px-6 py-3 rounded-t-md whitespace-nowrap transition-colors ${
                cableNetworkSelected === network.name
                  ? "bg-gray-500 dark:bg-gray-600 text-white shadow-md"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              onClick={() => setCableNetworkSelected(network.name)}
            >
              {network.name}
            </button>
          ))}
        </div>

        <div className="border border-t-0 p-4 rounded-b-md dark:border-gray-700 mb-20">
          <h3 className="text-lg pt-2 font-medium mt-2 text-gray-700 dark:text-gray-300 mb-4">
            Network ID:{" "}
            {
              (cable_networks || []).find((net: Network) => net.name === cableNetworkSelected)
                ?.id
            }
          </h3>

          <CablePlanTable plans={(cable_plans[cableNetworkSelected] || []) as Plan[]} />
        </div>

        <h2 className="font-semibold text-xl underline my-6 text-gray-700 dark:text-gray-300">
          Electricity Distributors List
        </h2>

        <div className="border rounded-md dark:border-gray-700 overflow-hidden">
          <DiscoTable plans={disco_list} />
        </div>
      </div>
    </AppLayout>
  )
}

interface TableProps {
  plans: Plan[]
}

function PlanTable({ plans }: TableProps): ReactNode {
  return (
    <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans?.map((row: any) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                {row.size} {row.volume.toUpperCase()}
              </TableCell>
              <TableCell>₦{parseFloat(row.amount).toLocaleString()}</TableCell>
              <TableCell className="text-gray-500 dark:text-gray-400">
                {row.id}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CablePlanTable({ plans }: TableProps): ReactNode {
  return (
    <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Package Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans?.map((row: any) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                {row.package_name?.toUpperCase() || "N/A"}
              </TableCell>
              <TableCell>₦{parseFloat(row.amount).toLocaleString()}</TableCell>
              <TableCell>{row.validity || "N/A"}</TableCell>
              <TableCell className="text-gray-500 dark:text-gray-400">
                {row.id}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function DiscoTable({ plans }: TableProps): ReactNode {
  return (
    <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Disco Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans?.map((row: any) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                {row.name?.toUpperCase() || "N/A"}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.active
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  }`}
                >
                  {row.active ? "Active" : "Disabled"}
                </span>
              </TableCell>
              <TableCell className="text-gray-500 dark:text-gray-400">
                {row.id}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
