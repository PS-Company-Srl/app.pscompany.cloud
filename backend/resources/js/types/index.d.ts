import { AxiosInstance } from 'axios';

declare global {
    interface Window {
        axios: AxiosInstance;
    }
}

// User types
export interface User {
    id: number;
    tenant_id: number;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'viewer';
    email_verified_at: string | null;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Admin {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

// Tenant types
export interface Tenant {
    id: number;
    name: string;
    slug: string;
    domain: string | null;
    api_key: string;
    status: 'active' | 'trial' | 'suspended';
    plan: 'starter' | 'business' | 'enterprise';
    monthly_message_limit: number;
    messages_used_this_month: number;
    trial_ends_at: string | null;
    settings: TenantSettings;
    created_at: string;
    updated_at: string;
    // Counts (when loaded)
    users_count?: number;
    conversations_count?: number;
    leads_count?: number;
    knowledge_bases_count?: number;
    // Relations
    owner?: User;
    bot_settings?: BotSetting;
}

export interface TenantSettings {
    company_name?: string;
    company_email?: string;
    company_phone?: string;
    timezone?: string;
    language?: string;
}

// Bot Settings
export interface BotSetting {
    id: number;
    tenant_id: number;
    system_prompt: string;
    welcome_message: string;
    fallback_message: string;
    fallback_action: 'ask_contact' | 'escalate' | 'none';
    lead_goal: string | null;
    trigger_delay: number;
    trigger_message: string | null;
    widget_position: 'bottom-right' | 'bottom-left';
    widget_colors: WidgetColors;
    openai_model: string;
    temperature: number;
    max_tokens: number;
    created_at: string;
    updated_at: string;
}

export interface WidgetColors {
    primary: string;
    secondary: string;
    text: string;
    userBubble: string;
    botBubble: string;
}

// Knowledge Base
export interface KnowledgeBase {
    id: number;
    tenant_id: number;
    title: string;
    type: 'text' | 'file' | 'url';
    original_content: string | null;
    file_path: string | null;
    file_name: string | null;
    url: string | null;
    status: 'pending' | 'processing' | 'ready' | 'failed';
    error_message: string | null;
    chunks_count: number;
    processed_at: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    chunks?: KbChunk[];
}

export interface KbChunk {
    id: number;
    knowledge_base_id: number;
    content: string;
    tokens_count: number;
    metadata: Record<string, any>;
    created_at: string;
}

// Conversation
export interface Conversation {
    id: number;
    tenant_id: number;
    session_id: string;
    channel: 'web' | 'whatsapp';
    visitor_name: string | null;
    visitor_email: string | null;
    visitor_phone: string | null;
    visitor_ip: string | null;
    visitor_user_agent: string | null;
    visitor_metadata: Record<string, any>;
    is_read: boolean;
    last_message_at: string | null;
    created_at: string;
    updated_at: string;
    // Counts
    messages_count?: number;
    // Relations
    messages?: Message[];
}

export interface Message {
    id: number;
    conversation_id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    tokens_used: number | null;
    model_used: string | null;
    metadata: Record<string, any>;
    created_at: string;
}

// Lead
export interface Lead {
    id: number;
    tenant_id: number;
    conversation_id: number | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    source: 'web' | 'whatsapp';
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    notes: string | null;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    // Relations
    conversation?: Conversation;
}

// Pagination
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Page Props
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User | null;
        admin: Admin | null;
    };
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
    impersonating?: boolean;
};
