import React, { useState } from "react";
import { Settings } from "../types";

export default function Contact({ settings }: { settings: Settings }) {
  const [sent,setSent]=useState(false);
  const [form,setForm]=useState({name:"",email:"",subject:"",message:""});
  const h = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
    setForm(f=>({...f,[e.target.name]:e.target.value}));
  
  return (<>
    <div className="page-hero"><div className="page-hero-inner">
      <div className="sec-lbl">Get In Touch</div><h1 className="fd">Contact Us</h1>
      <p>We're here to help. Reach out anytime — we respond fast.</p>
    </div></div>
    <div className="sec"><div className="contact-grid">
      <div>
        <h2 className="fd" style={{fontSize:22,marginBottom:24,color:"#fff"}}>Reach <span style={{color:"var(--neon-lime)"}}>KTT</span></h2>
        {[
          {icon:"📞",title:"Phone",text:settings.phone},
          {icon:"📧",title:"Email",text:settings.email},
          {icon:"📍",title:"Address",text:settings.address},
          {icon:"🕐",title:"Hours",text:`Mon – Sat: ${settings.monSat}\nSunday: ${settings.sunday}`},
        ].map((c,i)=>(
          <div key={i} className="cinfo">
            <div className="cinfo-ico">{c.icon}</div>
            <div><h4>{c.title}</h4><p style={{whiteSpace:"pre-line"}}>{c.text}</p></div>
          </div>
        ))}
        <a href={`https://wa.me/${settings.whatsapp}`} className="wa-btn" target="_blank" rel="noreferrer">💬 Chat on WhatsApp</a>
      </div>
      <div>
        {sent ? (
          <div className="success">
            <div style={{fontSize:40,marginBottom:10}}>✉️</div>
            <h3>Message Sent!</h3>
            <p>We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <div className="form-box">
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:18,color:"#fff"}}>Send a Message</h3>
            <div className="fg">
              {[
                {l:"Name",n:"name",ph:"Your name"},
                {l:"Email",n:"email",ph:"you@email.com",t:"email"}
              ].map(f=>(
                <div key={f.n} className="f">
                  <label>{f.l}</label>
                  <input className="fi" name={f.n} type={f.t||"text"} placeholder={f.ph} value={(form as any)[f.n]} onChange={h}/>
                </div>
              ))}
              <div className="f full"><label>Subject</label><input className="fi" name="subject" placeholder="How can we help?" value={form.subject} onChange={h}/></div>
              <div className="f full"><label>Message</label><textarea className="fi fi-ta" name="message" placeholder="Tell us what you need..." value={form.message} onChange={h}/></div>
              <button className="f-submit" onClick={()=>form.name&&form.email&&setSent(true)}>Send Message →</button>
            </div>
          </div>
        )}
      </div>
    </div></div>
  </>);
}
