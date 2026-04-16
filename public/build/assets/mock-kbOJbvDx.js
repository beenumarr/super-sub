const e={data:`{
        "id": 1,
        "user": {
            "id": 2,
            "name": "Test User",
            "phone": "09088776655"
        },
        "reference": "DT102023160253",
        "amount": "230.00",
        "api_response": "Success Test Mode",
        "description": "1 GB Data MTN to 8106664640",
        "status": "success",
        "balance_before": "2,000.00",
        "balance_after": "1,770.00",
        "date": "20/10/2023 05:10 PM"
    }`,airtime:`{
        "id": 1,
        "user": {
            "id": 2,
            "name": "Test User",
            "phone": "09088776655"
        },
        "reference": "DT102023160253",
        "amount": "230.00",
        "api_response": "Success Test Mode",
        "description": "200 Airtime MTN to 8106664640",
        "status": "success",
        "balance_before": "2,000.00",
        "balance_after": "1,770.00",
        "date": "20/10/2023 05:10 PM"
    }`,validate_meter:`{
        "status": "success",
        "data": {
            "name": "Ahamad Ibrahim",
            "address": "123 Main Street, Lagos",
            "meter_number": "1111111111111",
            "meter_type": "prepaid",
            "disco_name": "IKEDC"
        }
    }`,bill_payment:`{
        "id": 1,
        "user": {
            "id": 2,
            "name": "Test User",
            "phone": "09088776655"
        },
        "reference": "DT102023160253",
        "amount": "230.00",
        "api_response": "Success Test Mode",
        "description": "1000 Electricity Bill to 1229376663553",
        "status": "success",
        "token": "34425 266662 276637 2636",
        "balance_before": "2,000.00",
        "balance_after": "1,770.00",
        "date": "20/10/2023 05:10 PM"
    }`,tv_subscription:`{
        "id": 1,
        "user": {
            "id": 2,
            "name": "Test User",
            "phone": "09088776655"
        },
        "reference": "CB102023160253",
        "amount": "5000.00",
        "api_response": "Success Test Mode",
        "description": "DSTV Premium Subscription to 9099887766",
        "status": "success",
        "smart_card_number": "9099887766",
        "cable_provider": "DSTV",
        "plan_name": "Premium",
        "balance_before": "10,000.00",
        "balance_after": "5,000.00",
        "date": "15/03/2026 02:30 PM"
    }`,exam_pin:`{
        "id": 1,
        "user": {
            "id": 2,
            "name": "Test User",
            "phone": "09088776655"
        },
        "reference": "EP102023160253",
        "amount": "2500.00",
        "api_response": "Success Test Mode",
        "description": "Exam Pin Purchase",
        "status": "success",
        "pin": "A1B2C3D4E5F6G7H8",
        "plan_name": "JAMB Registration",
        "validity_period": "1 Year",
        "balance_before": "5,000.00",
        "balance_after": "2,500.00",
        "date": "15/03/2026 02:30 PM"
    }`},a={data:`{
    "mobile_number": "0810778800",
    "plan": "SME_1GB",
    "network": 1
}`,airtime:`{
    "mobile_number": "0810778800",
    "amount": "200",
    "network": 1
}`,validate_meter:`{
    "meter_number": "1111111111111",
    "meter_type": "prepaid",
    "electricity_distributor_id": 1
}`,bill_payment:`{
    "meter_number": "1111111111111",
    "meter_type": "prepaid",
    "phone_number": "0810776633",
    "amount": 2000,
    "name": "Ahamad",
    "electricity_distributor_id": 1
}`,tv_subscription:`{
    "cable_name": "DSTV",
    "cable_subscription_plan_id": 1,
    "smart_card_number": "9099887766"
}`,exam_pin:`{
    "plan": "jamb_registration",
    "mobile_number": "0810778800"
}`},t={data:"data",airtime:"airtime",validate_meter:"validate_meter",bill_payment:"electricity_bill_payments",tv_subscription:"cable_subscription_payments",exam_pin:"kirani"},s=`{
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer {Api Token}",
}`;export{t as endpoints,e as exampleResponseData,s as headers,a as payloadData};
