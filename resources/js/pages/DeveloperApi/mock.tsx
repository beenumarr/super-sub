export const httpMethods: Record<string, "GET" | "POST"> = {
    user: "GET",
    networks: "GET",
    data_plans: "GET",
    data: "POST",
    airtime: "POST",
    cable_plans: "GET",
    tv_subscription: "POST",
    electricity_discos: "GET",
    validate_meter: "POST",
    bill_payment: "POST",
    exam_types: "GET",
    exam_pin: "POST",
    transaction: "POST",
    nin: "POST",
    bvn: "POST",
};

export const endpoints: Record<string, string> = {
    user: "user",
    networks: "networks",
    data_plans: "data/plans",
    data: "data",
    airtime: "airtime",
    cable_plans: "cable/plans",
    tv_subscription: "cable_subscription_payments",
    electricity_discos: "electricity/discos",
    validate_meter: "validate_meter",
    bill_payment: "electricity_bill_payments",
    exam_types: "exam_types",
    exam_pin: "kirani",
    transaction: "transaction/get-by-reference",
    nin: "kyc/nin",
    bvn: "kyc/bvn",
};

export const exampleResponseData: Record<string, string> = {
    user: `{
    "status": "success",
    "user": {
        "id": 2,
        "name": "Developer VTU Hub",
        "email": "developer@example.com",
        "phone_number": "08012345678",
        "wallet_balance": 15450.00,
        "bonus_balance": 250.00,
        "package": "API Partner"
    },
    "message": "API connection successful"
}`,

    networks: `{
    "status": "success",
    "data": [
        { "id": 1, "name": "MTN", "code": "mtn", "data_active": 1, "airtime_active": 1 },
        { "id": 2, "name": "GLO", "code": "glo", "data_active": 1, "airtime_active": 1 },
        { "id": 3, "name": "AIRTEL", "code": "airtel", "data_active": 1, "airtime_active": 1 },
        { "id": 4, "name": "9MOBILE", "code": "9mobile", "data_active": 1, "airtime_active": 1 }
    ]
}`,

    data_plans: `{
    "status": "success",
    "data": [
        {
            "id": 1,
            "network_id": 1,
            "network_name": "MTN",
            "plan_type": "SME",
            "name": "MTN 1GB SME",
            "size": "1",
            "volume": "GB",
            "amount": 265.00,
            "validity": "30 Days"
        },
        {
            "id": 2,
            "network_id": 1,
            "network_name": "MTN",
            "plan_type": "SME",
            "name": "MTN 2GB SME",
            "size": "2",
            "volume": "GB",
            "amount": 530.00,
            "validity": "30 Days"
        }
    ]
}`,

    data: `{
    "id": 105,
    "user": {
        "id": 2,
        "name": "Developer VTU Hub",
        "phone": "08012345678"
    },
    "ident": "DT102026160253",
    "reference": "DT102026160253",
    "amount": "265.00",
    "api_response": "Transaction Successful",
    "description": "1 GB Data MTN to 08107788000",
    "status": "successful",
    "Status": "successful",
    "balance_before": "15,450.00",
    "balance_after": "15,185.00",
    "date": "27/09/2026 04:30 PM"
}`,

    airtime: `{
    "id": 106,
    "user": {
        "id": 2,
        "name": "Developer VTU Hub",
        "phone": "08012345678"
    },
    "ident": "AT102026160254",
    "reference": "AT102026160254",
    "amount": "196.00",
    "api_response": "Airtime delivered",
    "description": "200 Airtime MTN to 08107788000",
    "status": "successful",
    "Status": "successful",
    "balance_before": "15,185.00",
    "balance_after": "14,989.00",
    "date": "27/09/2026 04:31 PM"
}`,

    cable_plans: `{
    "status": "success",
    "data": [
        { "id": 1, "cable_network_id": 1, "provider": "DSTV", "package_name": "DSTV Padi", "amount": 2500.00 },
        { "id": 2, "cable_network_id": 1, "provider": "DSTV", "package_name": "DSTV Yanga", "amount": 3500.00 },
        { "id": 3, "cable_network_id": 2, "provider": "GOTV", "package_name": "GOTV Jinja", "amount": 2700.00 }
    ]
}`,

    tv_subscription: `{
    "id": 107,
    "user": {
        "id": 2,
        "name": "Developer VTU Hub",
        "phone": "08012345678"
    },
    "ident": "CB102026160255",
    "reference": "CB102026160255",
    "amount": "3500.00",
    "api_response": "Subscription Activated",
    "description": "DSTV Yanga to 9099887766",
    "status": "successful",
    "smart_card_number": "9099887766",
    "cable_provider": "DSTV",
    "plan_name": "DSTV Yanga",
    "balance_before": "14,989.00",
    "balance_after": "11,489.00",
    "date": "27/09/2026 04:32 PM"
}`,

    electricity_discos: `{
    "status": "success",
    "data": [
        { "id": 1, "name": "IKEDC (Ikeja Electric)" },
        { "id": 2, "name": "EKEDC (Eko Electric)" },
        { "id": 3, "name": "IBEDC (Ibadan Electric)" },
        { "id": 4, "name": "AEDC (Abuja Electric)" }
    ]
}`,

    validate_meter: `{
    "status": "success",
    "data": {
        "name": "Ahmad Ibrahim",
        "address": "123 Commercial Avenue, Lagos",
        "meter_number": "1111111111111",
        "meter_type": "prepaid",
        "disco_name": "IKEDC"
    }
}`,

    bill_payment: `{
    "id": 108,
    "user": {
        "id": 2,
        "name": "Developer VTU Hub",
        "phone": "08012345678"
    },
    "ident": "EB102026160256",
    "reference": "EB102026160256",
    "amount": "2000.00",
    "api_response": "Token Generated",
    "description": "2000 Electricity Bill to 1111111111111",
    "status": "successful",
    "token": "3442-5266-6622-7663-7263",
    "balance_before": "11,489.00",
    "balance_after": "9,489.00",
    "date": "27/09/2026 04:33 PM"
}`,

    exam_types: `{
    "status": "success",
    "data": [
        { "id": 1, "name": "WAEC", "amount": 3500.00 },
        { "id": 2, "name": "NECO", "amount": 1200.00 },
        { "id": 3, "name": "NABTEB", "amount": 1100.00 }
    ]
}`,

    exam_pin: `{
    "id": 109,
    "user": {
        "id": 2,
        "name": "Developer VTU Hub",
        "phone": "08012345678"
    },
    "ident": "EP102026160257",
    "reference": "EP102026160257",
    "amount": "3500.00",
    "api_response": "Pin Generated",
    "description": "WAEC Result Checker Pin Purchase",
    "status": "successful",
    "pin": "WAEC-9988223344",
    "pins": ["WAEC-9988223344"],
    "plan_name": "WAEC",
    "balance_before": "9,489.00",
    "balance_after": "5,989.00",
    "date": "27/09/2026 04:34 PM"
}`,

    transaction: `{
    "success": true,
    "message": "Transaction retrieved successfully",
    "data": {
        "id": 105,
        "reference_id": "DT102026160253",
        "type": "DATA",
        "amount": "265.00",
        "status": "successful",
        "description": "1 GB Data MTN to 08107788000",
        "api_response": "Transaction Successful",
        "created_at": "2026-09-27 16:30:00"
    }
}`,

    nin: `{
    "success": true,
    "status": "SUCCESS",
    "reference": "NV20260927123456",
    "service": "NIN_VERIFICATION",
    "data": {
        "nin": "11111111111",
        "first_name": "JOHN",
        "last_name": "DOE",
        "gender": "male",
        "phone": "08012345678"
    },
    "balance_after": 5889.00
}`,

    bvn: `{
    "success": true,
    "status": "SUCCESS",
    "reference": "BV20260927654321",
    "service": "BVN_VERIFICATION",
    "data": {
        "bvn": "11111111111",
        "first_name": "JOHN",
        "last_name": "DOE"
    },
    "balance_after": 5789.00
}`,
};

