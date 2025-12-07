export type EngagementRow = {
  intressent_id: string;
  display_name: string | null;
  party: string | null;
  electoral_district: string | null;
  documents_authored: number | null;
  speeches: number | null;
  votes: number | null;
  yes_votes: number | null;
  no_votes: number | null;
  abstain_votes: number | null;
  first_activity_date: string | null;
  last_activity_date: string | null;
  score: number | null;
};

