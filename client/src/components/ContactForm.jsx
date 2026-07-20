import axios from "axios";
import { useEffect, useState } from "react";
import { apiBaseUrl } from "../content";

const emptyForm = {
  udf1: "",
  udf2: "",
  udf3: "",
  udf4: "",
  headid: "",
  amount: "",
};

export default function ContactForm({
  title = "कलश की जानकारी दर्ज कराएं",
  subtitle = "व्यक्तिगत जानकारी",
}) {
  const [form, setForm] = useState(emptyForm);
  const [heads, setHeads] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingHeads, setLoadingHeads] = useState(true);
  const [headsError, setHeadsError] = useState("");

  useEffect(() => {
    let mounted = true;

    axios.get(`${apiBaseUrl}/api/pay-heads`)
      .then(({ data }) => {
        if (!mounted) {
          return;
        }

        const items = Array.isArray(data.items) ? data.items : [];
        setHeads(items);
        setHeadsError(items.length > 0 ? "" : "अभी कोई कलश विकल्प उपलब्ध नहीं है।");

        if (items.length > 0) {
          setForm((current) => ({
            ...current,
            headid: current.headid || items[0].headid,
            amount: current.amount || String(items[0].rate ?? ""),
          }));
        }
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        setHeads([]);
        setHeadsError(error.response?.data?.message || "कलश विकल्प लोड नहीं हो सके।");
      })
      .finally(() => {
        if (mounted) {
          setLoadingHeads(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "headid") {
      const selectedHead = heads.find((head) => head.headid === value);
      setForm((current) => ({
        ...current,
        headid: value,
        amount: selectedHead ? String(selectedHead.rate ?? "") : current.amount,
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const { data } = await axios.post(`${apiBaseUrl}/api/enquiry`, form);
      setMessage(`प्रविष्टि सफल रही। ऑर्डर नंबर: ${data.orderid} | राशि: ₹${data.amount}`);
      setForm((current) => ({
        ...emptyForm,
        headid: current.headid,
        amount: current.amount,
      }));
    } catch (error) {
      const errors = error.response?.data?.errors;
      setMessage(
        Array.isArray(errors) && errors.length > 0
          ? errors[0]
          : (error.response?.data?.message || "फॉर्म जमा नहीं हो सका। कृपया फिर प्रयास करें।"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="contact-section py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="contact-card">
          <h2 className="section-heading">{title}</h2>
          <h5 className="mb-8 text-center font-display text-xl font-medium">
            {subtitle}
          </h5>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="form-label" htmlFor="udf1">
                  Name:
                </label>
                <input
                  id="udf1"
                  name="udf1"
                  className="form-field"
                  value={form.udf1}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="udf2">
                  Email:
                </label>
                <input
                  id="udf2"
                  name="udf2"
                  type="email"
                  className="form-field"
                  value={form.udf2}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="form-label" htmlFor="udf3">
                  Phone:
                </label>
                <input
                  id="udf3"
                  name="udf3"
                  className="form-field"
                  value={form.udf3}
                  onChange={handleChange}
                  minLength={10}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="udf4">
                  Address:
                </label>
                <input
                  id="udf4"
                  name="udf4"
                  className="form-field"
                  value={form.udf4}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label" htmlFor="headid">
                Tail/Ghrit/Jaware Kalash:
              </label>
              <select
                id="headid"
                name="headid"
                className="form-field"
                value={form.headid}
                onChange={handleChange}
                disabled={loadingHeads || heads.length === 0}
                required
              >
                <option value="" disabled>
                  {loadingHeads
                    ? "Loading kalash types..."
                    : heads.length > 0
                      ? "Select a kalash type"
                      : "No kalash types available"}
                </option>
                {heads.map((head) => (
                  <option key={head.headid} value={head.headid}>
                    {head.PartyName} - ₹{head.rate}
                  </option>
                ))}
              </select>
              {headsError ? (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {headsError}
                </p>
              ) : null}
            </div>
            <div>
              <label className="form-label" htmlFor="amount">
                Amount:
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                className="form-field"
                value={form.amount}
                onChange={handleChange}
                min="50"
                required
              />
            </div>
            <button className="submit-button" type="submit" disabled={submitting || heads.length === 0}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
            {message ? (
              <p className="rounded-lg bg-temple-cream px-4 py-3 font-display text-base text-temple-maroon">
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
