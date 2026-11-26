/**
 * Slug helpers shared by the products and categories services.
 *
 * Slugs are the storefront URL segment (`/c/<slug>`, `/p/<slug>`), so they are
 * derived from the Latin name and never edited by a rename. Burmese-only names
 * slug to an empty string; the caller supplies a fallback instead of blocking a
 * shop that types only Burmese.
 */

export function slugify(text: string) {
  return text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/g, '');
}

/**
 * The first free slug: `base`, then `base-2`, `base-3`… `isTaken` is a database
 * probe so this stays correct even when several rows already share a prefix.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
  fallback = 'item',
): Promise<string> {
  const root = base || fallback;
  let candidate = root;
  let suffix = 1;

  while (await isTaken(candidate)) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }

  return candidate;
}
