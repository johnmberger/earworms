import { Track } from "@/lib/lastfm";
import TrackCard from "@/components/home/TrackCard";
import NowPlayingStrip from "@/components/home/NowPlayingStrip";
import { isNowPlayingTrack } from "@/lib/recentTracks";

function trackKey(track: Track, index: number): string {
  const artist = track.artist?.["#text"] ?? "";
  const uts = track.date?.uts;
  if (uts) return `${uts}-${artist}-${track.name}`;
  return `recent-${artist}-${track.name}-${index}`;
}

export default function RecentTracksList({ tracks }: { tracks: Track[] }) {
  const nowPlaying = tracks.find(isNowPlayingTrack) ?? null;
  const history = tracks.filter((track) => !isNowPlayingTrack(track));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {history.map((track, index) => (
          <TrackCard
            key={trackKey(track, index)}
            track={track}
            priority={index < 4}
          />
        ))}
      </div>
      {nowPlaying ? <NowPlayingStrip track={nowPlaying} /> : null}
    </>
  );
}
