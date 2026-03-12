import { Link } from "@inertiajs/react";

function ViewDetails(props) {
    return (
        <div className="flex text-start p-2 flex-col">
            <Link className="" href={`/admin/users/view/${props.id}`}>
                View
            </Link>
        </div>
    );
}

function Name({ row }) {
    return (
        <div className="flex  text-center items-center p-2 ">
            <h1>{row.name}</h1>
        </div>
    );
}

export const UserColumns = (setEditFormModal, setDeleteModal) => [
    {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 200,
        align: "left",
        sortable: true,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => <Name row={params.row} />,
    },
    {
        field: "email",
        headerName: "Email",
        flex: 1,
        minWidth: 200,
        align: "left",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
    },
    {
        field: "wallet_funding_count",
        headerName: "Wallet Funding Count",
        flex: 1,
        minWidth: 200,
        align: "left",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
    },
    {
        field: "transactions_count",
        headerName: "Transaction Count",
        flex: 1,
        minWidth: 200,
        align: "left",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
    },
    {
        field: "total_spending",
        flex: 1,
        minWidth: 150,
        headerName: "Total Spending",
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "total_fundings",
        flex: 1,
        minWidth: 150,
        headerName: "Total Funding",
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "wallet_balance",
        flex: 1,
        minWidth: 150,
        headerName: "Wallet Balance",
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "referal_username",
        flex: 1,
        minWidth: 150,
        headerName: "Referred By",
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "last_login",
        flex: 1,
        minWidth: 200,
        headerName: "Last Login",
        disableColumnMenu: true,
        sortable: true,
        filterable: false,
        editable: false,
    },
    {
        field: "view_user",
        headerName: "View Details",
        align: "left",
        width: 130,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => <ViewDetails id={params.row.id} />,
    },
];
