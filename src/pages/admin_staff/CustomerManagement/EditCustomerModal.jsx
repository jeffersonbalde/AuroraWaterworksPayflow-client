import { useEffect, useState } from "react";
import Portal from "../../../components/Portal";

const DEFAULT_FORM = (customer) => ({
  name: customer?.name || "",
  contact_number: customer?.contact_number || "",
  address: customer?.address || "",
  wws_id: customer?.wws_id || "",
  service: customer?.service || "residential",
});

const EditCustomerModal = ({ customer, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM(customer));
  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setFormData(DEFAULT_FORM(customer));
  }, [customer]);

  useEffect(() => {
    const handleEscape = async (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        await closeModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("modal-open");
    };
  }, []);

  const closeModal = async () => {
    if (loading) return;
    setIsClosing(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    onClose();
  };

  const handleBackdropClick = async (e) => {
    if (e.target === e.currentTarget) {
      await closeModal();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }
    if (formData.contact_number && !/^[0-9+\-\s]*$/.test(formData.contact_number)) {
      newErrors.contact_number = "Use numbers, spaces, plus or dash.";
    }
    if (!formData.service) {
      newErrors.service = "Service type is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      name: formData.name.trim(),
      contact_number: formData.contact_number.trim(),
      address: formData.address.trim(),
      wws_id: formData.wws_id.trim(),
      service: formData.service,
    });
  };

  return (
    <Portal>
      <div
        className={`modal fade show d-block modal-backdrop-animation ${
          isClosing ? "exit" : ""
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg mx-3 mx-sm-auto">
          <form
            className={`modal-content border-0 modal-content-animation ${
              isClosing ? "exit" : ""
            }`}
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onSubmit={handleSubmit}
          >
            <div
              className="modal-header border-0 text-white modal-smooth"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)",
              }}
            >
              <h5 className="modal-title fw-bold">
                <i className="fas fa-user-edit me-2" />
                Edit Customer
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white btn-smooth"
                onClick={closeModal}
                aria-label="Close"
                disabled={loading}
              ></button>
            </div>

            <div
              className="modal-body bg-light modal-smooth"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contact_number"
                    className={`form-control ${
                      errors.contact_number ? "is-invalid" : ""
                    }`}
                    value={formData.contact_number}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.contact_number && (
                    <div className="invalid-feedback">
                      {errors.contact_number}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">
                    Address
                  </label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">
                    WWS ID
                  </label>
                  <input
                    type="text"
                    name="wws_id"
                    className="form-control"
                    value={formData.wws_id}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">
                    Service Type
                  </label>
                  <select
                    name="service"
                    className={`form-select ${
                      errors.service ? "is-invalid" : ""
                    }`}
                    value={formData.service}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="institutional">Institutional</option>
                  </select>
                  {errors.service && (
                    <div className="invalid-feedback">{errors.service}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-white modal-smooth">
              <button
                type="button"
                className="btn btn-outline-secondary btn-smooth"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success btn-smooth text-white"
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #2d5a27 0%, #1f7a48 100%)",
                  borderColor: "#1f7a48",
                  color: "#fff",
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2" />
                    Update Customer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

export default EditCustomerModal;

