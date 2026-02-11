
import React from 'react';
/* Added missing icon imports from lucide-react to fix "Cannot find name" errors */
import { 
  ShieldCheck, Truck, RefreshCw, FileText, 
  CheckCircle2, Clock, Globe, CreditCard, 
  Lock, EyeOff, UserCheck, PackageCheck,
  Tag, Calendar, Sparkles, Mail
} from 'lucide-react';

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({ title, subtitle, icon, children }) => (
  <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200 text-amber-600 mb-8 border border-slate-100">
          {icon}
        </div>
        <h1 className="text-5xl md:text-6xl font-black heading-font text-slate-900 mb-4 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        {children}
      </div>

      {/* Footer Note */}
      <div className="mt-20 pt-8 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm italic">
          Last updated: {new Date().toLocaleDateString('en-EN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  </div>
);

const PolicySection = ({ title, items }: { title: string, items: { icon: React.ReactNode, text: string, bold?: string }[] }) => (
  <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
    <h3 className="text-2xl font-black text-slate-900 mb-8 heading-font border-b border-slate-50 pb-4">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
          <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
            {item.icon}
          </div>
          <div>
            {item.bold && <p className="font-black text-slate-900 text-sm mb-1 uppercase tracking-widest">{item.bold}</p>}
            <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ShippingPolicy = () => (
  <PolicyLayout 
    title="Shipping Policy" 
    subtitle="Our commitment to delivering luxury straight to your doorstep with maximum security."
    icon={<Truck size={40} />}
  >
    <PolicySection 
      title="Time & Process"
      items={[
        { icon: <Clock size={18} />, bold: "Fast Processing", text: "All orders are processed within 1–3 business days to ensure thorough quality checks." },
        { icon: <Globe size={18} />, bold: "Nationwide Coverage", text: "We ship across Indonesia through trusted logistics partners." },
        { icon: <PackageCheck size={18} />, bold: "Packaging", text: "Each item is carefully packed with protection to preserve its pristine condition." },
        { icon: <CheckCircle2 size={18} />, bold: "Tracking Real-time", text: "Receive your tracking number immediately after your order has been shipped." }
      ]}
    />
  </PolicyLayout>
);

export const ReturnsPolicy = () => (
  <PolicyLayout 
    title="Returns & Refunds" 
    subtitle="Your satisfaction is our priority. We offer a fair and transparent return policy."
    icon={<RefreshCw size={40} />}
  >
    <PolicySection 
      title="Return Terms"
      items={[
        { icon: <Calendar size={18} />, bold: "Timeframe", text: "You have 30 calendar days from the date of receipt to submit a return claim." },
        { icon: <ShieldCheck size={18} />, bold: "Product Condition", text: "Items must be in their original condition, unused, and still in their exclusive packaging." },
        { icon: <FileText size={18} />, bold: "Purchase Proof", text: "Please include a digital invoice or Order ID when submitting your return request." },
        { icon: <CheckCircle2 size={18} />, bold: "Quick Verification", text: "Our team will review the eligibility of your return within 48 business hours." }
      ]}
    />
    <PolicySection 
      title="Refund Process"
      items={[
        { icon: <CreditCard size={18} />, bold: "Refund Method", text: "Refunds will be issued to the original payment method used at checkout." },
        { icon: <Clock size={18} />, bold: "Processing Time", text: "The refund process typically takes 5-10 business days depending on your bank's policies." }
      ]}
    />
  </PolicyLayout>
);

export const TermsOfService = () => (
  <PolicyLayout 
    title="Terms of Service" 
    subtitle="A service agreement between you and DropshipPro to ensure a secure and trusted shopping experience."
    icon={<FileText size={40} />}
  >
    <PolicySection 
      title="Usage Terms"
      items={[
        { icon: <UserCheck size={18} />, bold: "Account Responsibility", text: "Users are responsible for maintaining account confidentiality and all related activities." },
        { icon: <Lock size={18} />, bold: "Prohibited Use", text: "Use of this site for illegal activities or violations of applicable laws is strictly prohibited." },
        { icon: <Sparkles size={18} />, bold: "Intellectual Property", text: "All images and content on this site are the property of DropshipPro and protected by copyright law." },
        { icon: <CheckCircle2 size={18} />, bold: "Price Adjustments", text: "We reserve the right to adjust product prices at any time based on global market conditions." }
      ]}
    />
  </PolicyLayout>
);

export const PrivacyPolicy = () => (
  <PolicyLayout 
    title="Privacy Policy" 
    subtitle="How we protect, safeguard, and value every personal data you entrust to us."
    icon={<ShieldCheck size={40} />}
  >
    <PolicySection 
      title="Data Protection"
      items={[
        { icon: <EyeOff size={18} />, bold: "Total Privacy", text: "We NEVER sell or share your personal data with third parties." },
        { icon: <Lock size={18} />, bold: "SSL Encryption", text: "All data transactions are protected by 256-bit industry-standard banking encryption." },
        { icon: <Mail size={18} />, bold: "Communication", text: "Email data is used for order updates and exclusive newsletters that can be unsubscribed at any time." },
        { icon: <ShieldCheck size={18} />, bold: "Access Rights", text: "You have full rights to request deletion of your data from our systems at any time." }
      ]}
    />
  </PolicyLayout>
);
