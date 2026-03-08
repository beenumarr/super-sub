export interface PhoneNumber {
    id: number;
    serial_number?: number;
    number: string;
    airtime_balance: string;
    data_balance: string;
    network: {
        name: string;
    };
    status: 'CONNECTED' | 'DISCONNECTED' | 'DISABLED';
    created_at: string;
    plan_type_purchased?: string;
    enable_datashare?: boolean;
    has_daily_limit: string;
    has_monthly_limit: string;
    datashare_count_today: string;
    datashare_today: string;
    datashare_count_thismonth: string;
    priority?: boolean;
    tarrif_plan?: string;
    custom_share_enabled?: boolean;
    share_preferences?: Record<string, number>;
    monthly_share_usage?: Record<string, number>;
    datashare_thismonth: string;
    expires_in?: string;
    token_expires_at?: string;

    token_refreshed_at?: string;
    plan_category: string;
    name?: string;
    // Debug data fields (only available for admin users)
    session_token?: string;
    refresh_token?: string;
    token_id?: string;
    token_refresh_at?: string;
    session_id?: string;
    token_expired_at?: string;
    token_refresh_expires_at?: string;
    last_api_response?: string;
    last_transactions?: Array<{
        id: number;
        api_response: string;
        status: string;
        created_at: string;
        beneficiary?: string;
    }>;
    has_active_plan?: boolean;
    error_count?: number;
    auth_user_id?: string;
    public_key?: string;
    private_key?: string;
    mgnt_refresh_token?: string;
    mgnt_token_id?: string;
    debugData?: string[];
}

export interface DataPlan {
    id: number;
    name: string;
    size: number;
    volume: string;
    price: number;
    validity?: number;
    description?: string;
    category?: {
        name: string;
        network?: {
            name: string;
        };
    };
}

export interface Group {
    id: number | null;
    name: string;
    description: string;
    color: string;
}

export interface UserGroup {
    id: number;
    name: string;
    color: string;
}

export interface Stats {
    total_success_transactions?: number;
    total_failed_transactions?: number;
    total_connected_numbers?: number;
    total_disconnected_numbers?: number;
    total_direct_gifts?: number;
    total_data_shares?: number;
    share_available_today: number;
    share_limit_today: number;
    datashared_today: number;
    share_available_count: number;
}

export interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface PhoneNumbersPaginated {
    data: PhoneNumber[];
    links: PaginationLinks;
    meta: PaginationMeta;
}

export interface PhoneNumbersIndexProps {
    phone_numbers: PhoneNumbersPaginated;
    stats: Stats;
    total_data_balance: number;
    data_plans: DataPlan[];
    current_group: Group;
    user_groups: UserGroup[];
    user_settings?: {
        master_phone_number_id?: number;
    };
    results?: Array<{
        status: string;
        message: string;
        job_id: string;
        phone_count: number;
        plan_id?: number;
    }>;
    filters?: {
        sort?: string;
        direction?: string;
        search?: string;
        status?: string;
        dailyLimit?: string;
        monthlyLimit?: string;
        data_share?: string;
        group_id?: string;
        perPage?: number;
    };
    master_phone_number_id?: number;
    master_phone_number?: PhoneNumber;
    debug?: boolean;
    auth: {
        phone_number_count: number;
        phone_number_limit: number;
    };
}
