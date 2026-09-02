import type { ComponentType } from "react";

import type { ProjectSlug } from "@/content/projects";

import { CrmPreview } from "./CrmPreview";
import { ErpPreview } from "./ErpPreview";
import { HrmPreview } from "./HrmPreview";
import { PortfolioPreview } from "./PortfolioPreview";
import { TravelPreview } from "./TravelPreview";
import type { PreviewProps } from "./PreviewFrame";

export const previewBySlug: Record<ProjectSlug, ComponentType<PreviewProps>> = {
  crm: CrmPreview,
  hrm: HrmPreview,
  portfolio: PortfolioPreview,
  travel: TravelPreview,
  erp: ErpPreview,
};

export function ConceptPreview({
  slug,
  ...props
}: PreviewProps & { slug: ProjectSlug }) {
  const Preview = previewBySlug[slug];
  return <Preview {...props} />;
}

export type { PreviewProps };
