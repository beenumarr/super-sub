import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Lightbulb, RefreshCw, Tv, Wallet } from 'lucide-react';
import { useState } from 'react';
import UtilityServicesUpdateForm from './UtilityServicesUpdateForm';

interface EditFormModalState {
    show: boolean;
    id: string | number;
    form?: string;
}

function UtilityServices() {
    const [editFormModal, setEditFormModal] = useState<EditFormModalState>({ show: false, id: '', form: '' });

    return (
        <>
            <Card className="mb-6 w-full rounded-none p-0 pb-4 shadow-none">
                <CardHeader className="bg-accent flex flex-row items-center justify-between space-y-0 px-2 pt-2 pb-2 sm:px-4">
                    <CardTitle className="text-lg">Utility and Other Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                        <ServiceCard
                            onClick={() => setEditFormModal({ show: true, id: '', form: 'cable_tv_services' })}
                            Icon={Tv}
                            name="Cable Tv Subscriptions"
                        />
                        <ServiceCard
                            onClick={() => setEditFormModal({ show: true, id: '', form: 'result_checker_services' })}
                            Icon={CreditCard}
                            name="Result Checker"
                        />
                        <ServiceCard
                            onClick={() => setEditFormModal({ show: true, id: '', form: 'airtime_to_cash_services' })}
                            Icon={RefreshCw}
                            name="Airtime to Cash"
                        />
                        <ServiceCard
                            onClick={() => setEditFormModal({ show: true, id: '', form: 'bill_payment_services' })}
                            Icon={Lightbulb}
                            name="Electricity Bill Payments"
                        />
                        <ServiceCard
                            onClick={() => setEditFormModal({ show: true, id: '', form: 'wallet_funding_services' })}
                            Icon={Wallet}
                            name="Wallet Funding"
                        />
                        <ServiceCard
                            onClick={() => setEditFormModal({ show: true, id: '', form: 'user_packages' })}
                            Icon={Wallet}
                            name="User Spending Limit"
                        />
                    </div>
                </CardContent>
            </Card>

            <UtilityServicesUpdateForm setFormModal={setEditFormModal} formModal={editFormModal} />
        </>
    );
}

export default UtilityServices;

interface ServiceCardProps {
    name: string;
    onClick: () => void;
    Icon: typeof Tv;
}

function ServiceCard({ name, onClick, Icon }: ServiceCardProps) {
    return (
        <Card className="hover:bg-muted/50 flex w-full flex-row items-center justify-start gap-4 px-2 py-4 transition-colors sm:px-4">
            <span className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-lg">
                <Icon className="text-muted-foreground h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{name}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onClick} className="shrink-0">
                Update
            </Button>
        </Card>
    );
}
