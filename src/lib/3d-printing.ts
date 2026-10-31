// Plain constants only: imported by the proxy and client components.

/** Admins can't delete this category or change its slug. */
export const PRINTING_CATEGORY_SLUG = "3d-printing";

export const PRINTING_PATH = "/3d-printing";

export const PRINTING_LABEL = "3D Printing";

export const isPrintingCategory = (slug: string) => slug === PRINTING_CATEGORY_SLUG;
