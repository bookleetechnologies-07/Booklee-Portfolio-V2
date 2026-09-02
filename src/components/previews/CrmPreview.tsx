import { cn } from "@/lib/cn";

import {
  PreviewFrame,
  PreviewMark,
  previewStyles as s,
  type PreviewProps,
} from "./PreviewFrame";

const NAV = [
  "Pipeline",
  "Contacts",
  "Companies",
  "Activity",
  "Reports",
  "Settings",
];

const COLUMNS = [
  {
    stage: "Qualified",
    count: 7,
    deals: [
      { name: "Harrow & Fleet", value: "£18,400", owner: "AM" },
      { name: "Northbank Foods", value: "£9,250", owner: "RS" },
      { name: "Kestrel Logistics", value: "£31,000", owner: "AM" },
      { name: "Pell & Daughter", value: "£6,400", owner: "PJ" },
      { name: "Wrenfield Care", value: "£14,900", owner: "RS" },
    ],
  },
  {
    stage: "Scoping",
    count: 5,
    deals: [
      { name: "Vale Interiors", value: "£24,900", owner: "PJ" },
      { name: "Orbit Dental", value: "£12,600", owner: "RS" },
      { name: "Bramley Farms", value: "£19,300", owner: "AM" },
      { name: "Cole Aviation", value: "£41,750", owner: "PJ" },
    ],
  },
  {
    stage: "Proposal",
    count: 4,
    deals: [
      { name: "Mercer Group", value: "£46,000", owner: "AM" },
      { name: "Lowfield Print", value: "£8,900", owner: "PJ" },
      { name: "Yarrow Textiles", value: "£27,400", owner: "RS" },
    ],
  },
  {
    stage: "Review",
    count: 3,
    deals: [
      { name: "Ashcroft Rail", value: "£57,300", owner: "RS" },
      { name: "Halden Marine", value: "£33,900", owner: "AM" },
    ],
  },
  {
    stage: "Won",
    count: 6,
    deals: [
      { name: "Tandem Studio", value: "£15,750", owner: "PJ" },
      { name: "Selwood Care", value: "£22,100", owner: "AM" },
      { name: "Riverbend Co.", value: "£11,200", owner: "RS" },
      { name: "Norbury Legal", value: "£28,600", owner: "PJ" },
    ],
  },
];

const STALLED = [
  { name: "Orbit Dental", days: "14 days" },
  { name: "Lowfield Print", days: "21 days" },
  { name: "Pell & Daughter", days: "30 days" },
];

const FEED = [
  { who: "Rae S.", what: "moved Ashcroft Rail to Review", when: "12m" },
  { who: "Priya J.", what: "logged a call with Vale Interiors", when: "48m" },
  { who: "Alex M.", what: "sent the Mercer Group proposal", when: "2h" },
  { who: "System", what: "flagged Orbit Dental as quiet for 14 days", when: "5h" },
];

const CHART = [38, 52, 46, 61, 55, 72, 64, 81, 76, 88];

const STAGE_TOTALS = [
  { stage: "Qualified", value: "£79,950" },
  { stage: "Scoping", value: "£98,550" },
  { stage: "Proposal", value: "£82,300" },
  { stage: "Review", value: "£91,200" },
  { stage: "Won", value: "£77,650" },
];

