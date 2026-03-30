from __future__ import annotations

from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
import json
import re
import unicodedata


BASE_URL = "https://epicap.com/"
USER_AGENT = "Mozilla/5.0"
OUTPUT_PATH = Path("lib/data/epicap-catalog.generated.json")
SECTION_PATTERN = re.compile(r'<section class="page-product-box">(.*?)</section>', re.S | re.I)

SHORT_NAME_OVERRIDES = {
    "equipements-de-protection-respiratoire": "Respiratoire",
    "equipements-de-protection-individuelle": "EPI",
    "decontamination": "Decontamination",
    "extracteurs-d-air-epiair": "EPIAIR",
    "aspirateurs-ponceuses-rectifieuses-de-sol": "Aspirateurs & sols",
    "mesures-controles-communication": "Mesures",
    "confinement": "Confinement",
    "emballages": "Emballages",
    "brumisation-impregnation-decapage-outillages": "Brumisation",
    "location-et-maintenance-equipements-anti-amiante": "Location",
    "materiel-et-consommables-pour-le-deplombage": "Deplombage",
}

BRAND_HINTS = [
    "3M",
    "SCOTT",
    "KASCO",
    "CUBAIR",
    "BULKAIR",
    "EPICOVER",
    "EPICAB",
    "EPIAIR",
    "EPIROLL",
    "AQUARIUS",
    "NUMATIC",
    "HUSQVARNA",
    "HTC",
    "ASTILLO",
    "COYNCO",
    "ZIPWALL",
    "DUMOND",
    "EASY GEL PROTECT",
    "RSG",
    "BLS",
    "HONEYWELL",
    "OMEGA",
    "EPICLEAN",
    "PEGA",
    "SAUERMANN",
    "KIMO",
    "ELSEA",
]

RENTABLE_KEYWORDS = [
    "epiroll",
    "epicab",
    "epiair",
    "aquarius",
    "bulkair",
    "cubair",
    "location",
]


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag != "a":
            return

        href = dict(attrs).get("href")
        if href:
            self.links.append(href)


def fetch(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=25) as response:
        return response.read().decode("utf-8", errors="replace")


