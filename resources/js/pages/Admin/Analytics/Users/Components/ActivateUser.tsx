import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface ActivateUserProps {
    active: boolean;
    id: string | number;
}

export default function ActivateUser({ active, id }: ActivateUserProps) {
    const [status, setStatus] = useState(active);

    const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formData = { active: e.target.checked };
        setStatus(e.target.checked);

        axios
            .post(`user/activation/${id}`, formData)
            .then((response) => {
                if (response.data.status === "success") {
                    toast.success(
                        `User ${
                            response.data.active ? "activated" : "deactivated"
                        } successfully`
                    );
                }
            })
            .catch((error) => {
                console.error(`Error: ${error}`);
                toast.error("Failed to update user status");
            });
    };

    return (
        <label className="flex items-center">
            <div key={id} className="relative">
                <input
                    onChange={(e) => onHandleChange(e)}
                    type="checkbox"
                    name="active"
                    className="hidden"
                    checked={status ? true : false}
                />
                <div className="toggle-path bg-gray-200 dark:bg-gray-800 w-9 h-5 rounded-full shadow-inner"></div>
                <div className="toggle-circle absolute w-3.5 h-3.5 bg-white rounded-full shadow inset-y-0 left-0"></div>
            </div>
        </label>
    );
}