export const payloadData: Record<string, string | null> = {
    user: null,

    networks: null,

    data_plans: `// Optional Query Parameter: ?network_id=1
// Example: GET /api/data/plans?network_id=1`,

    data: `{
    "mobile_number": "08107788000",
    "plan": 1,
    "network": 1
}`,

    airtime: `{
    "mobile_number": "08107788000",
    "amount": 200,
    "network": 1
}`,

    cable_plans: null,

    tv_subscription: `{
    "cable_name": "DSTV",
    "cable_subscription_plan_id": 1,
    "smart_card_number": "9099887766"
}`,

    electricity_discos: null,

    validate_meter: `{
    "meter_number": "1111111111111",
    "meter_type": "prepaid",
    "electricity_distributor_id": 1
}`,

    bill_payment: `{
    "meter_number": "1111111111111",
    "meter_type": "prepaid",
    "phone_number": "08107766330",
    "amount": 2000,
    "name": "Customer Name",
    "electricity_distributor_id": 1
}`,

    exam_types: null,

    exam_pin: `{
    "plan": "WAEC",
    "quantity": 1
}`,

    transaction: `{
    "reference_id": "DT102026160253"
}`,

    nin: `{
    "nin": "11111111111"
}`,

    bvn: `{
    "bvn": "11111111111"
}`,
};

export const headers = `{
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer {YOUR_API_TOKEN}"
}`;