def clean_html_text(value: str) -> str:
    value = re.sub(r"<script.*?</script>", " ", value, flags=re.S | re.I)
    value = re.sub(r"<style.*?</style>", " ", value, flags=re.S | re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = unescape(value)
    value = value.replace("\xa0", " ")
    value = " ".join(value.split())
    return value.strip()


def clean_rich_text(value: str) -> str:
    value = re.sub(r"<script.*?</script>", " ", value, flags=re.S | re.I)
    value = re.sub(r"<style.*?</style>", " ", value, flags=re.S | re.I)
    value = re.sub(r"<iframe.*?</iframe>", " ", value, flags=re.S | re.I)
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"</(p|div|section|article|h[1-6]|ul|ol|table|tbody|tr)>", "\n", value, flags=re.I)
    value = re.sub(r"<li[^>]*>", "- ", value, flags=re.I)
    value = re.sub(r"</li>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = unescape(value).replace("\xa0", " ")
    value = re.sub(r"[ \t\r\f\v]+", " ", value)
    value = re.sub(r" *\n *", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)

    lines: list[str] = []
    seen: set[str] = set()
    for raw_line in value.splitlines():
        line = raw_line.strip()
        if not line or re.fullmatch(r"\d+(?:\.\d+){2,}", line):
            continue

        fingerprint = re.sub(r"[^a-z0-9]+", "", slugify(line))
        if fingerprint and fingerprint in seen:
            continue

        if fingerprint:
            seen.add(fingerprint)
        lines.append(line)

    return "\n".join(lines).strip()


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "catalogue"


def path_slug(url: str) -> str:
    path = urlparse(url).path.strip("/").split("/")[-1]
    path = re.sub(r"^\d+-", "", path)
    path = re.sub(r"\.html$", "", path)
    return slugify(path)


def best_assignment(assignments: list[dict[str, Any]]) -> dict[str, Any]:
    unique: list[dict[str, Any]] = []
    seen: set[tuple[str, str | None]] = set()

    for assignment in assignments:
        key = (assignment["top_slug"], assignment["sub_slug"])
        if key in seen:
            continue

        seen.add(key)
        unique.append(assignment)

    unique.sort(
        key=lambda assignment: (
            assignment["sub_slug"] is None,
            len(assignment["sub_slug"] or ""),
            assignment["top_slug"],
            assignment["sub_slug"] or "",
        ),
    )
    return unique[0]


def infer_brand(name: str, html: str) -> str:
    brand_match = re.search(r"\"brand\":\"\\?\"(.*?)\\?\"", html)
    if brand_match:
        brand = clean_html_text(brand_match.group(1))
        if brand:
            return brand

    upper_name = name.upper()
    for hint in BRAND_HINTS:
        if hint in upper_name:
            return hint

    return "Epicap"


def normalize_heading(value: str) -> str:
    return slugify(clean_html_text(value))


def texts_are_similar(left: str, right: str) -> bool:
    normalized_left = re.sub(r"\s+", " ", left).strip().lower()
    normalized_right = re.sub(r"\s+", " ", right).strip().lower()

    if not normalized_left or not normalized_right:
        return False

    return (
        normalized_left == normalized_right
        or normalized_left in normalized_right
        or normalized_right in normalized_left
    )


def extract_sections(html: str) -> dict[str, list[dict[str, str]]]:
    sections: dict[str, list[dict[str, str]]] = defaultdict(list)

    for match in SECTION_PATTERN.finditer(html):
        section_html = match.group(1)
        heading_match = re.search(
            r'<h3[^>]*class="page-product-heading"[^>]*>(.*?)</h3>',
            section_html,
            re.S | re.I,
        )
        if not heading_match:
            continue

        heading = clean_html_text(heading_match.group(1))
        if not heading:
            continue

        body = section_html[heading_match.end() :]
        sections[normalize_heading(heading)].append({"heading": heading, "body": body})

    return sections


def parse_specs(section_body: str) -> list[dict[str, str]]:
    table_match = re.search(
        r'<table class="table-data-sheet".*?</table>',
        section_body,
        re.S | re.I,
    )
    if not table_match:
        return []

    specs: list[dict[str, str]] = []
    for row_match in re.finditer(
        r"<tr[^>]*>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(.*?)</td>\s*</tr>",
        table_match.group(0),
        re.S | re.I,
    ):
        name = clean_html_text(row_match.group(1))
        value = clean_html_text(row_match.group(2))
        if not name or not value:
            continue

        specs.append({"name": name, "value": value})

    return specs


@lru_cache(maxsize=2048)
def probe_document(url: str) -> dict[str, str]:
    request = Request(url, headers={"User-Agent": USER_AGENT}, method="HEAD")
    with urlopen(request, timeout=20) as response:
        content_type = response.headers.get("Content-Type", "").split(";")[0].strip()
        disposition = response.headers.get("Content-Disposition", "")

    filename_match = re.search(r'filename="?([^";]+)"?', disposition)
    filename = unescape(filename_match.group(1)).strip() if filename_match else ""

    file_type = ""
    if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
        file_type = "PDF"
    elif content_type:
        file_type = content_type.split("/")[-1].upper()

    return {
        "fileName": filename,
        "fileType": file_type,
    }


def parse_documents(section_body: str, source_url: str) -> list[dict[str, str]]:
    documents: list[dict[str, str]] = []

    for block_match in re.finditer(r'<div class="col-lg-4">(.*?)<hr ?/?></div>', section_body, re.S | re.I):
        block = block_match.group(1)
        title_match = re.search(r'<h4>\s*<a href="([^"]+)">(.*?)</a>\s*</h4>', block, re.S | re.I)
        if not title_match:
            continue

        url = urljoin(source_url, unescape(title_match.group(1)))
        name = clean_html_text(title_match.group(2))
        description_match = re.search(r'<p class="text-muted">(.*?)</p>', block, re.S | re.I)
        description = clean_html_text(description_match.group(1)) if description_match else ""
        size_match = re.search(
            r'T(?:&eacute;|é)l(?:&eacute;|é)chargement \((.*?)\)',
            block,
            re.S | re.I,
        )
        size_label = clean_html_text(size_match.group(1)) if size_match else ""

        try:
            document_info = probe_document(url)
        except Exception:
            document_info = {"fileName": "", "fileType": ""}

        documents.append(
            {
                "name": name or document_info["fileName"] or "Documentation produit",
                "description": description,
                "url": url,
                "sizeLabel": size_label,
                "fileName": document_info["fileName"],
                "fileType": document_info["fileType"],
            }
        )

    return documents


def build_description(
    name: str,
    short_description: str,
    meta_description: str,
    sections: dict[str, list[dict[str, str]]],
) -> str:
    description_sections: list[str] = []
    for section in sections.get("en-savoir-plus", []):
        text = clean_rich_text(section["body"])
        if text:
            description_sections.append(text)

    long_description = "\n\n".join(description_sections).strip()
    fallback = short_description or meta_description or name
    if not long_description:
        return fallback

    if short_description and not texts_are_similar(short_description, long_description):
        return f"{short_description}\n\n{long_description}"

    return long_description


def main() -> None:
    homepage_html = fetch(BASE_URL)
    homepage_parser = LinkParser()
    homepage_parser.feed(homepage_html)

    category_urls: list[str] = []
    for href in homepage_parser.links:
        full_url = urljoin(BASE_URL, href)
        path = full_url.replace(BASE_URL, "")
        if not full_url.startswith(BASE_URL) or full_url.endswith(".html"):
            continue
        if re.match(r"\d+-", path):
            category_urls.append(full_url)

    category_urls = list(dict.fromkeys(category_urls))

    categories: dict[str, dict[str, Any]] = {}
    product_assignments: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for url in category_urls:
        html = fetch(url)

        current_match = re.search(r'class="cat-name">(.*?)</span>', html, re.S)
        current_name = clean_html_text(current_match.group(1)) if current_match else path_slug(url)
        current_slug = path_slug(url)

        description_match = re.search(r'<meta name="description" content="([^"]*)"', html)
        current_description = clean_html_text(description_match.group(1)) if description_match else ""

        breadcrumb_match = re.search(
            r'breadcrumb clearfix">(.*?)</div><div id="slider_row"',
            html,
            re.S,
        )
        breadcrumb_html = breadcrumb_match.group(1) if breadcrumb_match else ""
        parent_matches = re.findall(
            r'href="(https://epicap\.com/\d+-[^"]+)"[^>]*><span itemprop="title">(.*?)</span>',
            breadcrumb_html,
        )

        if parent_matches:
            top_url, top_name_raw = parent_matches[0]
            top_name = clean_html_text(top_name_raw)
            top_slug = path_slug(top_url)
        else:
            top_name = current_name
            top_slug = current_slug

        top_entry = categories.setdefault(
            top_slug,
            {
                "name": top_name,
                "shortName": SHORT_NAME_OVERRIDES.get(top_slug, top_name.split(" ")[0]),
                "slug": top_slug,
                "description": current_description,
                "subcategories": [],
            },
        )

        if not top_entry["description"] and current_slug == top_slug:
            top_entry["description"] = current_description

        if current_slug != top_slug:
            subcategory = {"name": current_name, "slug": current_slug}
            if subcategory not in top_entry["subcategories"]:
                top_entry["subcategories"].append(subcategory)

        link_parser = LinkParser()
        link_parser.feed(html)

        for href in link_parser.links:
            full_url = urljoin(url, href)
            if not full_url.startswith(BASE_URL) or not full_url.endswith(".html"):
                continue

            product_assignments[full_url].append(
                {
                    "top_name": top_name,
                    "top_slug": top_slug,
                    "sub_name": None if current_slug == top_slug else current_name,
                    "sub_slug": None if current_slug == top_slug else current_slug,
                }
            )

    product_urls = sorted(product_assignments)

    def parse_product(url: str) -> dict[str, Any]:
        html = fetch(url)
        assignment = best_assignment(product_assignments[url])
        sections = extract_sections(html)

        name_match = re.search(r'<h1 itemprop="name">(.*?)</h1>', html, re.S)
        name = clean_html_text(name_match.group(1)) if name_match else path_slug(url)

        sku_match = re.search(r'itemprop="sku"[^>]*>(.*?)</span>', html, re.S)
        sku = clean_html_text(sku_match.group(1)) if sku_match else ""

        meta_description_match = re.search(r'<meta name="description" content="([^"]*)"', html)
        meta_description = (
            clean_html_text(meta_description_match.group(1)) if meta_description_match else ""
        )

        short_description_match = re.search(
            r'id="short_description_content"[^>]*>(.*?)</div><p class="buttons_bottom_block">',
            html,
            re.S,
        )
        short_description = (
            clean_html_text(short_description_match.group(1))
            if short_description_match
            else ""
        )

        if slugify(short_description) == slugify(name) or len(short_description) < 12:
            short_description = meta_description or short_description or name

        description = build_description(name, short_description, meta_description, sections)
        specs = parse_specs(sections.get("fiche-technique", [{}])[0].get("body", ""))
        documents = parse_documents(sections.get("telechargement", [{}])[0].get("body", ""), url)

        price_match = re.search(r'itemprop="price" content="([0-9]+(?:\.[0-9]+)?)"', html)
        price = float(price_match.group(1)) if price_match else 0.0

        availability = "InStock" in html

        image_match = re.search(r'id="bigpic"[^>]+src="([^"]+)"', html)
        image = urljoin(url, image_match.group(1)) if image_match else "/placeholder.jpg"

        images: list[str] = []
        for source in re.findall(
            r"https://epicap\.com/[^\"']+?(?:large_default|thickbox_default)[^\"']+",
            html,
        ):
            if source not in images:
                images.append(source)

        if not images and image:
            images = [image]

        local_slug = path_slug(url)
        rentable = assignment["top_slug"].startswith(
            "location-et-maintenance"
        ) or any(keyword in local_slug for keyword in RENTABLE_KEYWORDS)

        return {
            "sku": sku or local_slug.upper(),
            "slug": local_slug,
            "name": name,
            "shortDescription": short_description or name,
            "description": description,
            "price": price,
            "categorySlug": assignment["top_slug"],
            "categoryName": assignment["top_name"],
            "subcategorySlug": assignment["sub_slug"],
            "brand": infer_brand(name, html),
            "image": image,
            "images": images,
            "inStock": availability,
            "stockQuantity": 999 if availability else 0,
            "isRentable": rentable,
            "badge": "Location" if rentable else None,
            "specs": specs,
            "documents": documents,
            "sourceUrl": url,
        }

    products: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(parse_product, url): url for url in product_urls}
        for future in as_completed(futures):
            products.append(future.result())

    products.sort(key=lambda item: (item["categorySlug"], item["subcategorySlug"] or "", item["name"]))

    featured_counts: dict[str, int] = defaultdict(int)
    for index, product in enumerate(products, start=1):
        product["id"] = index

        if featured_counts[product["categorySlug"]] < 2:
            product["isFeatured"] = True
            featured_counts[product["categorySlug"]] += 1

    payload = {
        "categories": list(categories.values()),
        "products": products,
    }

    OUTPUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    document_count = sum(len(product["documents"]) for product in products)
    spec_count = sum(1 for product in products if product["specs"])
    print(f"Generated {len(products)} products across {len(categories)} categories")
    print(f"Structured specs on {spec_count} products, documents on {document_count} files")
    print(f"Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
