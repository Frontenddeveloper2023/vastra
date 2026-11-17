/**
 * Professional E-Commerce Tax Invoice & Printable PDF Utility
 * Modeled after Amazon India & Flipkart GST Tax Invoices.
 *
 * Features:
 * - Dynamic Brand Logo from Admin Settings (or fallback)
 * - GST Compliant Invoice Header (Seller Details, GSTIN, State code)
 * - Buyer Billing & Delivery Addresses
 * - Order ID, Invoice Number, Invoice Date & Shipping Date
 * - Itemized Table with Saree Name, Color/Fabric Variants, HSN, Qty, Rate, Taxable Value, GST & Total
 * - Payment Method & Transaction ID
 * - Dynamic Status Handling (Shipped/Delivered, Cancelled Void Slip, Returned Credit Note)
 * - Dedicated clean printable window triggering auto print / Save-as-PDF
 */

import { getCmsImageUrl } from './imageHelper'
import { formatIndianDate, formatIndianDateTime } from './dateHelper'

export function generateInvoiceHtml(order, settings) {
  if (!order) return ''

  const storeName = settings?.storeName || 'Vastraa - The House of Sarees'
  const cleanBrandName = storeName.split('-')[0].trim().toUpperCase()
  const supportPhone = settings?.supportPhone || '+91 9807738888'
  const contactEmail = settings?.contactEmail || 'vastraa@gmail.com'
  const atelierAddress =
    settings?.atelierAddress || 'Plot No 1, 3rd Street, Tambaram, Urapakkam, Chennai - 603 210, Tamil Nadu'

  // Dynamic Logo from Admin Settings: Convert relative to absolute URL so popup/print sees it
  let logoSrc = ''
  if (settings?.logoUrl) {
    const raw = getCmsImageUrl(settings.logoUrl)
    if (raw.startsWith('http')) {
      logoSrc = raw
    } else {
      logoSrc = window.location.origin + (raw.startsWith('/') ? '' : '/') + raw
    }
  } else {
    logoSrc = window.location.origin + '/slides/logo.png'
  }

  const orderId = order.orderId || order._id
  const orderDate = formatIndianDate(order.createdAt)
  const orderDateTime = formatIndianDateTime(order.createdAt)
  const invoiceNo = `INV-${String(orderId).replace(/^OD-?/i, '')}`

  // Determine invoice type and watermark based on order status (Amazon/Flipkart logic)
  const status = String(order.status || 'On process')
  const isCancelled = status.toLowerCase().includes('cancel')
  const isReturned = status.toLowerCase().includes('return')
  const isShipped = status.toLowerCase().includes('ship') || status.toLowerCase().includes('deliver')

  let invoiceTitle = 'TAX INVOICE'
  let watermarkText = ''
  let statusBannerColor = '#15803D' // green
  let statusBadgeText = 'COMPLETED / PAID'

  if (isCancelled) {
    invoiceTitle = 'TAX INVOICE (CANCELLED - VOID)'
    watermarkText = 'CANCELLED'
    statusBannerColor = '#B91C1C' // red
    statusBadgeText = 'ORDER CANCELLED - REFUND PROCESSED'
  } else if (isReturned) {
    invoiceTitle = 'TAX INVOICE & CREDIT MEMO'
    watermarkText = 'RETURNED'
    statusBannerColor = '#7C3AED' // purple
    statusBadgeText = 'PRODUCT RETURNED - CREDIT APPLIED'
  } else if (!isShipped) {
    invoiceTitle = 'ORDER SUMMARY & TAX ESTIMATE'
    watermarkText = 'PRE-DISPATCH'
    statusBannerColor = '#B45309' // amber
    statusBadgeText = 'PROCESSING (PRE-DISPATCH)'
  }

  // Address
  const shipAddr = order.shippingAddress || {}
  const custInfo = order.customerInfo || {}
  const customerName = shipAddr.name || custInfo.name || 'Valued Customer'
  const customerPhone = shipAddr.phone || custInfo.phone || ''
  const customerEmail = custInfo.email || ''
  const street = shipAddr.street || ''
  const landmark = shipAddr.landmark ? `, ${shipAddr.landmark}` : ''
  const city = shipAddr.city || ''
  const state = shipAddr.state || 'Tamil Nadu'
  const pincode = shipAddr.pincode || ''

  // Pricing
  const pricing = order.pricing || {}
  const subtotal = Number(pricing.subtotal || 0)
  const shippingFee = Number(pricing.shippingFee || 0)
  const discount = Number(pricing.discount || 0)
  const finalTotal = Number(pricing.finalTotal || order.total || 0)
  const gstPercentage = Number(pricing.gstPercentage || settings?.gst?.percentage || 5)
  const gstAmount = Number(pricing.gstAmount || 0)

  // Break items
  const items = order.items || []
  const itemsRows = items
    .map((item, idx) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 1)
      const variants = [item.color, item.material, item.design].filter(Boolean).join(' • ')
      return `
        <tr>
          <td style="text-align: center; border-bottom: 1px solid #E5E7EB; padding: 10px 8px;">${idx + 1}</td>
          <td style="border-bottom: 1px solid #E5E7EB; padding: 10px 8px;">
            <div style="font-weight: 700; color: #111827; font-size: 13px;">${item.title || 'Handcrafted Luxury Saree'}</div>
            ${variants ? `<div style="font-size: 11px; color: #6B7280; margin-top: 2px;">Variant: ${variants}</div>` : ''}
            <div style="font-size: 10px; color: #9CA3AF; margin-top: 1px;">Handloom / Saree Apparels</div>
          </td>
          <td style="text-align: center; border-bottom: 1px solid #E5E7EB; padding: 10px 8px; font-size: 11px; color: #4B5563;">5208</td>
          <td style="text-align: center; border-bottom: 1px solid #E5E7EB; padding: 10px 8px; font-weight: 700; color: #111827;">${item.quantity || 1}</td>
          <td style="text-align: right; border-bottom: 1px solid #E5E7EB; padding: 10px 8px; color: #374151;">₹${Number(item.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="text-align: right; border-bottom: 1px solid #E5E7EB; padding: 10px 8px; font-weight: 700; color: #111827;">₹${lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `
    })
    .join('')

  // Split GST into CGST + SGST (or IGST if out of state)
  const isInterState = state.toLowerCase().trim() !== 'tamil nadu' && state.toLowerCase().trim() !== 'tn'
  let gstBreakdownHtml = ''
  if (gstAmount > 0) {
    if (isInterState) {
      gstBreakdownHtml = `
        <tr>
          <td style="padding: 4px 0; color: #4B5563;">Integrated GST (IGST ${gstPercentage}%):</td>
          <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #111827;">₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `
    } else {
      const halfRate = (gstPercentage / 2).toFixed(1)
      const halfGst = (gstAmount / 2)
      gstBreakdownHtml = `
        <tr>
          <td style="padding: 4px 0; color: #4B5563;">Central GST (CGST ${halfRate}%):</td>
          <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #111827;">₹${halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #4B5563;">State GST (SGST ${halfRate}%):</td>
          <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #111827;">₹${halfGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Tax Invoice - ${orderId}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1F2937;
          background: #F9FAFB;
          padding: 24px;
          font-size: 12px;
          line-height: 1.45;
        }
        .invoice-wrapper {
          max-width: 820px;
          margin: 0 auto;
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          padding: 32px 36px;
          position: relative;
        }
        .watermark {
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-32deg);
          font-size: 80px;
          font-weight: 900;
          color: rgba(185, 28, 28, 0.08);
          pointer-events: none;
          letter-spacing: 12px;
          user-select: none;
          z-index: 1;
        }
        .header-table {
          width: 100%;
          border-bottom: 2px solid #111827;
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .brand-logo {
          max-height: 56px;
          max-width: 180px;
          object-fit: contain;
          margin-bottom: 6px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .box {
          border: 1px solid #E5E7EB;
          background: #FAF7F2;
          padding: 12px 14px;
          border-radius: 4px;
        }
        .box-title {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6D021B;
          margin-bottom: 6px;
          border-bottom: 1px dashed #D1D5DB;
          padding-bottom: 3px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          margin-bottom: 16px;
        }
        .items-table th {
          background: #F3F4F6;
          color: #374151;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 8px;
          border-top: 1px solid #D1D5DB;
          border-bottom: 1px solid #D1D5DB;
        }
        .totals-table {
          width: 100%;
          border-collapse: collapse;
        }
        .footer-note {
          margin-top: 28px;
          padding-top: 14px;
          border-top: 1px solid #E5E7EB;
          font-size: 10px;
          color: #6B7280;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        /* Amazon-like Print Action Bar */
        .no-print-bar {
          max-width: 820px;
          margin: 0 auto 16px auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #1F1713;
          color: #FFFFFF;
          border-radius: 6px;
        }
        .print-btn {
          background: #22C55E;
          color: #FFFFFF;
          border: none;
          font-weight: 700;
          padding: 8px 18px;
          font-size: 13px;
          border-radius: 4px;
          cursor: pointer;
        }
        .print-btn:hover { background: #16A34A; }

        @media print {
          body { background: #FFFFFF; padding: 0; }
          .no-print-bar { display: none !important; }
          .invoice-wrapper {
            box-shadow: none;
            border: none;
            padding: 0;
            margin: 0;
            max-width: 100%;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
          }
        }
      </style>
    </head>
    <body>

      <!-- Top Action Bar (Hidden when printed to PDF) -->
      <div class="no-print-bar">
        <div>
          <strong>${storeName}</strong> • Official GST Tax Invoice
          <span style="font-size: 11px; opacity: 0.8; margin-left: 8px;">(Order #${orderId})</span>
        </div>
        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
      </div>

      <div class="invoice-wrapper">
        ${watermarkText ? `<div class="watermark">${watermarkText}</div>` : ''}

        <!-- Top Header: Seller Branding & Invoice Meta -->
        <table class="header-table">
          <tr>
            <td style="width: 55%; vertical-align: top;">
              <!-- Dynamic Brand Logo from Admin Settings -->
              <img src="${logoSrc}" alt="${cleanBrandName}" class="brand-logo" onerror="this.style.display='none'" />
              <div style="font-size: 18px; font-weight: 900; letter-spacing: 0.05em; color: #6D021B; text-transform: uppercase;">
                ${cleanBrandName}
              </div>
              <div style="font-size: 11px; color: #6B7280; font-weight: 500; margin-top: 1px;">
                The House of Sarees
              </div>
              <div style="font-size: 11px; color: #4B5563; margin-top: 5px; line-height: 1.4;">
                ${atelierAddress}<br/>
                Email: ${contactEmail} • Support: ${supportPhone}<br/>
                <strong>GSTIN:</strong> 33AAAAA0000A1Z5 • <strong>State :</strong> Tamil Nadu
              </div>
            </td>

            <td style="width: 45%; vertical-align: top; text-align: right;">
              <div style="font-size: 20px; font-weight: 900; color: #111827; letter-spacing: 0.02em;">
                ${invoiceTitle}
              </div>
              <div style="display: inline-block; margin-top: 4px; padding: 2px 10px; background: ${statusBannerColor}15; color: ${statusBannerColor}; border: 1px solid ${statusBannerColor}40; border-radius: 3px; font-weight: 800; font-size: 10px; letter-spacing: 0.06em;">
                ${statusBadgeText}
              </div>

              <table style="width: 100%; margin-top: 10px; font-size: 11px; text-align: right;">
                <tr>
                  <td style="color: #6B7280; padding: 2px 0;">Invoice Number:</td>
                  <td style="font-weight: 700; color: #111827; padding: 2px 0 2px 8px;">${invoiceNo}</td>
                </tr>
                <tr>
                  <td style="color: #6B7280; padding: 2px 0;">Order ID:</td>
                  <td style="font-weight: 700; color: #111827; padding: 2px 0 2px 8px;">#${orderId}</td>
                </tr>
                <tr>
                  <td style="color: #6B7280; padding: 2px 0;">Order Date:</td>
                  <td style="font-weight: 600; color: #374151; padding: 2px 0 2px 8px;">${orderDate}</td>
                </tr>
                <tr>
                  <td style="color: #6B7280; padding: 2px 0;">Invoice Date:</td>
                  <td style="font-weight: 600; color: #374151; padding: 2px 0 2px 8px;">${orderDate}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Two Column Buyer Info: Sold By & Ship-To / Bill-To (Amazon Format) -->
        <div class="info-grid">
          <!-- Billing Address -->
          <div class="box">
            <div class="box-title">Billing Address (Customer)</div>
            <div style="font-weight: 700; color: #111827; font-size: 12px; margin-bottom: 2px;">
              ${customerName}
            </div>
            <div style="color: #4B5563; font-size: 11px; line-height: 1.4;">
              ${street}${landmark}<br/>
              ${city}, ${state} - <strong>${pincode}</strong><br/>
              Phone: ${customerPhone || 'N/A'}<br/>
              ${customerEmail ? `Email: ${customerEmail}` : ''}
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="box">
            <div class="box-title">Shipping / Delivery Address</div>
            <div style="font-weight: 700; color: #111827; font-size: 12px; margin-bottom: 2px;">
              ${customerName}
            </div>
            <div style="color: #4B5563; font-size: 11px; line-height: 1.4;">
              ${street}${landmark}<br/>
              ${city}, ${state} - <strong>${pincode}</strong><br/>
              Phone: ${customerPhone || 'N/A'}<br/>
              <strong>Dispatch State :</strong>Tamil Nadu
            </div>
          </div>
        </div>

        <!-- Itemized Table (Amazon & Flipkart Standard Format) -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 6%; text-align: center;">#</th>
              <th style="width: 48%; text-align: left;">Item Description</th>
              <th style="width: 10%; text-align: center;">HSN</th>
              <th style="width: 8%; text-align: center;">Qty</th>
              <th style="width: 14%; text-align: right;">Gross Rate</th>
              <th style="width: 14%; text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <!-- Bottom Calculations & Payment Summary -->
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; align-items: start;">
          <!-- Left: Payment Method & Declaration -->
          <div style="border: 1px solid #E5E7EB; padding: 12px; border-radius: 4px; background: #FAFAFA;">
            <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; color: #374151; margin-bottom: 6px;">
              Payment Information
            </div>
            <div style="font-size: 11px; color: #4B5563; line-height: 1.5;">
              <strong>Payment Mode:</strong> ${order.payment?.method || 'ONLINE PREPAID'}<br/>
              <strong>Payment Status:</strong> <span style="color: #15803D; font-weight: 700;">${order.payment?.status || 'Completed'}</span><br/>
              ${order.payment?.transactionId ? `<strong>Transaction Ref:</strong> ${order.payment.transactionId}<br/>` : ''}
              <strong>Total Items:</strong> ${items.reduce((acc, it) => acc + Number(it.quantity || 1), 0)} Saree(s)<br/>
              <strong>Weight:</strong> ${(Number(pricing.totalWeightGrams || 850) / 1000).toFixed(2)} kg
            </div>

            <div style="margin-top: 10px; font-size: 10px; color: #6B7280; border-top: 1px dashed #D1D5DB; padding-top: 6px;">
              <strong>Declaration:</strong> We declare that this invoice shows the actual price of the sarees described and that all particulars are true and correct.
            </div>
          </div>

          <!-- Right: Totals Breakdown -->
          <div>
            <table class="totals-table" style="font-size: 11px;">
              <tr>
                <td style="padding: 4px 0; color: #4B5563;">Items Subtotal:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #111827;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #4B5563;">Shipping & Handling Charges:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #111827;">
                  ${shippingFee === 0 ? '<span style="color:#15803D; font-weight: 700;">FREE</span>' : `₹${shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </td>
              </tr>
              ${discount > 0 ? `
              <tr>
                <td style="padding: 4px 0; color: #B91C1C;">Special Discount:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #B91C1C;">-₹${discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>` : ''}
              ${gstBreakdownHtml}
              <tr style="border-top: 2px solid #111827; border-bottom: 2px solid #111827;">
                <td style="padding: 8px 0; font-size: 13px; font-weight: 800; color: #6D021B;">Grand Total:</td>
                <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 900; color: #6D021B;">
                  ₹${finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </table>

            <div style="font-size: 10px; color: #6B7280; text-align: right; margin-top: 4px;">
              Amount in words: <strong style="color: #374151;">Indian Rupees Only</strong>
            </div>
          </div>
        </div>

        <!-- Footer: Signatory & Notice -->
        <div class="footer-note">
          <div>
            <div>• This is a computer-generated tax invoice and requires no physical signature.</div>
            <div>• Return Policy: Returns accepted within guarantee window from delivery date in unworn condition with tags intact.</div>
            <div>• For any boutique inquiries or styling guidance, contact <strong>${contactEmail}</strong></div>
          </div>

          <div style="text-align: right; min-width: 140px;">
            <div style="font-weight: 800; font-size: 11px; color: #6D021B; text-transform: uppercase;">
              For ${cleanBrandName}
            </div>
            <div style="margin-top: 24px; border-top: 1px solid #9CA3AF; padding-top: 3px; font-size: 10px; color: #4B5563;">
              Authorized Signatory
            </div>
          </div>
        </div>

      </div>

      <script>
        // Automatically open print dialog once assets load
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 450);
        };
      </script>
    </body>
    </html>
  `
}

/**
 * Download Invoice directly as a PDF file via Backend Puppeteer
 */
export async function downloadInvoicePdfDirect(orderId) {
  if (!orderId) return

  const API_BASE = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5000/api'
  const downloadUrl = `${API_BASE}/orders/${orderId}/invoice-pdf`

  // Fetch as blob to force instant browser download
  const response = await fetch(downloadUrl)
  if (!response.ok) {
    throw new Error('Failed to generate PDF invoice from server')
  }

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = `Invoice-${orderId}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(blobUrl)
}
