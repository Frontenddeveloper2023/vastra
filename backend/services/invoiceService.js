/**
 * Puppeteer Invoice PDF Generator Service
 * Professional Modern E-Commerce Tax Invoice Layout (Matching user template exactly):
 * - Top Left: Bold "INVOICE" header + "Invoice ID: ORD-..."
 * - Top Right: Brand Logo (from Admin Settings)
 * - Two Column Seller & Customer details:
 *     Left: SOLD BY (Store Name, Address, Email, Phone, GSTIN if enabled)
 *     Right: SHIPPING ADDRESS (Customer Name, Street, City, State, Pincode)
 * - Horizontal hairline divider
 * - Meta info row:
 *     Left: ISSUED ON (e.g. 6 July 2026)
 *     Right: ORDER ID (e.g. ORD-5503-864729)
 * - Modern dark navy table header (#0A364F / #0d3852):
 *     S.NO | ITEM DESCRIPTION | QUANTITY | UNIT PRICE | TOTAL PRICE
 * - Item rows with clean variants (color, size, material)
 * - Financial summary breakdown on right:
 *     Subtotal: Rs. X
 *     GST: Rs. Y (or breakdown)
 *     Shipping: Rs. Z
 *     ---
 *     Total Amount: Rs. TOTAL
 * - Authorized Signature section at bottom right (conditional on upload)
 */

import puppeteer from 'puppeteer'
import Setting from '../models/Setting.js'
import Order from '../models/Order.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Format Date as e.g. "6 July 2026"
 */
