/**
 * Centralized Luxury Email Templates for Vastraa Handloom Silks
 * Engineered with 15+ years UI/UX & Responsive Email Design Best Practices:
 * - Fluid table layouts compatible with Outlook, Apple Mail, Gmail, Yahoo, iOS & Android
 * - Typography: Georgia serif headers paired with clean system sans-serif body
 * - Vastraa Royal Palette: Royal Burgundy (#6D021B), Temple Gold (#DEA53B / #C5902B), Silk Cream (#FAF7F2), Warm Charcoal (#2A1D17)
 * - Anti-spam compliance: Preheaders, accessible contrast ratios, and clear footer brand identity
 */

// Global Email Design Wrapper with Royal Luxury Header & Footer
const renderEmailShell = ({ preheader = '', badge = 'VASTRAA SILK STUDIO', title = '', contentHtml = '', footerNote = '' }) => {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <title>${title || 'Vastraa Luxury Silks'}</title>
  <style type="text/css">
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; background-color:#FAF7F2; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    td { font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    a { color:#6D021B; text-decoration:none; }
    @media only screen and (max-width: 620px) {
      .email-container { width:100% !important; padding:12px !important; }
      .card-body { padding:20px 16px !important; }
      .otp-box { font-size:28px !important; letter-spacing:6px !important; padding:14px 20px !important; }
      .header-title { font-size:22px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#FAF7F2; color:#2A1D17;">
  <!-- Hidden Preheader Preview Text in Email Clients -->
  <div style="display:none; font-size:1px; color:#FAF7F2; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    ${preheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF7F2; padding:32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table class="email-container" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; width:100%;">
          
          <!-- Brand Luxury Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <span style="display:inline-block; font-size:9.5px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:#C5902B; background-color:#FFF; border:1px solid #EBE1D4; padding:3px 12px; margin-bottom:8px; border-radius:12px;">
                      ${badge}
                    </span>
                    <h1 class="header-title" style="margin:6px 0 0 0; font-family:'Playfair Display', Georgia, serif; font-size:26px; font-weight:700; letter-spacing:4px; color:#6D021B; text-transform:uppercase;">
                      VASTRAA
                    </h1>
                    <div style="width:40px; height:2px; background-color:#DEA53B; margin:8px auto 0 auto;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card with Gold Top Accent -->
          <tr>
            <td style="background-color:#ffffff; border-radius:10px; border:1px solid #EDE4D8; box-shadow:0 4px 18px rgba(109,2,27,0.04); overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <!-- Top Burgundy Gold Accent Stripe -->
                <tr>
                  <td height="4" style="background:linear-gradient(90deg, #6D021B 0%, #DEA53B 50%, #6D021B 100%);"></td>
                </tr>
                <tr>
                  <td class="card-body" style="padding:32px 28px;">
                    ${contentHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        


        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * 1. Customer Sign In (Login) OTP Verification Email Template
 */
export const getCustomerLoginOtpEmailTemplate = (otp) => {
  const content = `
    <div style="text-align:center;">
      <h2 style="margin:0 0 8px 0; font-family:'Playfair Display', Georgia, serif; font-size:20px; font-weight:700; color:#1F1713;">
        Welcome Back to Vastraa
      </h2>
      <p style="margin:0 0 18px 0; font-size:13px; color:#6F5E53;">
        Use this verification code to sign in to your account:
      </p>

      <!-- OTP Box -->
      <div style="background-color:#FAF7F2; border:1.5px dashed #DEA53B; border-radius:8px; padding:16px 20px; margin:16px auto; max-width:260px; text-align:center;">
        <span class="otp-box" style="font-family:'Courier New', Courier, monospace, sans-serif; font-size:34px; font-weight:800; letter-spacing:8px; color:#6D021B; display:inline-block;">
          ${otp}
        </span>
      </div>

      <p style="margin:12px 0 0 0; font-size:11.5px; color:#8A796E;">
        Valid for <strong>5 minutes</strong>.
      </p>
    </div>
  `
  return renderEmailShell({
    preheader: `Your Vastraa sign-in code is ${otp}.`,
    badge: 'SIGN IN',
    title: 'Sign in to Vastraa',
    contentHtml: content,
  })
}

/**
 * 2. Customer Account Creation (Sign Up / Welcome) OTP Verification Email Template
 */
export const getCustomerSignupOtpEmailTemplate = (otp) => {
  const content = `
    <div style="text-align:center;">
      <h2 style="margin:0 0 8px 0; font-family:'Playfair Display', Georgia, serif; font-size:20px; font-weight:700; color:#1F1713;">
        Welcome to Vastraa
      </h2>
      <p style="margin:0 0 18px 0; font-size:13px; color:#6F5E53;">
        Use this verification code to complete your registration:
      </p>

      <!-- OTP Box -->
      <div style="background-color:#FAF7F2; border:1.5px dashed #DEA53B; border-radius:8px; padding:16px 20px; margin:16px auto; max-width:260px; text-align:center;">
        <span class="otp-box" style="font-family:'Courier New', Courier, monospace, sans-serif; font-size:34px; font-weight:800; letter-spacing:8px; color:#6D021B; display:inline-block;">
          ${otp}
        </span>
      </div>

      <p style="margin:12px 0 0 0; font-size:11.5px; color:#8A796E;">
        Valid for <strong>5 minutes</strong>.
      </p>
    </div>
  `
  return renderEmailShell({
    preheader: `Your Vastraa registration code is ${otp}.`,
    badge: 'CREATE ACCOUNT',
    title: 'Welcome to Vastraa',
    contentHtml: content,
  })
}

/**
 * 3. Administrative Portal Secure OTP Verification Email Template
 */
export const getAdminOtpEmailTemplate = (otp) => {
  const content = `
    <div style="text-align:center;">
      <div style="display:inline-block; width:48px; height:48px; border-radius:50%; background-color:#FFF3F4; border:1px solid #F3C4C9; text-align:center; line-height:48px; margin-bottom:14px;">
        <span style="font-size:20px; color:#6D021B;">🛡️</span>
      </div>
      <h2 style="margin:0 0 8px 0; font-family:'Playfair Display', Georgia, serif; font-size:20px; font-weight:700; color:#1F1713;">
        Admin Portal Security Verification
      </h2>
      <p style="margin:0 0 20px 0; font-size:13px; color:#6F5E53; line-height:1.5;">
        A sign-in attempt was initiated for the <strong>Vastraa Administrative Control Center</strong>. Authenticate your session using the security code below:
      </p>

      <!-- High Security OTP Box -->
      <div style="background-color:#FFFDF9; border:2px solid #6D021B; border-radius:8px; padding:18px 24px; margin:20px auto; max-width:280px; text-align:center; box-shadow:0 2px 8px rgba(109,2,27,0.08);">
        <span class="otp-box" style="font-family:'Courier New', Courier, monospace, sans-serif; font-size:34px; font-weight:800; letter-spacing:8px; color:#6D021B; display:inline-block;">
          ${otp}
        </span>
      </div>

      <div style="background-color:#FAF7F2; border-radius:6px; padding:10px 14px; margin:14px 0 20px 0; display:inline-block;">
        <span style="font-size:11.5px; color:#7A695A; font-weight:600;">
          🔒 High Security Code • Expires in <strong>5 minutes</strong>
        </span>
      </div>

      <div style="background-color:#FFF8F8; border-left:3px solid #DC2626; border-radius:4px; padding:12px 14px; margin-top:16px; text-align:left;">
        <span style="font-size:11px; font-weight:700; color:#B91C1C; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:2px;">
          Security Alert
        </span>
        <p style="margin:0; font-size:11.5px; color:#4B3C35; line-height:1.4;">
          This verification grants full access to order fulfillments, inventory, and analytics. If you did not initiate this login, immediately notify store tech support.
        </p>
      </div>
    </div>
  `
  return renderEmailShell({
    preheader: `Admin Verification Passcode: ${otp}. Confidential access code.`,
    badge: 'ADMIN PORTAL ACCESS',
    title: 'Vastraa Admin Security Code',
    contentHtml: content,
    footerNote: 'This is an automated system security broadcast sent to authorized store administrators.',
  })
}

/**
 * 4. Customer Order Confirmation & Tax Invoice Email Template
 */
export const getOrderInvoiceEmailTemplate = ({ customerName, orderId, items = [], totalAmount, date }) => {
  const itemRows = items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #F0E8DC;">
          <td style="padding:12px 8px; font-size:12.5px; color:#1F1713;">
            <strong style="color:#2A1D17; display:block;">${item.title || 'Pure Handloom Silk Saree'}</strong>
            ${item.color ? `<span style="font-size:11px; color:#7A695A;">Color: ${item.color}</span>` : ''}
            ${item.material ? `<span style="font-size:11px; color:#7A695A;"> • Fabric: ${item.material}</span>` : ''}
          </td>
          <td style="padding:12px 8px; font-size:12px; text-align:center; color:#5F5148; font-weight:600;">${item.quantity || 1}</td>
          <td style="padding:12px 8px; font-size:12.5px; text-align:right; color:#6D021B; font-weight:700;">₹${Number(item.price || 0).toLocaleString('en-IN')}</td>
        </tr>
      `
    )
    .join('')

  const content = `
    <div>
      <div style="text-align:center; margin-bottom:20px;">
        <div style="display:inline-block; width:48px; height:48px; border-radius:50%; background-color:#ECFDF5; border:1px solid #A7F3D0; text-align:center; line-height:48px; margin-bottom:12px;">
          <span style="font-size:22px; color:#059669;">🛍️</span>
        </div>
        <h2 style="margin:0 0 6px 0; font-family:'Playfair Display', Georgia, serif; font-size:20px; font-weight:700; color:#1F1713;">
          Order Confirmed, ${customerName || 'Valued Patron'}!
        </h2>
        <p style="margin:0; font-size:12.5px; color:#6F5E53;">
          Thank you for embracing authentic Indian handloom artistry. We have received your order.
        </p>
      </div>

      <!-- Order Meta Header Box -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF7F2; border:1px solid #EDE4D8; border-radius:8px; padding:12px 16px; margin-bottom:20px; font-size:12px;">
        <tr>
          <td style="color:#6F5E53;">Order Reference: <strong style="color:#1F1713; font-family:monospace; font-size:13px;">#${orderId}</strong></td>
          <td align="right" style="color:#6F5E53;">Order Date: <strong style="color:#1F1713;">${date || 'Today'}</strong></td>
        </tr>
      </table>

      <!-- Items Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <thead>
          <tr style="background-color:#FAF7F2; border-bottom:2px solid #DEA53B; text-align:left;">
            <th style="padding:9px 8px; font-size:11px; text-transform:uppercase; color:#4A3E38; letter-spacing:0.5px;">Saree Details</th>
            <th style="padding:9px 8px; font-size:11px; text-transform:uppercase; text-align:center; color:#4A3E38; letter-spacing:0.5px;">Qty</th>
            <th style="padding:9px 8px; font-size:11px; text-transform:uppercase; text-align:right; color:#4A3E38; letter-spacing:0.5px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Total Paid Strip -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:2px solid #EDE4D8; padding-top:14px;">
        <tr>
          <td style="font-size:13px; color:#5F5148; font-weight:600;">Final Amount Paid:</td>
          <td align="right" style="font-size:18px; font-weight:800; color:#6D021B;">
            ₹${Number(totalAmount || 0).toLocaleString('en-IN')}
          </td>
        </tr>
      </table>

      <div style="background-color:#FAF7F2; border-radius:8px; padding:14px; margin-top:22px; text-align:center;">
        <span style="font-size:12px; font-weight:700; color:#6D021B; display:block; margin-bottom:4px;">Next Steps in Your Handloom Journey</span>
        <p style="margin:0; font-size:11.5px; color:#6F5E53; line-height:1.5;">
          Our master artisans are carefully hand-inspecting and packing your saree. You will receive an instant notification as soon as your order is dispatched.
        </p>
      </div>
    </div>
  `
  return renderEmailShell({
    preheader: `Thank you for order #${orderId}. Total paid: ₹${Number(totalAmount || 0).toLocaleString('en-IN')}.`,
    badge: 'ORDER CONFIRMATION',
    title: `Order #${orderId} Confirmed - Vastraa Silks`,
    contentHtml: content,
  })
}

/**
 * 5. Customer Order Rejection / Cancellation Email Template (Store Cancelled with Reason)
 */
export const getOrderCancellationEmailTemplate = ({ customerName, orderId, reason, items = [], totalAmount }) => {
  const itemRows = items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #F1ECE6;">
          <td style="padding:10px 8px; font-size:12px; color:#1F1713;">
            <strong style="color:#2A1D17; display:block;">${item.title || 'Pure Silk Saree'}</strong>
            ${item.color ? `<span style="font-size:11px; color:#7A695A;">Color: ${item.color}</span>` : ''}
          </td>
          <td style="padding:10px 8px; font-size:12px; text-align:center; color:#5F5148;">${item.quantity || 1}</td>
          <td style="padding:10px 8px; font-size:12px; text-align:right; color:#6D021B; font-weight:700;">₹${Number(item.price || 0).toLocaleString('en-IN')}</td>
        </tr>
      `
    )
    .join('')

  const content = `
    <div>
      <div style="text-align:center; margin-bottom:20px;">
        <div style="display:inline-block; width:48px; height:48px; border-radius:50%; background-color:#FEF2F2; border:1px solid #FECACA; text-align:center; line-height:48px; margin-bottom:12px;">
          <span style="font-size:20px; color:#DC2626;">✕</span>
        </div>
        <h2 style="margin:0 0 6px 0; font-family:'Playfair Display', Georgia, serif; font-size:20px; font-weight:700; color:#1F1713;">
          Order Notice: #${orderId}
        </h2>
        <p style="margin:0; font-size:12.5px; color:#6F5E53; line-height:1.5;">
          Dear <strong>${customerName || 'Valued Patron'}</strong>, we regret to inform you that our store team was unable to fulfill your order.
        </p>
      </div>

      <!-- Professional Reason Highlight Box -->
      <div style="background-color:#FFF8F8; border-left:3.5px solid #DC2626; border-radius:6px; padding:14px 16px; margin:20px 0; border:1px solid #FEE2E2; border-left-width:3.5px;">
        <span style="font-size:10.5px; font-weight:800; text-transform:uppercase; color:#991B1B; letter-spacing:0.8px; display:block; margin-bottom:4px;">
          Reason from Store Team
        </span>
        <p style="margin:0; font-size:12.5px; color:#2B1E19; line-height:1.5; font-style:italic;">
          "${reason || 'The requested handloom saree failed our pre-dispatch master weave quality check, and stock is temporarily exhausted.'}"
        </p>
      </div>

      <!-- Cancelled Items Summary -->
      <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:#7A695A; letter-spacing:1px; display:block; margin-bottom:8px;">
        Cancelled Items:
      </span>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
        <thead>
          <tr style="background-color:#FAF7F2; border-bottom:1.5px solid #DEA53B; text-align:left;">
            <th style="padding:8px; font-size:11px; text-transform:uppercase; color:#4A3E38;">Product</th>
            <th style="padding:8px; font-size:11px; text-transform:uppercase; text-align:center; color:#4A3E38;">Qty</th>
            <th style="padding:8px; font-size:11px; text-transform:uppercase; text-align:right; color:#4A3E38;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Order Total -->
      <div style="text-align:right; border-top:1px solid #EDE4D8; padding-top:12px; font-size:12px; color:#443830;">
        Cancelled Value: <strong style="color:#6D021B; font-size:15px; margin-left:6px;">₹${Number(totalAmount || 0).toLocaleString('en-IN')}</strong>
      </div>

      <!-- Refund Notice Box -->
      <div style="margin-top:20px; background-color:#FAF7F2; border:1px solid #EAE0D3; border-radius:8px; padding:14px 16px; font-size:11.5px; color:#6F5E52; line-height:1.5;">
        <strong style="color:#6D021B; display:block; margin-bottom:2px;">✦ Seamless Refund Assurance</strong>
        If you completed payment online, the full transaction amount will be automatically refunded back to your original source within <strong>3 to 5 business days</strong>. No manual action is needed on your end.
      </div>
    </div>
  `
  return renderEmailShell({
    preheader: `Important: Order #${orderId} has been cancelled. View store explanation and refund details.`,
    badge: 'ORDER CANCELLATION NOTICE',
    title: `Order #${orderId} Cancellation - Vastraa Silks`,
    contentHtml: content,
  })
}

