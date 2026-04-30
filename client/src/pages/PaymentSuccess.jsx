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

const SELLER_INFO = {
  name: "Kalyani Pet Shop",
  address: "Pet care products and services",
  city: "Bengaluru, Karnataka, India",
  gstin: import.meta.env.VITE_STORE_GSTIN || "GSTIN: To be updated",
  phone: import.meta.env.VITE_STORE_PHONE || "+91 98765 43210",
  email: import.meta.env.VITE_STORE_EMAIL || "support@kalyanipetshop.com",
};

const createInvoicePdf = ({ orderId, paymentMethod, paymentId, total, itemCount, items, billingDetails, createdAt }) => {
  const invoiceDate = createdAt ? new Date(createdAt) : new Date();
  const invoiceNo = orderId ? `INV-${String(orderId).slice(-8).toUpperCase()}` : `INV-${Date.now()}`;
  const safeItems = Array.isArray(items) && items.length ? items : [];
  const paidTotal = Number(total || 0);
  const itemSubtotal = safeItems.length
    ? safeItems.reduce((sum, item) => {
        const qty = Number(item.quantity || 1);
        const rate = Number(item.price || 0);
        return sum + rate * qty;
      }, 0)
    : paidTotal;
  const taxableValue = itemSubtotal;
  const totalGst = Math.max(0, paidTotal - taxableValue);
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const customerAddress = [
    billingDetails?.address,
    billingDetails?.city,
    billingDetails?.pincode,
  ].filter(Boolean).join(", ");
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

  lines.push("0.05 0.48 0.43 rg 0 792 612 64 re f");
  lines.push("1 1 1 rg");
  lines.push("0 0 0 RG 0.85 0.9 0.95 RG");
  bold(42, 746, 22, SELLER_INFO.name);
  text(42, 728, 10, "Tax Invoice / Bill of Supply");
  bold(420, 746, 24, "INVOICE");
  text(420, 727, 10, invoiceNo);

  lines.push("0 0 0 rg");
  rect(42, 646, 528, 54);
  bold(58, 682, 11, "Sold By");
  text(58, 666, 9, SELLER_INFO.address);
  text(58, 652, 9, SELLER_INFO.city);
  text(335, 682, 9, SELLER_INFO.gstin);
  text(335, 666, 9, `Phone: ${SELLER_INFO.phone}`);
  text(335, 652, 9, `Email: ${SELLER_INFO.email}`);

  rect(42, 530, 528, 96);
  bold(58, 606, 11, "Bill To / Customer Details");
  text(58, 588, 10, billingDetails?.fullName || "Customer");
  text(58, 572, 10, `Email: ${billingDetails?.email || "-"}`);
  text(58, 556, 10, `Phone: ${billingDetails?.phone || "-"}`);
  text(58, 540, 10, `Address: ${truncate(customerAddress || "-", 48)}`);

  bold(365, 606, 11, "Order Details");
  text(365, 588, 10, `Order ID: ${orderId || "-"}`);
  text(365, 572, 10, `Invoice Date: ${invoiceDate.toLocaleDateString("en-IN")}`);
  text(365, 556, 10, `Payment Mode: ${paymentMethod ? paymentMethod.toUpperCase() : "-"}`);
  text(365, 540, 10, `Payment ID: ${truncate(paymentId || "-", 28)}`);

  bold(42, 498, 11, "Order Items");
  lines.push("0.93 0.97 1 rg 42 466 528 30 re f");
  lines.push("0 0 0 rg 0.85 0.9 0.95 RG");
  const visibleItemCount = Math.max(safeItems.slice(0, 10).length, 1);
  const tableBottom = 438 - (visibleItemCount - 1) * 26;
  rect(42, tableBottom, 528, 58 + visibleItemCount * 26);
  bold(58, 478, 9, "Product Name");
  bold(252, 478, 9, "Quantity");
  bold(318, 478, 9, "Price");
  bold(390, 478, 9, "GST");
  bold(470, 478, 9, "Total Amt Paid");
  line(42, 466, 570, 466);
  line(242, tableBottom, 242, 496);
  line(306, tableBottom, 306, 496);
  line(378, tableBottom, 378, 496);
  line(458, tableBottom, 458, 496);

  if (safeItems.length) {
    safeItems.slice(0, 10).forEach((item, index) => {
      const y = 444 - index * 26;
      const qty = Number(item.quantity || 1);
      const rate = Number(item.price || 0);
      const amount = rate * qty;
      const gstAmount = itemSubtotal > 0 ? totalGst * (amount / itemSubtotal) : 0;
      const rowTotal = amount + gstAmount;
      text(58, y, 9, truncate(item.name || "Product", 30));
      text(252, y, 9, qty);
      text(318, y, 9, formatMoney(rate));
      text(390, y, 9, formatMoney(gstAmount));
      text(470, y, 9, formatMoney(rowTotal));
      line(42, y - 11, 570, y - 11);
    });
  } else {
    text(58, 444, 9, `Pet products order (${itemCount || 1} item${itemCount === 1 ? "" : "s"})`);
    text(252, 444, 9, itemCount || 1);
    text(318, 444, 9, formatMoney(taxableValue));
    text(390, 444, 9, formatMoney(totalGst));
    text(470, 444, 9, formatMoney(paidTotal));
    line(42, 433, 570, 433);
  }

  line(360, 236, 570, 236);
  text(380, 216, 10, "Taxable Value");
  text(500, 216, 10, formatMoney(taxableValue));
  text(380, 198, 10, "CGST 9%");
  text(500, 198, 10, formatMoney(cgst));
  text(380, 180, 10, "SGST 9%");
  text(500, 180, 10, formatMoney(sgst));
  text(380, 162, 10, "Round Off");
  text(500, 162, 10, formatMoney(paidTotal - taxableValue - totalGst));
  lines.push("0.05 0.48 0.43 rg 360 116 210 32 re f");
  lines.push("1 1 1 rg 0 0 0 RG");
  bold(380, 126, 13, "Total Paid");
  bold(500, 126, 13, formatMoney(paidTotal));

  lines.push("0 0 0 rg");
  bold(42, 184, 10, "Declaration");
  text(42, 166, 9, "The goods/services listed above were supplied to the customer named in this invoice.");
  text(42, 148, 9, "GST is added to the product price and included in the final paid amount.");
  text(42, 110, 10, "Thank you for shopping with Kalyani Pet Shop.");
  text(42, 92, 9, "This is a system-generated invoice and does not require a physical signature.");

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