function formatIssuedDate(dateValue) {
  if (!dateValue) return ''
  try {
    const d = new Date(dateValue)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

/**
 * Format Currency: 1,800.00
 */
function formatCurrency(val) {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Build Exact Modern Invoice Layout HTML matching the uploaded design
 */
function buildInvoiceHtml(order, settings, logoBase64, signatureBase64) {
  const storeName = settings?.storeName || 'Vastraa E-Commerce Inc.'
  const atelierAddress =
    settings?.atelierAddress ||
    'Plot No 1, 3rd Street, Tambaram, Urapakkam, Chennai - 603 210'
  const contactEmail = settings?.contactEmail || ''
  const supportPhone = settings?.supportPhone || ''

  const isGstEnabled = Boolean(settings?.gst?.enabled)
  const gstNumber = settings?.gst?.gstNumber?.trim() || ''

  const orderId = order.orderId || order._id
  const issuedDateFormatted = formatIssuedDate(order.createdAt)

  // Order status check for security watermark
  // When delivered: no watermark (official final tax invoice)
  // When not delivered (e.g. Shipped, On process): show subtle diagonal anti-misuse watermark
  const statusStr = String(order.status || '').toLowerCase().trim()
  const isDelivered = statusStr === 'delivered'
  let watermarkText = ''
  if (!isDelivered) {
    if (statusStr.includes('ship')) {
      watermarkText = 'IN TRANSIT / SHIPPED'
    } else if (statusStr.includes('cancel')) {
      watermarkText = 'CANCELLED / VOID'
    } else if (statusStr.includes('return')) {
      watermarkText = 'RETURNED'
    } else {
      watermarkText = 'ORDER IN PROCESS'
    }
  }

  // Customer / Shipping Address
  const shipAddr = order.shippingAddress || {}
  const custInfo = order.customerInfo || {}
  const customerName = shipAddr.name || custInfo.name || 'Customer'
  const street = shipAddr.street || ''
  const landmark = shipAddr.landmark ? `, ${shipAddr.landmark}` : ''
  const city = shipAddr.city || ''
  const state = shipAddr.state || ''
  const pincode = shipAddr.pincode || ''

  // Pricing
  const pricing = order.pricing || {}
  const subtotal = Number(pricing.subtotal || order.subtotal || 0)
  const shippingFee = Number(pricing.shippingFee || 0)
  const gstPercentage = isGstEnabled ? Number(pricing.gstPercentage || settings?.gst?.percentage || 5) : 0

  // Calculate GST amount accurately:
  // If stored on pricing.gstAmount, use it; otherwise compute based on (subtotal * gstPercentage / 100)
  let gstAmount = 0
  if (isGstEnabled && gstPercentage > 0) {
    if (pricing.gstAmount !== undefined && pricing.gstAmount !== null && Number(pricing.gstAmount) > 0) {
      gstAmount = Number(pricing.gstAmount)
    } else {
      gstAmount = Math.round((subtotal * gstPercentage) / 100)
    }
  }

  // Final Total: use stored finalTotal or calculate if needed
  let finalTotal = Number(pricing.finalTotal || order.total || 0)
  if (finalTotal === 0 && subtotal > 0) {
    finalTotal = subtotal + gstAmount + shippingFee
  }

  const items = order.items || []

  // Build items rows
  const itemsRows = items
    .map((item, idx) => {
      const qty = Number(item.quantity || 1)
      const unitPrice = Number(item.price || 0)
      const lineTotal = unitPrice * qty

      const variantParts = []
      if (item.color) variantParts.push(`color: ${item.color}`)
      if (item.size) variantParts.push(`size: ${item.size}`)
      if (item.material) variantParts.push(`material: ${item.material}`)
      if (item.design) variantParts.push(`design: ${item.design}`)
      const variantsText = variantParts.join(', ')

      return `
        <tr>
          <td class="col-sno">${idx + 1}</td>
          <td class="col-desc">
            <div class="item-title">${item.title}</div>
            ${variantsText ? `<div class="item-sub">${variantsText}</div>` : ''}
          </td>
          <td class="col-qty">${qty}</td>
          <td class="col-unit">Rs. ${formatCurrency(unitPrice)}</td>
          <td class="col-total">Rs. ${formatCurrency(lineTotal)}</td>
        </tr>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${orderId}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1F1713;
          background: #FFFFFF;
          padding: 32px 38px;
          font-size: 13px;
          line-height: 1.45;
        }
        .invoice-container {
          max-width: 820px;
          margin: 0 auto;
          position: relative;
        }

        /* Diagonal Security Watermark (Hidden when order is Delivered) */
        .watermark-overlay {
          position: fixed;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-32deg);
          font-size: 54px;
          font-weight: 900;
          letter-spacing: 4px;
          color: rgba(109, 2, 27, 0.08); /* Subtle brand maroon tone */
          border: 4px dashed rgba(109, 2, 27, 0.12);
          padding: 14px 44px;
          border-radius: 12px;
          text-align: center;
          text-transform: uppercase;
          pointer-events: none;
          z-index: 999;
          white-space: nowrap;
          font-family: Arial, sans-serif;
        }

        /* Header Row */
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 28px;
        }
        .header-table td {
          vertical-align: top;
        }
        .main-invoice-title {
          font-size: 28px;
          font-weight: 800;
          color: #6D021B;
          letter-spacing: -0.5px;
          line-height: 1.1;
          font-family: "Playfair Display", Georgia, serif;
        }
        .invoice-id-line {
          font-size: 13.5px;
          font-weight: 600;
          color: #78716C;
          margin-top: 6px;
        }
        .invoice-id-line strong {
          color: #1F1713;
          font-weight: 700;
        }

        .header-logo-td {
          text-align: right;
        }
        .top-logo {
          max-height: 58px;
          max-width: 180px;
          object-fit: contain;
          display: inline-block;
        }

        /* Sold By & Shipping Address Grid */
        .parties-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        .parties-table td {
          vertical-align: top;
          width: 50%;
        }
        .parties-heading {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #8C7B75;
          margin-bottom: 8px;
        }
        .party-name {
          font-size: 14px;
          font-weight: 700;
          color: #1F1713;
          margin-bottom: 5px;
        }
        .party-details {
          font-size: 12.5px;
          color: #574F4A;
          line-height: 1.45;
        }
        .party-details span {
          display: block;
        }

        /* Divider */
        .section-divider {
          border: 0;
          height: 1px;
          background: #E7E5E4;
          margin-bottom: 20px;
        }

        /* Issued On / Order Id Metadata */
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 22px;
        }
        .meta-table td {
          vertical-align: top;
          width: 50%;
        }
        .meta-label {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #8C7B75;
          margin-bottom: 4px;
        }
        .meta-value {
          font-size: 13.5px;
          font-weight: 700;
          color: #1F1713;
        }

        /* Main Table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border: 1px solid #E7E5E4;
        }
        .items-table th {
          background-color: #6D021B;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 10px 12px;
          border: 1px solid #6D021B;
        }
        .items-table td {
          border: 1px solid #E7E5E4;
          padding: 12px;
          font-size: 12.5px;
          color: #292524;
        }
        .col-sno {
          width: 7%;
          text-align: center;
          vertical-align: middle;
          font-weight: 500;
        }
        .col-desc {
          width: 47%;
          text-align: left;
          vertical-align: middle;
        }
        .item-title {
          font-weight: 700;
          color: #1F1713;
          font-size: 13px;
          line-height: 1.35;
        }
        .item-sub {
          font-size: 11.5px;
          color: #78716C;
          margin-top: 4px;
        }
        .col-qty {
          width: 12%;
          text-align: center;
          vertical-align: middle;
          font-weight: 700;
          color: #1F1713;
        }
        .col-unit {
          width: 17%;
          text-align: center;
          vertical-align: middle;
          color: #574F4A;
        }
        .col-total {
          width: 17%;
          text-align: right;
          vertical-align: middle;
          font-weight: 700;
          color: #1F1713;
        }

        /* Summary Calculations Block */
        .calc-wrapper {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }
        .calc-table {
          width: 320px;
          border-collapse: collapse;
          margin-left: auto;
        }
        .calc-table td {
          padding: 4px 0;
          font-size: 13px;
        }
        .calc-label {
          text-align: right;
          color: #78716C;
          font-weight: 600;
          padding-right: 18px !important;
          width: 50%;
        }
        .calc-value {
          text-align: right;
          color: #1F1713;
          font-weight: 700;
          width: 50%;
          white-space: nowrap;
        }
        .calc-divider {
          border-bottom: 1px solid #E7E5E4;
          padding-bottom: 10px !important;
        }
        .total-amount-row td {
          padding-top: 12px;
          font-size: 15px;
        }
        .total-amount-row .calc-label {
          font-size: 15px;
          font-weight: 800;
          color: #6D021B;
        }
        .total-amount-row .calc-value {
          font-size: 16px;
          font-weight: 800;
          color: #6D021B;
        }

        /* Signature Block */
        .signature-wrapper {
          margin-top: 28px;
          text-align: right;
          float: right;
          width: 260px;
        }
        .signature-box {
          text-align: center;
          display: inline-block;
          min-width: 190px;
        }
        .signature-img {
          max-height: 52px;
          max-width: 160px;
          object-fit: contain;
          display: block;
          margin: 0 auto 6px auto;
        }
        .sig-line {
          border-top: 1px solid #A8A29E;
          width: 100%;
          margin-bottom: 6px;
        }
        .sig-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #78716C;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">

        <!-- Anti-Misuse Security Watermark (Only active when order is not yet Delivered) -->
        ${
          watermarkText
            ? `
          <div class="watermark-overlay">
            ${watermarkText}
          </div>
        `
            : ''
        }

        <!-- Top Header: INVOICE title vs Brand Logo -->
        <table class="header-table">
          <tr>
            <td>
              <div class="main-invoice-title">INVOICE</div>
              <div class="invoice-id-line">Invoice ID: <strong>${orderId}</strong></div>
            </td>
            <td class="header-logo-td">
              ${
                logoBase64
                  ? `<img src="${logoBase64}" alt="${storeName}" class="top-logo" />`
                  : `<div style="font-size: 24px; font-weight: bold; font-family: Georgia, serif; color: #6D021B;">${storeName}</div>`
              }
            </td>
          </tr>
        </table>

        <!-- Two Column Seller vs Buyer Address -->
        <table class="parties-table">
          <tr>
            <!-- SOLD BY -->
            <td>
              <div class="parties-heading">SOLD BY</div>
              <div class="party-name">${storeName}</div>
              <div class="party-details">
                <span>${atelierAddress}</span>
                ${contactEmail ? `<span>${contactEmail}</span>` : ''}
                ${supportPhone ? `<span>${supportPhone}</span>` : ''}
                ${isGstEnabled && gstNumber ? `<span>GSTIN: <strong>${gstNumber}</strong></span>` : ''}
              </div>
            </td>

            <!-- SHIPPING ADDRESS -->
            <td>
              <div class="parties-heading">SHIPPING ADDRESS</div>
              <div class="party-name">${customerName}</div>
              <div class="party-details">
                ${street ? `<span>${street}${landmark}</span>` : ''}
                <span>${[city, state].filter(Boolean).join(', ')}${pincode ? ` - ${pincode}` : ''}</span>
              </div>
            </td>
          </tr>
        </table>

        <div class="section-divider"></div>

        <!-- ISSUED ON vs ORDER ID -->
        <table class="meta-table">
          <tr>
            <td>
              <div class="meta-label">ISSUED ON</div>
              <div class="meta-value">${issuedDateFormatted}</div>
            </td>
            <td>
              <div class="meta-label">ORDER ID</div>
              <div class="meta-value">${orderId}</div>
            </td>
          </tr>
        </table>

        <!-- Itemized Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 7%; text-align: center;">S.NO</th>
              <th style="width: 47%; text-align: left;">ITEM DESCRIPTION</th>
              <th style="width: 12%; text-align: center;">QUANTITY</th>
              <th style="width: 17%; text-align: center;">UNIT PRICE</th>
              <th style="width: 17%; text-align: right;">TOTAL PRICE</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Calculation Breakdown on Right -->
        <div class="calc-wrapper">
          <table class="calc-table">
            <tr>
              <td class="calc-label">Subtotal:</td>
              <td class="calc-value">Rs. ${formatCurrency(subtotal)}</td>
            </tr>
            ${
              isGstEnabled
                ? `
              <tr>
                <td class="calc-label">GST (${gstPercentage}%):</td>
                <td class="calc-value">Rs. ${formatCurrency(gstAmount)}</td>
              </tr>
            `
                : ''
            }
            <tr>
              <td class="calc-label calc-divider">Shipping:</td>
              <td class="calc-value calc-divider">Rs. ${formatCurrency(shippingFee)}</td>
            </tr>
            <tr class="total-amount-row">
              <td class="calc-label">Total Amount:</td>
              <td class="calc-value">Rs. ${formatCurrency(finalTotal)}</td>
            </tr>
          </table>
        </div>

        <!-- Authorized Signature (if uploaded) -->
        ${
          signatureBase64
            ? `
          <div class="signature-wrapper">
            <div class="signature-box">
              <img src="${signatureBase64}" alt="Authorized Signature" class="signature-img" />
              <div class="sig-line"></div>
              <div class="sig-label">AUTHORIZED SIGNATURE</div>
            </div>
          </div>
        `
            : ''
        }

      </div>
    </body>
    </html>
  `
}

/**
 * Main Export: Generate PDF binary buffer using Puppeteer
 */
export async function generateOrderInvoicePdf(orderId) {
  // 1. Fetch order and settings
  const order = await Order.findOne({
    $or: [{ orderId: orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }],
  })

  if (!order) {
    throw new Error('Order not found')
  }

  const settings = await Setting.findOne().sort({ createdAt: -1 })

  // 2. Resolve logo into base64 data URI so Puppeteer embeds it offline cleanly
  let logoBase64 = ''
  if (settings?.logoUrl) {
    const cleanRel = settings.logoUrl.replace(/^\/?uploads\//, '')
    const localLogoPath = path.join(__dirname, '../public/uploads', cleanRel)
    if (fs.existsSync(localLogoPath)) {
      const ext = path.extname(localLogoPath).toLowerCase().replace('.', '')
      const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg'
      const b64 = fs.readFileSync(localLogoPath).toString('base64')
      logoBase64 = `data:${mime};base64,${b64}`
    }
  }

  // Fallback to default logo if none uploaded
  if (!logoBase64) {
    const defaultLogoPath = path.join(__dirname, '../../front-end/public/slides/logo.png')
    if (fs.existsSync(defaultLogoPath)) {
      const b64 = fs.readFileSync(defaultLogoPath).toString('base64')
      logoBase64 = `data:image/png;base64,${b64}`
    }
  }

  // 3. Resolve signature into base64 data URI (ONLY if uploaded by admin)
  let signatureBase64 = ''
  if (settings?.signatureUrl) {
    const cleanSigRel = settings.signatureUrl.replace(/^\/?uploads\//, '')
    const localSigPath = path.join(__dirname, '../public/uploads', cleanSigRel)
    if (fs.existsSync(localSigPath)) {
      const ext = path.extname(localSigPath).toLowerCase().replace('.', '')
      const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg'
      const b64 = fs.readFileSync(localSigPath).toString('base64')
      signatureBase64 = `data:${mime};base64,${b64}`
    }
  }

  // 4. Render HTML
  const htmlContent = buildInvoiceHtml(order, settings, logoBase64, signatureBase64)

  // 5. Launch Puppeteer in headless mode
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '14mm',
        bottom: '14mm',
        left: '12mm',
        right: '12mm',
      },
    })

    return {
      pdfBuffer,
      filename: `Invoice-${order.orderId || order._id}.pdf`,
    }
  } finally {
    await browser.close()
  }
}
