import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import UpdateForm from "./UpdateForm";

interface CableNetwork {
    id: number;
    name: string;
}

function CableTvServices(): JSX.Element {
    const [editFormModal, setEditFormModal] = useState<{ show: boolean; id: string | number }>({ show: false, id: "" });
    const { cable_networks } = usePage().props as { cable_networks: CableNetwork[] };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Cable TV Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {cable_networks.map((network) => (
                            <div key={network.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                                <span className="text-base font-medium text-gray-700 dark:text-white">{network.name}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditFormModal({ show: true, id: network.id })}
                                    className="flex items-center gap-2"
                                >
                                    <span>Edit</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <UpdateForm
                setFormModal={setEditFormModal}
                formModal={editFormModal}
            />
        </>
    );
}

export default CableTvServices;
