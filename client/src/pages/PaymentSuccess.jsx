import { Link, useLocation, useNavigate } from "react-router-dom";

const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const escapePdfText = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");

const truncate = (value, max = 42) => {
  const text = String(value || "-");
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

const createInvoicePdf = ({ orderId, paymentMethod, paymentId, total, itemCount, items, billingDetails, createdAt }) => {
  const invoiceDate = createdAt ? new Date(createdAt) : new Date();
  const invoiceNo = orderId ? `INV-${String(orderId).slice(-8).toUpperCase()}` : `INV-${Date.now()}`;
  const safeItems = Array.isArray(items) && items.length ? items : [];
  const lines = [];

  const text = (x, y, size, value) => {
    lines.push(`BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`);
  };
  const bold = (x, y, size, value) => {
    lines.push(`BT /F2 ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`);
  };
  const line = (x1, y1, x2, y2) => {
    lines.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };
  const rect = (x, y, w, h) => {
    lines.push(`${x} ${y} ${w} ${h} re S`);
  };

  lines.push("0.05 0.48 0.43 rg 0 792 612 50 re f");
  lines.push("1 1 1 rg");
  lines.push("0 0 0 RG 0.85 0.9 0.95 RG");
  bold(42, 754, 22, "Pet App");
  text(42, 735, 10, "Premium pet products and services");
  bold(440, 752, 24, "INVOICE");
  text(440, 733, 10, invoiceNo);

  lines.push("0 0 0 rg");
  rect(42, 620, 528, 92);
  bold(58, 690, 11, "Bill To");
  text(58, 672, 10, billingDetails?.fullName || "Customer");
  text(58, 656, 10, billingDetails?.email || "-");
  text(58, 640, 10, billingDetails?.phone || "-");
  text(58, 624, 10, [billingDetails?.address, billingDetails?.city, billingDetails?.pincode].filter(Boolean).join(", ") || "-");

  bold(365, 690, 11, "Order Details");
  text(365, 672, 10, `Order ID: ${orderId || "-"}`);
  text(365, 656, 10, `Date: ${invoiceDate.toLocaleDateString("en-IN")}`);
  text(365, 640, 10, `Payment: ${paymentMethod ? paymentMethod.toUpperCase() : "-"}`);
  text(365, 624, 10, `Payment ID: ${paymentId || "-"}`);

  lines.push("0.96 0.98 1 rg 42 560 528 28 re f 0.85 0.9 0.95 RG");
  const visibleItemCount = Math.max(safeItems.slice(0, 10).length, 1);
  rect(42, 532 - (visibleItemCount - 1) * 26, 528, 56 + visibleItemCount * 26);
  bold(58, 570, 10, "Item");
  bold(325, 570, 10, "Qty");
  bold(385, 570, 10, "Rate");
  bold(485, 570, 10, "Amount");
  line(42, 560, 570, 560);

  if (safeItems.length) {
    safeItems.slice(0, 10).forEach((item, index) => {
      const y = 540 - index * 26;
      const qty = Number(item.quantity || 1);
      const rate = Number(item.price || 0);
      text(58, y, 10, truncate(item.name || "Product", 38));
      text(325, y, 10, qty);
      text(385, y, 10, formatMoney(rate));
      text(485, y, 10, formatMoney(rate * qty));
    });
  } else {
    text(58, 540, 10, `Pet products order (${itemCount || 1} item${itemCount === 1 ? "" : "s"})`);
    text(325, 540, 10, itemCount || 1);
    text(385, 540, 10, formatMoney(total));
    text(485, 540, 10, formatMoney(total));
  }

  line(360, 250, 570, 250);
  text(380, 228, 11, "Subtotal");
  text(500, 228, 11, formatMoney(total));
  text(380, 208, 11, "Tax");
  text(500, 208, 11, "Included");
  lines.push("0.05 0.48 0.43 rg 360 164 210 32 re f");
  lines.push("1 1 1 rg 0 0 0 RG");
  bold(380, 174, 13, "Total Paid");
  bold(500, 174, 13, formatMoney(total));

  lines.push("0 0 0 rg");
  text(42, 136, 10, "Thank you for shopping with Pet App.");
  text(42, 118, 9, "This is a system-generated invoice for your successful payment.");

  const stream = lines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return { blob: new Blob([pdf], { type: "application/pdf" }), invoiceNo };
};

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId || "";
  const paymentMethod = location.state?.paymentMethod || "";
  const paymentId = location.state?.paymentId || "";
  const total = Number(location.state?.total || 0);
  const itemCount = Number(location.state?.itemCount || 0);
  const items = location.state?.items || [];
  const billingDetails = location.state?.billingDetails || {};
  const createdAt = location.state?.createdAt || "";

  const downloadInvoice = () => {
    const { blob, invoiceNo } = createInvoicePdf({
      orderId,
      paymentMethod,
      paymentId,
      total,
      itemCount,
      items,
      billingDetails,
      createdAt,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoiceNo}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 1024 }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 28,
            boxShadow: "0 4px 18px rgba(2, 6, 23, 0.06)",
          }}
        >
          <p
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#ecfdf5",
              color: "#047857",
              border: "1px solid #a7f3d0",
              borderRadius: 999,
              padding: "6px 12px",
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Payment Successful
          </p>

          <h2 style={{ marginBottom: 10 }}>Order Confirmed</h2>
          <p style={{ color: "#475569", marginBottom: 18 }}>
            Your order has been placed successfully. We will update your order status in your account.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <SummaryCard label="Order ID" value={orderId || "Will be available in Order History"} />
            <SummaryCard label="Items" value={itemCount > 0 ? String(itemCount) : "-"} />
            <SummaryCard label="Payment Method" value={paymentMethod ? paymentMethod.toUpperCase() : "-"} />
            <SummaryCard label="Payment ID" value={paymentId || "-"} />
            <SummaryCard label="Amount Paid" value={total > 0 ? formatMoney(total) : "-"} />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => navigate("/user?section=orders")}>View Order History</button>
            <Link to="/products" className="btn btn-outline">
              Continue Shopping
            </Link>
            <button type="button" className="btn btn-outline" onClick={downloadInvoice}>
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: 12,
        background: "#f8fafc",
      }}
    >
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>{label}</p>
      <p style={{ color: "#0f172a", fontWeight: 700, fontSize: 14, wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}
