import { z } from "zod";

export const politicianSearchResultSchema = z.object({
  intressent_id: z.string(),
  display_name: z.string().nullable(),
  party: z.string().nullable(),
  electoral_district: z.string().nullable(),
  documents_authored: z.coerce.number().nullable(),
  speeches: z.coerce.number().nullable(),
  votes: z.coerce.number().nullable(),
  first_activity_date: z.string().nullable(),
  last_activity_date: z.string().nullable(),
});

export type PoliticianSearchResult = z.infer<typeof politicianSearchResultSchema>;

export const politicianSummarySchema = z.object({
  intressent_id: z.string(),
  display_name: z.string().nullable(),
  party: z.string().nullable(),
  electoral_district: z.string().nullable(),
  documents_authored: z.coerce.number().nullable(),
  speeches: z.coerce.number().nullable(),
  votes: z.coerce.number().nullable(),
  yes_votes: z.coerce.number().nullable(),
  no_votes: z.coerce.number().nullable(),
  abstain_votes: z.coerce.number().nullable(),
  parliamentary_sessions_active: z.coerce.number().nullable(),
  first_activity_date: z.string().nullable(),
  last_activity_date: z.string().nullable(),
});

export type PoliticianSummary = z.infer<typeof politicianSummarySchema>;

const baseDocumentSchema = z.object({
  dok_id: z.string(),
  document_title: z.string().nullable(),
  document_date: z.string().nullable(),
});

export const politicianDocumentSchema = baseDocumentSchema.extend({
  derived_doc_type: z.string().nullable(),
});

export type PoliticianDocument = z.infer<typeof politicianDocumentSchema>;

export const politicianVoteSchema = baseDocumentSchema.extend({
  vote_choice: z.string().nullable(),
  vote_description: z.string().nullable(),
  vote_timestamp: z.string().nullable(),
});

export type PoliticianVote = z.infer<typeof politicianVoteSchema>;

export const politicianSpeechSchema = z.object({
  speech_id: z.string(),
  dok_id: z.string().nullable(),
  document_title: z.string().nullable(),
  document_date: z.string().nullable(),
  parliamentary_session: z.string().nullable(),
  speech_timestamp: z.string().nullable(),
});

export type PoliticianSpeech = z.infer<typeof politicianSpeechSchema>;

export type PoliticianDetail = {
  summary: PoliticianSummary | null;
  documents: PoliticianDocument[];
  votes: PoliticianVote[];
  speeches: PoliticianSpeech[];
};
