import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "../content";
import { getDonationHeads, createDonation as createDonationRequest } from "../services/donationService";
import { createPaymentOrder, verifyPayment } from "../services/paymentService";

const initialForm = {
  donor_name: "",
  email: "",
  phone: "",
  address: "",
  head_id: "",
  amount: "",
  message: "",
  payment_method: "Mock",
};

export default function DonationForm() {
  const [heads, setHeads] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadHeads() {
      try {
        const data = await getDonationHeads();
        const items = data.data || [];
        setHeads(items);

        if (items.length) {
          setForm((current) => ({
            ...current,
            head_id: String(items[0].id),
            amount: String(items[0].minimum_amount),
          }));
        }
      } finally {
        setLoading(false);
      }
    }

    loadHeads();
  }, []);

  const selectedHead = useMemo(
    () => heads.find((head) => String(head.id) === String(form.head_id)),
    [form.head_id, heads],
  );

  function validate() {
    const nextErrors = {};

    if (!form.donor_name.trim()) nextErrors.donor_name = "Name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "A valid email is required.";
    if (!form.phone.trim() || !/^[0-9]{10,15}$/.test(form.phone)) nextErrors.phone = "A valid phone number is required.";
    if (!form.address.trim()) nextErrors.address = "Address is required.";
    if (!form.head_id) nextErrors.form = "Donation settings are unavailable right now.";
    if (!form.amount || Number(form.amount) <= 0) {
      nextErrors.amount = "Amount must be greater than zero.";
    } else if (selectedHead && Number(form.amount) < Number(selectedHead.minimum_amount)) {
      nextErrors.amount = `Minimum amount is Rs ${selectedHead.minimum_amount}.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setResult(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const donationResponse = await createDonationRequest({
        ...form,
        head_id: Number(form.head_id),
        amount: Number(form.amount),
      });

      const orderResponse = await createPaymentOrder({ donation_id: donationResponse.data.id });

      const paymentResponse = await verifyPayment({
        provider: orderResponse.data.provider,
        order_id: donationResponse.data.order_id,
        payment_id: `mockpay_${Date.now()}`,
        transaction_id: `txn_${Date.now()}`,
        status: "Success",
      });

      setResult({
        donation: paymentResponse.data.donation,
        receipt: paymentResponse.data.receipt,
      });
      setForm((current) => ({
        ...initialForm,
        head_id: current.head_id,
        amount: current.amount,
      }));
      setErrors({});
    } catch (error) {
      const responseErrors = error.response?.data?.errors;
      setErrors(Array.isArray(responseErrors)
        ? { form: responseErrors.join(" ") }
        : { form: error.response?.data?.message || "Donation could not be submitted." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="contact-section py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="contact-card">
          <h2 className="section-heading">दान विवरण दर्ज करें</h2>
          <h5 className="mb-8 text-center font-display text-xl font-medium">Secure donation and payment form</h5>

          {loading ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">Loading donation form...</div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="donor_name">Name</label>
                  <input id="donor_name" className="form-field" value={form.donor_name} onChange={(event) => setForm((current) => ({ ...current, donor_name: event.target.value }))} />
                  {errors.donor_name ? <p className="mt-2 text-sm text-red-600">{errors.donor_name}</p> : null}
                </div>
                <div>
                  <label className="form-label" htmlFor="email">Email</label>
                  <input id="email" type="email" className="form-field" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
                  {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email}</p> : null}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="phone">Phone</label>
                  <input id="phone" className="form-field" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                  {errors.phone ? <p className="mt-2 text-sm text-red-600">{errors.phone}</p> : null}
                </div>
                <div>
                  <label className="form-label" htmlFor="address">Address</label>
                  <input id="address" className="form-field" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} />
                  {errors.address ? <p className="mt-2 text-sm text-red-600">{errors.address}</p> : null}
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="amount">Amount</label>
                <input id="amount" type="number" min={selectedHead?.minimum_amount || 1} className="form-field" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
                {errors.amount ? <p className="mt-2 text-sm text-red-600">{errors.amount}</p> : null}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="message">Message (optional)</label>
                  <textarea id="message" className="form-field" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
                </div>
                <div>
                  <label className="form-label" htmlFor="payment_method">Payment Method</label>
                  <select id="payment_method" className="form-field" value={form.payment_method} onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value }))}>
                    <option value="Mock">Mock</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank">Bank</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <button className="submit-button" type="submit" disabled={submitting}>
                {submitting ? "Processing..." : "Proceed to Donate"}
              </button>

              {errors.form ? <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{errors.form}</p> : null}

              {result ? (
                <div className="rounded-2xl bg-temple-cream px-5 py-4 text-temple-maroon">
                  <p className="font-semibold">Donation successful. Receipt No: {result.donation.receipt_no}</p>
                  <p className="mt-2 text-sm">Order ID: {result.donation.order_id} | Transaction ID: {result.donation.transaction_id}</p>
                  {result.receipt?.publicPath ? (
                    <a className="mt-3 inline-flex font-semibold underline" href={`${apiBaseUrl}${result.receipt.publicPath}`} target="_blank" rel="noreferrer">
                      Open receipt
                    </a>
                  ) : null}
                </div>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
