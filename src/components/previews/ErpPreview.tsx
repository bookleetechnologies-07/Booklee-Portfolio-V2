import { cn } from "@/lib/cn";

import {
  PreviewFrame,
  PreviewMark,
  previewStyles as s,
  type PreviewProps,
} from "./PreviewFrame";

const MODULES = [
  "Overview",
  "Orders",
  "Inventory",
  "Purchasing",
  "Invoicing",
  "Suppliers",
  "Reporting",
];

const TILES = [
  { value: "34", label: "Orders to fulfil" },
  { value: "9", label: "Below threshold" },
  { value: "12", label: "Awaiting goods" },
  { value: "6", label: "Invoices overdue" },
  { value: "2", label: "Failed imports" },
];

const ORDERS = [
  { ref: "SO-4182", customer: "Ashgrove Retail", value: "£4,120", state: "Picking" },
  { ref: "SO-4181", customer: "Bellhouse Ltd", value: "£980", state: "Packed" },
  { ref: "SO-4179", customer: "Corran Supplies", value: "£12,640", state: "Hold" },
  { ref: "SO-4175", customer: "Denby & Rowe", value: "£2,315", state: "Shipped" },
  { ref: "SO-4174", customer: "Eastgate Trade", value: "£7,890", state: "Picking" },
  { ref: "SO-4172", customer: "Fairhurst & Co", value: "£1,640", state: "Packed" },
  { ref: "SO-4170", customer: "Garrick Interiors", value: "£9,410", state: "Picking" },
  { ref: "SO-4168", customer: "Halloway Joinery", value: "£3,275", state: "Shipped" },
  { ref: "SO-4166", customer: "Ingram Fittings", value: "£15,020", state: "Hold" },
  { ref: "SO-4163", customer: "Jarrow Timber", value: "£5,600", state: "Shipped" },
  { ref: "SO-4161", customer: "Kelsall Doors", value: "£2,180", state: "Picking" },
  { ref: "SO-4158", customer: "Larchmont Retail", value: "£8,340", state: "Packed" },
  { ref: "SO-4155", customer: "Marrick Supplies", value: "£4,905", state: "Shipped" },
  { ref: "SO-4152", customer: "Netherby Build", value: "£21,700", state: "Hold" },
];

const DESPATCH = [46, 58, 51, 67, 62, 74, 69, 82, 77, 88, 81, 94];

const STATE_COLOR: Record<string, { bg: string; fg: string }> = {
  Picking: { bg: "#cbefae", fg: "#20361a" },
  Packed: { bg: "#e2eddc", fg: "#2c3a28" },
  Hold: { bg: "#f1d4c9", fg: "#4a2a1f" },
  Shipped: { bg: "rgb(26 28 26 / 0.08)", fg: "rgb(26 28 26 / 0.74)" },
};

const STOCK = [
  { name: "Hinge, 90mm brass", level: 78 },
  { name: "Oak panel, 18mm", level: 41 },
  { name: "Fixing kit, type C", level: 16 },
  { name: "Edge banding, walnut", level: 63 },
  { name: "Drawer runner, 450mm", level: 34 },
  { name: "Softwood batten, 2.4m", level: 88 },
  { name: "Handle, matt black", level: 22 },
  { name: "Lacquer, satin 5L", level: 57 },
];

