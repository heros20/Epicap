import type { QuoteRequestInput } from "@/lib/commerce/request-validation"
import {
  formatDepartmentOptionLabel,
  getAgencyForDepartmentCode,
  getAgencyLabelForDepartmentCode,
  getDepartmentByCode,
} from "@/lib/data/agency-departments"

interface QuoteEmailLine {
  sku: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  isRental: boolean
  rentalDays: number | null
}

interface QuoteEmailPricing {
  subtotal: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  total: number
  logisticsMode: "estimated" | "manual"
  hasQuoteOnlyItems: boolean
}

export interface QuoteEmailDelivery {
  recipient: string
  recipients: string[]
  provider: "resend" | "development"
  messageId: string | null
}

interface SendQuoteRequestEmailOptions {
  reference: string
  form: QuoteRequestInput
  customerLabel: string
  lines: QuoteEmailLine[]
  pricing: QuoteEmailPricing
}

const defaultRecipient = "herosqwerty@gmail.com"
const defaultFrom = "Epicap <onboarding@resend.dev>"
const resendTestDomain = "@resend.dev"
const fallbackValues = new Set(["", "Non renseigné", "À confirmer", "À préciser"])

const requestTypeLabels: Record<QuoteRequestInput["requestType"], string> = {
  purchase: "Achat",
  rental: "Location",
  maintenance: "Maintenance",
  "fit-test": "FIT TEST",
  mixed: "Mixte",
}

