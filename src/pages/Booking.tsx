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

      // Construct mailto link to send email copy directly to Chatkttlimited@gmail.com
      const emailSubject = encodeURIComponent(`New KTT Booking Order: ${form.service} - ${form.name}`);
      const emailBody = encodeURIComponent(
        `NEW BOOKING DETAILS:\n\n` +
        `Customer Name: ${form.name}\n` +
        `Email: ${form.email}\n` +
        `Phone: ${form.phone}\n` +
        `Service: ${form.service}\n` +
        `Date & Time: ${form.date} ${form.time}\n` +
        `Address: ${form.address}\n` +
        `Notes: ${form.notes}\n`
      );
      
      // Attempt window.location open for mailto optional alert
      setTimeout(() => {
        window.open(`mailto:Chatkttlimited@gmail.com?subject=${emailSubject}&body=${emailBody}`, '_blank');
      }, 500);
    } else {
      alert("Please fill in your Name, Email, and select a Service.");
    }
  };

  const whatsappMsg = encodeURIComponent(
    `Hello Kings Treat Tech! I just placed an order on your site.\n\nName: ${form.name}\nService: ${form.service}\nPhone: ${form.phone}`
  );

  return (<>
    <div className="page-hero"><div className="page-hero-inner">
      <div className="sec-lbl">Schedule a Service</div><h1 className="fd">Book with KTT</h1>
      <p>Fill in the form — our team receives your order instantly in the Admin Portal!</p>
    </div></div>
    <div className="sec" style={{maxWidth:740}}>
      {sent ? (
        <div className="success" style={{ background: "#111", border: "1px solid #39FF14", borderRadius: 16, padding: 36, textAlign: "center" }}>
          <div style={{fontSize:54,marginBottom:12}}>✅</div>
          <h3 style={{ color: "#fff", fontSize: 24, marginBottom: 8 }}>Booking Submitted Successfully!</h3>
          <p style={{ color: "#aaa", fontSize: 14, marginBottom: 20 }}>
            Thank you, <strong style={{color:"#39FF14"}}>{form.name}</strong>. Your order has been logged in our system and sent to <strong style={{color:"#fff"}}>Chatkttlimited@gmail.com</strong>.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
            <a 
              href={`https://wa.me/2347066613373?text=${whatsappMsg}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ background: "#25D366", color: "#000", padding: "12px 24px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 14 }}
            >
              💬 Instant Confirm via WhatsApp
            </a>
            <button 
              onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", service: pre || "", date: "", time: "", address: "", notes: "" }); }}
              style={{ background: "#222", color: "#ccc", border: "1px solid #444", padding: "12px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
            >
              ➕ Place Another Order
            </button>
          </div>
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
