export interface Profile {
  id: string;
  email: string;
  wedding_name: string | null;
  role: 'super_admin' | 'couple';
  is_blocked: boolean;
  created_at: string;
}

export interface AccessCode {
  id: string;
  code: string;
  linked_user_id: string | null;
  event_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DashboardModule {
  id: string;
  name: string;
  label: string;
  title: string;   // display convenience field (= label)
  enabled: boolean;
  order: number;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'table' | 'progress' | 'kanban' | 'toggle';
  title: string;
  config: any;
}

export interface Feedback {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  status: 'new' | 'in-progress' | 'resolved';
  created_at: string;
  users?: {
    email: string;
  };
}
