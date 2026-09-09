import { z } from "zod";

const chartRangeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const weeklyChartListSchema = z.object({
  weeklychartlist: z.object({
    chart: z.union([z.array(chartRangeSchema), chartRangeSchema]),
  }),
});

const rankAttr = z
  .object({
    rank: z.string().optional(),
  })
  .optional();

/** Weekly charts sometimes nest artist as `{ "#text": "Name" }` */
const artistNameSchema = z.union([
  z.string(),
  z.object({ "#text": z.string() }).transform((v) => v["#text"]),
]);

export const weeklyArtistEntrySchema = z.object({
  name: z.string(),
  playcount: z.string().optional(),
  url: z.string().optional(),
  mbid: z.string().optional(),
  "@attr": rankAttr,
});

export const weeklyAlbumEntrySchema = z.object({
  name: z.string(),
  artist: artistNameSchema,
  playcount: z.string().optional(),
  url: z.string().optional(),
  mbid: z.string().optional(),
  "@attr": rankAttr,
});

export const weeklyTrackEntrySchema = z.object({
  name: z.string(),
  artist: artistNameSchema,
  playcount: z.string().optional(),
  url: z.string().optional(),
  mbid: z.string().optional(),
  "@attr": rankAttr,
});

export const weeklyArtistChartSchema = z.object({
  weeklyartistchart: z.object({
    artist: z
      .union([z.array(weeklyArtistEntrySchema), weeklyArtistEntrySchema])
      .optional(),
  }),
});

export const weeklyAlbumChartSchema = z.object({
  weeklyalbumchart: z.object({
    album: z
      .union([z.array(weeklyAlbumEntrySchema), weeklyAlbumEntrySchema])
      .optional(),
  }),
});

export const weeklyTrackChartSchema = z.object({
  weeklytrackchart: z.object({
    track: z
      .union([z.array(weeklyTrackEntrySchema), weeklyTrackEntrySchema])
      .optional(),
  }),
});

export type ChartRange = z.infer<typeof chartRangeSchema>;
export type WeeklyArtistEntry = z.infer<typeof weeklyArtistEntrySchema>;
export type WeeklyAlbumEntry = z.infer<typeof weeklyAlbumEntrySchema>;
export type WeeklyTrackEntry = z.infer<typeof weeklyTrackEntrySchema>;
