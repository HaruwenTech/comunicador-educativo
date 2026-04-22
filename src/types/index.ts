export type AnnouncementType = 'strike' | 'early_dismissal' | 'info' | 'urgent';

export type Announcement = {
  id: string;
  created_at: string;
  title: string;
  content: string;
  type: AnnouncementType;
  grade: string;
  section: string;
  author_id?: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'super_admin' | 'admin' | 'parent';
  grade: string | null;
  section: string | null;
};
