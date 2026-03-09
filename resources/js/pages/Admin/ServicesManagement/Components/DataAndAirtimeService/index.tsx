import { NetworkIcon } from '@/components/shared/network-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import DataTransactionUpdateForm from './DataTransactionUpdateForm';

interface MobileNetwork {
    id: number;
    name: string;
    data_active: boolean;
    airtime_active: boolean;
}

interface EditFormModalState {
    show: boolean;
    id: number | string;
}

function DataAndAirtimeService() {
    const [editFormModal, setEditFormModal] = useState<EditFormModalState>({ show: false, id: '' });
    const { mobile_networks } = usePage().props as unknown as { mobile_networks: MobileNetwork[] };

    return (
        <>
            <Card className="mt-8 mb-6 w-full rounded-none p-0 pb-4 shadow-none">
                <CardHeader className="bg-accent flex flex-row items-center justify-between space-y-0 px-2 pt-2 pb-2 sm:px-4">
                    <CardTitle className="text-lg">Data and Airtime Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                        {mobile_networks.map((it) => (
                            <NetworkCard key={it.id} item={it} onClick={() => setEditFormModal({ show: true, id: it.id })} name={it.name} />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <DataTransactionUpdateForm setFormModal={setEditFormModal} formModal={editFormModal} />
        </>
    );
}

export default DataAndAirtimeService;

interface NetworkCardProps {
    name: string;
    item: MobileNetwork;
    onClick: () => void;
}

function NetworkCard({ name, onClick, item }: NetworkCardProps) {
    return (
        <Card className="hover:bg-muted/50 flex w-full flex-row items-center justify-start gap-4 px-2 py-4 transition-colors sm:px-4">
            <span className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-lg">
                <NetworkIcon network={name} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                    Data: <span className="font-medium">{item.data_active ? 'Active' : 'Disabled'}</span>
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                    Airtime: <span className="font-medium">{item.airtime_active ? 'Active' : 'Disabled'}</span>
                </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onClick} className="shrink-0">
                Update
            </Button>
        </Card>
    );
}
