import { cn } from "@/lib/cn";

import {
  PreviewFrame,
  PreviewMark,
  previewStyles as s,
  type PreviewProps,
} from "./PreviewFrame";

const TABS = ["People", "Attendance", "Leave", "Documents", "Reports"];

const STATS = [
  { value: "48", label: "People" },
  { value: "3", label: "On leave today" },
  { value: "5", label: "Pending approvals" },
  { value: "92%", label: "Attendance this week" },
];

type Status = "in" | "remote" | "off" | "half";

const STATUS_COLOR: Record<Status, string> = {
  in: "#bfd9f2",
  remote: "#d9e8f7",
  off: "rgb(28 32 39 / 0.08)",
  half: "#eef3d8",
};

const TEAM: { name: string; initials: string; week: Status[] }[] = [
  { name: "Alina Duval", initials: "AD", week: ["in", "in", "remote", "in", "in"] },
  { name: "Marcus Reid", initials: "MR", week: ["remote", "remote", "in", "in", "off"] },
  { name: "Sana Iqbal", initials: "SI", week: ["in", "in", "in", "half", "in"] },
  { name: "Tomas Vieira", initials: "TV", week: ["off", "in", "in", "in", "remote"] },
  { name: "Ruth Okafor", initials: "RO", week: ["in", "half", "in", "in", "in"] },
  { name: "Jonas Prell", initials: "JP", week: ["in", "in", "off", "off", "in"] },
  { name: "Elin Haugen", initials: "EH", week: ["remote", "in", "in", "in", "in"] },
  { name: "Dev Raghavan", initials: "DR", week: ["in", "in", "in", "in", "half"] },
  { name: "Nora Castellan", initials: "NC", week: ["in", "off", "remote", "in", "in"] },
  { name: "Owen Blythe", initials: "OB", week: ["half", "in", "in", "remote", "in"] },
];

const COVERAGE = [82, 94, 88, 76, 91];

const ONBOARDING = [
  { task: "Contract signed and filed", done: true },
  { task: "Equipment issued", done: true },
  { task: "Accounts and access created", done: true },
  { task: "Team introductions booked", done: false },
  { task: "First-month objectives agreed", done: false },
];

const DOCUMENTS = [
  { name: "Right to work · Owen Blythe", when: "Expires 12 Jun" },
  { name: "First aid certificate · Sana Iqbal", when: "Expires 30 Jun" },
  { name: "DBS check · Nora Castellan", when: "Expires 14 Aug" },
];

const UPCOMING = [
  { who: "Alina Duval", when: "19–23 May", kind: "Annual" },
  { who: "Tomas Vieira", when: "27 May", kind: "Study" },
  { who: "Jonas Prell", when: "3–7 Jun", kind: "Annual" },
  { who: "Elin Haugen", when: "10 Jun", kind: "Public holiday" },
];

const LEAVE = [
  { who: "Marcus Reid", initials: "MR", detail: "Annual · 12–16 May · 5 days" },
  { who: "Ruth Okafor", initials: "RO", detail: "Parental · 2 Jun onward" },
  { who: "Sana Iqbal", initials: "SI", detail: "Annual · 29 May · half day" },
];

