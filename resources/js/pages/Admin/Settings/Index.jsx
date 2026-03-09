import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { Box, styled } from "@mui/material";
import { DataGrid as MuiDataGrid } from "@mui/x-data-grid";
import AdminAuthenticatedLayout from "@/Layouts/AdminAuthenticatedLayout";

const DataGrid = styled(MuiDataGrid)(({ theme }) => ({
    border: 0,
    "& .MuiDataGrid-columnHeaders": { display: "none" },
    "& .MuiDataGrid-virtualScroller": { marginTop: "0!important" },
}));

export default function Index(props) {
    const { transactions: data } = usePage().props;

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const columns = [
        {
            field: "user",
            // flex: 1,
            align: "left",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <UserDetails row={params.row} api={params.api} />
            ),
        },
        {
            field: "edit",
            flex: 1,
            align: "left",
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: (params) => (
                <TransactionDescription row={params.row} api={params.api} />
            ),
        },

        {
            field: "status",
            disableColumnMenu: true,
            sortable: false,
            filterable: false,
            editable: false,
        },
        {
            field: "amount",
            disableColumnMenu: true,
            sortable: false,
            filterable: false,
            editable: false,
        },
    ];

    const [rowCountState, setRowCountState] = useState(data?.meta?.total || 0);

    useEffect(() => {
        setRowCountState((prevRowCountState) =>
            data?.meta?.total !== undefined
                ? data?.meta?.total
                : prevRowCountState
        );
    }, [data?.meta?.total, setRowCountState]);

    return (
        <AdminAuthenticatedLayout auth={props.auth} title="Settings">
            <div className=" flex flex-col p-3 w-full text-center justify-center ">
                <DataGrid
                    disableColumnFilter
                    customHeadRender={() => null}
                    rows={data.data || []}
                    columns={columns}
                    rowCount={rowCountState}
                    loading={!data}
                    pageSizeOptions={[5]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    sx={{
                        "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                            outline: "none !important",
                        },
                    }}
                    disableRowSelectionOnClick
                    rowHeight={55} // decrease the row height
                    headerHeight={40} // decrease the header height
                    hideFooter={true}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}

function TransactionDescription(props) {
    return (
        <>
            <div className="flex text-start p-2 flex-col">
                <span className=" text-theme-2">{props.row.description}</span>
                <span className="w-full text-xs">{props.row.date}</span>
            </div>
        </>
    );
}

function UserDetails(props) {
    return (
        <>
            <div className="flex text-start p-2 flex-col">
                <span className=" text-theme-2">{props.row.user.name}</span>
                <span className="w-full text-xs">{props.row.user.phone}</span>
            </div>
        </>
    );
}