const customerTypeLabels: Record<QuoteRequestInput["customerType"], string> = {
  company: "Entreprise",
  individual: "Particulier",
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

function formatValue(value: string | number | null | undefined, fallback = "Non renseigné") {
  const normalized = String(value ?? "").trim()
  return normalized.length > 0 ? normalized : fallback
}

function hasDisplayValue(value: string | number | null | undefined) {
  const normalized = formatValue(value).trim()
  return !fallbackValues.has(normalized)
}

function buildInfoRow(label: string, value: string | number | null | undefined) {
  return `
    <tr>
      <td style="padding:8px 0;color:#64748b;font-size:13px;width:180px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(formatValue(value))}</td>
    </tr>
  `
}

function buildOptionalInfoRow(label: string, value: string | number | null | undefined) {
  return hasDisplayValue(value) ? buildInfoRow(label, value) : ""
}

function buildTextLine(label: string, value: string | number | null | undefined) {
  return hasDisplayValue(value) ? `${label}: ${formatValue(value)}` : null
}

function compactTextLines(lines: Array<string | null>) {
  return lines.filter((line): line is string => Boolean(line))
}

function getEmailRecipients(primaryRecipient: string, requestedDepartment: string) {
  const selectedAgency = getAgencyForDepartmentCode(requestedDepartment)
  const recipients = [primaryRecipient, selectedAgency?.email]
    .filter((email): email is string => Boolean(email?.trim()))
    .map((email) => email.trim())

  return Array.from(new Set(recipients))
}

function buildLineRows(lines: QuoteEmailLine[]) {
  if (lines.length === 0) {
    return `
      <tr>
        <td colspan="5" style="padding:14px;border-top:1px solid #e2e8f0;color:#64748b;font-size:14px;">
          Aucun article catalogue joint. Le besoin est décrit dans le message client.
        </td>
      </tr>
    `
  }

  return lines
    .map(
      (line) => `
        <tr>
          <td style="padding:12px 10px;border-top:1px solid #e2e8f0;font-size:13px;color:#0f172a;">
            <strong>${escapeHtml(line.name)}</strong><br />
            <span style="color:#64748b;">${escapeHtml(line.sku)}</span>
            ${
              line.description
                ? `<br /><span style="color:#64748b;">${escapeHtml(line.description)}</span>`
                : ""
            }
          </td>
          <td style="padding:12px 10px;border-top:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:center;">
            ${escapeHtml(line.quantity)}
          </td>
          <td style="padding:12px 10px;border-top:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:center;">
            ${line.isRental ? `Location ${escapeHtml(line.rentalDays ?? 1)} j` : "Vente"}
          </td>
          <td style="padding:12px 10px;border-top:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;">
            ${escapeHtml(formatPrice(line.unitPrice))}
          </td>
          <td style="padding:12px 10px;border-top:1px solid #e2e8f0;font-size:13px;color:#0f172a;text-align:right;font-weight:700;">
            ${escapeHtml(formatPrice(line.totalPrice))}
          </td>
        </tr>
      `,
    )
    .join("")
}

function buildQuoteRequestEmailHtml(options: SendQuoteRequestEmailOptions) {
  const { reference, form, customerLabel, lines, pricing } = options
  const requestedDepartment = getDepartmentByCode(form.requestedDepartment)
  const requestedAgencyLabel = getAgencyLabelForDepartmentCode(form.requestedDepartment)
  const messageBlock = hasDisplayValue(form.message)
    ? `<div style="margin:0 0 24px;padding:14px 16px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;color:#0f172a;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(
        formatValue(form.message),
      )}</div>`
    : ""

  return `
    <div style="margin:0;padding:0;background:#f7f8fa;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:760px;margin:0 auto;padding:28px 16px;">
        <div style="background:#ffffff;border:1px solid #e8ebef;border-radius:10px;overflow:hidden;">
          <div style="height:8px;background:#ff851c;"></div>
          <div style="background:#0f1012;color:#ffffff;padding:24px 26px;">
            <p style="margin:0 0 14px;font-size:24px;line-height:1;font-weight:800;letter-spacing:0;color:#ffffff;">
              <span style="color:#ff851c;">EPI</span>CAP
            </p>
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#ffbf86;">Nouvelle demande de devis</p>
            <h1 style="margin:0;font-size:25px;line-height:1.25;color:#ffffff;">${escapeHtml(reference)}</h1>
            <p style="margin:10px 0 0;color:#f7f8fa;font-size:14px;">Demande à traiter par l'équipe Epicap. La trace est aussi disponible dans le tableau de bord Epicap.</p>
          </div>

          <div style="padding:24px;">
            <h2 style="margin:0 0 12px;font-size:18px;color:#0f1012;border-left:4px solid #ff851c;padding-left:10px;">Coordonnées client</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:24px;">
              ${buildInfoRow("Profil", customerTypeLabels[form.customerType])}
              ${buildOptionalInfoRow("Société", form.customerType === "company" ? customerLabel : null)}
              ${buildInfoRow("Contact", form.contactName)}
              ${buildInfoRow("E-mail", form.contactEmail)}
              ${buildInfoRow("Téléphone", form.contactPhone)}
              ${buildInfoRow("Département", requestedDepartment ? formatDepartmentOptionLabel(requestedDepartment) : form.requestedDepartment)}
              ${buildInfoRow("Agence Epicap", requestedAgencyLabel)}
            </table>

            <h2 style="margin:0 0 12px;font-size:18px;color:#0f1012;border-left:4px solid #ff851c;padding-left:10px;">Besoin</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:16px;">
              ${buildInfoRow("Type de demande", requestTypeLabels[form.requestType])}
              ${buildOptionalInfoRow("Durée de location", form.rentalDays ? `${form.rentalDays} jour(s)` : null)}
              ${buildOptionalInfoRow("Origine", form.contextLabel || form.sourcePage)}
              ${buildOptionalInfoRow("Produit catalogue", form.productSlug)}
            </table>
            ${messageBlock}

            <h2 style="margin:0 0 12px;font-size:18px;color:#0f1012;border-left:4px solid #ff851c;padding-left:10px;">Articles joints</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e8ebef;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <thead>
                <tr style="background:#0f1012;">
                  <th align="left" style="padding:10px;font-size:12px;color:#ffffff;">Article</th>
                  <th align="center" style="padding:10px;font-size:12px;color:#ffffff;">Qt.</th>
                  <th align="center" style="padding:10px;font-size:12px;color:#ffffff;">Mode</th>
                  <th align="right" style="padding:10px;font-size:12px;color:#ffffff;">PU</th>
                  <th align="right" style="padding:10px;font-size:12px;color:#ffffff;">Total</th>
                </tr>
              </thead>
              <tbody>${buildLineRows(lines)}</tbody>
            </table>

            <h2 style="margin:0 0 12px;font-size:18px;color:#0f1012;border-left:4px solid #ff851c;padding-left:10px;">Estimation indicative</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#fff7ef;border:1px solid #ffd6b3;border-radius:8px;">
              ${buildInfoRow("Sous-total", formatPrice(pricing.subtotal))}
              ${buildInfoRow("Remise", pricing.discountAmount > 0 ? `-${formatPrice(pricing.discountAmount)}` : "Aucune")}
              ${buildInfoRow("Logistique", pricing.logisticsMode === "manual" ? "À confirmer" : formatPrice(pricing.shippingAmount))}
              ${buildInfoRow("TVA", formatPrice(pricing.taxAmount))}
              ${buildInfoRow("Montant estimé", pricing.hasQuoteOnlyItems ? "À préciser" : formatPrice(pricing.total))}
            </table>
          </div>
        </div>
      </div>
    </div>
  `
}

function buildQuoteRequestEmailText(options: SendQuoteRequestEmailOptions) {
  const { reference, form, customerLabel, lines, pricing } = options
  const requestedDepartment = getDepartmentByCode(form.requestedDepartment)
  const requestedAgencyLabel = getAgencyLabelForDepartmentCode(form.requestedDepartment)
  const customerLines = compactTextLines([
    `Profil: ${customerTypeLabels[form.customerType]}`,
    buildTextLine("Société", form.customerType === "company" ? customerLabel : null),
    `Contact: ${form.contactName}`,
    `E-mail: ${form.contactEmail}`,
    `Téléphone: ${form.contactPhone}`,
    `Type: ${requestTypeLabels[form.requestType]}`,
    `Département: ${requestedDepartment ? formatDepartmentOptionLabel(requestedDepartment) : form.requestedDepartment}`,
    `Agence Epicap: ${requestedAgencyLabel}`,
    buildTextLine("Durée de location", form.rentalDays ? `${form.rentalDays} jour(s)` : null),
    buildTextLine("Origine", form.contextLabel || form.sourcePage),
    buildTextLine("Produit catalogue", form.productSlug),
  ])
  const messageLines = hasDisplayValue(form.message)
    ? ["", "Message client:", formatValue(form.message)]
    : []
  const itemLines =
    lines.length > 0
      ? lines
          .map(
            (line) =>
              `- ${line.name} (${line.sku}) x${line.quantity} - ${
                line.isRental ? `location ${line.rentalDays ?? 1} j` : "vente"
              } - ${formatPrice(line.totalPrice)}`,
          )
          .join("\n")
      : "Aucun article catalogue joint."

  return [
    `Nouvelle demande de devis ${reference}`,
    "Demande à traiter par l'équipe Epicap. La trace est aussi disponible dans le tableau de bord Epicap.",
    "",
    ...customerLines,
    ...messageLines,
    "",
    "Articles:",
    itemLines,
    "",
    "Estimation indicative:",
    `Sous-total: ${formatPrice(pricing.subtotal)}`,
    `Remise: ${pricing.discountAmount > 0 ? `-${formatPrice(pricing.discountAmount)}` : "Aucune"}`,
    `Logistique: ${pricing.logisticsMode === "manual" ? "À confirmer" : formatPrice(pricing.shippingAmount)}`,
    `TVA: ${formatPrice(pricing.taxAmount)}`,
    `Montant estimé: ${pricing.hasQuoteOnlyItems ? "À préciser" : formatPrice(pricing.total)}`,
  ].join("\n")
}

export async function sendQuoteRequestEmail(
  options: SendQuoteRequestEmailOptions,
): Promise<QuoteEmailDelivery> {
  const recipient = process.env.EPICAP_QUOTE_EMAIL?.trim() || defaultRecipient
  const recipients = getEmailRecipients(recipient, options.form.requestedDepartment)
  const from = process.env.RESEND_FROM_EMAIL?.trim() || defaultFrom
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!apiKey) {
    throw new Error(
      `RESEND_API_KEY est absent. Email ${options.reference} non envoyé à ${recipients.join(", ")}.`,
    )
  }

  if (process.env.NODE_ENV === "production" && from.toLowerCase().includes(resendTestDomain)) {
    throw new Error(
      "RESEND_FROM_EMAIL doit utiliser un domaine vérifié en production, pas onboarding@resend.dev.",
    )
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      reply_to: options.form.contactEmail,
      subject: `Demande de devis Epicap ${options.reference} - ${options.customerLabel}`,
      html: buildQuoteRequestEmailHtml(options),
      text: buildQuoteRequestEmailText(options),
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Le service d’envoi a refusé la demande de devis (${response.status}) : ${errorBody}`,
    )
  }

  const payload = (await response.json()) as { id?: string }

  return {
    recipient,
    recipients,
    provider: "resend",
    messageId: payload.id ?? null,
  }
}