export function CrmPreview({ className }: PreviewProps) {
  return (
    <PreviewFrame
      className={className}
      canvasClassName={s.crm}
      label="Concept CRM interface: a five-stage deal pipeline with contact records, an activity feed and a weighted forecast chart, in lilac and graphite."
    >
      <aside className={cn(s.crmSidebar, s.dense)}>
        <div className={s.brandRow} style={{ color: "#ded0f5" }}>
          <PreviewMark />
          <span>Booklee CRM</span>
        </div>
        <nav className={s.crmNav}>
          {NAV.map((item, index) => (
            <span
              key={item}
              className={cn(s.crmNavItem, index === 0 && s.crmNavItemActive)}
            >
              <span
                className={s.dot}
                style={{
                  background: index === 0 ? "#dcccf4" : "currentColor",
                  opacity: index === 0 ? 1 : 0.5,
                }}
              />
              {item}
            </span>
          ))}
        </nav>
        <div style={{ marginTop: "auto", display: "grid", gap: "0.5em" }}>
          <span style={{ fontSize: "0.78em", opacity: 0.62 }}>This quarter</span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.2em",
              lineHeight: 1,
              fontWeight: 600,
              color: "#ded0f5",
            }}
          >
            £246k
          </span>
          <span style={{ fontSize: "0.78em", opacity: 0.62 }}>
            weighted forecast
          </span>
        </div>
      </aside>

      <div className={s.crmMain}>
        <header className={s.crmTopbar}>
          <span className={s.crmSearch}>Search deals, contacts, companies</span>
          <span className={s.crmButton}>New deal</span>
          <span
            className={s.avatar}
            style={{
              width: "2.1em",
              height: "2.1em",
              background: "#dcccf4",
              color: "#2a2340",
            }}
          >
            AM
          </span>
        </header>

        <div className={s.crmBody}>
          <div className={s.crmBoardWrap}>
            <div className={s.crmHeadingRow}>
              <span className={s.crmTitle}>Pipeline</span>
              <span style={{ display: "flex", gap: "0.4em" }}>
                <span
                  className={s.chip}
                  style={{ background: "#dcccf4", color: "#2a2340" }}
                >
                  All owners
                </span>
                <span
                  className={s.chip}
                  style={{
                    background: "rgb(29 29 33 / 0.06)",
                    color: "rgb(29 29 33 / 0.68)",
                  }}
                >
                  Closing this quarter
                </span>
              </span>
            </div>

            <div className={s.crmBoard}>
              {COLUMNS.map((column) => (
                <div key={column.stage} className={s.crmColumn}>
                  <div className={s.crmColumnHead}>
                    <span>{column.stage}</span>
                    <span>{column.count}</span>
                  </div>
                  {column.deals.map((deal) => (
                    <div key={deal.name} className={s.crmCard}>
                      <span className={s.crmCardName}>{deal.name}</span>
                      <span className={s.bar} style={{ width: "70%" }} />
                      <span className={s.crmCardMeta}>
                        <span>{deal.value}</span>
                        <span
                          className={s.avatar}
                          style={{
                            width: "1.6em",
                            height: "1.6em",
                            background: "rgb(220 204 244 / 0.5)",
                            color: "#2a2340",
                            fontSize: "0.68em",
                          }}
                        >
                          {deal.owner}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "auto",
                paddingTop: "0.8em",
                borderTop: "0.1em solid rgb(29 29 33 / 0.1)",
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: "0.7em",
              }}
            >
              {STAGE_TOTALS.map((total) => (
                <span
                  key={total.stage}
                  style={{ display: "grid", gap: "0.15em", minWidth: 0 }}
                >
                  <span
                    style={{
                      fontSize: "0.76em",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "rgb(29 29 33 / 0.64)",
                    }}
                  >
                    {total.stage}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.5em",
                      fontWeight: 600,
                      lineHeight: 1,
                    }}
                  >
                    {total.value}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <aside className={cn(s.crmRail, s.dense)}>
            <div style={{ display: "grid", gap: "0.6em" }}>
              <span className={s.crmRailTitle}>Weighted forecast</span>
              <div className={s.crmChart}>
                {CHART.map((height, index) => (
                  <span
                    key={index}
                    className={s.crmChartBar}
                    style={{
                      height: `${height}%`,
                      opacity: 0.45 + index * 0.055,
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.7em" }}>
              <span className={s.crmRailTitle}>Activity</span>
              <div className={s.crmFeed}>
                {FEED.map((item) => (
                  <div key={item.what} className={s.crmFeedItem}>
                    <span
                      className={s.dot}
                      style={{ background: "#b79ce4", marginTop: "0.45em" }}
                    />
                    <span>
                      <strong style={{ color: "#1d1d21", fontWeight: 600 }}>
                        {item.who}
                      </strong>{" "}
                      {item.what}
                      <span style={{ opacity: 0.5 }}> · {item.when}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.6em" }}>
              <span className={s.crmRailTitle}>Gone quiet</span>
              <div className={s.crmFeed}>
                {STALLED.map((item) => (
                  <div
                    key={item.name}
                    className={s.crmFeedItem}
                    style={{ justifyContent: "space-between" }}
                  >
                    <span style={{ color: "#1d1d21" }}>{item.name}</span>
                    <span>{item.days}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={s.brandline}
              style={{
                marginTop: "auto",
                color: "rgb(29 29 33 / 0.62)",
                borderTop: "0.07em solid rgb(29 29 33 / 0.1)",
                paddingTop: "0.7em",
              }}
            >
              <span className={s.brandRow} style={{ fontSize: "0.95em" }}>
                <PreviewMark />
                Booklee
              </span>
              <span>Built around how you sell</span>
            </div>
          </aside>
        </div>
      </div>
    </PreviewFrame>
  );
}
