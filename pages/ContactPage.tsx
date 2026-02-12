
import React, { useState } from 'react';
import { Mail, Instagram, MapPin, Send, CheckCircle2, Globe, Sparkles, ArrowRight, AlertTriangle, X } from 'lucide-react';
import { api } from '../services/api';

const ContactPage: React.FC = () => {
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        throw new Error('All fields are required.');
      }

      // Send via API
      const result = await api.sendContactMessage(formData);
      
      setIsSubmitting(false);
      setIsSent(true);
      
      // Reset form setelah beberapa saat
      setTimeout(() => {
        setIsSent(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 5000);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to send your message. Please try again.');
      console.error('Error sending contact message:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-20 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Side: Information - Aligned with the card */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <Sparkles size={12} /> Contact Concierge
              </div>
              <h1 className="text-5xl md:text-6xl font-black heading-font text-slate-900 mb-6 leading-tight">
                Let's <span className="text-amber-600">Connect</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-md leading-relaxed">
                Our team is here to assist you with product inquiries, orders, and collaborations—quickly and personally.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-center gap-5 group">
                <div className="bg-white p-4 rounded-2xl shadow-sm text-amber-600 border border-slate-100 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Inquiry</h4>
                  <p className="font-bold text-slate-900 text-lg">triship772@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group">
                <a href="https://www.instagram.com/trishop772?igsh=ZWIwZjZ5NWlmdHZq&utm_source=qr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group w-full hover:no-underline">
                  <div className="bg-white p-4 rounded-2xl shadow-sm text-amber-600 border border-slate-100 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <Instagram size={22} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Instagram</h4>
                    <p className="font-bold text-slate-900 text-lg">@trishop772</p>
                  </div>
                </a>
              </div>

              <div className="flex items-center gap-5 group">
                <div className="bg-white p-4 rounded-2xl shadow-sm text-amber-600 border border-slate-100 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global HQ</h4>
                  <p className="font-bold text-slate-900 text-lg">Sepinggan Baru, Balikpapan Selatan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form Card */}
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            
            {isSent ? (
              <div className="py-20 flex flex-col items-center text-center animate-in zoom-in duration-500">
                <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mb-8">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 heading-font">Message Sent Successfully!</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8 text-lg">
                  Your message has been received and sent to triship772@gmail.com. Our team will get back to you shortly.
                </p>
                <button 
                  onClick={() => setIsSent(false)}
                  className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 transition-colors"
                >
                  Send another message <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-in shake">
                    <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-red-800">{error}</p>
                    </div>
                    <button type="button" onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Johnathan Doe"
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-base font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Liaison</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="john@example.com"
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-base font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry Subject</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Product Inquiry / Partnership"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-base font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Narration</label>
                  <textarea 
                    rows={4} 
                    required 
                    placeholder="How can our team assist you today?"
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-base font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium resize-none"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} /> Send Message
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-4 opacity-40">
                  <Globe size={12} className="text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PCI-DSS Compliant Network • SSL Secured</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
