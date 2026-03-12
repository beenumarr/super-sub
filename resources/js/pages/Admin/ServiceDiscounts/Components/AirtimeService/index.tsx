import { useState } from 'react';
import UpdateForm from './UpdateForm';
import { usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';

interface MobileNetwork {
    id: number;
    name: string;
}

interface PageProps {
    mobile_networks: MobileNetwork[];
}

function AirtimeDiscount() {
    const [editFormModal, setEditFormModal] = useState({ show: false, id: '' });
    const { mobile_networks } = usePage<PageProps>().props;

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    <div className="bg-accent/50">
                        <h2 className="px-6 py-3 text-lg font-semibold text-gray-900 dark:text-white">
                            Airtime Discounts
                        </h2>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {mobile_networks.map((network) => (
                            <button
                                key={network.id}
                                onClick={() => setEditFormModal({ show: true, id: String(network.id) })}
                                className="w-full px-6 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {network.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <UpdateForm setFormModal={setEditFormModal} formModal={editFormModal} />
        </>
    );
}

export default AirtimeDiscount;
