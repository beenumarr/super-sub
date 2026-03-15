import { DeleteOutline, Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";

export const cablePlanColumns = (setEditFormModal, setDeleteModal) => [
    {
        field: "package_name",
        headerName: "Package Name",
        flex: 1,
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "cable_name",
        headerName: "Cable Name",
        flex: 1,
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "product_code",
        headerName: "Product Code",
        flex: 1,
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "amount",
        headerName: "Amount",
        flex: 1,
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "validity",
        headerName: "Validity",
        flex: 1,
        disableColumnMenu: true,
        sortable: false,
        filterable: false,
        editable: false,
    },
    {
        field: "edit",
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
    {
        field: "delete",
        headerName: "Delete",
        align: "left",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
            <DeletePlan
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteModal({ show: true, id: params.row.id });
                }}
                row={params.row}
            />
        ),
    },
];

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
