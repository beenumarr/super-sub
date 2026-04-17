import React from "react";
import { router } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PromotionRow = {
    id: number;
    code: string;
    reward_amount: string | number;
    max_redemptions: number;
    redeemed_count: number;
    is_active: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
};

export default function PromotionTable({ promotions }: { promotions: PromotionRow[] }) {
    if (!promotions || promotions.length === 0) {
        return <div className="py-8 text-center text-sm text-gray-500">No promos created yet.</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Reward (₦)</TableHead>
                    <TableHead>Redeemed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {promotions.map((promo) => (
                    <TableRow key={promo.id}>
                        <TableCell className="font-medium">{promo.code}</TableCell>
                        <TableCell>{promo.reward_amount}</TableCell>
                        <TableCell>
                            {promo.redeemed_count}/{promo.max_redemptions}
                        </TableCell>
                        <TableCell>
                            {promo.is_active ? (
                                <Badge className="bg-green-600 hover:bg-green-600">Active</Badge>
                            ) : (
                                <Badge variant="secondary">Inactive</Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                            {promo.is_active ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.put(route("admin.promotions.deactivate", { promotion: promo.id }, false))}
                                >
                                    End
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => router.put(route("admin.promotions.activate", { promotion: promo.id }, false))}
                                >
                                    Start
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant="destructive"
                                disabled={promo.redeemed_count > 0}
                                title={promo.redeemed_count > 0 ? "Cannot delete redeemed promo" : "Delete promo"}
                                onClick={() => router.delete(route("admin.promotions.destroy", { promotion: promo.id }, false))}
                            >
                                Delete
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
