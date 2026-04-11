"use client";

import { useEffect } from "react";
import { defaultPortfolioContent } from "../data/site-content";

export function SiteMetaSync() {
  useEffect(() => {
    document.title = defaultPortfolioContent.siteMeta.title;
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", defaultPortfolioContent.siteMeta.description);
  }, []);

  return null;
}