/**
 * 6. Customer Contact & Inquiry Message Email Template (Dispatched to Admin Email)
 */
export const getContactInquiryEmailTemplate = ({ name, email, phone, subject, message, date }) => {
  const content = `
    <div style="padding:4px 0 16px 0;">
      <h2 class="header-title" style="font-family:Georgia, serif; font-size:22px; color:#1F1713; font-weight:700; margin:0 0 10px 0; letter-spacing:-0.2px;">
        New Customer Inquiry Received
      </h2>
      <p style="font-size:13px; color:#5A4A41; line-height:1.6; margin:0 0 20px 0;">
        A customer has submitted a message via the Vastraa Contact page. Details are provided below:
      </p>

      <!-- Customer Details Card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF7F2; border:1px solid #EDE4D8; border-radius:8px; margin-bottom:20px;">
        <tr>
          <td style="padding:16px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:4px 0; font-size:12px; color:#78665A; width:110px;"><strong>Customer:</strong></td>
                <td style="padding:4px 0; font-size:12.5px; color:#1F1713; font-weight:600;">${name}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; font-size:12px; color:#78665A;"><strong>Email Address:</strong></td>
                <td style="padding:4px 0; font-size:12.5px; color:#6D021B; font-weight:600;"><a href="mailto:${email}" style="color:#6D021B; text-decoration:underline;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:4px 0; font-size:12px; color:#78665A;"><strong>Phone Number:</strong></td>
                <td style="padding:4px 0; font-size:12.5px; color:#1F1713;">${phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; font-size:12px; color:#78665A;"><strong>Subject:</strong></td>
                <td style="padding:4px 0; font-size:12.5px; color:#1F1713; font-weight:600;">${subject || 'General Inquiry'}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; font-size:12px; color:#78665A;"><strong>Received At:</strong></td>
                <td style="padding:4px 0; font-size:11.5px; color:#78665A;">${date || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Message Card -->
      <div style="background-color:#FFFFFF; border:1.5px solid #DEA53B; border-radius:8px; padding:18px 20px; margin-bottom:20px;">
        <span style="font-size:10.5px; font-weight:800; text-transform:uppercase; color:#6D021B; letter-spacing:1px; display:block; margin-bottom:8px;">
          Customer Message:
        </span>
        <p style="margin:0; font-size:13.5px; color:#2B1E19; line-height:1.7; white-space:pre-wrap; font-family:inherit;">
${message}
        </p>
      </div>

      <!-- Quick Reply CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
        <tr>
          <td align="center">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your inquiry at Vastraa')}" style="background-color:#6D021B; color:#FFFFFF; font-size:12.5px; font-weight:700; text-decoration:none; padding:12px 28px; border-radius:6px; display:inline-block; letter-spacing:0.5px;">
              Reply directly to Customer &rarr;
            </a>
          </td>
        </tr>
      </table>
    </div>
  `

  return renderEmailShell({
    preheader: `New customer inquiry from ${name} (${email}): "${subject || 'General inquiry'}"`,
    badge: 'CUSTOMER INQUIRY',
    title: `Inquiry from ${name} - Vastraa Silks`,
    contentHtml: content,
  })
}



