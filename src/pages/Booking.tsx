import React, { useState } from "react";
import { dbService } from "../services/dbService";

export default function BookingPage({ pre }: { pre?: string }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: pre || "", date: "", time: "", address: "", notes: "" });
  
  const h = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const go = async () => {
    if (form.name && form.email && form.service) {
      await dbService.createBooking(form);
      setSent(true);
    }
  };

  return (<>
    <div className="page-hero"><div className="page-hero-inner">
      <div className="sec-lbl">Schedule a Service</div><h1 className="fd">Book with KTT</h1>
      <p>Fill in the form — our team confirms within 30 minutes.</p>
    </div></div>
    <div className="sec" style={{maxWidth:740}}>
      {sent ? (
        <div className="success">
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <h3>Booking Received!</h3>
          <p>Thank you, <strong style={{color:"#fff"}}>{form.name}</strong>. We'll contact you shortly.</p>
        </div>
      ) : (
        <div className="form-box">
          <h2 className="fd" style={{fontSize:20,marginBottom:6,color:"#fff"}}>Booking Details</h2>
          <p style={{color:"#888",fontSize:13,fontWeight:300,marginBottom:24}}>Fields marked * are required. Confirmation within 30 minutes.</p>
          <div className="fg">
            {[
              {l:"Full Name *",n:"name",ph:"Your full name"},
              {l:"Email *",n:"email",ph:"you@email.com",t:"email"},
              {l:"Phone",n:"phone",ph:"08160880608",t:"tel"}
            ].map(f=>(
              <div key={f.n} className="f">
                <label>{f.l}</label>
                <input className="fi" name={f.n} type={f.t||"text"} placeholder={f.ph} value={(form as any)[f.n]} onChange={h}/>
              </div>
            ))}
            <div className="f"><label>Service *</label>
              <select className="fi" name="service" value={form.service} onChange={h}>
                <option value="">Select a service</option>
                <option>Food Delivery</option>
                <option>Laundry &amp; Dry Cleaning</option>
                <option>Home Cleaning</option>
                <option>Office Cleaning</option>
              </select>
            </div>
            <div className="f"><label>Date</label><input className="fi" name="date" type="date" value={form.date} onChange={h}/></div>
            <div className="f"><label>Time</label><input className="fi" name="time" type="time" value={form.time} onChange={h}/></div>
            <div className="f full"><label>Address</label><input className="fi" name="address" placeholder="Full service address" value={form.address} onChange={h}/></div>
            <div className="f full"><label>Notes</label><textarea className="fi fi-ta" name="notes" placeholder="Special instructions..." value={form.notes} onChange={h}/></div>
            <button className="f-submit" onClick={go}>Confirm Booking →</button>
          </div>
        </div>
      )}
    </div>
  </>);
}