export function ErpPreview({ className, phraseId }: PreviewProps) {
  return (
    <PreviewFrame
      className={className}
      canvasClassName={s.erp}
      label="Concept ERP interface: an operations module board, an orders table with status pills and inventory levels, in mint and graphite."
    >
      <aside className={cn(s.erpSidebar, s.dense)}>
        <span className={s.brandRow} style={{ color: "#cbefae" }}>
          <PreviewMark />
          Booklee Ops
        </span>
        <nav className={s.erpModuleNav}>
          {MODULES.map((item, index) => (
            <span
              key={item}
              className={cn(
                s.erpModuleNavItem,
                index === 1 && s.erpModuleNavItemActive,
              )}
            >
              <span
                className={s.dot}
                style={{
                  background: index === 1 ? "#cbefae" : "currentColor",
                  opacity: index === 1 ? 1 : 0.5,
                }}
              />
              {item}
            </span>
          ))}
        </nav>
        <div style={{ marginTop: "auto", display: "grid", gap: "0.3em" }}>
          <span style={{ fontSize: "0.76em", opacity: 0.62 }}>
            Warehouse 2 · live
          </span>
          <span className={s.bar} style={{ width: "60%", opacity: 0.25 }} />
        </div>
      </aside>

      <div className={s.erpMain}>
        <header className={s.erpTop}>
          <div>
            <span className={s.erpTitle}>Operations</span>
            <span
              style={{ fontSize: "0.8em", color: "rgb(26 28 26 / 0.64)" }}
            >
              Thursday 14 May · all sites
            </span>
          </div>
          <span style={{ display: "flex", gap: "0.45em" }}>
            <span
              className={s.chip}
              style={{
                background: "rgb(26 28 26 / 0.06)",
                color: "rgb(26 28 26 / 0.68)",
              }}
            >
              Export
            </span>
            <span
              className={s.chip}
              style={{ background: "#cbefae", color: "#20361a" }}
            >
              New order
            </span>
          </span>
        </header>

        <div className={s.erpTiles}>
          {TILES.map((tile) => (
            <div key={tile.label} className={s.erpTile}>
              <span className={s.erpTileValue}>{tile.value}</span>
              <span className={s.erpTileLabel}>{tile.label}</span>
            </div>
          ))}
        </div>

        <div className={s.erpBody}>
          <section className={s.erpPanel}>
            <span className={s.erpPanelTitle}>Open orders</span>
            <div className={s.erpTable}>
              <div className={cn(s.erpRow, s.erpRowHead)}>
                <span>Ref</span>
                <span>Customer</span>
                <span>Value</span>
                <span>State</span>
              </div>
              {ORDERS.map((order) => (
                <div key={order.ref} className={s.erpRow}>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {order.ref}
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {order.customer}
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    {order.value}
                  </span>
                  <span
                    className={s.chip}
                    style={{
                      background: STATE_COLOR[order.state].bg,
                      color: STATE_COLOR[order.state].fg,
                      fontSize: "0.78em",
                    }}
                  >
                    {order.state}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "auto",
                paddingTop: "0.6em",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.82em",
                color: "rgb(26 28 26 / 0.64)",
                borderTop: "0.1em solid rgb(26 28 26 / 0.1)",
              }}
            >
              <span>Showing 14 of 34 open</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                Total £102,415
              </span>
            </div>
          </section>

          <section className={cn(s.erpPanel, s.dense)}>
            <span className={s.erpPanelTitle}>Stock against threshold</span>
            <div className={s.erpStock}>
              {STOCK.map((item) => (
                <div key={item.name} className={s.erpStockRow}>
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.5em",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        color: "rgb(26 28 26 / 0.64)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {item.level}%
                    </span>
                  </span>
                  <span className={s.erpStockTrack}>
                    <span
                      className={s.erpStockFill}
                      style={{
                        width: `${item.level}%`,
                        background: item.level < 25 ? "#d98b6a" : "#7fbf5a",
                      }}
                    />
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "auto", display: "grid", gap: "0.5em" }}>
              <span className={s.erpPanelTitle}>Despatched, last 12 weeks</span>
              <div
                style={{
                  height: "4.5em",
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "0.3em",
                }}
              >
                {DESPATCH.map((height, index) => (
                  <span
                    key={index}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      borderRadius: "0.2em 0.2em 0 0",
                      background: "#cbefae",
                      opacity: 0.5 + index * 0.04,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/*
          The phrase below is the real, readable text handed to the next section
          by the home-page laptop story. It must stay a live DOM node — it is
          never baked into an image — so that the handoff can measure it.
        */}
        <footer className={s.erpFooter}>
          <span
            className={cn(s.brandRow, s.erpFooterMark, s.dense)}
            style={{ fontSize: "0.95em" }}
          >
            <PreviewMark />
            Built with Booklee
          </span>
          <span id={phraseId} className={s.erpPhrase}>
            Built around you.
          </span>
        </footer>
      </div>
    </PreviewFrame>
  );
}
