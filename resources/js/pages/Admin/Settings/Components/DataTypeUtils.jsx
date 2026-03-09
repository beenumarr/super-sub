import { DeleteOutline, Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
// Table Stuffs
function EditPlan(props) {
    return (
        <div className="flex text-start p-2 flex-col">
            <IconButton onClick={props.onClick}>
                <Edit />
            </IconButton>
        </div>
    );
}

function DeletePlan(props) {
    return (
        <div className="flex text-start p-2 flex-col">
            <IconButton onClick={props.onClick}>
                <DeleteOutline />
            </IconButton>
        </div>
    );
}

function MobileNetwork(props) {
    return (
        <div className="flex uppercase text-start p-2 flex-col">
            {props.row.network.name}
        </div>
    );
}

function Status(props) {
    return (
        <div className="flex uppercase text-start p-2 flex-col">
            {props.row.active ? "Active" : "Disabled"}
        </div>
    );
}

export const dataTypeColumns = (setEditFormModal, setDeleteModal) => [
    {
        field: "name",
        headerName: "Name",
        flex: 0.5,
        minWidth: 150,
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "network",
        headerName: "Network",
        flex: 0.5,
        minWidth: 150,
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
        renderCell: (params) => <MobileNetwork row={params.row} />,
    },
    {
        field: "active",
        headerName: "Status",
        flex: 0.5,
        minWidth: 150,
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
        renderCell: (params) => <Status row={params.row} />,
    },
    {
        field: "edit",
        with: 110,
        headerName: "Edit",
        align: "left",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
            <EditPlan
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditFormModal({ show: true, id: params.row.id });
                }}
                row={params.row}
            />
        ),
    },
    // {
    //     field: "delete",
    //     with: 110,
    //     headerName: "Delete",
    //     align: "left",
    //     sortable: false,
    //     filterable: false,
    //     disableColumnMenu: true,
    //     renderCell: (params) => (
    //         <DeletePlan
    //             onClick={(e) => {
    //                 e.preventDefault();
    //                 e.stopPropagation();
    //                 setDeleteModal({ show: true, id: params.row.id });
    //             }}
    //             row={params.row}
    //         />
    //     ),
    // },
];