export function HrmPreview({ className }: PreviewProps) {
  return (
    <PreviewFrame
      className={className}
      canvasClassName={s.hrm}
      label="Concept HRM workspace: an employee directory, a weekly attendance strip and pending leave approvals, in pastel blue."
    >
      <header className={s.hrmTop}>
        <span className={s.brandRow}>
          <PreviewMark />
          Booklee People
        </span>
        <nav className={cn(s.hrmTabs, s.dense)}>
          {TABS.map((tab, index) => (
            <span key={tab} className={index === 1 ? s.hrmTabActive : undefined}>
              {tab}
            </span>
          ))}
        </nav>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <span
            className={s.chip}
            style={{ background: "#bfd9f2", color: "#1d3049" }}
          >
            Request leave
          </span>
          <span
            className={s.avatar}
            style={{
              width: "2em",
              height: "2em",
              background: "#e3edf8",
              color: "#1d3049",
            }}
          >
            RO
          </span>
        </span>
      </header>

      <div className={s.hrmStats}>
        {STATS.map((stat) => (
          <div key={stat.label} className={s.hrmStat}>
            <span className={s.hrmStatValue}>{stat.value}</span>
            <span className={s.hrmStatLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className={s.hrmBody}>
        <section className={s.hrmPanel}>
          <div className={s.hrmPanelTitle}>
            <span>This week · Product team</span>
            <span className={s.dense}>Week 19</span>
          </div>
          <div className={s.hrmWeek}>
            <span />
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
              <span key={day} className={s.hrmWeekHead}>
                {day}
              </span>
            ))}
            {TEAM.map((person) => (
              <Row key={person.name} person={person} />
            ))}
          </div>
          <div className={s.hrmCoverage}>
            <span
              style={{
                color: "rgb(28 32 39 / 0.64)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontSize: "0.9em",
              }}
            >
              Coverage
            </span>
            {COVERAGE.map((value, index) => (
              <span key={index} style={{ display: "grid", gap: "0.25em" }}>
                <span
                  style={{
                    textAlign: "center",
                    color: "rgb(28 32 39 / 0.64)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {value}%
                </span>
                <span
                  className={s.hrmCoverageBar}
                  style={{ height: `${(value * 0.032).toFixed(2)}em` }}
                />
              </span>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.9em",
              marginTop: "auto",
              paddingTop: "0.6em",
              fontSize: "0.78em",
              color: "rgb(28 32 39 / 0.64)",
            }}
          >
            {(
              [
                ["in", "In office"],
                ["remote", "Remote"],
                ["half", "Half day"],
                ["off", "Off"],
              ] as const
            ).map(([key, label]) => (
              <span
                key={key}
                style={{ display: "flex", alignItems: "center", gap: "0.35em" }}
              >
                <span
                  className={s.dot}
                  style={{ background: STATUS_COLOR[key] }}
                />
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className={s.hrmPanel}>
          <div className={s.hrmPanelTitle}>
            <span>Awaiting your approval</span>
            <span>3</span>
          </div>
          <div className={s.hrmLeave}>
            {LEAVE.map((request) => (
              <div key={request.who} className={s.hrmLeaveRow}>
                <span
                  className={s.avatar}
                  style={{
                    width: "1.9em",
                    height: "1.9em",
                    background: "#ffffff",
                    color: "#1d3049",
                  }}
                >
                  {request.initials}
                </span>
                <span
                  style={{ display: "grid", gap: "0.1em", minWidth: 0 }}
                >
                  <strong style={{ fontWeight: 600 }}>{request.who}</strong>
                  <span
                    style={{
                      fontSize: "0.86em",
                      color: "rgb(28 32 39 / 0.66)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {request.detail}
                  </span>
                </span>
                <span className={cn(s.hrmApprove, s.dense)}>
                  <span className={s.hrmBtnPrimary}>Approve</span>
                  <span className={s.hrmBtnQuiet}>Decline</span>
                </span>
              </div>
            ))}
          </div>

          <div className={s.hrmPanelTitle} style={{ marginTop: "0.4em" }}>
            <span>Upcoming across the team</span>
          </div>
          <div className={s.hrmLeave}>
            {UPCOMING.map((item) => (
              <div
                key={item.who}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "0.6em",
                  fontSize: "0.84em",
                  paddingBottom: "0.4em",
                  borderBottom: "0.07em solid rgb(28 32 39 / 0.07)",
                }}
              >
                <span style={{ fontWeight: 500 }}>{item.who}</span>
                <span style={{ color: "rgb(28 32 39 / 0.64)" }}>
                  {item.kind} · {item.when}
                </span>
              </div>
            ))}
          </div>

          <div
            className={s.brandline}
            style={{
              marginTop: "auto",
              color: "rgb(28 32 39 / 0.62)",
              borderTop: "0.07em solid rgb(28 32 39 / 0.1)",
              paddingTop: "0.7em",
            }}
          >
            <span className={s.brandRow} style={{ fontSize: "0.95em" }}>
              <PreviewMark />
              Booklee
            </span>
            <span>Shaped to your working week</span>
          </div>
        </section>

        <section className={cn(s.hrmPanel, s.hrmWide, s.dense)}>
          <div style={{ display: "grid", gap: "0.5em", minWidth: 0 }}>
            <div className={s.hrmPanelTitle}>
              <span>Onboarding · Dev Raghavan</span>
              <span>Day 4 of 30</span>
            </div>
            {ONBOARDING.map((item) => (
              <span key={item.task} className={s.hrmCheck}>
                <span
                  className={s.hrmTick}
                  style={{
                    background: item.done
                      ? "#bfd9f2"
                      : "rgb(28 32 39 / 0.08)",
                  }}
                >
                  {item.done ? "✓" : ""}
                </span>
                <span
                  style={{
                    color: item.done
                      ? "rgb(28 32 39 / 0.5)"
                      : "rgb(28 32 39 / 0.85)",
                    textDecoration: item.done ? "line-through" : undefined,
                  }}
                >
                  {item.task}
                </span>
              </span>
            ))}
          </div>

          <div style={{ display: "grid", gap: "0.5em", minWidth: 0 }}>
            <div className={s.hrmPanelTitle}>
              <span>Documents to renew</span>
              <span>3</span>
            </div>
            {DOCUMENTS.map((document) => (
              <span
                key={document.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.8em",
                  fontSize: "0.86em",
                  padding: "0.34em 0",
                  borderBottom: "0.07em solid rgb(28 32 39 / 0.07)",
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {document.name}
                </span>
                <span
                  style={{ color: "rgb(28 32 39 / 0.64)", whiteSpace: "nowrap" }}
                >
                  {document.when}
                </span>
              </span>
            ))}
          </div>
        </section>
      </div>
    </PreviewFrame>
  );
}

function Row({
  person,
}: {
  person: { name: string; initials: string; week: Status[] };
}) {
  return (
    <>
      <span className={s.hrmWeekName}>
        <span
          className={s.avatar}
          style={{
            width: "1.7em",
            height: "1.7em",
            background: "#e3edf8",
            color: "#1d3049",
            fontSize: "0.72em",
          }}
        >
          {person.initials}
        </span>
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {person.name}
        </span>
      </span>
      {person.week.map((status, index) => (
        <span
          key={index}
          className={s.hrmCell}
          style={{ background: STATUS_COLOR[status] }}
        />
      ))}
    </>
  );
}
