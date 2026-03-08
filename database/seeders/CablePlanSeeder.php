<?php

namespace Database\Seeders;

use App\Models\CableNetwork;
use App\Models\DataPlanType;
use App\Models\MobileNetwork;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CablePlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cable_networks = '[
            {
                "id": 1,
                "name": "GOTV",
                "plans": [
                    {
                        "id": 34,
                        "cableplan_id": "34",
                        "cable": "GOTV",
                        "package": "GOtv smallie - Monthly",
                        "plan_amount": "1100"
                    },
                    {
                        "id": 16,
                        "cableplan_id": "16",
                        "cable": "GOTV",
                        "package": "GOtv Jinja",
                        "plan_amount": "2250"
                    },
                    {
                        "id": 48,
                        "cableplan_id": "48",
                        "cable": "GOTV",
                        "package": "Gotv smallie - quarterly",
                        "plan_amount": "2900"
                    },
                    {
                        "id": 17,
                        "cableplan_id": "17",
                        "cable": "GOTV",
                        "package": "GOtv Jolli - Monthly",
                        "plan_amount": "3300"
                    },
                    {
                        "id": 2,
                        "cableplan_id": "2",
                        "cable": "GOTV",
                        "package": "GOtv Max - Monthly",
                        "plan_amount": "4850"
                    },
                    {
                        "id": 47,
                        "cableplan_id": "47",
                        "cable": "GOTV",
                        "package": "Gotv Supa - Monthly",
                        "plan_amount": "6400"
                    },
                    {
                        "id": 49,
                        "cableplan_id": "49",
                        "cable": "GOTV",
                        "package": "Gotv smallie - Yearly",
                        "plan_amount": "8600"
                    }
                ]
            },
            {
                "id": 2,
                "name": "DSTV",
                "plans": [
                        {
                            "id": 20,
                            "cableplan_id": "20",
                            "cable": "DSTV",
                            "package": "DStv Padi - Monthly",
                            "plan_amount": "2500"
                        },
                        {
                            "id": 33,
                            "cableplan_id": "33",
                            "cable": "DSTV",
                            "package": "ExtraView Access - Monthly",
                            "plan_amount": "3400"
                        },
                        {
                            "id": 6,
                            "cableplan_id": "6",
                            "cable": "DSTV",
                            "package": "DStv Yanga - Monthly",
                            "plan_amount": "3500"
                        },
                        {
                            "id": 28,
                            "cableplan_id": "28",
                            "cable": "DSTV",
                            "package": "DStv Padi + ExtraView - Monthly",
                            "plan_amount": "5900"
                        },
                        {
                            "id": 19,
                            "cableplan_id": "19",
                            "cable": "DSTV",
                            "package": "DStv Confam - Monthly",
                            "plan_amount": "6200"
                        },
                        {
                            "id": 27,
                            "cableplan_id": "27",
                            "cable": "DSTV",
                            "package": "DStv Yanga + ExtraView - Monthly",
                            "plan_amount": "6900"
                        },
                        {
                            "id": 23,
                            "cableplan_id": "23",
                            "cable": "DSTV",
                            "package": "DStv Asia - Monthly",
                            "plan_amount": "7100"
                        },
                        {
                            "id": 26,
                            "cableplan_id": "26",
                            "cable": "DSTV",
                            "package": "DStv Confam + ExtraView - Monthly",
                            "plan_amount": "9600"
                        },
                        {
                            "id": 7,
                            "cableplan_id": "7",
                            "cable": "DSTV",
                            "package": "DStv Compact - Monthly",
                            "plan_amount": "10500"
                        },
                        {
                            "id": 29,
                            "cableplan_id": "29",
                            "cable": "DSTV",
                            "package": "DStv Compact + Extra View - Monthly",
                            "plan_amount": "13900"
                        },
                        {
                            "id": 8,
                            "cableplan_id": "8",
                            "cable": "DSTV",
                            "package": "DStv Compact Plus - Monthly",
                            "plan_amount": "16600"
                        },
                        {
                            "id": 31,
                            "cableplan_id": "31",
                            "cable": "DSTV",
                            "package": "DStv Compact Plus - Extra View",
                            "plan_amount": "20000"
                        },
                        {
                            "id": 9,
                            "cableplan_id": "9",
                            "cable": "DSTV",
                            "package": "DStv Premium - Monthly",
                            "plan_amount": "24500"
                        },
                        {
                            "id": 25,
                            "cableplan_id": "25",
                            "cable": "DSTV",
                            "package": "DStv Premium Asia - Monthly",
                            "plan_amount": "27500"
                        },
                        {
                            "id": 30,
                            "cableplan_id": "30",
                            "cable": "DSTV",
                            "package": "DStv Premium + Extra View",
                            "plan_amount": "27900"
                        },
                        {
                            "id": 24,
                            "cableplan_id": "24",
                            "cable": "DSTV",
                            "package": "DStv Premium French - Monthly",
                            "plan_amount": "36000"
                        }
                    ]
            },
            {
                "id": 3,
                "name": "STARTIME",
                "plans": [
                    {
                        "id": 42,
                        "cableplan_id": "42",
                        "cable": "STARTIME",
                        "package": "Nova - 90 Naira - 1 Day",
                        "plan_amount": "90"
                    },
                    {
                        "id": 43,
                        "cableplan_id": "43",
                        "cable": "STARTIME",
                        "package": "Basic - 185Naira - 1 Day",
                        "plan_amount": "185"
                    },
                    {
                        "id": 44,
                        "cableplan_id": "44",
                        "cable": "STARTIME",
                        "package": "Smart - 260 Naira - 1 Day",
                        "plan_amount": "260"
                    },
                    {
                        "id": 37,
                        "cableplan_id": "37",
                        "cable": "STARTIME",
                        "package": "Nova - 300 Naira - 1 Week",
                        "plan_amount": "300"
                    },
                    {
                        "id": 45,
                        "cableplan_id": "45",
                        "cable": "STARTIME",
                        "package": "Classic - 320 Naira - 1 Day",
                        "plan_amount": "320"
                    },
                    {
                        "id": 46,
                        "cableplan_id": "46",
                        "cable": "STARTIME",
                        "package": "Super - 490 Naira - 1 Day",
                        "plan_amount": "490"
                    },
                    {
                        "id": 38,
                        "cableplan_id": "38",
                        "cable": "STARTIME",
                        "package": "Basic - 600 Naira - 1 Week",
                        "plan_amount": "600"
                    },
                    {
                        "id": 39,
                        "cableplan_id": "39",
                        "cable": "STARTIME",
                        "package": "Smart - 700 Naira - 1 Week",
                        "plan_amount": "700"
                    },
                    {
                        "id": 40,
                        "cableplan_id": "40",
                        "cable": "STARTIME",
                        "package": "Classic - 1200 Naira - 1 Week",
                        "plan_amount": "1200"
                    },
                    {
                        "id": 14,
                        "cableplan_id": "14",
                        "cable": "STARTIME",
                        "package": "Nova - 1200 Naira - 1 Month",
                        "plan_amount": "1200"
                    },
                    {
                        "id": 41,
                        "cableplan_id": "41",
                        "cable": "STARTIME",
                        "package": "Super - 1,500 Naira - 1 Week",
                        "plan_amount": "1500"
                    },
                    {
                        "id": 12,
                        "cableplan_id": "12",
                        "cable": "STARTIME",
                        "package": "Basic - 2100Naira - 1 Month",
                        "plan_amount": "2100"
                    },
                    {
                        "id": 13,
                        "cableplan_id": "13",
                        "cable": "STARTIME",
                        "package": "Smart - 2,800 Naira - 1 Month",
                        "plan_amount": "2800"
                    },
                    {
                        "id": 11,
                        "cableplan_id": "11",
                        "cable": "STARTIME",
                        "package": "Classic - 3100 Naira - 1 Mont",
                        "plan_amount": "3100"
                    },
                    {
                        "id": 15,
                        "cableplan_id": "15",
                        "cable": "STARTIME",
                        "package": "Super - 5300 Naira - 1 Month",
                        "plan_amount": "5300"
                    }
                ]
            }
        ]';


        $data = json_decode($cable_networks, true);

        foreach ($data as $network) {
            $mNetwork = CableNetwork::create([
                'name' => $network['name'],
                'code' => $network['id'],
                'transaction_api_id'=> 1,
            ]);

            foreach ($network['plans'] as $plan) {
                // Extracting package name and validity from the "package" field
                $packageParts = explode(" - ", $plan['package']);
                $packageName = $packageParts[0];
                $validity = $packageParts[1] ?? 'Monthly';

                $mNetwork->plans()->create([
                    'product_code' => $plan['cableplan_id'],
                    'package_name' => $packageName,
                    'validity' => $validity,
                    'amount' => $plan['plan_amount'],
                ]);
            }
        }

    }
}
