import { cn } from "@/lib/cn";

import {
  PreviewFrame,
  PreviewMark,
  previewStyles as s,
  type PreviewProps,
} from "./PreviewFrame";

const TRIPS = [
  {
    title: "Faroe Ridgeline",
    meta: "6 days · Sep–Oct · from £2,150",
    tag: "North Atlantic",
    art: "linear-gradient(170deg, #8fb0c4 0%, #5f7686 58%, #3d4a54 100%)",
  },
  {
    title: "Douro by Rail",
    meta: "5 days · Apr–Jun · from £1,480",
    tag: "Northern Portugal",
    art: "linear-gradient(170deg, #f1c3a8 0%, #d68f74 55%, #7b5545 100%)",
  },
  {
    title: "Hokkaido, Slowly",
    meta: "9 days · Jan–Feb · from £3,320",
    tag: "Northern Japan",
    art: "linear-gradient(170deg, #e6eef3 0%, #b6c8d4 52%, #6d7f8c 100%)",
  },
];

const DAYS = [
  { day: "Day 1", text: "Arrive Tórshavn. Harbour walk, early night." },
  { day: "Day 2", text: "Ferry to Nólsoy. 11 km coastal path." },
  { day: "Day 3", text: "Saksun and the tidal lagoon at low water." },
  { day: "Day 4", text: "Rest day. Optional sea-cliff boat." },
  { day: "Day 5", text: "Slættaratindur ascent, weather allowing." },
  { day: "Day 6", text: "Return via Gjógv. Late flight." },
];

export function TravelPreview({ className }: PreviewProps) {
  return (
    <PreviewFrame
      className={className}
      canvasClassName={s.travel}
      label="Concept travel website: a large destination hero over a stylised coastal landscape, a row of trip cards and a day-by-day itinerary, in coral and sky tones."
    >
      <div className={s.travelHero}>
        <div className={s.travelSky} />
        <div className={s.travelSun} />
        <div className={s.travelRidgeFar} />
        <div className={s.travelRidgeNear} />
        <div className={s.travelWater} />

        <div className={s.travelHeroTop}>
          <span className={s.brandRow}>
            <PreviewMark />
            Longway
          </span>
          <nav className={cn(s.travelHeroNav, s.dense)}>
            <span>Destinations</span>
            <span>Journal</span>
            <span>About</span>
          </nav>
        </div>

        <div className={s.travelHeroBottom}>
          <div style={{ display: "grid", gap: "0.85em" }}>
            <span
              style={{
                fontSize: "0.84em",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                opacity: 0.85,
              }}
            >
              North Atlantic
            </span>
            <span className={s.travelHeroTitle}>
              Faroe Ridgeline,
              <br />
              six unhurried days
            </span>
            <span className={s.travelHeroMeta}>
              {["Small group", "Moderate pace", "Sep–Oct"].map((item) => (
                <span
                  key={item}
                  className={s.chip}
                  style={{
                    background: "rgb(255 250 247 / 0.22)",
                    color: "#fffaf7",
                  }}
                >
                  {item}
                </span>
              ))}
            </span>
          </div>
          <span className={s.travelBook}>Enquire &rarr;</span>
        </div>
      </div>

      <div className={s.travelLower}>
        <div style={{ display: "grid", gap: "0.7em", minHeight: 0 }}>
          <span
            style={{
              fontSize: "0.8em",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgb(31 28 27 / 0.64)",
            }}
          >
            Selected journeys
          </span>
          <div className={s.travelCards}>
          {TRIPS.map((trip) => (
            <div key={trip.title} className={s.travelCard}>
              <span className={s.travelThumb} style={{ background: trip.art }}>
                <span className={s.travelThumbTag}>{trip.tag}</span>
              </span>
              <span className={s.travelCardTitle}>{trip.title}</span>
              <span className={s.travelCardMeta}>{trip.meta}</span>
            </div>
          ))}
          </div>
        </div>

        <div className={cn(s.travelItinerary, s.dense)}>
          <span
            style={{
              fontSize: "0.8em",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgb(31 28 27 / 0.64)",
            }}
          >
            Itinerary
          </span>
          {DAYS.map((entry) => (
            <span key={entry.day} className={s.travelDay}>
              <span className={s.travelDayIndex}>{entry.day}</span>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.text}
              </span>
            </span>
          ))}
          <span
            className={s.brandline}
            style={{
              marginTop: "auto",
              paddingTop: "0.6em",
              color: "rgb(31 28 27 / 0.62)",
            }}
          >
            <span className={s.brandRow} style={{ fontSize: "0.95em" }}>
              <PreviewMark />
              Booklee
            </span>
            <span>Story first, booking never far</span>
          </span>
        </div>
      </div>
    </PreviewFrame>
  );
}
