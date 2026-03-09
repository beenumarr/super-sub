import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import APIForm from './APIForm';
import APIsUpdateForm from './APIsUpdateForm';

interface ApiDefinition {
    id: number;
    name: string;
    model: string;
}

interface APIsProps {
    can_add_api?: boolean;
}

interface EditFormModalState {
    show: boolean;
    id: number | null;
}

function APIs({ can_add_api }: APIsProps) {
    const [editFormModal, setEditFormModal] = useState<EditFormModalState>({ show: false, id: null });
    const [formModal, setFormModal] = useState(false);
    const { apis } = usePage().props as unknown as { apis: ApiDefinition[] };

    return (
        <>
            <Card className="mb-6 w-full rounded-none p-0 pb-4 shadow-none">
                <CardHeader className="bg-accent flex flex-row items-center justify-between space-y-0 px-2 pt-2 pb-2 sm:px-4">
                    <CardTitle className="text-lg">Vending Medium APIs</CardTitle>
                    {can_add_api && (
                        <Button type="button" onClick={() => setFormModal(true)} className="capitalize">
                            Add API
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                        {apis.map((it) => (
                            <APICard key={it.id} onClick={() => setEditFormModal({ show: true, id: it.id })} model={it.model} name={it.name} />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <APIsUpdateForm setFormModal={setEditFormModal} formModal={editFormModal} />
            <APIForm setFormModal={setFormModal} formModal={formModal} />
        </>
    );
}

export default APIs;

interface APICardProps {
    name: string;
    model: string;
    onClick: () => void;
}

function APICard({ name, onClick, model }: APICardProps) {
    const apiType = model.replace('APIs\\', '').replace('\\', '');

    return (
        <Card className="hover:bg-muted/50 flex w-full flex-row items-center justify-start gap-4 px-2 py-4 transition-colors sm:px-4">
            <span className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-lg">
                <Globe className="text-muted-foreground h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                    API Type: <span className="font-medium">{apiType === 'Default' ? 'Msorg' : apiType}</span>
                </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onClick} className="shrink-0">
                Update
            </Button>
        </Card>
    );
}
